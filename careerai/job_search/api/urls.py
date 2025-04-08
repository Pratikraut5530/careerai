from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'jobs', views.JobListingViewSet, basename='job')
router.register(r'applications', views.JobApplicationViewSet, basename='application')
router.register(r'saved-jobs', views.SavedJobViewSet, basename='saved-job')
router.register(r'job-alerts', views.JobAlertViewSet, basename='job-alert')
router.register(r'cold-emails', views.ColdEmailViewSet, basename='cold-email')

urlpatterns = [
    path('', include(router.urls)),
]