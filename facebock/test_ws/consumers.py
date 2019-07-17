from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from django.contrib import auth

from .models import Notification_2_test
from chat.models import Notification_test
import datetime
import channels
from channels.layers import get_channel_layer
from random import randrange

DEBUG = True


# from pprint import pprint


class TestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            'asd',
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            'asd',
            self.channel_name,
        )

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        content_type = text_data_json['type']
        if content_type == 'chat':
            pass
        elif content_type == 'notification':
            await self.put_notification(text=message)
            await self.channel_layer.group_send(
                'asd',
                {
                    'type': 'notification_message',
                    'message': message,
                    'cate': 'noti',
                    'from_user': 'asd',
                    'id': 1
                }
            )

    async def notification_message(self, event):
        message = event['message']
        cate = event['cate']
        now = datetime.datetime.now()
        # Send message to WebSocket
        pass

    @database_sync_to_async
    def put_notification(self, text):
        if randrange(2):
            notification = Notification_test(content=text,
                                             date=datetime.datetime.now(),
                                             seen=False,
                                             )
            notification.save(using='mysql_1')
        else:
            notification = Notification_2_test(content=text,
                                               date=datetime.datetime.now(),
                                               seen=False,
                                               )
            notification.save(using='mysql_2')
        return notification
        pass
