from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
import json

from ..models import Resume, ResumeAnalysis, LearningPath, LearningPathItem, LearningNote
from .serializers import (
    ResumeSerializer, ResumeAnalysisSerializer, LearningPathSerializer,
    LearningPathItemSerializer, LearningNoteSerializer
)

class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'updated_at', 'version']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def submit_for_review(self, request, pk=None):
        resume = self.get_object()
        
        if resume.status != 'draft':
            return Response(
                {'detail': 'Only resumes in draft status can be submitted for review'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        resume.status = 'submitted'
        resume.save()
        
        # In a real application, you might trigger a background task to analyze the resume
        # For now, we'll create a placeholder analysis
        analysis, created = ResumeAnalysis.objects.get_or_create(
            resume=resume,
            defaults={
                'analysis_text': 'Your resume is currently being analyzed. Check back soon!',
                'strengths': 'Pending analysis',
                'weaknesses': 'Pending analysis',
                'improvement_suggestions': 'Pending analysis',
                'ai_generated_score': None
            }
        )
        
        serializer = self.get_serializer(resume)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def analysis(self, request, pk=None):
        resume = self.get_object()
        
        try:
            analysis = ResumeAnalysis.objects.get(resume=resume)
            serializer = ResumeAnalysisSerializer(analysis)
            return Response(serializer.data)
        except ResumeAnalysis.DoesNotExist:
            return Response(
                {'detail': 'No analysis available for this resume'},
                status=status.HTTP_404_NOT_FOUND
            )

class ResumeAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ResumeAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ResumeAnalysis.objects.filter(resume__user=self.request.user)

class LearningPathViewSet(viewsets.ModelViewSet):
    serializer_class = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return LearningPath.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def generate_path(self, request, pk=None):
        learning_path = self.get_object()
        
        # In a real app, you would use AI to generate a custom learning path
        # For now, we'll create a placeholder with sample items
        
        # Clear existing items
        learning_path.items.all().delete()
        
        # Create new sample items
        sample_items = [
            {
                'title': 'Learn Core Concepts',
                'description': 'Understanding the fundamentals',
                'item_type': 'resource',
                'order': 1,
                'priority': 'high',
                'estimated_completion_days': 7
            },
            {
                'title': 'Take Online Course',
                'description': 'Complete a comprehensive course',
                'item_type': 'course',
                'order': 2,
                'priority': 'high',
                'estimated_completion_days': 30
            },
            {
                'title': 'Build Practice Project',
                'description': 'Apply your knowledge in a real project',
                'item_type': 'project',
                'order': 3,
                'priority': 'medium',
                'estimated_completion_days': 14
            },
            {
                'title': 'Take Assessment',
                'description': 'Test your knowledge',
                'item_type': 'assessment',
                'order': 4,
                'priority': 'medium',
                'estimated_completion_days': 1
            }
        ]
        
        for item_data in sample_items:
            LearningPathItem.objects.create(learning_path=learning_path, **item_data)
        
        # Return the updated learning path
        serializer = self.get_serializer(learning_path)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        learning_path = self.get_object()
        total_items = learning_path.items.count()
        
        if total_items == 0:
            return Response({'progress_percentage': 0})
        
        completed_items = learning_path.items.filter(is_completed=True).count()
        progress_percentage = int((completed_items / total_items) * 100)
        
        return Response({
            'total_items': total_items,
            'completed_items': completed_items,
            'progress_percentage': progress_percentage
        })

class LearningPathItemViewSet(viewsets.ModelViewSet):
    serializer_class = LearningPathItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        learning_path_id = self.kwargs.get('learning_path_pk')
        return LearningPathItem.objects.filter(
            learning_path_id=learning_path_id,
            learning_path__user=self.request.user
        ).order_by('order')
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, learning_path_pk=None, pk=None):
        item = self.get_object()
        item.mark_as_completed()
        serializer = self.get_serializer(item)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reorder(self, request, learning_path_pk=None, pk=None):
        item = self.get_object()
        new_order = request.data.get('order')
        
        if new_order is None:
            return Response(
                {'detail': 'New order is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all items in the learning path
        all_items = LearningPathItem.objects.filter(
            learning_path_id=learning_path_pk
        ).order_by('order')
        
        # Update orders
        current_order = item.order
        if new_order > current_order:
            # Moving down
            items_to_update = all_items.filter(
                order__gt=current_order,
                order__lte=new_order
            )
            for update_item in items_to_update:
                update_item.order -= 1
                update_item.save()
        else:
            # Moving up
            items_to_update = all_items.filter(
                order__lt=current_order,
                order__gte=new_order
            )
            for update_item in items_to_update:
                update_item.order += 1
                update_item.save()
        
        # Update the item's order
        item.order = new_order
        item.save()
        
        # Return all items in their new order
        serializer = self.get_serializer(all_items.order_by('order'), many=True)
        return Response(serializer.data)

class LearningNoteViewSet(viewsets.ModelViewSet):
    serializer_class = LearningNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = LearningNote.objects.filter(user=self.request.user)
        
        # Filter by learning path item if provided
        learning_path_item_id = self.kwargs.get('learning_path_item_pk')
        if learning_path_item_id:
            queryset = queryset.filter(learning_path_item_id=learning_path_item_id)
            
        return queryset
    
    def perform_create(self, serializer):
        # If this is a nested route under a learning path item, set it automatically
        learning_path_item_id = self.kwargs.get('learning_path_item_pk')
        if learning_path_item_id:
            learning_path_item = get_object_or_404(
                LearningPathItem, 
                id=learning_path_item_id,
                learning_path__user=self.request.user
            )
            serializer.save(user=self.request.user, learning_path_item=learning_path_item)
        else:
            serializer.save(user=self.request.user)