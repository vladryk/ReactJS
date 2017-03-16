from django.contrib.auth.models import User, Group

from rest_framework.filters import DjangoFilterBackend
from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework import generics

from . import serializers
from . import models
from . import filters
from permissions import EditExpense, EditUser


class UserList(generics.ListCreateAPIView):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = ()
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


class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, EditUser)
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer


class ExpensesList(generics.ListCreateAPIView):
    serializer_class = serializers.ExpenseSerializer
    permission_classes = (permissions.IsAuthenticated, EditExpense)
    filter_backends = (DjangoFilterBackend,)
    filter_class = filters.ExpenseFilter

    def get_queryset(self):
        user = self.request.user
        data = []
        if self.request.user.groups.filter(name='user').exists():
            data = models.Expense.objects.filter(user=user)
        elif self.request.user.groups.filter(name='admin').exists():
            data = models.Expense.objects.all()
        return data

    def perform_create(self, serializer):  # FIXME: http://stackoverflow.com/questions/35518273/how-to-set-current-user-to-user-field-in-django-rest-framework
        serializer.save(user=self.request.user)


class ExpensesDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Expense.objects.all()
    serializer_class = serializers.ExpenseSerializer
    permission_classes = (permissions.IsAuthenticated, EditExpense)
