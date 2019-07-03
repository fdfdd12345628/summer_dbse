from django.contrib import admin
from .models import Group,Message,Notification

admin.site.register(Group)
admin.site.register(Message)
admin.site.register(Notification)

from .models import Group, Message, Notification


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    pass


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    pass


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    pass

# Register your models here.
