/**
 * Cynara Movie Detail JavaScript
 * Handles movie detail page interactions
 */

class MovieDetail {
  constructor() {
    this.currentRating = 0;
    this.movieSlug = '';
    this.csrfToken = '';
    this.init();
  }

  init() {
    // Get data from the page
    this.movieSlug = document.getElementById('movie-slug')?.textContent?.trim() || 
                     document.querySelector('[data-movie-slug]')?.dataset.movieSlug || '';
    this.csrfToken = document.querySelector('meta[name=csrf-token]')?.content || 
                     document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
    
    if (this.movieSlug) {
      this.setupRatingStars();
      this.setupInteractionButtons();
      this.setupRatingForm();
    } else {
      console.warn('Movie slug not found on page');
    }
  }

  setupRatingStars() {
    const stars = document.querySelectorAll('.star-btn');
    const userRatingElement = document.querySelector('#user-current-rating');
    
    if (userRatingElement) {
      this.currentRating = parseInt(userRatingElement.textContent) || 0;
    }

    stars.forEach((star, index) => {
      star.addEventListener('click', () => {
        this.currentRating = index + 1;
        this.updateStars();
        this.enableRatingSubmit();
      });

      star.addEventListener('mouseenter', () => {
        this.highlightStars(index + 1);
      });

      star.addEventListener('mouseleave', () => {
        this.updateStars();
      });
    });

    // Initialize stars
    this.updateStars();
  }

  updateStars() {
    const stars = document.querySelectorAll('.star-btn');
    stars.forEach((star, index) => {
      const svg = star.querySelector('svg');
      if (index < this.currentRating) {
        svg.setAttribute('fill', 'currentColor');
        svg.style.color = 'var(--accent-light)';
      } else {
        svg.setAttribute('fill', 'none');
        svg.style.color = 'var(--gray-400)';
      }
    });
  }

  highlightStars(rating) {
    const stars = document.querySelectorAll('.star-btn');
    stars.forEach((star, index) => {
      const svg = star.querySelector('svg');
      if (index < rating) {
        svg.style.color = 'var(--accent-light)';
      } else {
        svg.style.color = 'var(--gray-400)';
      }
    });
  }

  enableRatingSubmit() {
    const submitBtn = document.querySelector('#submit-rating-btn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn-secondary');
      submitBtn.classList.add('btn-primary');
    }
  }

  setupInteractionButtons() {
    const favoriteBtn = document.querySelector('.favorite-btn');
    const watchLaterBtn = document.querySelector('.watch-later-btn');

    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', () => {
        this.toggleFavorite();
      });
    }

    if (watchLaterBtn) {
      watchLaterBtn.addEventListener('click', () => {
        this.toggleWatchLater();
      });
    }
  }

  setupRatingForm() {
    const ratingForm = document.querySelector('#rating-form');
    if (ratingForm) {
      ratingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitRating();
      });
    }

    const submitBtn = document.querySelector('#submit-rating-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.submitRating();
      });
    }
  }

  async toggleFavorite() {
    if (!this.movieSlug) {
      console.error('Movie slug not found');
      return;
    }

    try {
      const response = await fetch(`/movie/${this.movieSlug}/favorite/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': this.csrfToken,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        const btn = document.querySelector('.favorite-btn');
        btn.classList.toggle('active');
        
        // Update button text (skip SVG)
        const textNodes = Array.from(btn.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
        if (textNodes.length > 0) {
          textNodes.forEach(node => {
            if (node.textContent.trim()) {
              node.textContent = data.is_favorite ? ' Remove from Favorites' : ' Add to Favorites';
            }
          });
        }
        
        if (window.cynara) {
          window.cynara.showMessage(data.message, 'success');
        }
      } else {
        if (window.cynara) {
          window.cynara.showMessage(data.message || 'Error occurred', 'error');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      if (window.cynara) {
        window.cynara.showMessage('An error occurred', 'error');
      }
    }
  }

  async toggleWatchLater() {
    if (!this.movieSlug) {
      console.error('Movie slug not found');
      return;
    }

    try {
      const response = await fetch(`/movie/${this.movieSlug}/watch-later/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': this.csrfToken,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        const btn = document.querySelector('.watch-later-btn');
        btn.classList.toggle('active');
        
        // Update button text (skip SVG)
        const textNodes = Array.from(btn.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
        if (textNodes.length > 0) {
          textNodes.forEach(node => {
            if (node.textContent.trim()) {
              node.textContent = data.is_watch_later ? ' Remove from Watch Later' : ' Watch Later';
            }
          });
        }
        
        if (window.cynara) {
          window.cynara.showMessage(data.message, 'success');
        }
      } else {
        if (window.cynara) {
          window.cynara.showMessage(data.message || 'Error occurred', 'error');
        }
      }
    } catch (error) {
      console.error('Error toggling watch later:', error);
      if (window.cynara) {
        window.cynara.showMessage('An error occurred', 'error');
      }
    }
  }

  async submitRating() {
    if (!this.movieSlug || this.currentRating === 0) {
      if (window.cynara) {
        window.cynara.showMessage('Please select a rating', 'warning');
      }
      return;
    }

    const reviewText = document.querySelector('#rating-review')?.value || '';

    try {
      const response = await fetch(`/movie/${this.movieSlug}/rate/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': this.csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: this.currentRating,
          review: reviewText
        })
      });

      const data = await response.json();
      if (data.success) {
        if (window.cynara) {
          window.cynara.showMessage(data.message, 'success');
        }
        
        // Update average rating display if present
        const avgRatingElement = document.querySelector('#avg-rating-display');
        if (avgRatingElement && data.avg_rating) {
          avgRatingElement.textContent = data.avg_rating;
        }
        
        // Disable submit button
        const submitBtn = document.querySelector('#submit-rating-btn');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Rating Submitted';
          submitBtn.classList.remove('btn-primary');
          submitBtn.classList.add('btn-secondary');
        }
      } else {
        if (window.cynara) {
          window.cynara.showMessage(data.message || 'Error submitting rating', 'error');
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      if (window.cynara) {
        window.cynara.showMessage('An error occurred while submitting rating', 'error');
      }
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.movieDetail = new MovieDetail();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MovieDetail;
}