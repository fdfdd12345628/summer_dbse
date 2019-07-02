from django.shortcuts import render
from django.http import HttpResponse
from django.utils.safestring import mark_safe
from .models  import Notification
import json


def index(request):

    return render(request, 'chat/index.html', {})


def room(request, room_name):
    if request.method =="GET":
        if request.user.is_authenticated:
            userid = request.user.id
        owner = request.user
        All_Notification = Notification.objects.filter(to_user_id=owner)
        print(All_Notification)
        return render(request, 'chat/room.html', {
            'room_name_json': mark_safe(json.dumps(room_name)),
            'All_Notification': All_Notification,
        })
    if request.method == "POST":
        seen_id = request.POST.getlist('seen_id[]', '')
        Notification_Select_List = Notification.objects.filter(id__in=seen_id)
        for ele in Notification_Select_List:
            ele.seen = True
            ele.save()
        return HttpResponse(status=200)
# Create your views here.