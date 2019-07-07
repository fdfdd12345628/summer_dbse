from django.conf.urls import url
from django.urls import path
from . import views
from .views import webauthn_begin_activate,webauthn_begin_assertion,verify_credential_info

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^(?P<room_name>[^/]+)/$', views.room, name='room'),
    path("webauthn_begin_activate", webauthn_begin_activate),
    path("webauthn_begin_assertion", webauthn_begin_assertion),
    path("verify_credential_info", verify_credential_info),
]
