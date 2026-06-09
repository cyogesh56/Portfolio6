class CustomVideoPlayer {
    constructor(videoElement) {
        this.video = videoElement;
        
        // Don't initialize twice
        if (this.video.parentNode.classList.contains('custom-video-wrapper')) {
            return;
        }

        // Read attributes
        this.config = {
            hasSound: this.video.getAttribute('hassound') === 'true',
            hasControls: this.video.getAttribute('hascontrols') === 'true',
            autoplay: this.video.getAttribute('autoplay') === 'true',
            loop: this.video.getAttribute('loop') === 'true'
        };

        this.init();
    }

    init() {
        // Set native properties
        this.video.loop = this.config.loop;
        this.video.muted = !this.config.hasSound;
        
        if (this.config.autoplay) {
            this.video.autoplay = true;
            this.video.play().catch(e => console.log('Autoplay prevented:', e));
        } else {
            // Force metadata preload to get the first frame if no poster is provided
            this.video.preload = 'metadata';
        }

        // Build wrapper and controls if enabled
        if (this.config.hasControls) {
            this.buildDOM();
            this.bindEvents();
        } else {
            // Just wrap without controls
            const wrapper = document.createElement('div');
            wrapper.className = 'custom-video-wrapper';
            this.video.parentNode.insertBefore(wrapper, this.video);
            wrapper.appendChild(this.video);
        }
    }

    buildDOM() {
        // Create wrapper
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'custom-video-wrapper is-paused is-initial';
        this.video.parentNode.insertBefore(this.wrapper, this.video);
        this.wrapper.appendChild(this.video);

        // Remove native controls
        this.video.controls = false;

        // Big center play button
        this.centerPlay = document.createElement('div');
        this.centerPlay.className = 'cvp-center-play';
        this.centerPlay.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
        this.centerPlay.setAttribute('aria-label', 'Play video');
        this.centerPlay.setAttribute('role', 'button');
        this.wrapper.appendChild(this.centerPlay);

        // Controls container
        this.controls = document.createElement('div');
        this.controls.className = 'cvp-controls';

        // Progress bar
        this.progressContainer = document.createElement('div');
        this.progressContainer.className = 'cvp-progress-container';
        this.progressContainer.setAttribute('aria-label', 'Video progress');
        this.progressContainer.setAttribute('role', 'slider');
        this.progressContainer.setAttribute('tabindex', '0');
        this.progressContainer.setAttribute('aria-valuemin', '0');
        this.progressContainer.setAttribute('aria-valuemax', '100');
        this.progressContainer.setAttribute('aria-valuenow', '0');
        
        this.progressFilled = document.createElement('div');
        this.progressFilled.className = 'cvp-progress-filled';
        
        this.progressThumb = document.createElement('div');
        this.progressThumb.className = 'cvp-progress-thumb';
        
        this.progressFilled.appendChild(this.progressThumb);
        this.progressContainer.appendChild(this.progressFilled);

        // Buttons row
        this.buttonsRow = document.createElement('div');
        this.buttonsRow.className = 'cvp-buttons';

        // Play/Pause button
        this.playBtn = document.createElement('button');
        this.playBtn.className = 'cvp-btn';
        this.playBtn.setAttribute('aria-label', 'Play');
        this.playBtn.innerHTML = this.getPlayIcon();

        // Volume
        this.volumeContainer = document.createElement('div');
        this.volumeContainer.className = 'cvp-volume-container';
        
        this.muteBtn = document.createElement('button');
        this.muteBtn.className = 'cvp-btn';
        this.muteBtn.setAttribute('aria-label', this.video.muted ? 'Unmute' : 'Mute');
        this.muteBtn.innerHTML = this.getVolumeIcon();
        
        this.volumeSliderContainer = document.createElement('div');
        this.volumeSliderContainer.className = 'cvp-volume-slider';
        
        this.volumeSlider = document.createElement('input');
        this.volumeSlider.type = 'range';
        this.volumeSlider.min = '0';
        this.volumeSlider.max = '1';
        this.volumeSlider.step = '0.05';
        this.volumeSlider.value = this.video.muted ? '0' : this.video.volume;
        this.volumeSlider.setAttribute('aria-label', 'Volume');
        
        this.volumeSliderContainer.appendChild(this.volumeSlider);
        this.volumeContainer.appendChild(this.muteBtn);
        this.volumeContainer.appendChild(this.volumeSliderContainer);

        // Time display
        this.timeDisplay = document.createElement('div');
        this.timeDisplay.className = 'cvp-time';
        this.timeDisplay.textContent = '0:00 / 0:00';

        // Fullscreen
        this.fullscreenBtn = document.createElement('button');
        this.fullscreenBtn.className = 'cvp-btn';
        this.fullscreenBtn.setAttribute('aria-label', 'Fullscreen');
        this.fullscreenBtn.innerHTML = this.getFullscreenIcon();

        // Assemble
        this.buttonsRow.appendChild(this.playBtn);
        this.buttonsRow.appendChild(this.volumeContainer);
        this.buttonsRow.appendChild(this.timeDisplay);
        
        const spacer = document.createElement('div');
        spacer.className = 'cvp-spacer';
        this.buttonsRow.appendChild(spacer);
        
        this.buttonsRow.appendChild(this.fullscreenBtn);

        this.controls.appendChild(this.progressContainer);
        this.controls.appendChild(this.buttonsRow);
        
        this.wrapper.appendChild(this.controls);
    }

    bindEvents() {
        // Toggle play on video click, center play button, and play button
        const togglePlay = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (this.video.paused) {
                this.video.play();
            } else {
                this.video.pause();
            }
        };

        this.video.addEventListener('click', togglePlay);
        this.centerPlay.addEventListener('click', togglePlay);
        this.playBtn.addEventListener('click', togglePlay);

        // Video state changes
        this.video.addEventListener('play', () => {
            this.wrapper.classList.remove('is-paused', 'is-initial');
            this.playBtn.innerHTML = this.getPauseIcon();
            this.playBtn.setAttribute('aria-label', 'Pause');
        });

        this.video.addEventListener('pause', () => {
            this.wrapper.classList.add('is-paused');
            this.playBtn.innerHTML = this.getPlayIcon();
            this.playBtn.setAttribute('aria-label', 'Play');
        });

        // Time update
        this.video.addEventListener('timeupdate', () => {
            const percent = (this.video.currentTime / this.video.duration) * 100;
            this.progressFilled.style.width = `${percent}%`;
            this.progressContainer.setAttribute('aria-valuenow', percent.toFixed(1));
            this.updateTimeDisplay();
        });

        this.video.addEventListener('loadedmetadata', () => {
            this.updateTimeDisplay();
        });

        // Progress bar interaction
        let isDraggingProgress = false;

        const updateVideoTime = (e) => {
            const rect = this.progressContainer.getBoundingClientRect();
            let pos = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
            pos = Math.max(0, Math.min(pos, rect.width));
            const percent = pos / rect.width;
            this.video.currentTime = percent * this.video.duration;
        };

        this.progressContainer.addEventListener('mousedown', (e) => {
            isDraggingProgress = true;
            updateVideoTime(e);
            e.stopPropagation();
        });

        this.progressContainer.addEventListener('touchstart', (e) => {
            isDraggingProgress = true;
            updateVideoTime(e);
            e.stopPropagation();
        }, { passive: true });

        document.addEventListener('mousemove', (e) => {
            if (isDraggingProgress) updateVideoTime(e);
        });

        document.addEventListener('touchmove', (e) => {
            if (isDraggingProgress) updateVideoTime(e);
        }, { passive: true });

        document.addEventListener('mouseup', () => { isDraggingProgress = false; });
        document.addEventListener('touchend', () => { isDraggingProgress = false; });

        // Volume controls
        const toggleMute = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.video.muted = !this.video.muted;
            if (!this.video.muted && this.video.volume === 0) {
                this.video.volume = 1;
                this.volumeSlider.value = 1;
            }
        };

        this.muteBtn.addEventListener('click', toggleMute);

        this.volumeSlider.addEventListener('input', (e) => {
            e.stopPropagation();
            this.video.volume = e.target.value;
            this.video.muted = e.target.value == 0;
        });

        this.video.addEventListener('volumechange', () => {
            this.volumeSlider.value = this.video.muted ? 0 : this.video.volume;
            this.muteBtn.innerHTML = this.getVolumeIcon();
            this.muteBtn.setAttribute('aria-label', this.video.muted ? 'Unmute' : 'Mute');
        });

        // Fullscreen
        this.fullscreenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!document.fullscreenElement) {
                if (this.wrapper.requestFullscreen) {
                    this.wrapper.requestFullscreen();
                } else if (this.wrapper.webkitRequestFullscreen) {
                    this.wrapper.webkitRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        });

        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                this.fullscreenBtn.innerHTML = this.getExitFullscreenIcon();
                this.fullscreenBtn.setAttribute('aria-label', 'Exit Fullscreen');
            } else {
                this.fullscreenBtn.innerHTML = this.getFullscreenIcon();
                this.fullscreenBtn.setAttribute('aria-label', 'Fullscreen');
            }
        });

        // Prevent click events on controls from bubbling up to Lightbox and navigating links
        this.controls.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
        });

        // Touch detection for showing controls
        this.wrapper.addEventListener('touchstart', () => {
            this.wrapper.classList.add('is-touch');
            // Hide controls after 3 seconds of inactivity on touch
            clearTimeout(this.touchTimer);
            this.touchTimer = setTimeout(() => {
                if (!this.video.paused) {
                    this.wrapper.classList.remove('is-touch');
                }
            }, 3000);
        }, { passive: true });
        
        // Keyboard accessibility
        this.wrapper.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                togglePlay();
            } else if (e.key === 'ArrowRight') {
                this.video.currentTime += 5;
            } else if (e.key === 'ArrowLeft') {
                this.video.currentTime -= 5;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.video.volume = Math.min(1, this.video.volume + 0.1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.video.volume = Math.max(0, this.video.volume - 0.1);
            } else if (e.key === 'm' || e.key === 'M') {
                toggleMute();
            } else if (e.key === 'f' || e.key === 'F') {
                this.fullscreenBtn.click();
            }
        });
        // Removed wrapper.setAttribute('tabindex', '0') to prevent redundant focus stops
    }

    formatTime(timeInSeconds) {
        if (isNaN(timeInSeconds)) return '0:00';
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    updateTimeDisplay() {
        this.timeDisplay.textContent = `${this.formatTime(this.video.currentTime)} / ${this.formatTime(this.video.duration)}`;
    }

    // Icons
    getPlayIcon() { return `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`; }
    getPauseIcon() { return `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`; }
    getVolumeIcon() {
        if (this.video.muted || this.video.volume === 0) {
            return `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
        } else if (this.video.volume < 0.5) {
            return `<svg viewBox="0 0 24 24"><path d="M5 9v6h4l5 5V4L9 9H5zm11.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
        } else {
            return `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
        }
    }
    getFullscreenIcon() { return `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`; }
    getExitFullscreenIcon() { return `<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`; }
}

// Global initialization function
window.initCustomVideos = function() {
    document.querySelectorAll('video.custom-yt-video').forEach(videoEl => {
        if (!videoEl.dataset.initialized) {
            new CustomVideoPlayer(videoEl);
            videoEl.dataset.initialized = 'true';
        }
    });
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.initCustomVideos();
});
