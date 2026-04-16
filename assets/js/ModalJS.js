const storyViewer = document.getElementById('story-viewer');
        const progressContainer = document.getElementById('progress-container');
        const announcer = document.getElementById('a11y-announcer');
        const slides = document.querySelectorAll('.story-slide');
        
        let currentIndex = 0;
        let storyTimer;
        let startTime;
        let remainingTime;
        let isPaused = false;
        let lastFocusedElement = null;

        let touchStartX = 0;
        let touchStartTime = 0;
        const swipeThreshold = 50;
        const storyDuration = 7000; // Consistent 7 seconds

        function setupTypewriters() {
            document.querySelectorAll('.typewriter').forEach(el => {
                const text = el.textContent;
                el.innerHTML = '';
                [...text].forEach((char, i) => {
                    const span = document.createElement('span');
                    span.textContent = char;
                    span.className = 'char';
                    span.style.animationDelay = `${i * 0.04}s`;
                    el.appendChild(span);
                });
                const cursor = document.createElement('span');
                cursor.className = 'typewriter-cursor';
                el.appendChild(cursor);
            });
        }

        function initBars() {
            progressContainer.innerHTML = '';
            slides.forEach((_, i) => {
                const barBg = document.createElement('div');
                barBg.className = 'bar-bg';
                barBg.setAttribute('role', 'progressbar');
                barBg.setAttribute('aria-label', `Story ${i + 1} progress`);
                const barFill = document.createElement('div');
                barFill.className = 'bar-fill';
                barBg.appendChild(barFill);
                progressContainer.appendChild(barBg);
            });
        }

        function openStories(index, triggerElement) {
            lastFocusedElement = triggerElement;
            storyViewer.classList.add('active');
            initBars();
            playStory(index);
        }

        function closeStories() {
            clearTimeout(storyTimer);
            storyViewer.classList.remove('active');
            if (lastFocusedElement) lastFocusedElement.focus();
        }

        function playStory(index) {
            clearTimeout(storyTimer);
            currentIndex = index;
            isPaused = false;
            
            slides.forEach((slide, i) => slide.classList.toggle('active', i === index));

            // Reset characters typewriter
            const chars = slides[currentIndex].querySelectorAll('.char');
            if (chars.length > 0) {
                chars.forEach(c => {
                    c.style.animation = 'none';
                    void c.offsetWidth;
                    c.style.animation = null;
                });
            }

            const fills = document.querySelectorAll('.bar-fill');
            fills.forEach((fill, i) => {
                fill.style.transition = 'none';
                if (i < index) {
                    fill.style.width = '100%';
                } else if (i > index) {
                    fill.style.width = '0%';
                } else {
                    fill.style.width = '0%';
                    void fill.offsetWidth;
                    fill.style.transition = `width ${storyDuration}ms linear`;
                    fill.style.width = '100%';
                    
                    startTime = Date.now();
                    remainingTime = storyDuration;
                    storyTimer = setTimeout(nextStory, storyDuration);
                }
            });
            
            announcer.textContent = `Story ${index + 1} of ${slides.length}: ${slides[index].getAttribute('data-title')}`;
        }

        function nextStory() {
            if (currentIndex < slides.length - 1) playStory(currentIndex + 1);
            else closeStories();
        }

        function prevStory() {
            if (currentIndex > 0) playStory(currentIndex - 1);
            else playStory(0);
        }

        function pauseStory(e) {
            // Prevent pause if hitting the CTA button
            if (e.target.closest('.cta-button') || e.target.closest('.close-btn')) return;
            
            if (isPaused || !storyViewer.classList.contains('active')) return;
            isPaused = true;
            clearTimeout(storyTimer);
            remainingTime -= (Date.now() - startTime);
            const fill = document.querySelectorAll('.bar-fill')[currentIndex];
            if (fill) {
                fill.style.transition = 'none';
                fill.style.width = window.getComputedStyle(fill).width;
            }
        }

        function resumeStory() {
            if (!isPaused || !storyViewer.classList.contains('active')) return;
            isPaused = false;
            startTime = Date.now();
            const fill = document.querySelectorAll('.bar-fill')[currentIndex];
            if (fill) {
                fill.style.transition = `width ${remainingTime}ms linear`;
                fill.style.width = '100%';
            }
            storyTimer = setTimeout(nextStory, remainingTime);
        }

        storyViewer.addEventListener('touchstart', (e) => {
            const touch = e.changedTouches[0];
            touchStartX = touch.screenX;
            touchStartTime = Date.now();
            if (!e.target.closest('.nav-tap')) pauseStory(e);
        }, {passive: true});

        storyViewer.addEventListener('touchend', (e) => {
            const touch = e.changedTouches[0];
            const diffX = touch.screenX - touchStartX;
            const timeElapsed = Date.now() - touchStartTime;

            let navigated = false;

            // Swipe Logic
            if (Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0) prevStory(); 
                else nextStory();
                navigated = true;
            } 
            // Tap Logic (if swipe didn't trigger and it was a short tap)
            else if (timeElapsed < 250 && !e.target.closest('.cta-button') && !e.target.closest('.close-btn')) {
                // If the click wasn't on a navigation zone but somewhere else on the viewer
                if (!e.target.closest('.nav-tap')) {
                    if (touch.screenX < window.innerWidth * 0.3) prevStory(); 
                    else nextStory();
                    navigated = true;
                }
            }

            // Only resume if we didn't just skip to a new story
            if (!navigated) resumeStory();
        }, {passive: true});

        storyViewer.addEventListener('mousedown', pauseStory);
        storyViewer.addEventListener('mouseup', resumeStory);

        document.addEventListener('keydown', (e) => {
            if (!storyViewer.classList.contains('active')) return;
            if (e.key === 'Escape') closeStories();
            if (e.key === 'ArrowRight') nextStory();
            if (e.key === 'ArrowLeft') prevStory();
        });

        window.addEventListener('DOMContentLoaded', setupTypewriters);
        window.addEventListener('resize', () => {
            if (storyViewer.classList.contains('active')) playStory(currentIndex);
        });