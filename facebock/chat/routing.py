from django.conf.urls import url
from django.urls import path
from channels.staticfiles import *
from . import consumers

websocket_urlpatterns = [
    path('websocket/chat/<room_name>/', consumers.ChatConsumer),
]

