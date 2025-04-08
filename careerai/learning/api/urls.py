from django.urls import path, include
from rest_framework_nested import routers
from . import views

router = routers.DefaultRouter()
router.register(r'resumes', views.ResumeViewSet, basename='resume')
router.register(r'resume-analyses', views.ResumeAnalysisViewSet, basename='resume-analysis')
router.register(r'learning-paths', views.LearningPathViewSet, basename='learning-path')
router.register(r'notes', views.LearningNoteViewSet, basename='learning-note')

# Nested router for learning path items
learning_path_router = routers.NestedDefaultRouter(router, r'learning-paths', lookup='learning_path')
learning_path_router.register(r'items', views.LearningPathItemViewSet, basename='learning-path-items')

# Nested router for learning notes by item
learning_path_item_router = routers.NestedDefaultRouter(learning_path_router, r'items', lookup='learning_path_item')
learning_path_item_router.register(r'notes', views.LearningNoteViewSet, basename='learning-path-item-notes')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(learning_path_router.urls)),
    path('', include(learning_path_item_router.urls)),
]