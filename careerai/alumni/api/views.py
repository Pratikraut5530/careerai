from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q

from ..models import (
    Alumni, MentorshipArea, MentorProfile, MentorshipRequest,
    MentorshipRelationship, MentorshipSession, AlumniEvent,
    EventRegistration, AlumniReferral
)
from .serializers import (
    AlumniSerializer, MentorshipAreaSerializer, MentorProfileSerializer,
    MentorshipRequestSerializer, MentorshipRelationshipSerializer,
    MentorshipSessionSerializer, AlumniEventSerializer,
    EventRegistrationSerializer, AlumniReferralSerializer
)

class AlumniViewSet(viewsets.ModelViewSet):
    serializer_class = AlumniSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'position', 'bio']
    
    def get_queryset(self):
        # Regular users can only see their own alumni profile
        if self.action in ['list', 'retrieve']:
            return Alumni.objects.all()
        return Alumni.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            alumni = Alumni.objects.get(user=request.user)
            serializer = self.get_serializer(alumni)
            return Response(serializer.data)
        except Alumni.DoesNotExist:
            return Response(
                {'detail': 'Alumni profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def mentors(self, request):
        mentors = Alumni.objects.filter(is_mentor=True)
        serializer = self.get_serializer(mentors, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def for_referrals(self, request):
        available_for_referrals = Alumni.objects.filter(is_available_for_referrals=True)
        serializer = self.get_serializer(available_for_referrals, many=True)
        return Response(serializer.data)

class MentorshipAreaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MentorshipArea.objects.all()
    serializer_class = MentorshipAreaSerializer
    permission_classes = [permissions.IsAuthenticated]

class MentorProfileViewSet(viewsets.ModelViewSet):
    serializer_class = MentorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.action in ['list', 'retrieve']:
            return MentorProfile.objects.filter(is_active=True)
        
        # For other actions, only allow alumni who own the profile to edit
        try:
            alumni = Alumni.objects.get(user=self.request.user)
            return MentorProfile.objects.filter(alumni=alumni)
        except Alumni.DoesNotExist:
            return MentorProfile.objects.none()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            alumni = Alumni.objects.get(user=request.user)
            mentor_profile = MentorProfile.objects.get(alumni=alumni)
            serializer = self.get_serializer(mentor_profile)
            return Response(serializer.data)
        except (Alumni.DoesNotExist, MentorProfile.DoesNotExist):
            return Response(
                {'detail': 'Mentor profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def by_expertise(self, request):
        expertise_area_id = request.query_params.get('expertise_area_id')
        if not expertise_area_id:
            return Response(
                {'detail': 'expertise_area_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        mentors = MentorProfile.objects.filter(
            expertise_areas__id=expertise_area_id,
            is_active=True
        ).distinct()
        
        serializer = self.get_serializer(mentors, many=True)
        return Response(serializer.data)

class MentorshipRequestViewSet(viewsets.ModelViewSet):
    serializer_class = MentorshipRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Return both sent and received requests
        try:
            alumni = Alumni.objects.get(user=user)
            mentor_profile = MentorProfile.objects.get(alumni=alumni)
            
            # If user is a mentor, show requests sent to them
            return MentorshipRequest.objects.filter(
                Q(user=user) |  # Requests sent by the user
                Q(mentor=mentor_profile)  # Requests received by the user as a mentor
            )
        except (Alumni.DoesNotExist, MentorProfile.DoesNotExist):
            # If user is not a mentor, show only their sent requests
            return MentorshipRequest.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        mentorship_request = self.get_object()
        
        # Check that this request is to the current user as a mentor
        try:
            alumni = Alumni.objects.get(user=request.user)
            mentor_profile = MentorProfile.objects.get(alumni=alumni)
            
            if mentorship_request.mentor != mentor_profile:
                return Response(
                    {'detail': 'You are not the mentor for this request'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if mentorship_request.status != 'pending':
                return Response(
                    {'detail': f'Request is already {mentorship_request.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Accept the request
            mentorship_request.status = 'accepted'
            mentorship_request.responded_at = timezone.now()
            mentorship_request.save()
            
            # Create a mentorship relationship
            goals = request.data.get('goals', 'No specific goals provided')
            relationship = MentorshipRelationship.objects.create(
                mentor=mentor_profile,
                mentee=mentorship_request.user,
                goals=goals
            )
            
            # Return the updated request
            serializer = self.get_serializer(mentorship_request)
            return Response(serializer.data)
            
        except (Alumni.DoesNotExist, MentorProfile.DoesNotExist):
            return Response(
                {'detail': 'You do not have a mentor profile'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        mentorship_request = self.get_object()
        
        # Check that this request is to the current user as a mentor
        try:
            alumni = Alumni.objects.get(user=request.user)
            mentor_profile = MentorProfile.objects.get(alumni=alumni)
            
            if mentorship_request.mentor != mentor_profile:
                return Response(
                    {'detail': 'You are not the mentor for this request'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if mentorship_request.status != 'pending':
                return Response(
                    {'detail': f'Request is already {mentorship_request.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Reject the request
            mentorship_request.status = 'rejected'
            mentorship_request.responded_at = timezone.now()
            mentorship_request.save()
            
            # Return the updated request
            serializer = self.get_serializer(mentorship_request)
            return Response(serializer.data)
            
        except (Alumni.DoesNotExist, MentorProfile.DoesNotExist):
            return Response(
                {'detail': 'You do not have a mentor profile'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        mentorship_request = self.get_object()
        
        # Check that this request was created by the current user
        if mentorship_request.user != request.user:
            return Response(
                {'detail': 'You did not create this request'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if mentorship_request.status != 'pending':
            return Response(
                {'detail': f'Request is already {mentorship_request.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cancel the request
        mentorship_request.status = 'canceled'
        mentorship_request.save()
        
        # Return the updated request
        serializer = self.get_serializer(mentorship_request)
        return Response(serializer.data)

class MentorshipRelationshipViewSet(viewsets.ModelViewSet):
    serializer_class = MentorshipRelationshipSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Return both relationships where user is mentor or mentee
        try:
            alumni = Alumni.objects.get(user=user)
            mentor_profile = MentorProfile.objects.get(alumni=alumni)
            
            return MentorshipRelationship.objects.filter(
                Q(mentor=mentor_profile) |  # User is the mentor
                Q(mentee=user)  # User is the mentee
            )
        except (Alumni.DoesNotExist, MentorProfile.DoesNotExist):
            # If user is not a mentor, show only where they are mentee
            return MentorshipRelationship.objects.filter(mentee=user)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        relationship = self.get_object()
        
        # Check that the user is part of this relationship
        user = request.user
        try:
            alumni = Alumni.objects.get(user=user)
            mentor_profile = MentorProfile.objects.get(alumni=alumni)
            
            if relationship.mentor != mentor_profile and relationship.mentee != user:
                return Response(
                    {'detail': 'You are not part of this mentorship relationship'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Complete the relationship
            relationship.status = 'completed'
            relationship.ended_at = timezone.now()
            relationship.save()
            
            # Return the updated relationship
            serializer = self.get_serializer(relationship)
            return Response(serializer.data)
            
        except (Alumni.DoesNotExist, MentorProfile.DoesNotExist):
            # Check if user is the mentee
            if relationship.mentee != user:
                return Response(
                    {'detail': 'You are not part of this mentorship relationship'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Complete the relationship
            relationship.status = 'completed'
            relationship.ended_at = timezone.now()
            relationship.save()
            
            # Return the updated relationship
            serializer = self.get_serializer(relationship)
            return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def terminate(self, request, pk=None):
        relationship = self.get_object()
        
        # Similar logic to complete
        user = request.user
        try:
            alumni = Alumni.objects.get(user=user)
            mentor_profile = MentorProfile.objects.get(alumni=alumni)
            
            if relationship.mentor != mentor_profile and relationship.mentee != user:
                return Response(
                    {'detail': 'You are not part of this mentorship relationship'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Terminate the relationship
            relationship.status = 'terminated'
            relationship.ended_at = timezone.now()
            relationship.save()
            
            # Return the updated relationship
            serializer = self.get_serializer(relationship)
            return Response(serializer.data)
            
        except (Alumni.DoesNotExist, MentorProfile.DoesNotExist):
            # Check if user is the mentee
            if relationship.mentee != user:
                return Response(
                    {'detail': 'You are not part of this mentorship relationship'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Terminate the relationship
            relationship.status = 'terminated'
            relationship.ended_at = timezone.now()
            relationship.save()
            
            # Return the updated relationship
            serializer = self.get_serializer(relationship)
            return Response(serializer.data)

class MentorshipSessionViewSet(viewsets.ModelViewSet):
    serializer_class = MentorshipSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        relationship_id = self.kwargs.get('relationship_pk')
        
        if relationship_id:
            # Check if user is part of this relationship
            try:
                relationship = MentorshipRelationship.objects.get(id=relationship_id)
                alumni = Alumni.objects.get(user=user)
                mentor_profile = MentorProfile.objects.get(alumni=alumni)
                
                if relationship.mentor != mentor_profile and relationship.mentee != user:
                    return MentorshipSession.objects.none()
                
                return MentorshipSession.objects.filter(relationship_id=relationship_id)
                
            except (MentorshipRelationship.DoesNotExist, Alumni.DoesNotExist, MentorProfile.DoesNotExist):
                # Check if user is the mentee
                try:
                    relationship = MentorshipRelationship.objects.get(id=relationship_id)
                    if relationship.mentee != user:
                        return MentorshipSession.objects.none()
                    
                    return MentorshipSession.objects.filter(relationship_id=relationship_id)
                
                except MentorshipRelationship.DoesNotExist:
                    return MentorshipSession.objects.none()
        
        # If no relationship_id, return all sessions for relationships the user is part of
        try:
            alumni = Alumni.objects.get(user=user)
            mentor_profile = MentorProfile.objects.get(alumni=alumni)
            
            relationships = MentorshipRelationship.objects.filter(
                Q(mentor=mentor_profile) |  # User is the mentor
                Q(mentee=user)  # User is the mentee
            )
            
            return MentorshipSession.objects.filter(relationship__in=relationships)
            
        except (Alumni.DoesNotExist, MentorProfile.DoesNotExist):
            # If user is not a mentor, show only where they are mentee
            relationships = MentorshipRelationship.objects.filter(mentee=user)
            return MentorshipSession.objects.filter(relationship__in=relationships)

class AlumniEventViewSet(viewsets.ModelViewSet):
    serializer_class = AlumniEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['start_datetime', 'end_datetime', 'created_at']
    ordering = ['start_datetime']
    
    def get_queryset(self):
        # For modifying actions, only allow organizer
        if self.action in ['update', 'partial_update', 'destroy']:
            return AlumniEvent.objects.filter(organizer=self.request.user)
        
        # For listing/viewing, show all events
        queryset = AlumniEvent.objects.all()
        
        # Filter by event type
        event_type = self.request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by location
        location_id = self.request.query_params.get('location_id')
        if location_id:
            queryset = queryset.filter(location_id=location_id)
        
        # Filter by virtual option
        is_virtual = self.request.query_params.get('is_virtual')
        if is_virtual is not None:
            is_virtual_bool = is_virtual.lower() == 'true'
            queryset = queryset.filter(is_virtual=is_virtual_bool)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(start_datetime__date__gte=start_date)
        
        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(end_datetime__date__lte=end_date)
        
        # Filter for upcoming events
        upcoming = self.request.query_params.get('upcoming')
        if upcoming and upcoming.lower() == 'true':
            queryset = queryset.filter(start_datetime__gte=timezone.now())
        
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
    
    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        event = self.get_object()
        user = request.user
        
        # Check if registration deadline has passed
        if event.registration_deadline and timezone.now() > event.registration_deadline:
            return Response(
                {'detail': 'Registration deadline has passed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already registered
        if EventRegistration.objects.filter(event=event, user=user).exists():
            return Response(
                {'detail': 'You are already registered for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if event is at capacity
        if event.max_participants and event.registrations.count() >= event.max_participants:
            return Response(
                {'detail': 'Event has reached maximum capacity'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Register for the event
        registration = EventRegistration.objects.create(event=event, user=user)
        
        serializer = EventRegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def unregister(self, request, pk=None):
        event = self.get_object()
        user = request.user
        
        try:
            registration = EventRegistration.objects.get(event=event, user=user)
            registration.delete()
            return Response({'detail': 'Successfully unregistered from event'})
        except EventRegistration.DoesNotExist:
            return Response(
                {'detail': 'You are not registered for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )

class EventRegistrationViewSet(viewsets.ModelViewSet):
    serializer_class = EventRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        event_id = self.kwargs.get('event_pk')
        
        if event_id:
            # Only the event organizer or the registered user can see specific registrations
            try:
                event = AlumniEvent.objects.get(id=event_id)
                user = self.request.user
                
                if event.organizer == user:
                    # Organizer can see all registrations
                    return EventRegistration.objects.filter(event_id=event_id)
                else:
                    # Other users can only see their own registrations
                    return EventRegistration.objects.filter(event_id=event_id, user=user)
                
            except AlumniEvent.DoesNotExist:
                return EventRegistration.objects.none()
        
        # Without event_id, users see their own registrations
        return EventRegistration.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_attended(self, request, event_pk=None, pk=None):
        registration = self.get_object()
        
        # Only event organizer can mark attendance
        if registration.event.organizer != request.user:
            return Response(
                {'detail': 'Only the event organizer can mark attendance'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        registration.attended = True
        registration.save()
        
        serializer = self.get_serializer(registration)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_feedback(self, request, event_pk=None, pk=None):
        registration = self.get_object()
        
        # Only the registered user can provide feedback
        if registration.user != request.user:
            return Response(
                {'detail': 'You can only provide feedback for your own registration'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        feedback = request.data.get('feedback')
        if not feedback:
            return Response(
                {'detail': 'Feedback is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        registration.feedback = feedback
        registration.save()
        
        serializer = self.get_serializer(registration)
        return Response(serializer.data)

class AlumniReferralViewSet(viewsets.ModelViewSet):
    serializer_class = AlumniReferralSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Return both sent and received referrals
        try:
            alumni = Alumni.objects.get(user=user)
            return AlumniReferral.objects.filter(
                Q(requester=user) |  # Referrals requested by the user
                Q(alumni=alumni)  # Referrals received by the user as an alumni
            )
        except Alumni.DoesNotExist:
            # If user is not an alumni, show only their requests
            return AlumniReferral.objects.filter(requester=user)
    
    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        referral = self.get_object()
        
        # Check that this referral is to the current user as an alumni
        try:
            alumni = Alumni.objects.get(user=request.user)
            
            if referral.alumni != alumni:
                return Response(
                    {'detail': 'This referral was not requested from you'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if referral.status != 'pending':
                return Response(
                    {'detail': f'Referral is already {referral.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Accept the referral
            referral.status = 'accepted'
            referral.save()
            
            # Return the updated referral
            serializer = self.get_serializer(referral)
            return Response(serializer.data)
            
        except Alumni.DoesNotExist:
            return Response(
                {'detail': 'You do not have an alumni profile'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        referral = self.get_object()
        
        # Check that this referral is to the current user as an alumni
        try:
            alumni = Alumni.objects.get(user=request.user)
            
            if referral.alumni != alumni:
                return Response(
                    {'detail': 'This referral was not requested from you'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if referral.status != 'pending':
                return Response(
                    {'detail': f'Referral is already {referral.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Reject the referral
            referral.status = 'rejected'
            referral.save()
            
            # Return the updated referral
            serializer = self.get_serializer(referral)
            return Response(serializer.data)
            
        except Alumni.DoesNotExist:
            return Response(
                {'detail': 'You do not have an alumni profile'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        referral = self.get_object()
        
        # Only the alumni who accepted the referral can mark it complete
        try:
            alumni = Alumni.objects.get(user=request.user)
            
            if referral.alumni != alumni:
                return Response(
                    {'detail': 'This referral was not requested from you'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if referral.status != 'accepted':
                return Response(
                    {'detail': 'Referral must be accepted before being completed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Complete the referral
            referral.status = 'completed'
            referral.save()
            
            # Return the updated referral
            serializer = self.get_serializer(referral)
            return Response(serializer.data)
            
        except Alumni.DoesNotExist:
            return Response(
                {'detail': 'You do not have an alumni profile'},
                status=status.HTTP_403_FORBIDDEN
            )