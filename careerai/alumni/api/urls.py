from django.urls import path, include
from rest_framework_nested import routers
from . import views

router = routers.DefaultRouter()
router.register(r'alumni', views.AlumniViewSet, basename='alumni')
router.register(r'mentorship-areas', views.MentorshipAreaViewSet, basename='mentorship-area')
router.register(r'mentor-profiles', views.MentorProfileViewSet, basename='mentor-profile')
router.register(r'mentorship-requests', views.MentorshipRequestViewSet, basename='mentorship-request')
router.register(r'mentorship-relationships', views.MentorshipRelationshipViewSet, basename='mentorship-relationship')
router.register(r'events', views.AlumniEventViewSet, basename='alumni-event')
router.register(r'referrals', views.AlumniReferralViewSet, basename='alumni-referral')

# Nested router for mentorship sessions
relationship_router = routers.NestedDefaultRouter(router, r'mentorship-relationships', lookup='relationship')
relationship_router.register(r'sessions', views.MentorshipSessionViewSet, basename='mentorship-session')

# Nested router for event registrations
event_router = routers.NestedDefaultRouter(router, r'events', lookup='event')
event_router.register(r'registrations', views.EventRegistrationViewSet, basename='event-registration')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(relationship_router.urls)),
    path('', include(event_router.urls)),
]