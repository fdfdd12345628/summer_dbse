from django.shortcuts import render
from django.http import HttpResponse
from django.utils.safestring import mark_safe
from .models import Notification, Message, Group, User
import json, os, string, random, sys
# from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
import webauthn as webauthn

RP_ID = 'localhost'
ORIGIN = 'https://localhost'
TRUST_ANCHOR_DIR = 'trusted_attestation_roots'


def index(request):
    if request.method == "GET":
        return render(request, 'chat/index.html', {})
    else:
        if request.POST.get('type', '') == 'register':
            username = request.POST.get("username", '')
            password = request.POST.get("password", '')
            Re_user = User.objects.filter(username=username)
            if Re_user.count() == 0:
                User.objects.create_user(username=username, password=password)
                return JsonResponse({"message": "註冊成功"})
            else:
                return JsonResponse({"message": "錯誤或重複的輸入"})
        elif request.POST.get('type', '') == 'login':
            if request.user.is_authenticated:
                return JsonResponse({"message": "already login"})
            username = request.POST.get("username", '')
            password = request.POST.get("password", '')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({"message": "success login"})
            else:
                return JsonResponse({"message": "wrong password or none account"})
        elif request.POST.get("type", '') == 'logout':
            if request.user.is_authenticated:
                logout(request)
                return JsonResponse({"message": "success logout"})
            else:
                return JsonResponse({"message": "not login"})
        else:
            print("null")
            return HttpResponse(200)

def rtc(request, room_name):
    return render(request, "chat/rtc.html", {
        'request': request,
        'room_name': room_name,
    })


def room(request):
    if request.method == "GET":
        if request.user.is_authenticated:
            userid = request.user.id
        owner = request.user
        if request.user.is_authenticated:
            All_Notification = Notification.objects.filter(to_user_id=owner)
            # Notification 中取出 傳送對象為自己的
            All_User = User.objects.exclude(id=userid)
            # for 聊天室 取出除了自己以外的user
            # 若有好友系統也可在此更改(?
            All_Involved_Group = Group.objects.filter(user__in=[userid])
            # Group中含有自己的 放入聊天室
            for group in All_Involved_Group:
                group.display_name = group.display_name.replace(request.user.username,'').replace("_with_","")
        else:
            All_Notification = []
            All_User = []
            All_Involved_Group = []
        return render(request, 'chat/room.html', {
            'room_name_json': 'chat',
            'All_Notification': All_Notification,
            'All_User': All_User,
            'Self_User': owner,
            'Existed_Group': All_Involved_Group,
        })
    if request.method == "POST":
        if request.POST.get("type", "") == "Clean_Seen":
            # 將未讀改為已讀
            seen_id = request.POST.getlist('seen_id[]', '')
            Notification_Select_List = Notification.objects.filter(id__in=seen_id)
            for ele in Notification_Select_List:
                ele.seen = True
                ele.save()
            return HttpResponse(status=200)
        elif request.POST.get("type", "") == "Create_Group_Single":
            # for one to one chat room
            to_user = request.POST.get("user", "")
            content = {}
            Redundant_Group = Group.objects.filter(type="single", user__in=[request.user.id]).filter(user__in=[to_user])
            # 若 1對1聊天室已建立 則回傳已存在的id
            # 否則創立後回傳
            print(Redundant_Group)
            if Redundant_Group.count() == 0:
                Create_Group = Group.objects.create(
                    display_name=request.user.username + "_with_" + User.objects.get(id=to_user).username,
                    type="single")
                Create_Group.save()
                Create_Group.user.add(request.user)
                Create_Group.user.add(User.objects.get(id=to_user))
                # Create field:
                #   display_name: 顯示的name  目前預設username_with_username
                #   type: "single"
                #   user: many to many
                content["id"] = Create_Group.id
                content["display_name"] = Create_Group.display_name.replace(request.user.username,'').replace("_with_","")
                return HttpResponse(json.dumps(content))
            else:
                content["id"] = Redundant_Group.first().id
                content["display_name"] = Redundant_Group.first().display_name.replace(request.user.username,'').replace("_with_","")
                return HttpResponse(json.dumps(content))
        elif request.POST.get("type","") == 'Create_Group_Multiple':
            content={}
            roomUser = request.POST.getlist("user[]","")
            print(roomUser)
            Create_Group = Group.objects.create(
                display_name=request.POST.get("displayName",""),
                type="multiple")
            Create_Group.save()
            Create_Group.user.add(request.user)
            for user in roomUser:
                Create_Group.user.add(User.objects.get(username = user))
            content["id"] = Create_Group.id
            content["display_name"] = Create_Group.display_name
            return HttpResponse(json.dumps(content))
        elif request.POST.get("type", "") == "getRoomMessage":
            groupId = request.POST.get("groupId")
            messageNum = int(request.POST.get("messageNum"))
            returnMessageObjectList = Message.objects.filter(to_group_id=groupId).order_by('-id')[
                                      messageNum:messageNum + 9]
            print(messageNum)
            returnMessage = [{"content": ele.content,
                              "date": ele.date,
                              "fromUserName":ele.from_user.username,
                              "fromUser": True if ele.from_user_id == request.user.id else False} for ele in
                             returnMessageObjectList
                             ]
            return JsonResponse({"returnMessage": returnMessage})

# Create your views here.


def webauthn_begin_activate(request):
    print("webauthn_begin_activate")
    # username = request.POST.get('username')
    global username
    username = request.POST.get('register_username', '')
    display_name = request.POST.get('register_display_username')
    print(username)
    rp_name = "localhost"
    challenge = generate_challenge(32)
    ukey = generate_ukey()
    if 'register_ukey' in request.session:
        del request.session['register_ukey']
    if 'register_username' in request.session:
        del request.session['register_username']
    if 'register_display_name' in request.session:
        del request.session['register_display_name']
    if 'challenge' in request.session:
        del request.session['challenge']
    request.session['register_username'] = username
    request.session['register_display_name'] = display_name
    request.session['challenge'] = challenge
    request.session['register_ukey'] = ukey

    make_credential_options = webauthn.WebAuthnMakeCredentialOptions(
        challenge, rp_name, RP_ID, ukey, username, display_name,
        'https://chendin.com')
    temp = make_credential_options.registration_dict
    # temp['attestation'] = 'direct'
    return JsonResponse(temp)


def webauthn_begin_assertion(request):
    print("webauthn_begin_assertion")
    username = request.POST.get('login_username')
    challenge = generate_challenge(32)
    user = User.objects.get(username=username)
    if 'challenge' in request.session:
        del request.session['challenge']

    challenge = generate_challenge(32)
    print("assertion get challenge")
    request.session['challenge'] = challenge
    webauthn_user = webauthn.WebAuthnUser(
        user.ukey, user.username, user.display_name, user.icon_url,
        user.credential_id, user.pub_key, user.sign_count, user.rp_id)
    print("assertion get user")
    webauthn_assertion_options = webauthn.WebAuthnAssertionOptions(
        webauthn_user, challenge)
    print("go return")
    return JsonResponse(webauthn_assertion_options.assertion_dict)


def verify_credential_info(request):
    print("verify_credential_info")
    # user = authenticate(request, username=username)
    # global username
    challenge = request.session['challenge']
    username = request.session['register_username']
    display_name = request.session['register_display_name']
    ukey = request.session['register_ukey']
    # user = User.objects.get(username=username)
    # print("user {}".format(user))
    print("challenge {}".format(challenge))
    print("username {}".format(username))
    print("display_name {}".format(display_name))
    print("ukey {}".format(ukey))

    registration_response = request.POST
    trust_anchor_dir = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), TRUST_ANCHOR_DIR)
    trusted_attestation_cert_required = True
    self_attestation_permitted = True
    none_attestation_permitted = True
    webauthn_registration_response = webauthn.WebAuthnRegistrationResponse(
        RP_ID,
        ORIGIN,
        registration_response,
        challenge,
        trust_anchor_dir,
        trusted_attestation_cert_required,
        self_attestation_permitted,
        none_attestation_permitted,
        uv_required=False)
    print(webauthn_registration_response)
    try:
        webauthn_credential = webauthn_registration_response.verify()
    except Exception as e:
        return JsonResponse({'fail': 'Registration failed. Error: {}'.format(e)})

    credential_id_exists = User.objects.filter(
        credential_id=webauthn_credential.credential_id).first()
    if credential_id_exists:
        return JsonResponse({'fail': 'Credential ID already exists.'})
    existing_user = User.objects.filter(username=username).first()
    if not existing_user:
        print("create")
        if sys.version_info >= (3, 0):
            webauthn_credential.credential_id = str(
                webauthn_credential.credential_id, "utf-8")
        user = User.objects.create(
            ukey=ukey,
            username=username,
            display_name=username,
            pub_key=webauthn_credential.public_key,
            credential_id=webauthn_credential.credential_id,
            sign_count=webauthn_credential.sign_count,
            rp_id=RP_ID,
            icon_url='https://example.com')
    else:
        return JsonResponse({'fail': 'User already exists.'})
    print('Successfully registered as {}.'.format(username))
    return JsonResponse({'success': 'User successfully registered.'})


def verify_assertion(request):
    print("verify_assertion")
    challenge = request.session.get('challenge', False)
    assertion_response = request.POST
    credential_id = assertion_response.get('id')

    user = User.objects.filter(credential_id=credential_id).first()
    if not user:
        return JsonResponse({'fail': 'User does not exist.'})
    webauthn_user = webauthn.WebAuthnUser(
        user.ukey, user.username, user.display_name, user.icon_url,
        user.credential_id, user.pub_key, user.sign_count, user.rp_id)

    webauthn_assertion_response = webauthn.WebAuthnAssertionResponse(
        webauthn_user,
        assertion_response,
        challenge,
        ORIGIN,
        uv_required=False)  # User Verification
    try:
        sign_count = webauthn_assertion_response.verify()
    except Exception as e:
        return JsonResponse({'fail': 'Assertion failed. Error: {}'.format(e)})
    # Update counter.
    user.sign_count = sign_count
    user.save()

    login(request, user)

    return JsonResponse({
        'success':
            'Successfully authenticated as {}'.format(user.username)
    })


def generate_challenge(challenge_len):
    return ''.join([
        random.SystemRandom().choice(string.ascii_letters + string.digits)
        for i in range(challenge_len)
    ])


def generate_ukey():
    return generate_challenge(20)
