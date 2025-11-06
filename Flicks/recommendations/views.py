"""
Cynara Recommendations Views

AI-powered movie recommendations using OpenAI and user behavior.
"""

from django.shortcuts import render
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from movies.models import Movie


class RecommendationsView(TemplateView):
    """Main recommendations page"""
    template_name = 'recommendations/home.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # For now, show popular movies as recommendations
        context['recommended_movies'] = Movie.objects.filter(
            is_available=True
        ).order_by('-view_count')[:12]
        
        return context


class PersonalizedRecommendationsView(LoginRequiredMixin, TemplateView):
    """Personalized recommendations for logged-in users"""
    template_name = 'recommendations/personalized.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # For now, show recent movies as personalized recommendations
        context['recommended_movies'] = Movie.objects.filter(
            is_available=True
        ).order_by('-date_added')[:12]
        
        return context


class TrendingMoviesView(TemplateView):
    """Trending movies view"""
    template_name = 'recommendations/trending.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        context['trending_movies'] = Movie.objects.filter(
            is_available=True
        ).order_by('-view_count')[:24]
        
        return context


class SimilarMoviesView(TemplateView):
    """Similar movies based on a specific movie"""
    template_name = 'recommendations/similar.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # For now, show movies from the same genres
        movie_slug = kwargs.get('movie_slug')
        try:
            movie = Movie.objects.get(slug=movie_slug, is_available=True)
            context['movie'] = movie
            context['similar_movies'] = Movie.objects.filter(
                genres__in=movie.genres.all(),
                is_available=True
            ).exclude(id=movie.id).distinct()[:12]
        except Movie.DoesNotExist:
            context['movie'] = None
            context['similar_movies'] = []
        
        return context


class RecommendationFeedbackView(LoginRequiredMixin, TemplateView):
    """View for managing recommendation feedback"""
    template_name = 'recommendations/feedback.html'


# API Views
@login_required
def generate_recommendations(request):
    """Generate new recommendations for a user"""
    # Placeholder implementation
    recommendations = Movie.objects.filter(is_available=True)[:6]
    
    data = {
        'recommendations': [
            {
                'id': movie.id,
                'title': movie.title,
                'slug': movie.slug,
                'poster_url': movie.get_poster_url(),
                'year': movie.year,
                'rating': movie.user_rating or 0
            }
            for movie in recommendations
        ]
    }
    
    return JsonResponse(data)


@login_required
def submit_feedback(request, movie_id):
    """Submit feedback on a recommendation"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid method'})
    
    # Placeholder implementation
    return JsonResponse({
        'success': True,
        'message': 'Feedback submitted successfully'
    })


@login_required
def refresh_recommendations(request):
    """Refresh user's recommendations"""
    # Placeholder implementation
    return JsonResponse({
        'success': True,
        'message': 'Recommendations refreshed'
    })
