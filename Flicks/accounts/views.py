"""
Cynara Accounts Views

Views for user authentication and profile management.
"""

from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView, UpdateView
from django.contrib import messages
from django.urls import reverse_lazy
from django.db.models import Count, Sum
from .models import UserPreferences


class CynaraLoginView(LoginView):
    """Custom login view for Cynara"""
    template_name = 'accounts/login.html'
    redirect_authenticated_user = True
    
    def get_success_url(self):
        return self.get_redirect_url() or reverse_lazy('movies:home')


class RegisterView(TemplateView):
    """User registration view"""
    template_name = 'accounts/register.html'
    
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('movies:home')
        return super().get(request, *args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        username = request.POST.get('username')
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        
        # Basic validation
        if not all([username, email, password1, password2]):
            messages.error(request, 'All fields are required.')
            return self.get(request, *args, **kwargs)
        
        if password1 != password2:
            messages.error(request, 'Passwords do not match.')
            return self.get(request, *args, **kwargs)
        
        if len(password1) < 8:
            messages.error(request, 'Password must be at least 8 characters long.')
            return self.get(request, *args, **kwargs)
        
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists.')
            return self.get(request, *args, **kwargs)
        
        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already registered.')
            return self.get(request, *args, **kwargs)
        
        try:
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password1,
                first_name=first_name,
                last_name=last_name
            )
            
            # Log the user in
            login(request, user)
            messages.success(request, f'Welcome to Cynara, {user.get_full_name() or user.username}!')
            
            return redirect('movies:home')
            
        except Exception as e:
            messages.error(request, 'An error occurred during registration. Please try again.')
            return self.get(request, *args, **kwargs)


class ProfileView(LoginRequiredMixin, TemplateView):
    """User profile view"""
    template_name = 'accounts/profile.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        
        # Get user statistics
        from movies.models import WatchHistory, Favorite, Rating
        
        watch_history = WatchHistory.objects.filter(user=user)
        total_watch_time = watch_history.aggregate(
            total_time=Sum('watch_duration')
        )['total_time'] or 0
        
        context.update({
            'total_movies_watched': watch_history.values('movie').distinct().count(),
            'total_watch_time_hours': total_watch_time // 3600,
            'total_watch_time_minutes': (total_watch_time % 3600) // 60,
            'favorite_count': Favorite.objects.filter(user=user).count(),
            'rating_count': Rating.objects.filter(user=user).count(),
            'avg_rating': Rating.objects.filter(user=user).aggregate(
                avg=models.Avg('rating')
            )['avg'] or 0,
        })
        
        return context


class EditProfileView(LoginRequiredMixin, UpdateView):
    """Edit user profile"""
    model = User
    fields = ['first_name', 'last_name', 'email']
    template_name = 'accounts/edit_profile.html'
    success_url = reverse_lazy('accounts:profile')
    
    def get_object(self):
        return self.request.user
    
    def form_valid(self, form):
        messages.success(self.request, 'Profile updated successfully!')
        return super().form_valid(form)


class PreferencesView(LoginRequiredMixin, UpdateView):
    """User preferences view"""
    model = UserPreferences
    fields = ['theme', 'auto_play_next', 'default_quality', 'email_notifications', 'public_profile']
    template_name = 'accounts/preferences.html'
    success_url = reverse_lazy('accounts:preferences')
    
    def get_object(self):
        preferences, created = UserPreferences.objects.get_or_create(
            user=self.request.user
        )
        return preferences
    
    def form_valid(self, form):
        messages.success(self.request, 'Preferences updated successfully!')
        return super().form_valid(form)


class UserDashboardView(LoginRequiredMixin, TemplateView):
    """User dashboard with activity overview"""
    template_name = 'accounts/dashboard.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        
        from movies.models import WatchHistory, Favorite, Rating, Movie
        
        # Recent activity
        context['recent_watches'] = WatchHistory.objects.filter(
            user=user
        ).select_related('movie').order_by('-watched_at')[:10]
        
        context['recent_favorites'] = Favorite.objects.filter(
            user=user
        ).select_related('movie').order_by('-added_at')[:6]
        
        context['recent_ratings'] = Rating.objects.filter(
            user=user
        ).select_related('movie').order_by('-created_at')[:5]
        
        # Continue watching (movies with progress but not completed)
        context['continue_watching'] = WatchHistory.objects.filter(
            user=user,
            completed=False,
            progress_seconds__gt=300  # At least 5 minutes watched
        ).select_related('movie').order_by('-watched_at')[:6]
        
        return context


class UserStatsView(LoginRequiredMixin, TemplateView):
    """Detailed user statistics"""
    template_name = 'accounts/stats.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        
        from movies.models import WatchHistory, Favorite, Rating, Genre
        from django.db.models import Count, Sum, Avg
        
        # Watch statistics
        watch_stats = WatchHistory.objects.filter(user=user).aggregate(
            total_sessions=Count('id'),
            total_time=Sum('watch_duration'),
            completed_movies=Count('id', filter=models.Q(completed=True)),
            unique_movies=Count('movie', distinct=True)
        )
        
        # Genre preferences (based on watch history)
        genre_stats = Genre.objects.filter(
            movie__watch_sessions__user=user
        ).annotate(
            watch_count=Count('movie__watch_sessions')
        ).order_by('-watch_count')[:10]
        
        # Rating statistics
        rating_stats = Rating.objects.filter(user=user).aggregate(
            total_ratings=Count('id'),
            avg_rating=Avg('rating'),
            five_star_count=Count('id', filter=models.Q(rating=5)),
            one_star_count=Count('id', filter=models.Q(rating=1))
        )
        
        context.update({
            'watch_stats': watch_stats,
            'genre_stats': genre_stats,
            'rating_stats': rating_stats,
        })
        
        return context
