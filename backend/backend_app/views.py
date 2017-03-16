from django.shortcuts import render
from django.contrib.auth.models import User, Group

from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import BasePermission
from rest_framework import generics
from rest_framework.compat import is_authenticated

from . import serializers


SAFE_METHODS = ['GET', ]


class CreateOnly(BasePermission):
    pass
    # def has_permission(self, request, view):
    #     if request.method in SAFE_METHODS and request.user.groups.filter(name='manager').exists():
    #         return True
    #     return True




class UserList(generics.ListCreateAPIView):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (CreateOnly,)
    #queryset = User.objects.all()
    serializer_class = serializers.UserSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        instance.groups.add(Group.objects.get(name='user'))

    def get_queryset(self):
        if (self.request.user.groups.filter(name='manager').exists() or
                self.request.user.groups.filter(name='admin').exists()):
            return User.objects.filter(groups__name='user')
        else:
            return []




