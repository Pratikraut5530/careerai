from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from user_registration.api.views import (
    UserViewSet, UserProfileViewSet, SkillViewSet,
    CompanyViewSet, LocationViewSet, EducationLevelViewSet,
    EmploymentTypeViewSet, DesiredWorkEnvironmentViewSet, JobRoleViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'companies', CompanyViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'education-levels', EducationLevelViewSet)
router.register(r'employment-types', EmploymentTypeViewSet)
router.register(r'work-environments', DesiredWorkEnvironmentViewSet)
router.register(r'job-roles', JobRoleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]