from rest_framework import serializers
from ..models import CourseCategory, Course, Module, Lesson, Enrollment, LessonProgress, CourseReview

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'
        read_only_fields = ['module']

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = Module
        fields = '__all__'
        read_only_fields = ['course']

class CourseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCategory
        fields = '__all__'

class CourseReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseReview
        fields = ['id', 'user', 'user_name', 'course', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CourseListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'category', 'category_name',
            'difficulty_level', 'duration_in_weeks', 'instructor_name',
            'thumbnail', 'is_active', 'created_at', 'average_rating',
            'total_reviews', 'is_enrolled'
        ]
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return None
        return sum(review.rating for review in reviews) / reviews.count()
    
    def get_total_reviews(self, obj):
        return obj.reviews.count()
    
    def get_is_enrolled(self, obj):
        user = self.context.get('request').user
        if user and user.is_authenticated:
            return obj.enrollments.filter(user=user).exists()
        return False

class CourseDetailSerializer(CourseListSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    reviews = CourseReviewSerializer(many=True, read_only=True)
    
    class Meta(CourseListSerializer.Meta):
        fields = CourseListSerializer.Meta.fields + ['modules', 'reviews']

class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'user', 'course', 'course_title', 'enrolled_at',
            'completed', 'completed_at', 'progress_percentage'
        ]
        read_only_fields = ['user', 'enrolled_at', 'completed', 'completed_at']
    
    def get_progress_percentage(self, obj):
        total_lessons = obj.course.modules.values_list('lessons', flat=True).count()
        if total_lessons == 0:
            return 0
        
        completed_lessons = obj.lesson_progress.filter(completed=True).count()
        return int((completed_lessons / total_lessons) * 100)
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    module_title = serializers.CharField(source='lesson.module.title', read_only=True)
    
    class Meta:
        model = LessonProgress
        fields = [
            'id', 'enrollment', 'lesson', 'lesson_title', 'module_title',
            'completed', 'last_accessed', 'time_spent_minutes'
        ]
        read_only_fields = ['enrollment', 'lesson', 'last_accessed']