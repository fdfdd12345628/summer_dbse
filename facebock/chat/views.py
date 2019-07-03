from django.shortcuts import render
from django.http import HttpResponse
from django.utils.safestring import mark_safe
from .models  import Notification,Message,Group
import json
from django.contrib.auth.models import User


def index(request):

    return render(request, 'chat/index.html', {})


def room(request, room_name):
    if request.method =="GET":
        if request.user.is_authenticated:
            userid = request.user.id
        owner = request.user
        if request.user.is_authenticated:
            All_Notification = Notification.objects.filter(to_user_id=owner)
            All_User = User.objects.exclude(id=userid)
            All_Involved_Group = Group.objects.filter(user__in=[userid])
        else:
            All_Notification = []
            All_User = []
            All_Involved_Group = []
        return render(request, 'chat/room.html', {
            'room_name_json': mark_safe(json.dumps(room_name)),
            'All_Notification': All_Notification,
            'All_User' : All_User,
            'Self_User': owner,
            'Existed_Group': All_Involved_Group,
        })
    if request.method == "POST":
        if request.POST.get("type","") == "Clean_Seen":
            seen_id = request.POST.getlist('seen_id[]', '')
            Notification_Select_List = Notification.objects.filter(id__in=seen_id)
            for ele in Notification_Select_List:
                ele.seen = True
                ele.save()
            return HttpResponse(status=200)
        elif request.POST.get("type","") == "Create_Group_Single":
            to_user = request.POST.get("user","")
            content = {}
            Redundant_Group = Group.objects.filter(type="single", user__in = [request.user.id]).filter(user__in = [to_user])
            print(Redundant_Group)
            if Redundant_Group.count() == 0:
                Create_Group = Group.objects.create(display_name=request.user.username+"_with_"+User.objects.get(id = to_user).username , type="single")
                Create_Group.save()
                Create_Group.user.add(request.user)
                Create_Group.user.add(User.objects.get(id = to_user))
                print(Create_Group)
                content["id"] = Create_Group.id
                content["display_name"] = Create_Group.display_name
                return HttpResponse(json.dumps(content))
            else:
                content["id"] = Redundant_Group.first().id
                content["display_name"] = Redundant_Group.first().display_name
                return  HttpResponse(json.dumps(content))
# Create your views here.