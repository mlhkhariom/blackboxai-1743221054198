// Authentication Check
function checkAuth() {
    if (!localStorage.getItem('isAuthenticated')) {
        window.location.href = 'index.html';
    }
}

// Logout Function
function logout() {
    localStorage.removeItem('isAuthenticated');
    window.location.href = 'index.html';
}

// Toggle Password Visibility
function togglePasswordVisibility(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        toggle.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Toast Notification
function showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// Video Player Controls
class VideoPlayer {
    constructor(videoElement) {
        this.video = videoElement;
        this.progress = document.querySelector('.progress');
        this.progressBar = document.querySelector('.progress-bar');
        this.playButton = document.querySelector('.play-button');
        this.volumeControl = document.querySelector('.volume-control');
        this.timeDisplay = document.querySelector('.time-display');
        
        this.initializeControls();
    }

    initializeControls() {
        // Play/Pause
        this.playButton?.addEventListener('click', () => this.togglePlay());
        this.video?.addEventListener('click', () => this.togglePlay());

        // Progress Bar
        this.video?.addEventListener('timeupdate', () => this.updateProgress());
        this.progressBar?.addEventListener('click', (e) => this.scrub(e));

        // Volume Control
        this.volumeControl?.addEventListener('input', (e) => this.updateVolume(e));

        // Keyboard Controls
        document.addEventListener('keydown', (e) => this.handleKeypress(e));
    }

    togglePlay() {
        if (!this.video) return;
        this.video.paused ? this.video.play() : this.video.pause();
        this.updatePlayButton();
    }

    updatePlayButton() {
        if (!this.playButton || !this.video) return;
        this.playButton.innerHTML = this.video.paused ? 
            '<i class="fas fa-play"></i>' : 
            '<i class="fas fa-pause"></i>';
    }

    updateProgress() {
        if (!this.video || !this.progress) return;
        const percent = (this.video.currentTime / this.video.duration) * 100;
        this.progress.style.width = `${percent}%`;
        this.updateTimeDisplay();
    }

    scrub(e) {
        if (!this.video || !this.progressBar) return;
        const scrubTime = (e.offsetX / this.progressBar.offsetWidth) * this.video.duration;
        this.video.currentTime = scrubTime;
    }

    updateVolume(e) {
        if (!this.video) return;
        this.video.volume = e.target.value;
    }

    updateTimeDisplay() {
        if (!this.timeDisplay || !this.video) return;
        const currentMinutes = Math.floor(this.video.currentTime / 60);
        const currentSeconds = Math.floor(this.video.currentTime % 60);
        const durationMinutes = Math.floor(this.video.duration / 60);
        const durationSeconds = Math.floor(this.video.duration % 60);

        this.timeDisplay.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
    }

    handleKeypress(e) {
        if (!this.video) return;
        switch(e.key.toLowerCase()) {
            case ' ':
            case 'k':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'arrowleft':
                this.video.currentTime -= 5;
                break;
            case 'arrowright':
                this.video.currentTime += 5;
                break;
            case 'm':
                this.video.muted = !this.video.muted;
                break;
            case 'f':
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    this.video.requestFullscreen();
                }
                break;
        }
    }
}

// Upload Functionality
class FileUploader {
    constructor(dropZone, fileInput) {
        this.dropZone = dropZone;
        this.fileInput = fileInput;
        this.initializeUploader();
    }

    initializeUploader() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone?.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone?.addEventListener(eventName, () => {
                this.dropZone.classList.add('dragging');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone?.addEventListener(eventName, () => {
                this.dropZone.classList.remove('dragging');
            });
        });

        this.dropZone?.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });

        this.fileInput?.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('video/')) {
                this.uploadFile(file);
            } else {
                showToast('Please upload video files only');
            }
        });
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('video', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showToast('Upload successful!', 'success');
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            showToast('Upload failed: ' + error.message);
        }
    }
}

// Initialize Components
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication on protected pages
    if (!window.location.pathname.includes('index.html')) {
        checkAuth();
    }

    // Initialize video player if video element exists
    const videoElement = document.querySelector('video');
    if (videoElement) {
        new VideoPlayer(videoElement);
    }

    // Initialize file uploader if upload elements exist
    const dropZone = document.querySelector('.upload-area');
    const fileInput = document.querySelector('input[type="file"]');
    if (dropZone && fileInput) {
        new FileUploader(dropZone, fileInput);
    }

    // Initialize mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    menuToggle?.addEventListener('click', () => {
        sidebar?.classList.toggle('open');
    });
});