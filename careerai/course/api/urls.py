from django.urls import path, include
from rest_framework_nested import routers
from . import views

router = routers.DefaultRouter()
router.register(r'categories', views.CourseCategoryViewSet)
router.register(r'courses', views.CourseViewSet, basename='course')  # Add basename parameter
router.register(r'enrollments', views.EnrollmentViewSet, basename='enrollment')

# Nested routes for course modules
courses_router = routers.NestedDefaultRouter(router, r'courses', lookup='course')
courses_router.register(r'modules', views.ModuleViewSet, basename='course-modules')

# Nested routes for module lessons
modules_router = routers.NestedDefaultRouter(courses_router, r'modules', lookup='module')
modules_router.register(r'lessons', views.LessonViewSet, basename='module-lessons')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(courses_router.urls)),
    path('', include(modules_router.urls)),
]