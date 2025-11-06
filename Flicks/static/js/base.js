/**
 * Cynara Base JavaScript
 * Core functionality for the movie streaming platform
 */

class Cynara {
  constructor() {
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupSearch();
    this.setupModals();
    this.setupInfiniteScroll();
    this.setupMovieCards();
  }

  // Navigation functionality
  setupNavigation() {
    const navToggle = document.getElementById('navToggle');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');

    // Mobile menu toggle
    if (navToggle) {
      navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        // Add mobile menu logic here
      });
    }

    // User dropdown menu
    if (userMenuBtn && userMenu) {
      userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('show');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target)) {
          userMenu.classList.remove('show');
        }
      });
    }
  }

  // Search functionality
  setupSearch() {
    const searchInput = document.querySelector('.search-input');
    let searchTimeout;

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length > 2) {
          searchTimeout = setTimeout(() => {
            this.performSearch(query);
          }, 300);
        }
      });
    }
  }

  async performSearch(query) {
    try {
      const response = await fetch(`/api/search/?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      this.displaySearchResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  displaySearchResults(results) {
    // Implement search results display
    console.log('Search results:', results);
  }

  // Modal functionality
  setupModals() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
      const closeBtn = modal.querySelector('.modal-close');
      
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.closeModal(modal);
        });
      }

      // Close modal on background click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
          this.closeModal(openModal);
        }
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  // Infinite scroll for movie grid
  setupInfiniteScroll() {
    const movieGrid = document.querySelector('.movie-grid');
    
    if (movieGrid) {
      let loading = false;
      let page = 1;

      window.addEventListener('scroll', () => {
        if (loading) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        
        if (scrollTop + clientHeight >= scrollHeight - 1000) {
          loading = true;
          this.loadMoreMovies(++page).then(() => {
            loading = false;
          });
        }
      });
    }
  }

  async loadMoreMovies(page) {
    try {
      const response = await fetch(`/movies/?page=${page}`);
      const html = await response.text();
      
      // Parse the HTML and extract movie cards
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newCards = doc.querySelectorAll('.movie-card');
      
      const movieGrid = document.querySelector('.movie-grid');
      newCards.forEach(card => {
        movieGrid.appendChild(card);
      });

      // Re-setup movie card functionality for new cards
      this.setupMovieCards();
    } catch (error) {
      console.error('Error loading more movies:', error);
    }
  }

  // Movie card interactions
  setupMovieCards() {
    const movieCards = document.querySelectorAll('.movie-card');

    movieCards.forEach(card => {
      // Favorite toggle
      const favoriteBtn = card.querySelector('.favorite-btn');
      if (favoriteBtn) {
        favoriteBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleFavorite(favoriteBtn);
        });
      }

      // Watch later toggle
      const watchLaterBtn = card.querySelector('.watch-later-btn');
      if (watchLaterBtn) {
        watchLaterBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleWatchLater(watchLaterBtn);
        });
      }

      // Play button
      const playBtn = card.querySelector('.play-button');
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const movieSlug = card.dataset.movieSlug;
          window.location.href = `/movie/${movieSlug}/`;
        });
      }

      // Card click (navigate to detail)
      card.addEventListener('click', () => {
        const movieSlug = card.dataset.movieSlug;
        window.location.href = `/movie/${movieSlug}/`;
      });
    });
  }

  async toggleFavorite(btn) {
    const movieSlug = btn.closest('.movie-card').dataset.movieSlug;
    
    try {
      const response = await fetch(`/movie/${movieSlug}/favorite/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': this.getCSRFToken(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        btn.classList.toggle('active');
        this.showMessage(data.message, 'success');
      } else {
        this.showMessage(data.message, 'error');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      this.showMessage('An error occurred', 'error');
    }
  }

  async toggleWatchLater(btn) {
    const movieSlug = btn.closest('.movie-card').dataset.movieSlug;
    
    try {
      const response = await fetch(`/movie/${movieSlug}/watch-later/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': this.getCSRFToken(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        btn.classList.toggle('active');
        this.showMessage(data.message, 'success');
      } else {
        this.showMessage(data.message, 'error');
      }
    } catch (error) {
      console.error('Error toggling watch later:', error);
      this.showMessage('An error occurred', 'error');
    }
  }

  // Utility functions
  getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
  }

  showMessage(message, type = 'info') {
    const messagesContainer = document.querySelector('.messages-container');
    
    if (!messagesContainer) {
      // Create messages container if it doesn't exist
      const container = document.createElement('div');
      container.className = 'messages-container';
      document.body.appendChild(container);
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible`;
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="alert-close" onclick="this.parentElement.remove()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    messagesContainer.appendChild(alertDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }

  showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      spinner.classList.add('show');
    }
  }

  hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      spinner.classList.remove('show');
    }
  }

  // Format duration from minutes to human readable
  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  // Format file size
  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Debounce function for search and other inputs
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize Cynara when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cynara = new Cynara();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Cynara;
}