from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from user_registration.api.views import (
    UserViewSet, UserProfileViewSet, SkillViewSet,
    IndustryViewSet, EducationLevelViewSet,
    PreferredEmploymentTypeViewSet, DesiredWorkEnvironmentViewSet,
    JobRoleViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'industries', IndustryViewSet)
router.register(r'education-levels', EducationLevelViewSet)
router.register(r'employment-types', PreferredEmploymentTypeViewSet)
router.register(r'work-environments', DesiredWorkEnvironmentViewSet)
router.register(r'job-roles', JobRoleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]