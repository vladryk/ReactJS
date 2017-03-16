from rest_framework.permissions import BasePermission


class EditUser(BasePermission):
    def has_permission(self, request, view):
        if (request.user.groups.filter(name='admin').exists() or
                request.user.groups.filter(name='manager').exists()):
            return True
        return False

    def has_object_permission(self, request, view, obj):
        if obj.groups.filter(name='user').exists():
            return True
        return False


class EditExpense(BasePermission):
    def has_permission(self, request, view):
        if (request.user.groups.filter(name='admin').exists() or
                request.user.groups.filter(name='user').exists()):
            return True
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.groups.filter(name='user').exists():
            return obj.user == request.user
        return True