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
        All_Notification = Notification.objects.filter(to_user_id=owner)
        All_User = User.objects.exclude(id = userid)
        All_Involved_Group = Group.objects.filter(user__in=[userid])
        print(All_Involved_Group)
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
            Create_Group = Group.objects.create(display_name=request.user.username+"_with_"+User.objects.get(id = to_user).username)
            Create_Group.save()
            Create_Group.user.add(request.user)
            Create_Group.user.add(User.objects.get(id = to_user))
            print(Create_Group)
            return HttpResponse(Create_Group.id)
# Create your views here.