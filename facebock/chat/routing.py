from django.conf.urls import url
from django.urls import path
from channels.staticfiles import *
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('websocket/chat/<room_name>/', consumers.ChatConsumer),
    path('websocket/rtc/<room_name>', consumers.ChatConsumer)
]

