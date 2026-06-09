document.addEventListener('DOMContentLoaded', () => {
            const carousel = document.getElementById('heroCustomCarousel');
            if (!carousel) return;

            const inner = document.getElementById('heroCarouselInner');
            const items = carousel.querySelectorAll('.custom-carousel-item');
            const dots = carousel.querySelectorAll('.custom-carousel-indicators button');
            
            // Read timing from HTML property (fallback to 4000ms if not set)
            const intervalTime = parseInt(carousel.getAttribute('data-carousel-interval')) || 4000;
            
            let currentIndex = 0;
            let autoPlayInterval;

            function updateCarousel(index) {
                // Handle wrap-around
                if (index < 0) index = items.length - 1;
                if (index >= items.length) index = 0;
                currentIndex = index;

                // Apply smooth sliding transition
                inner.style.transform = `translateX(-${currentIndex * 100}%)`;

                // Update Accessibility and Dot states
                items.forEach((item, i) => {
                    const isActive = i === currentIndex;
                    item.classList.toggle('active', isActive);
                    item.setAttribute('aria-hidden', !isActive);
                    
                    dots[i].classList.toggle('active', isActive);
                    dots[i].setAttribute('aria-selected', isActive);
                });
            }

            function nextSlide() { updateCarousel(currentIndex + 1); }
            function prevSlide() { updateCarousel(currentIndex - 1); }

            function startAutoPlay() {
                if (!autoPlayInterval) {
                    autoPlayInterval = setInterval(nextSlide, intervalTime);
                }
            }

            function stopAutoPlay() {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }

            // Dot Click Navigation
            dots.forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const index = parseInt(e.target.getAttribute('data-slide-index'));
                    updateCarousel(index);
                    stopAutoPlay(); // Reset timer so it doesn't instantly jump to next
                    startAutoPlay();
                });
            });

            // Keyboard Accessibility
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                stopAutoPlay();
                startAutoPlay();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                stopAutoPlay();
                startAutoPlay();
            }
        });

        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
            stopAutoPlay(); // Pause autoplay while touching
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            handleSwipe();
            startAutoPlay(); // Resume autoplay after swipe
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 40; // Minimum distance (px) required to trigger swipe
            if (touchEndX < touchStartX - swipeThreshold) {
                nextSlide(); // Swiped Left
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                prevSlide(); // Swiped Right
            }
        }

        // Pause Autoplay on Hover/Focus for Accessibility
            carousel.addEventListener('mouseenter', stopAutoPlay);
            carousel.addEventListener('mouseleave', startAutoPlay);
            carousel.addEventListener('focusin', stopAutoPlay);
            carousel.addEventListener('focusout', startAutoPlay);

            // Initialize
            startAutoPlay();
        });