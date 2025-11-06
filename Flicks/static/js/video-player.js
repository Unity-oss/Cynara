/**
 * Cynara Video Player
 * Custom HTML5 video player with controls and streaming features
 */

class VideoPlayer {
  constructor() {
    this.video = document.getElementById('videoElement');
    this.container = document.getElementById('streamContainer');
    this.controls = document.getElementById('videoControls');
    this.infoHeader = document.getElementById('movieInfoHeader');
    this.loadingSpinner = document.getElementById('loadingSpinner');
    this.errorMessage = document.getElementById('errorMessage');
    
    // Control elements
    this.playPauseBtn = document.getElementById('playPauseBtn');
    this.playIcon = document.getElementById('playIcon');
    this.pauseIcon = document.getElementById('pauseIcon');
    this.progressContainer = document.getElementById('progressContainer');
    this.progressBar = document.getElementById('progressBar');
    this.progressBuffer = document.getElementById('progressBuffer');
    this.timeDisplay = document.getElementById('timeDisplay');
    this.volumeSlider = document.getElementById('volumeSlider');
    this.muteBtn = document.getElementById('muteBtn');
    this.fullscreenBtn = document.getElementById('fullscreenBtn');
    
    // State
    this.isPlaying = false;
    this.isMuted = false;
    this.previousVolume = 1;
    this.isDragging = false;
    this.hideControlsTimeout = null;
    this.lastActivity = Date.now();
    
    // Movie data
    this.movieSlug = document.getElementById('movie-slug')?.textContent;
    this.csrfToken = document.querySelector('meta[name=csrf-token]')?.content;
    
    this.init();
  }

  init() {
    if (!this.video) return;
    
    this.setupEventListeners();
    this.hideLoadingSpinner();
    this.startActivityTimer();
  }

  setupEventListeners() {
    // Video events
    this.video.addEventListener('loadstart', () => this.showLoadingSpinner());
    this.video.addEventListener('loadeddata', () => this.hideLoadingSpinner());
    this.video.addEventListener('canplay', () => this.hideLoadingSpinner());
    this.video.addEventListener('waiting', () => this.showLoadingSpinner());
    this.video.addEventListener('playing', () => this.hideLoadingSpinner());
    
    this.video.addEventListener('play', () => this.onPlay());
    this.video.addEventListener('pause', () => this.onPause());
    this.video.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.video.addEventListener('progress', () => this.onProgress());
    this.video.addEventListener('ended', () => this.onEnded());
    this.video.addEventListener('error', (e) => this.onError(e));
    this.video.addEventListener('volumechange', () => this.onVolumeChange());
    
    // Click to play/pause
    this.video.addEventListener('click', () => this.togglePlayPause());
    
    // Control events
    this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    this.progressContainer.addEventListener('click', (e) => this.seekToPosition(e));
    this.progressContainer.addEventListener('mousedown', (e) => this.startDragging(e));
    this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value / 100));
    this.muteBtn.addEventListener('click', () => this.toggleMute());
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    
    // Mouse movement for showing/hiding controls
    this.container.addEventListener('mousemove', () => this.onActivity());
    this.container.addEventListener('mouseleave', () => this.hideControls());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    
    // Dragging for progress bar
    document.addEventListener('mousemove', (e) => this.onDrag(e));
    document.addEventListener('mouseup', () => this.stopDragging());
    
    // Fullscreen events
    document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
  }

  // Playback controls
  togglePlayPause() {
    if (this.video.paused) {
      this.video.play().catch(e => console.error('Play failed:', e));
    } else {
      this.video.pause();
    }
  }

  onPlay() {
    this.isPlaying = true;
    this.playIcon.style.display = 'none';
    this.pauseIcon.style.display = 'block';
    this.onActivity();
  }

  onPause() {
    this.isPlaying = false;
    this.playIcon.style.display = 'block';
    this.pauseIcon.style.display = 'none';
    this.showControls();
  }

  // Progress and time handling
  onTimeUpdate() {
    if (this.isDragging) return;
    
    const progress = (this.video.currentTime / this.video.duration) * 100;
    this.progressBar.style.width = `${progress}%`;
    
    this.updateTimeDisplay();
    this.updateWatchProgress();
  }

  onProgress() {
    if (this.video.buffered.length > 0) {
      const buffered = (this.video.buffered.end(0) / this.video.duration) * 100;
      this.progressBuffer.style.width = `${buffered}%`;
    }
  }

  seekToPosition(e) {
    const rect = this.progressContainer.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = percent * this.video.duration;
    this.video.currentTime = seekTime;
  }

  startDragging(e) {
    this.isDragging = true;
    this.onDrag(e);
  }

  onDrag(e) {
    if (!this.isDragging) return;
    
    const rect = this.progressContainer.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this.progressBar.style.width = `${percent * 100}%`;
  }

  stopDragging() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    const percent = parseFloat(this.progressBar.style.width) / 100;
    this.video.currentTime = percent * this.video.duration;
  }

  // Volume controls
  setVolume(volume) {
    this.video.volume = Math.max(0, Math.min(1, volume));
    this.volumeSlider.value = this.video.volume * 100;
    this.updateVolumeIcon();
  }

  toggleMute() {
    if (this.video.muted) {
      this.video.muted = false;
      this.video.volume = this.previousVolume;
    } else {
      this.previousVolume = this.video.volume;
      this.video.muted = true;
    }
    this.updateVolumeIcon();
  }

  onVolumeChange() {
    this.volumeSlider.value = this.video.volume * 100;
    this.updateVolumeIcon();
  }

  updateVolumeIcon() {
    const volumeIcon = document.getElementById('volumeIcon');
    if (this.video.muted || this.video.volume === 0) {
      volumeIcon.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>';
    } else if (this.video.volume < 0.5) {
      volumeIcon.innerHTML = '<polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>';
    } else {
      volumeIcon.innerHTML = '<polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>';
    }
  }

  // Fullscreen handling
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  onFullscreenChange() {
    // Update fullscreen button icon or state if needed
    this.onActivity();
  }

  // UI state management
  showControls() {
    this.controls.classList.add('visible');
    this.infoHeader.classList.add('visible');
  }

  hideControls() {
    if (this.isPlaying) {
      this.controls.classList.remove('visible');
      this.infoHeader.classList.remove('visible');
    }
  }

  onActivity() {
    this.lastActivity = Date.now();
    this.showControls();
    this.startActivityTimer();
  }

  startActivityTimer() {
    clearTimeout(this.hideControlsTimeout);
    this.hideControlsTimeout = setTimeout(() => {
      if (Date.now() - this.lastActivity > 3000 && this.isPlaying) {
        this.hideControls();
      }
    }, 3000);
  }

  // Loading and error states
  showLoadingSpinner() {
    this.loadingSpinner.style.display = 'block';
  }

  hideLoadingSpinner() {
    this.loadingSpinner.style.display = 'none';
  }

  onError(e) {
    console.error('Video error:', e);
    this.hideLoadingSpinner();
    this.errorMessage.style.display = 'block';
  }

  onEnded() {
    this.isPlaying = false;
    this.playIcon.style.display = 'block';
    this.pauseIcon.style.display = 'none';
    this.showControls();
    this.updateWatchProgress(true); // Mark as completed
  }

  // Keyboard shortcuts
  handleKeyboard(e) {
    // Only handle when video is focused or no other input is active
    if (document.activeElement.tagName === 'INPUT') return;
    
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        this.togglePlayPause();
        break;
      case 'f':
        e.preventDefault();
        this.toggleFullscreen();
        break;
      case 'm':
        e.preventDefault();
        this.toggleMute();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.video.currentTime -= 10;
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.video.currentTime += 10;
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.setVolume(this.video.volume + 0.1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.setVolume(this.video.volume - 0.1);
        break;
    }
  }

  // Utility functions
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  updateTimeDisplay() {
    const current = this.formatTime(this.video.currentTime);
    const duration = this.formatTime(this.video.duration || 0);
    this.timeDisplay.textContent = `${current} / ${duration}`;
  }

  // Watch progress tracking
  async updateWatchProgress(completed = false) {
    if (!this.movieSlug || !this.csrfToken) return;
    
    const progress = completed ? 100 : (this.video.currentTime / this.video.duration) * 100;
    
    try {
      await fetch(`/api/movie/${this.movieSlug}/progress/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': this.csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress: progress,
          completed: completed,
          current_time: this.video.currentTime,
          duration: this.video.duration
        })
      });
    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  }
}

// Initialize video player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new VideoPlayer();
});

// Prevent right-click context menu on video
document.addEventListener('contextmenu', (e) => {
  if (e.target.tagName === 'VIDEO') {
    e.preventDefault();
  }
});