from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'profile', views.UserProfileViewSet, basename='user-profile')
router.register(r'skills', views.SkillViewSet, basename='skill')
router.register(r'companies', views.CompanyViewSet, basename='company')
router.register(r'locations', views.LocationViewSet, basename='location')
router.register(r'education-levels', views.EducationLevelViewSet, basename='education-level')
router.register(r'employment-types', views.EmploymentTypeViewSet, basename='employment-type')
router.register(r'work-environments', views.DesiredWorkEnvironmentViewSet, basename='work-environment')
router.register(r'job-roles', views.JobRoleViewSet, basename='job-role')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    path('me/', views.CurrentUserView.as_view(), name='current-user'),
]