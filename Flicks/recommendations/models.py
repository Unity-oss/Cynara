"""
Cynara Recommendations Models

AI-powered recommendation system using OpenAI embeddings and user behavior.
"""

from django.db import models
from django.contrib.auth.models import User
from movies.models import Movie


class MovieEmbedding(models.Model):
    """Store OpenAI embeddings for movies for similarity calculations"""
    movie = models.OneToOneField(Movie, on_delete=models.CASCADE, related_name='embedding')
    embedding_vector = models.JSONField()  # Store the embedding as JSON array
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Embedding for {self.movie.title}"


class RecommendationSet(models.Model):
    """Store pre-computed recommendations for users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendation_sets')
    movies = models.ManyToManyField(Movie, through='RecommendationItem')
    
    # Recommendation metadata
    algorithm_used = models.CharField(
        max_length=50,
        choices=[
            ('collaborative', 'Collaborative Filtering'),
            ('content_based', 'Content-Based'),
            ('hybrid', 'Hybrid (AI + Collaborative)'),
            ('popularity', 'Popularity-Based'),
        ],
        default='hybrid'
    )
    
    confidence_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()  # Recommendations expire and need refresh
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Recommendations for {self.user.username}"


class RecommendationItem(models.Model):
    """Individual recommendation with score and reasoning"""
    recommendation_set = models.ForeignKey(RecommendationSet, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    
    score = models.FloatField()  # Recommendation strength (0.0 to 1.0)
    reason = models.CharField(
        max_length=200,
        help_text="Why this movie was recommended"
    )
    position = models.PositiveIntegerField()  # Order in the recommendation list
    
    class Meta:
        ordering = ['position']
        unique_together = ('recommendation_set', 'movie')
    
    def __str__(self):
        return f"{self.movie.title} (Score: {self.score})"


class UserSimilarity(models.Model):
    """Store user similarity scores for collaborative filtering"""
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='similarity_as_user1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='similarity_as_user2')
    similarity_score = models.FloatField()  # Cosine similarity or other metric
    last_calculated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user1', 'user2')
        indexes = [
            models.Index(fields=['user1', '-similarity_score']),
        ]
    
    def __str__(self):
        return f"Similarity: {self.user1.username} <-> {self.user2.username} ({self.similarity_score})"


class RecommendationFeedback(models.Model):
    """Track user feedback on recommendations to improve the system"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    
    feedback_type = models.CharField(
        max_length=20,
        choices=[
            ('liked', 'Liked Recommendation'),
            ('disliked', 'Disliked Recommendation'),
            ('not_interested', 'Not Interested'),
            ('watched', 'Watched Based on Recommendation'),
        ]
    )
    
    recommendation_algorithm = models.CharField(max_length=50)  # Which algorithm made this rec
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'movie')
    
    def __str__(self):
        return f"{self.user.username} {self.feedback_type} {self.movie.title}"
