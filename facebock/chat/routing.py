from django.conf.urls import url
from channels.staticfiles import *
from . import consumers

websocket_urlpatterns = [
    url(r'^ws/chat/(?P<room_name>[^/]+)/$', consumers.ChatConsumer),
    url(r'^ws/test/$', consumers.TestConsumer)
]

