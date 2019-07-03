from django.db import models
from django.contrib.auth.models import User
import datetime


# Create your models here.

class Group(models.Model):
    user = models.ManyToManyField(User)
    display_name = models.CharField(max_length=100)

class Notification(models.Model):
    from_user = models.ForeignKey(User, on_delete=None, related_name='notification_from_user')
    to_user = models.ForeignKey(User, on_delete=None, related_name='notification_to_user')
    content = models.CharField(max_length=1000)
    date = models.DateTimeField()
    seen = models.BooleanField()


class Message(models.Model):
    from_user = models.ForeignKey(User, on_delete=None, related_name='message_from_user')
    content = models.CharField(max_length=1000)
    date = models.DateTimeField()
    to_group = models.ForeignKey(Group, on_delete=None, related_name='to_group')
    seen = models.ManyToManyField(User, related_name='seen')
