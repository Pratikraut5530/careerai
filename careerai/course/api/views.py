from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Avg
from django.conf import settings
from django.utils import timezone

from ..models import CourseCategory, Course, Module, Lesson, Enrollment, LessonProgress, CourseReview
from .serializers import (
    CourseCategorySerializer, CourseListSerializer, CourseDetailSerializer,
    ModuleSerializer, LessonSerializer, EnrollmentSerializer, LessonProgressSerializer,
    CourseReviewSerializer
)
from ..services.course_apis import get_course_api_client

class CourseCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'instructor_name', 'category__name']
    ordering_fields = ['title', 'created_at', 'duration_in_weeks']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer
    
    def get_queryset(self):
        queryset = Course.objects.filter(is_active=True)
        
        # Check if we should fetch fresh data from APIs
        should_refresh = self.request.query_params.get('refresh', 'false').lower() == 'true'
        if should_refresh and settings.USE_REAL_COURSE_APIS:
            try:
                # Get course API client and sync courses
                course_api_client = get_course_api_client()
                course_api_client.sync_courses()
            except Exception as e:
                print(f"Error refreshing courses: {str(e)}")
        
        # Apply filters
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        difficulty_level = self.request.query_params.get('difficulty_level')
        if difficulty_level:
            queryset = queryset.filter(difficulty_level=difficulty_level)
        
        duration_max = self.request.query_params.get('duration_max')
        if duration_max:
            queryset = queryset.filter(duration_in_weeks__lte=int(duration_max))
        
        # Free text search across multiple fields
        keywords = self.request.query_params.get('keywords')
        if keywords:
            keyword_query = Q()
            for keyword in keywords.split():
                keyword_query |= (
                    Q(title__icontains=keyword) |
                    Q(description__icontains=keyword) |
                    Q(instructor_name__icontains=keyword) |
                    Q(category__name__icontains=keyword)
                )
            queryset = queryset.filter(keyword_query)
        
        return queryset.select_related('category')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user = request.user
        
        # Check if already enrolled
        if Enrollment.objects.filter(course=course, user=user).exists():
            return Response(
                {'detail': 'You are already enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create enrollment
        enrollment = Enrollment.objects.create(
            course=course,
            user=user
        )
        
        # Create lesson progress records for all lessons
        lessons = Lesson.objects.filter(module__course=course)
        lesson_progress_objects = [
            LessonProgress(
                enrollment=enrollment,
                lesson=lesson
            )
            for lesson in lessons
        ]
        
        if lesson_progress_objects:
            LessonProgress.objects.bulk_create(lesson_progress_objects)
        
        serializer = EnrollmentSerializer(enrollment, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        course = self.get_object()
        user = request.user
        
        # Check if user is enrolled
        if not Enrollment.objects.filter(course=course, user=user).exists():
            return Response(
                {'detail': 'You must be enrolled in this course to review it'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get rating and comment from request
        rating = request.data.get('rating')
        comment = request.data.get('comment', '')
        
        if not rating:
            return Response(
                {'detail': 'Rating is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                raise ValueError
        except ValueError:
            return Response(
                {'detail': 'Rating must be an integer between 1 and 5'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create or update review
        review, created = CourseReview.objects.update_or_create(
            user=user,
            course=course,
            defaults={
                'rating': rating,
                'comment': comment
            }
        )
        
        serializer = CourseReviewSerializer(review, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most popular courses based on enrollment count"""
        # Get courses with the most enrollments
        popular_courses = Course.objects.filter(is_active=True)\
            .annotate(enrollment_count=models.Count('enrollments'))\
            .order_by('-enrollment_count')[:10]
        
        serializer = CourseListSerializer(
            popular_courses, 
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def top_rated(self, request):
        """Get top-rated courses"""
        # Get courses with at least 3 reviews and order by average rating
        top_courses = Course.objects.filter(is_active=True)\
            .annotate(
                review_count=models.Count('reviews'),
                avg_rating=models.Avg('reviews__rating')
            )\
            .filter(review_count__gte=3)\
            .order_by('-avg_rating')[:10]
        
        serializer = CourseListSerializer(
            top_courses, 
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recommended(self, request):
        """Get course recommendations based on user's learning history"""
        user = request.user
        
        # Get categories of courses the user is enrolled in
        user_categories = Course.objects.filter(
            enrollments__user=user
        ).values_list('category_id', flat=True).distinct()
        
        # Get courses in those categories that the user is not enrolled in
        if user_categories:
            recommended_courses = Course.objects.filter(
                category_id__in=user_categories,
                is_active=True
            ).exclude(
                enrollments__user=user
            ).order_by('-created_at')[:10]
        else:
            # If user has no enrollments, get top-rated courses
            recommended_courses = Course.objects.filter(is_active=True)\
                .annotate(avg_rating=models.Avg('reviews__rating'))\
                .order_by('-avg_rating')[:10]
        
        serializer = CourseListSerializer(
            recommended_courses, 
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)


class ModuleViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_pk')
        if course_id:
            return Module.objects.filter(course_id=course_id).order_by('order')
        return Module.objects.none()


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        module_id = self.kwargs.get('module_pk')
        if module_id:
            return Lesson.objects.filter(module_id=module_id).order_by('order')
        return Lesson.objects.none()
    
    @action(detail=True, methods=['post'])
    def mark_complete(self, request, module_pk=None, pk=None):
        lesson = self.get_object()
        user = request.user
        
        # Find the enrollment for this user and course
        try:
            enrollment = Enrollment.objects.get(
                user=user,
                course=lesson.module.course
            )
        except Enrollment.DoesNotExist:
            return Response(
                {'detail': 'You are not enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create lesson progress
        lesson_progress, created = LessonProgress.objects.get_or_create(
            enrollment=enrollment,
            lesson=lesson,
            defaults={'completed': True, 'last_accessed': timezone.now()}
        )
        
        # Update if not created
        if not created:
            lesson_progress.completed = True
            lesson_progress.last_accessed = timezone.now()
            lesson_progress.save()
        
        # Check if all lessons in the course are completed
        all_lessons = Lesson.objects.filter(module__course=lesson.module.course)
        all_completed = LessonProgress.objects.filter(
            enrollment=enrollment,
            lesson__in=all_lessons,
            completed=True
        ).count() == all_lessons.count()
        
        # If all lessons completed, mark the enrollment as completed
        if all_completed and not enrollment.completed:
            enrollment.completed = True
            enrollment.completed_at = timezone.now()
            enrollment.save()
        
        return Response({'detail': 'Lesson marked as complete'})
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, module_pk=None, pk=None):
        lesson = self.get_object()
        user = request.user
        time_spent = request.data.get('time_spent_minutes', 0)
        
        try:
            time_spent = int(time_spent)
            if time_spent < 0:
                raise ValueError
        except ValueError:
            return Response(
                {'detail': 'Time spent must be a positive integer'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find the enrollment for this user and course
        try:
            enrollment = Enrollment.objects.get(
                user=user,
                course=lesson.module.course
            )
        except Enrollment.DoesNotExist:
            return Response(
                {'detail': 'You are not enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create lesson progress
        lesson_progress, created = LessonProgress.objects.get_or_create(
            enrollment=enrollment,
            lesson=lesson,
            defaults={
                'last_accessed': timezone.now(),
                'time_spent_minutes': time_spent
            }
        )
        
        # Update if not created
        if not created:
            lesson_progress.last_accessed = timezone.now()
            lesson_progress.time_spent_minutes += time_spent
            lesson_progress.save()
        
        serializer = LessonProgressSerializer(lesson_progress)
        return Response(serializer.data)


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        enrollment = self.get_object()
        enrollment.mark_as_completed()
        
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        enrollment = self.get_object()
        
        # Get all lessons for the course
        lessons = Lesson.objects.filter(module__course=enrollment.course)
        total_lessons = lessons.count()
        
        if total_lessons == 0:
            return Response({'progress_percentage': 0})
        
        # Get completed lessons
        completed_lessons = LessonProgress.objects.filter(
            enrollment=enrollment,
            completed=True
        ).count()
        
        progress_percentage = int((completed_lessons / total_lessons) * 100)
        
        return Response({
            'enrollment_id': enrollment.id,
            'course_id': enrollment.course.id,
            'course_title': enrollment.course.title,
            'total_lessons': total_lessons,
            'completed_lessons': completed_lessons,
            'progress_percentage': progress_percentage,
            'is_completed': enrollment.completed
        })