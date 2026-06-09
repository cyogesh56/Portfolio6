/* =======================================================
   SCROLL PROGRESS TRACKER
   Handles both sectional tracking (ALSAC) and global tracking
   ======================================================= */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Check if we are on a page with sectional navigation (alsac.html)
    const navButtons = document.querySelectorAll('.top-bar-navbtn');
    
    // We assume it's sectional if we have nav buttons with hrefs starting with '#'
    const isSectional = Array.from(navButtons).some(btn => {
        const link = btn.querySelector('.top-bar-navbtn-link');
        return link && link.getAttribute('href') && link.getAttribute('href').startsWith('#');
    });

    if (isSectional) {
        // --- Sectional Progress Logic ---
        const sections = Array.from(navButtons).map(btn => {
            const link = btn.querySelector('.top-bar-navbtn-link');
            if (link && link.getAttribute('href').startsWith('#')) {
                const targetId = link.getAttribute('href').substring(1);
                const targetEl = document.getElementById(targetId);
                const progressBar = btn.querySelector('.section-progress-bar');
                return { btn, targetEl, progressBar };
            }
            return null;
        }).filter(sec => sec && sec.targetEl && sec.progressBar);

        const updateSectionProgress = () => {
            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;

            sections.forEach((sec, index) => {
                const rect = sec.targetEl.getBoundingClientRect();
                const sectionTop = rect.top + scrollY;
                
                // Determine the end of this section
                const nextSec = sections[index + 1];
                let sectionBottom;
                if (nextSec && nextSec.targetEl) {
                    sectionBottom = nextSec.targetEl.getBoundingClientRect().top + scrollY;
                } else {
                    // Last section goes to the bottom of the document
                    sectionBottom = document.documentElement.scrollHeight;
                }

                // We consider the user "in" the section when it reaches the middle of the viewport
                const offset = viewportHeight / 2; 
                
                // Calculate progress within this section
                const totalScrollable = sectionBottom - sectionTop;
                
                if (scrollY + offset >= sectionTop && scrollY + offset < sectionBottom) {
                    // Active section
                    sec.btn.classList.add('active');
                    let progress = ((scrollY + offset - sectionTop) / totalScrollable) * 100;
                    progress = Math.max(0, Math.min(100, progress));
                    sec.progressBar.style.width = `${progress}%`;
                } else {
                    // Inactive section
                    sec.btn.classList.remove('active');
                    if (scrollY + offset >= sectionBottom) {
                        sec.progressBar.style.width = '100%'; // User has passed this section
                    } else {
                        sec.progressBar.style.width = '0%'; // User hasn't reached it yet
                    }
                }
            });
        };

        window.addEventListener('scroll', () => {
            requestAnimationFrame(updateSectionProgress);
        });
        
        // Slight delay to ensure layout is complete before initial calculation
        setTimeout(updateSectionProgress, 100);

    } else {
        // --- Global Progress Logic ---
        const globalBar = document.getElementById('global-progress');
        if (globalBar) {
            const updateGlobalProgress = () => {
                const scrollY = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
                globalBar.style.width = `${progress}%`;
            };

            window.addEventListener('scroll', () => {
                requestAnimationFrame(updateGlobalProgress);
            });
            
            setTimeout(updateGlobalProgress, 100);
        }
    }
});
