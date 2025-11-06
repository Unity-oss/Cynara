"""
Cynara Recommendations Admin Configuration
"""

from django.contrib import admin
from .models import (
    MovieEmbedding, RecommendationSet, RecommendationItem,
    UserSimilarity, RecommendationFeedback
)


@admin.register(MovieEmbedding)
class MovieEmbeddingAdmin(admin.ModelAdmin):
    list_display = ('movie', 'created_at', 'updated_at')
    search_fields = ('movie__title',)
    readonly_fields = ('embedding_vector', 'created_at', 'updated_at')


class RecommendationItemInline(admin.TabularInline):
    model = RecommendationItem
    extra = 0
    readonly_fields = ('score', 'reason')


@admin.register(RecommendationSet)
class RecommendationSetAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'algorithm_used', 'confidence_score', 
        'created_at', 'expires_at'
    )
    list_filter = ('algorithm_used', 'created_at')
    search_fields = ('user__username',)
    inlines = [RecommendationItemInline]
    readonly_fields = ('created_at',)


@admin.register(UserSimilarity)
class UserSimilarityAdmin(admin.ModelAdmin):
    list_display = ('user1', 'user2', 'similarity_score', 'last_calculated')
    search_fields = ('user1__username', 'user2__username')
    readonly_fields = ('last_calculated',)


@admin.register(RecommendationFeedback)
class RecommendationFeedbackAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'movie', 'feedback_type', 
        'recommendation_algorithm', 'created_at'
    )
    list_filter = ('feedback_type', 'recommendation_algorithm', 'created_at')
    search_fields = ('user__username', 'movie__title')
    readonly_fields = ('created_at',)
