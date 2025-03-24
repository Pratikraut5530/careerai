from rest_framework import permissions

class IsAuthenticatedOrRegistering(permissions.BasePermission):
    """
    Allow access to authenticated users, or unauthenticated users for registration.
    """
    def has_permission(self, request, view):
        # Allow if user is authenticated
        if request.user and request.user.is_authenticated:
            return True
            
        # Allow if user is trying to register
        if view.action == 'register' and request.method == 'POST':
            return True
            
        return False