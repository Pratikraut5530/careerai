from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication
    path('api/auth/', include('user_registration.api.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # API endpoints for each app
    path('api/courses/', include('course.api.urls')),
    path('api/jobs/', include('job_search.api.urls')),
    path('api/learning/', include('learning.api.urls')),
    path('api/alumni/', include('alumni.api.urls')),
    
    # Browser-based API auth (for development)
    path('api-auth/', include('rest_framework.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)