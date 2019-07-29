from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from django.contrib import auth

from .models import Notification, Group, Message, Clients, User
import datetime
import channels
from channels.layers import get_channel_layer


# from pprint import pprint


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
        if self.scope["user"].is_anonymous:
            self.user_name = "anonymous"
        else:
            self.user_name = self.scope["user"].id
            self.user = self.scope['user']
            print(self.user.username)
            await self.add_clients()
        print(self.user_name)
        # Join room group
        # add user to group that the name is as same as current user
        await self.channel_layer.group_add(
            str(self.user_name),
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        # remove user from layer
        await self.channel_layer.group_discard(
            self.user_name,
            self.channel_name,
        )
        # clear relation between user and websocket
        await self.delete_client()

    # Receive message from WebSocket
    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        print(text_data_json)
        cate = text_data_json['type']
        # Send message to room group
        if cate == 'chat':
            # groupname = '1'  # text_data_json['groupname']
            groupname = text_data_json['groupname']
            # get all user's layer in that group
            print(groupname)
            total_channel = await self.get_all_user_layer(group_name=groupname)
            # save to database
            message_model=await self.put_message(
                group_id=groupname,
                from_user=self.user,
                text=message,
            )
            # send to all websocket
            for channel in total_channel:
                await self.channel_layer.send(
                    channel,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'cate': cate,
                        # 'user': User.objects.all(),
                        'group_name': groupname,
                        'from_user': self.user.id
                    }
                )

        # send notification to target user
        elif cate == 'notification':
            user_name = text_data_json['user_name']
            # save in database
            notification = await self.put_notification(text=message,
                                                       from_username=self.user.username,
                                                       to_username=user_name)
            to_user=await self.get_user_by_name(username=user_name)

            await self.channel_layer.group_send(
                str(to_user.id),
                {
                    'type': 'notification_message',
                    'message': message,
                    'cate': cate,
                    'from_user': self.user.username,
                    'id': str(notification.id)
                }
            )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        cate = event['cate']
        now = datetime.datetime.now()
        group = await self.get_group(event['group_name'])
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'group_name': event['group_name'],
            'display_name': group.display_name,
            'message': message,
            'from_user': (await self.get_user(event['from_user'])).username,
            'date': now.__str__()
        }))

    async def notification_message(self, event):
        message = event['message']
        cate = event['cate']
        now = datetime.datetime.now()
        # Send message to WebSocket
        if cate == "notification":
            await self.send(text_data=json.dumps({
                'type': 'notification',
                'message': message,
                'from_user': event['from_user'],
                'date': str(now),
                'id': event['id'],
            }))

    @database_sync_to_async
    def get_notification(self, notification_id):
        return Notification.objects.get(pk=notification_id)
        pass

    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(pk=user_id)

    @database_sync_to_async
    def get_user_by_name(self, username):
        return User.objects.get(username=username)

    @database_sync_to_async
    def put_notification(self, text, from_username, to_username):
        notification = Notification(from_user=User.objects.get(username=from_username),
                                    to_user=User.objects.get(username=to_username),
                                    content=text,
                                    date=datetime.datetime.now(),
                                    seen=False,
                                    )
        notification.save()
        return notification

    '''@database_sync_to_async
    def get_group(self, group_id):
        return Group.objects.get(pk=group_id)'''

    @database_sync_to_async
    def get_group(self, group_name):
        print("group name: ", group_name)
        return Group.objects.get(pk=group_name)

    @database_sync_to_async
    def put_message(self, text, group_id, from_user):
        if group_id is not None:
            group = Group.objects.get(pk=group_id)
            message = Message(from_user=from_user,
                              content=text,
                              date=datetime.datetime.now(),
                              to_group=group, )

            message.save()
        else:
            return

    @database_sync_to_async
    def group_add_user(self, group, user):
        group.user.add(user)
        group.save()

    # create relation between user and websocket
    @database_sync_to_async
    def add_clients(self):
        obj, created = Clients.objects.get_or_create(
            user=self.user,
            layer=self.channel_name)

    # delete relation between user and websocket
    @database_sync_to_async
    def delete_client(self):
        Clients.objects.filter(user=self.user).delete()

    # get all user's layer in a group
    @database_sync_to_async
    def get_all_user_layer(self, group_name):
        group = Group.objects.get(pk=group_name)
        all_layer = Clients.objects.filter(user__in=[each for each in group.user.all()])
        return [layer.layer for layer in all_layer]
