from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from django.contrib import auth
from django.contrib.auth.models import User
from .models import Notification, Group, Message
import datetime


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
        if self.scope["user"].is_anonymous:
            self.user_name = "anonymous"
        else:
            self.user_name = self.scope["user"].username
            self.user = self.scope['user']
            print(self.user)
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.channel_layer.group_add(
            self.user_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )
        await self.channel_layer.group_discard(
            self.user_name,
            self.channel_name,
        )

    # Receive message from WebSocket
    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        cate = text_data_json['type']
        user_name = text_data_json['user_name']
        # Send message to room group
        if cate == 'chat':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'cate': cate,
                }
            )
        elif cate == 'notification':
            await self.channel_layer.group_send(
                user_name,
                {
                    'type': 'notification_message',
                    'message': message,
                    'cate': cate,
                }
            )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        cate = event['cate']
        # Send message to WebSocket

        await self.send(text_data=json.dumps({
            'message': message,
            'cate': cate,
        }))
        '''await self.put_message(text=message,
                               group=)
        '''

    async def notification_message(self, event):
        message = event['message']
        cate = event['cate']
        # Send message to WebSocket
        if cate == "notification":
            await self.send(text_data=json.dumps({
                'message': message,
                'cate': cate,
            }))
            await self.put_notification(text=message,
                                        to_user=self.user)


    @database_sync_to_async
    def get_notification(self, notification_id):
        return Notification.objects.get(pk=notification_id)
        pass


    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(pk=user_id)


    @database_sync_to_async
    def put_notification(self, text, to_user):
        notification = Notification(from_user=self.user,
                                    to_user=to_user,
                                    content=text,
                                    date=datetime.datetime.now(),
                                    seen=False,
                                    )
        notification.save()
        pass

    @database_sync_to_async
    def get_message(self):
        pass

    @database_sync_to_async
    def put_message(self, text, group=None):
        if group is not None:
            message = Message(from_user=self.user,
                              content=text,
                              date=datetime.datetime.now(),
                              to_group=group, )

            message.save()
        else:
            return

    @database_sync_to_async
    def create_group(self, user_1, user_2=None):
        group = Group()
        group.user.add(user_1)
        group.user.add(user_2)
        pass

    @database_sync_to_async
    def group_add_user(self, group, user):
        group.user.add(user)
        group.save()

    def get_group(self, group_id, ):
        pass
