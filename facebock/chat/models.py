from django.db import models
from django.contrib.auth.models import AbstractUser
import datetime


class User(AbstractUser):
    ukey = models.CharField(max_length=20,blank=True)
    credential_id = models.CharField(max_length=250,blank=True)
    display_name = models.CharField(max_length=160,blank=True)
    pub_key = models.CharField(max_length=65,blank=True)
    sign_count = models.IntegerField(blank=True,null=True)
    rp_id = models.CharField(max_length=253,blank=True)
    icon_url = models.CharField(max_length=2083,blank=True)


class Group(models.Model):
    user = models.ManyToManyField(User)
    display_name = models.CharField(max_length=100)
    type = models.CharField(max_length=20)


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
    to_group = models.ForeignKey(Group, on_delete=None, related_name='message_to_group')
    seen = models.ManyToManyField(User, related_name='message_seen')


class Clients(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    layer = models.CharField(max_length=100)

