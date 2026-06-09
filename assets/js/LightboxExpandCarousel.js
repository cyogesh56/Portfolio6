/* =======================================================
           CUSTOM RESPONSIVE SWIPEABLE LIGHTBOX SCRIPT
           ======================================================= */
        class Lightbox {
            constructor() {
                this.galleries = {};
                this.currentGroup = null;
                this.currentIndex = 0;
                this.uiVisible = true; // Track UI presentation state
                
                // Swipe tracking
                this.touchStartX = 0;
                this.touchEndX = 0;
                
                this.previouslyFocusedElement = null; // a11y: Store what to focus back to when modal closes
                
                this.init();
            }

            init() {
                this.buildDOM();
                this.scanDOM();
                this.bindEvents();
            }

            // Creates the Lightbox HTML structure dynamically
            buildDOM() {
                // a11y: Added appropriate aria attributes to dialog and buttons for screen readers
                const html = `
                    <div id="custom-lightbox" role="dialog" aria-modal="true" aria-label="Image Gallery" inert>
                        <div class="lightbox-topbar">
                            <span class="lightbox-counter" aria-live="polite"></span> <!-- a11y: aria-live politely reads the image count changes -->
                            <div class="lightbox-top-right">
                                <!-- Toggle button for Powerpoint style -->
                                <button class="lightbox-toggle-ui" title="Toggle Presentation Mode" aria-label="Toggle Presentation Mode">
                                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                                </button>
                                <button class="lightbox-close" aria-label="Close Lightbox">&times;</button>
                            </div>
                        </div>
                        <button class="lightbox-nav lightbox-prev" aria-label="Previous Image">&#10094;</button>
                        <button class="lightbox-nav lightbox-next" aria-label="Next Image">&#10095;</button>
                        <div class="lightbox-content-wrapper">
                            <img src="" alt="" class="lightbox-image"> <!-- a11y: alt is updated dynamically -->
                            <div class="lightbox-video-container" style="display:none; width:100%; height:100%; align-items:center; justify-content:center; position:absolute; top:0; left:0;"></div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', html);
                
                // Cache DOM elements
                this.el = document.getElementById('custom-lightbox');
                this.img = this.el.querySelector('.lightbox-image');
                this.counter = this.el.querySelector('.lightbox-counter');
                this.closeBtn = this.el.querySelector('.lightbox-close');
                this.toggleUIBtn = this.el.querySelector('.lightbox-toggle-ui');
                this.prevBtn = this.el.querySelector('.lightbox-prev');
                this.nextBtn = this.el.querySelector('.lightbox-next');
                this.wrapper = this.el.querySelector('.lightbox-content-wrapper');
                this.videoContainer = this.el.querySelector('.lightbox-video-container');
            }

            // Finds all links with data-lightbox and groups them
            scanDOM() {
                const items = document.querySelectorAll('a[data-lightbox]');
                
                items.forEach(link => {
                    const group = link.getAttribute('data-lightbox');
                    
                    if (!this.galleries[group]) {
                        this.galleries[group] = [];
                    }

                    const isDuplicate = link.closest('.swiper-slide-duplicate');
                    const src = link.getAttribute('href');
                    
                    // a11y: Attempt to fetch the original image's alt text
                    const imgEl = link.querySelector('img');
                    const alt = imgEl ? (imgEl.getAttribute('alt') || 'Gallery Image') : 'Gallery Image';
                    const videoEl = link.querySelector('video');

                    if (!isDuplicate) {
                        this.galleries[group].push({ src, alt, videoEl }); // a11y: store alt text alongside src
                    }

                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        let realIndex = this.galleries[group].findIndex(item => item.src === src);
                        if(realIndex === -1) realIndex = 0; 
                        this.open(group, realIndex);
                    });
                });
            }

            open(group, index) {
                // a11y: Keep track of the element clicked so we can return focus to it later
                this.previouslyFocusedElement = document.activeElement;

                this.currentGroup = group;
                this.currentIndex = index;
                this.updateUI(false); 
                
                this.el.classList.add('active');
                document.body.style.overflow = 'hidden'; 
                
                // Ensure UI is visible when opening
                this.uiVisible = true;
                this.el.classList.remove('ui-hidden');
                
                // a11y: Remove inert so it can receive focus
                this.el.removeAttribute('inert');

                // a11y: Transfer focus into the modal immediately
                this.el.setAttribute('tabindex', '-1');
                this.el.focus();
            }

            close() {
                this.el.classList.remove('active');
                document.body.style.overflow = '';
                
                // Exit fullscreen if closing the lightbox entirely
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(err => console.log(err));
                }

                // Reset UI State for the next time it's opened
                this.uiVisible = true;
                this.el.classList.remove('ui-hidden');

                setTimeout(() => {
                    this.img.src = ''; 
                    this.img.alt = ''; // a11y: clear alt text
                    this.img.classList.remove('active', 'slide-in-right', 'slide-in-left', 'slide-out-left', 'slide-out-right');
                    this.videoContainer.innerHTML = '';
                    this.videoContainer.classList.remove('active', 'slide-in-right', 'slide-in-left', 'slide-out-left', 'slide-out-right');
                }, 300);

                // a11y: Return focus to the original element that opened the lightbox
                if (this.previouslyFocusedElement) {
                    this.previouslyFocusedElement.focus();
                }
                
                // a11y: Restore inert attribute so it cannot be focused while closed
                this.el.setAttribute('inert', '');
            }

            // Method to ONLY toggle UI visibility (no fullscreen changes)
            toggleUI() {
                this.uiVisible = !this.uiVisible;
                if (this.uiVisible) {
                    this.el.classList.remove('ui-hidden');
                } else {
                    this.el.classList.add('ui-hidden');
                }
            }

            // Method to toggle Fullscreen Native API and hide UI simultaneously
            toggleFullscreen() {
                if (!document.fullscreenElement) {
                    this.el.requestFullscreen().catch(err => console.log(err));
                    this.uiVisible = false;
                    this.el.classList.add('ui-hidden');
                } else {
                    document.exitFullscreen().catch(err => console.log(err));
                    this.uiVisible = true;
                    this.el.classList.remove('ui-hidden');
                }
            }

            navigate(direction) {
                const gallery = this.galleries[this.currentGroup];
                if (!gallery || gallery.length <= 1) return;

                let newIndex = this.currentIndex + direction;
                
                // Stop navigation if trying to go past the first or last image
                if (newIndex < 0 || newIndex >= gallery.length) return;

                this.img.classList.remove('active');
                this.img.className = `lightbox-image ${direction === 1 ? 'slide-out-left' : 'slide-out-right'}`;
                
                this.videoContainer.classList.remove('active');
                this.videoContainer.className = `lightbox-video-container ${direction === 1 ? 'slide-out-left' : 'slide-out-right'}`;

                setTimeout(() => {
                    this.currentIndex = newIndex;
                    this.updateUI(true, direction);
                }, 300); 
            }

            updateUI(animateIn = true, direction = 1) {
                const item = this.galleries[this.currentGroup][this.currentIndex];
                const total = this.galleries[this.currentGroup].length;

                if (total <= 1) {
                    this.prevBtn.style.display = 'none';
                    this.nextBtn.style.display = 'none';
                } else {
                    // Show or hide individual arrows based on current index position
                    this.prevBtn.style.display = this.currentIndex === 0 ? 'none' : 'flex';
                    this.nextBtn.style.display = this.currentIndex === total - 1 ? 'none' : 'flex';
                }
                this.counter.style.display = 'block';
                this.counter.textContent = `${this.currentIndex + 1} / ${total}`;


                if (animateIn) {
                    const animClass = direction === 1 ? 'slide-in-right' : 'slide-in-left';
                    this.img.className = `lightbox-image ${animClass}`;
                    this.videoContainer.className = `lightbox-video-container ${animClass}`;
                } else {
                    this.img.className = 'lightbox-image active';
                    this.videoContainer.className = 'lightbox-video-container active';
                }
                
                const isVideo = item.src.match(/\.(mp4|webm|ogg)$/i);
                
                if (isVideo) {
                    this.img.style.display = 'none';
                    this.videoContainer.style.display = 'flex';
                    this.videoContainer.innerHTML = '';
                    
                    const vidEl = document.createElement('video');
                    vidEl.className = 'custom-yt-video';
                    vidEl.style.width = '100%';
                    vidEl.style.height = '100%';
                    vidEl.src = item.src;
                    
                    if (item.videoEl) {
                        vidEl.setAttribute('hassound', item.videoEl.getAttribute('hassound') || 'true');
                        vidEl.setAttribute('hascontrols', item.videoEl.getAttribute('hascontrols') || 'true');
                        vidEl.setAttribute('autoplay', item.videoEl.getAttribute('autoplay') || 'false');
                        vidEl.setAttribute('loop', item.videoEl.getAttribute('loop') || 'true');
                        if (item.videoEl.hasAttribute('poster')) {
                            vidEl.setAttribute('poster', item.videoEl.getAttribute('poster'));
                        }
                    } else {
                        vidEl.setAttribute('hassound', 'true');
                        vidEl.setAttribute('hascontrols', 'true');
                        vidEl.setAttribute('autoplay', 'false');
                        vidEl.setAttribute('loop', 'true');
                    }

                    this.videoContainer.appendChild(vidEl);
                    if (window.initCustomVideos) {
                        window.initCustomVideos();
                    }
                } else {
                    this.videoContainer.style.display = 'none';
                    this.videoContainer.innerHTML = '';
                    this.img.style.display = 'block';
                    this.img.src = item.src;
                    this.img.alt = item.alt; 
                }

                if (animateIn) {
                    void this.img.offsetWidth; 
                    this.img.className = 'lightbox-image active';
                    this.videoContainer.className = 'lightbox-video-container active';
                }
            }

            bindEvents() {
                this.closeBtn.addEventListener('click', () => this.close());
                
                // Button toggles native fullscreen and hides UI
                this.toggleUIBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent closing
                    this.toggleFullscreen();
                });
                
                // Clicking the background wrapper closes the lightbox, OR shows UI if hidden
                this.el.addEventListener('click', (e) => {
                    if (e.target === this.el || e.target === this.wrapper) {
                        if (!this.uiVisible) {
                            this.toggleUI(); // Just reveal controls, doesn't exit fullscreen
                        } else {
                            this.close(); // Close completely
                        }
                    }
                });

                // Clicking the image only toggles the UI back on/off, doesn't trigger fullscreen
                this.img.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent background click
                    this.toggleUI();
                });

                this.prevBtn.addEventListener('click', () => this.navigate(-1));
                this.nextBtn.addEventListener('click', () => this.navigate(1));

                document.addEventListener('keydown', (e) => {
                    if (!this.el.classList.contains('active')) return;
                    
                    if (e.key === 'Escape') {
                        // Browser handles Esc exiting native fullscreen automatically. 
                        // This block ensures pressing Esc while just the normal lightbox is open will close it.
                        if (!document.fullscreenElement) {
                            this.close();
                        }
                    }
                    if (e.key === 'ArrowLeft') this.navigate(-1);
                    if (e.key === 'ArrowRight') this.navigate(1);
                    if (e.key === 'f' || e.key === ' ') { // Space or F toggles native fullscreen
                        e.preventDefault();
                        this.toggleFullscreen();
                    }
                    
                    // a11y: Focus trap mechanism - ensure keyboard users don't Tab out of the modal
                    if (e.key === 'Tab') {
                        // Gather all focusable elements inside the modal
                        const focusableElements = this.el.querySelectorAll('button:not([style*="display: none"])');
                        if (focusableElements.length > 0) {
                            const firstElement = focusableElements[0];
                            const lastElement = focusableElements[focusableElements.length - 1];

                            if (e.shiftKey) { // Shift + Tab (go backwards)
                                if (document.activeElement === firstElement) {
                                    e.preventDefault();
                                    lastElement.focus();
                                }
                            } else { // Tab (go forwards)
                                if (document.activeElement === lastElement) {
                                    e.preventDefault();
                                    firstElement.focus();
                                }
                            }
                        } else {
                            e.preventDefault(); // If nothing is focusable, just trap entirely
                        }
                    }
                });

                // Listen for native fullscreen state changes (e.g. user pressed ESC key)
                document.addEventListener('fullscreenchange', () => {
                    if (!document.fullscreenElement && !this.uiVisible && this.el.classList.contains('active')) {
                        // Automatically reveal the UI when exiting fullscreen via native methods
                        this.uiVisible = true;
                        this.el.classList.remove('ui-hidden');
                    }
                });

                // Swipe Gestures (Touch Events)
                this.wrapper.addEventListener('touchstart', (e) => {
                    this.touchStartX = e.changedTouches[0].clientX;
                }, { passive: true });

                this.wrapper.addEventListener('touchend', (e) => {
                    this.touchEndX = e.changedTouches[0].clientX;
                    this.handleSwipe();
                }, { passive: true });
            }

            handleSwipe() {
                const threshold = 50; 
                const distance = this.touchEndX - this.touchStartX;
                
                if (distance < -threshold) {
                    this.navigate(1); 
                } else if (distance > threshold) {
                    this.navigate(-1); 
                }
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            
            // Initialize User's Custom Lightbox
            new Lightbox();

            // Helper function for reliable scrolling with CSS snap boundaries
            const getTargetLeft = (track, card) => {
                return track.scrollLeft + (card.getBoundingClientRect().left - track.getBoundingClientRect().left);
            };

            // === 1. Dynamic Modular Carousel Logic ===
            const carousels = document.querySelectorAll('.carousel-container');
            
            carousels.forEach((container, containerIndex) => {
                const track = container.querySelector('.carousel-track');
                if (!track) return;

                const config = {
                    controls: container.getAttribute('data-controls') !== 'false',
                    dots: container.getAttribute('data-dots') === 'true',
                };

                const prevBtn = container.querySelector('.carousel-btn-prev');
                const nextBtn = container.querySelector('.carousel-btn-next');
                const cards = Array.from(track.children);

                // -- CONTROLS LOGIC --
                if (config.controls && prevBtn && nextBtn) {
                    const updateButtons = () => {
                        if (track.clientWidth === 0) return;

                        if (track.scrollLeft <= 20) {
                            prevBtn.style.opacity = '0';
                            prevBtn.style.pointerEvents = 'none';
                            prevBtn.style.transform = 'translateY(-50%) scale(0.9)';
                            prevBtn.setAttribute('tabindex', '-1');
                            prevBtn.setAttribute('aria-hidden', 'true');
                        } else {
                            prevBtn.style.opacity = '1';
                            prevBtn.style.pointerEvents = 'auto';
                            prevBtn.style.transform = 'translateY(-50%) scale(1)';
                            prevBtn.removeAttribute('tabindex');
                            prevBtn.setAttribute('aria-hidden', 'false');
                        }

                        // Increased threshold slightly for mobile subpixel rendering reliability
                        if (Math.ceil(track.scrollLeft + track.clientWidth) >= track.scrollWidth - 20) {
                            nextBtn.style.opacity = '0';
                            nextBtn.style.pointerEvents = 'none';
                            nextBtn.style.transform = 'translateY(-50%) scale(0.9)';
                            nextBtn.setAttribute('tabindex', '-1');
                            nextBtn.setAttribute('aria-hidden', 'true');
                        } else {
                            nextBtn.style.opacity = '1';
                            nextBtn.style.pointerEvents = 'auto';
                            nextBtn.style.transform = 'translateY(-50%) scale(1)';
                            nextBtn.removeAttribute('tabindex');
                            nextBtn.setAttribute('aria-hidden', 'false');
                        }
                    };

                    // Robust Next Button - Hunts for exact snap coordinates instead of arbitrary distances
                    nextBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const trackLeft = track.getBoundingClientRect().left;
                        const targetCard = cards.find(card => (card.getBoundingClientRect().left - trackLeft) > 20);
                        
                        if (targetCard) {
                            track.scrollTo({ left: getTargetLeft(track, targetCard), behavior: 'smooth' });
                        } else {
                            track.scrollBy({ left: track.clientWidth * 0.75, behavior: 'smooth' });
                        }
                    });

                    // Robust Prev Button
                    prevBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const trackLeft = track.getBoundingClientRect().left;
                        const targetCard = [...cards].reverse().find(card => (card.getBoundingClientRect().left - trackLeft) < -20);
                        
                        if (targetCard) {
                            track.scrollTo({ left: getTargetLeft(track, targetCard), behavior: 'smooth' });
                        } else {
                            track.scrollBy({ left: -track.clientWidth * 0.75, behavior: 'smooth' });
                        }
                    });

                    track.addEventListener('scroll', updateButtons);
                    window.addEventListener('resize', updateButtons);
                    
                    const resizeObserver = new ResizeObserver(() => updateButtons());
                    resizeObserver.observe(track);
                    setTimeout(updateButtons, 50);
                } else {
                    if (prevBtn) prevBtn.style.display = 'none';
                    if (nextBtn) nextBtn.style.display = 'none';
                }

                // -- DOTS PAGINATION LOGIC --
                if (config.dots && cards.length > 1) {
                    const dotsWrapper = document.createElement('div');
                    dotsWrapper.className = 'w-100 d-flex justify-content-center align-items-center gap-2 mt-3';
                    // a11y: Let screen readers know this is a list of pagination controls
                    dotsWrapper.setAttribute('role', 'tablist');
                    dotsWrapper.setAttribute('aria-label', `Slides pagination for carousel ${containerIndex + 1}`);
                    
                    cards.forEach((card, dotIndex) => {
                        const dot = document.createElement('div');
                        dot.className = 'carousel-dot rounded-circle bg-secondary opacity-25';
                        
                        // a11y: Make dots keyboard accessible natively as buttons
                        dot.setAttribute('role', 'tab');
                        dot.setAttribute('tabindex', dotIndex === 0 ? '0' : '-1'); 
                        dot.setAttribute('aria-label', `Go to slide ${dotIndex + 1}`);
                        dot.setAttribute('aria-selected', 'false');

                        // Mouse click behavior
                        dot.addEventListener('click', (e) => {
                            e.preventDefault();
                            track.scrollTo({ left: getTargetLeft(track, card), behavior: 'smooth' });
                        });

                        // a11y: Keyboard behavior (Enter or Space)
                        dot.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                track.scrollTo({ left: getTargetLeft(track, card), behavior: 'smooth' });
                            }
                        });

                        dotsWrapper.appendChild(dot);
                    });
                    
                    container.appendChild(dotsWrapper);
                    const dotsArray = Array.from(dotsWrapper.children);

                    const updateDots = () => {
                        let activeIndex = 0;
                        let minDiff = Infinity;
                        
                        const trackCenter = track.getBoundingClientRect().left + (track.clientWidth / 2);
                        
                        cards.forEach((card, i) => {
                            const cardCenter = card.getBoundingClientRect().left + (card.clientWidth / 2);
                            const diff = Math.abs(trackCenter - cardCenter);
                            if (diff < minDiff) {
                                minDiff = diff;
                                activeIndex = i;
                            }
                        });

                        dotsArray.forEach((dot, i) => {
                            if (i === activeIndex) {
                                dot.classList.add('active', 'bg-success', 'opacity-100');
                                dot.classList.remove('bg-secondary', 'opacity-25');
                                dot.setAttribute('aria-selected', 'true'); // a11y: Let screen reader know it is active
                                dot.setAttribute('tabindex', '0');
                            } else {
                                dot.classList.remove('active', 'bg-success', 'opacity-100');
                                dot.classList.add('bg-secondary', 'opacity-25');
                                dot.setAttribute('aria-selected', 'false');
                                dot.setAttribute('tabindex', '-1');
                            }
                        });
                    };

                    track.addEventListener('scroll', updateDots);
                    window.addEventListener('resize', updateDots);
                    setTimeout(updateDots, 50);
                }
            });

            // === 2. Dynamic Expandable Text Logic (Supports Multiple Instances) ===
            const expandableSections = document.querySelectorAll('.expandable-section');
            
            expandableSections.forEach(section => {
                const textContainer = section.querySelector('.expand-text');
                const icon = section.querySelector('.expand-icon');

                if (!textContainer || !icon) return; // Skip if missing elements

                // Get exact desired text length from HTML attribute
                const maxLength = parseInt(textContainer.getAttribute('data-max-length')) || 150;
                
                // Extract safe plain text before modifying DOM
                let plainText = textContainer.textContent.replace(/\s+/g, ' ').trim();
                
                // Create absolute character cutoff appending '...'
                let previewText = plainText;
                if (plainText.length > maxLength) {
                    previewText = plainText.substring(0, maxLength).trim() + "...";
                }
                
                // CRUCIAL FIX: Wrap existing content to preserve DOM nodes and event listeners (for Lightbox/Carousels)
                const fullContentWrapper = document.createElement('div');
                while (textContainer.firstChild) {
                    fullContentWrapper.appendChild(textContainer.firstChild);
                }
                
                const previewContentWrapper = document.createElement('div');
                previewContentWrapper.innerHTML = `<p class="mb-0">${previewText}</p>`;
                
                textContainer.appendChild(previewContentWrapper);
                textContainer.appendChild(fullContentWrapper);
                
                // Set initial collapsed state
                let isExpanded = false;
                fullContentWrapper.style.display = 'none';

                // a11y: Function handling both click and keyboard interaction
                const toggleSection = (e) => {
                    if (e) e.stopPropagation(); // Prevent event bubbling
                    
                    isExpanded = !isExpanded;
                    icon.setAttribute('aria-expanded', isExpanded); // a11y: Update state for screen readers
                    
                    // A. Lock current height so it doesn't jump instantly
                    const startHeight = textContainer.getBoundingClientRect().height;
                    textContainer.style.height = startHeight + 'px';
                    
                    // B. Swap visibility of wrappers (This preserves DOM events perfectly)
                    if (isExpanded) {
                        previewContentWrapper.style.display = 'none';
                        fullContentWrapper.style.display = 'block';
                    } else {
                        fullContentWrapper.style.display = 'none';
                        previewContentWrapper.style.display = 'block';
                    }
                    
                    icon.style.transform = isExpanded ? 'rotate(270deg)' : 'rotate(0deg)';
                    
                    // C. Measure what the new target height SHOULD be
                    textContainer.style.height = 'auto';
                    const targetHeight = textContainer.getBoundingClientRect().height;
                    
                    // D. Reset back to the start height immediately
                    textContainer.style.height = startHeight + 'px';
                    
                    // Force the browser to register this start height (Reflow)
                    void textContainer.offsetHeight;
                    
                    // E. Trigger the smooth CSS height transition
                    textContainer.style.height = targetHeight + 'px';
                    
                    // F. Remove hardcoded heights after animation finishes (0.3s)
                    setTimeout(() => {
                        textContainer.style.height = 'auto';
                    }, 300);
                };

                // Mouse interaction
                icon.addEventListener('click', toggleSection);
                
                // Allow clicking the text box to expand (but not collapse)
                textContainer.addEventListener('click', (e) => {
                    // Prevent triggering if clicking a link inside the text
                    if (e.target.closest('a')) return;
                    
                    if (!isExpanded) {
                        toggleSection(e);
                        textContainer.style.cursor = 'text'; // Remove pointer cursor after expanding
                    }
                });
                
                // Add pointer cursor initially
                textContainer.style.cursor = 'pointer';

                // a11y: Keyboard interaction
                icon.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault(); // Stop page from scrolling on Space
                        toggleSection(e);
                    }
                });

            });

            // === 3. Centered 'Read More' Text Expander Logic ===
            const readMoreSections = document.querySelectorAll('.read-more-section');
            
            readMoreSections.forEach(section => {
                const maxLength = parseInt(section.getAttribute('data-max-length')) || 150;
                let plainText = section.textContent.replace(/\s+/g, ' ').trim();

                // If content is already short, do not build the read more logic
                if (plainText.length <= maxLength) return; 

                let previewText = plainText.substring(0, maxLength).trim() + "...";

                // Store original content safely
                const fullContentWrapper = document.createElement('div');
                while (section.firstChild) {
                    fullContentWrapper.appendChild(section.firstChild);
                }

                const previewContentWrapper = document.createElement('div');
                previewContentWrapper.innerHTML = `<p class="mb-0">${previewText}</p>`;

                // The container that will manage the smooth height transition
                const textContainer = document.createElement('div');
                textContainer.className = 'text-expandable';
                textContainer.appendChild(previewContentWrapper);
                textContainer.appendChild(fullContentWrapper);

                // Create the accessible "Read More" button
                const toggleBtn = document.createElement('button');
                // a11y: Use standard button styling with btn-link for accessible focus handling
                toggleBtn.className = 'btn btn-link text-muted fw-medium w-100 text-center text-decoration-none p-0 mt-3';
                toggleBtn.setAttribute('aria-expanded', 'false'); // a11y: Announce collapsed state
                toggleBtn.textContent = 'Read More';

                // Append the assembled pieces back into the original container
                section.appendChild(textContainer);
                section.appendChild(toggleBtn);

                let isExpanded = false;
                fullContentWrapper.style.display = 'none';

                // a11y: Buttons automatically capture 'Click', 'Enter', and 'Space' natively
                toggleBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    isExpanded = !isExpanded;
                    toggleBtn.setAttribute('aria-expanded', isExpanded); // a11y: Announce new state
                    toggleBtn.textContent = isExpanded ? 'Show Less' : 'Read More';

                    // Smooth transition logic (same as previous expander)
                    const startHeight = textContainer.getBoundingClientRect().height;
                    textContainer.style.height = startHeight + 'px';

                    if (isExpanded) {
                        previewContentWrapper.style.display = 'none';
                        fullContentWrapper.style.display = 'block';
                    } else {
                        fullContentWrapper.style.display = 'none';
                        previewContentWrapper.style.display = 'block';
                    }

                    textContainer.style.height = 'auto';
                    const targetHeight = textContainer.getBoundingClientRect().height;
                    textContainer.style.height = startHeight + 'px';
                    void textContainer.offsetHeight; // Force reflow
                    textContainer.style.height = targetHeight + 'px';

                    setTimeout(() => { textContainer.style.height = 'auto'; }, 300);
                });
            });

        });