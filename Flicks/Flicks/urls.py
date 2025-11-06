"""
URL configuration for Cynara (Flicks) project.

Cynara - Personal Movie Streaming Platform
Main URL routing configuration.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

# Customize admin site header
admin.site.site_header = "Cynara Administration"
admin.site.site_title = "Cynara Admin"
admin.site.index_title = "Welcome to Cynara Administration"

urlpatterns = [
    # Admin interface
    path("admin/", admin.site.urls),
    
    # Main movies app (homepage and movie browsing)
    path("", include("movies.urls")),
    
    # User authentication
    path("accounts/", include("accounts.urls")),
    
    # Recommendations and AI features
    path("recommendations/", include("recommendations.urls")),
    
    # Redirect old home URL to movies
    path("home/", RedirectView.as_view(url='/', permanent=True)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
