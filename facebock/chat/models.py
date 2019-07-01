from django.db import models
from django.contrib.auth.models import User
import datetime


# Create your models here.

class Group(models.Model):
    user = models.ManyToManyField(User)


class Notification(models.Model):
    from_user = models.ForeignKey(User, on_delete=None)
    to_user = models.ForeignKey(User, on_delete=None)
    content = models.CharField(max_length=1000)
    date = models.DateTimeField()
    seen = models.BooleanField()


class Message(models.Model):
    from_user = models.ForeignKey(User, on_delete=None)
    content = models.CharField(max_length=1000)
    date = models.DateTimeField()
    to_group = models.ForeignKey(Group, on_delete=None)
    seen = models.ManyToManyField(User)
