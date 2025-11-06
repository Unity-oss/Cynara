"""
Cynara Recommendations URLs

URL patterns for AI-powered movie recommendations.
"""

from django.urls import path
from . import views

app_name = 'recommendations'

urlpatterns = [
    # Main recommendations page
    path('', views.RecommendationsView.as_view(), name='home'),
    
    # Different recommendation algorithms
    path('for-you/', views.PersonalizedRecommendationsView.as_view(), name='personalized'),
    path('trending/', views.TrendingMoviesView.as_view(), name='trending'),
    path('similar/<slug:movie_slug>/', views.SimilarMoviesView.as_view(), name='similar'),
    
    # Recommendation feedback
    path('feedback/', views.RecommendationFeedbackView.as_view(), name='feedback'),
    
    # API endpoints
    path('api/generate/', views.generate_recommendations, name='generate'),
    path('api/feedback/<int:movie_id>/', views.submit_feedback, name='submit_feedback'),
    path('api/refresh/', views.refresh_recommendations, name='refresh'),
]