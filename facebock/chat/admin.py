from django.contrib import admin
from .models import Group,Message,Notification, Clients

admin.site.register(Group)
admin.site.register(Message)
admin.site.register(Notification)
admin.site.register(Clients)
