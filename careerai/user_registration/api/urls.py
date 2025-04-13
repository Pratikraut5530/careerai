from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'skills', views.SkillViewSet, basename='skill')
router.register(r'locations', views.LocationViewSet, basename='location')
router.register(r'companies', views.CompanyViewSet, basename='company')
router.register(r'employment-types', views.EmploymentTypeViewSet, basename='employment-type')
router.register(r'user-skills', views.UserSkillViewSet, basename='user-skill')
router.register(r'preferences', views.UserPreferenceViewSet, basename='preference')

urlpatterns = [
    path('', include(router.urls)),
    
    # Auth endpoints
    path('register/', views.AuthViewSet.as_view({'post': 'register'}), name='register'),
    path('login/', views.AuthViewSet.as_view({'post': 'login'}), name='login'),
    path('logout/', views.AuthViewSet.as_view({'post': 'logout'}), name='logout'),
    path('profile/', views.AuthViewSet.as_view({
        'get': 'profile',
        'post': 'profile',
        'put': 'profile',
        'patch': 'profile'
    }), name='profile'),
    path('me/', views.AuthViewSet.as_view({
        'get': 'me',
        'patch': 'me'
    }), name='me'),
    path('request_password_reset/', views.AuthViewSet.as_view({'post': 'request_password_reset'}), name='request_password_reset'),
    path('confirm_password_reset/', views.AuthViewSet.as_view({'post': 'confirm_password_reset'}), name='confirm_password_reset'),
    path('verify_email/', views.AuthViewSet.as_view({'post': 'verify_email'}), name='verify_email'),
]