document.addEventListener('DOMContentLoaded', () => {

    // --- NEW: Page Loader Logic ---
    const pageLoader = document.getElementById('full-screen-loader'); // <--- CORRECTED ID HERE
    const LOADER_DISPLAY_DURATION = 1000; // 1 second in milliseconds

    if (pageLoader) {
        // Set a timeout to hide the loader after the specified duration
        setTimeout(() => {
            pageLoader.classList.add('hidden');
            // Optional: Remove the loader from DOM completely after transition
            pageLoader.addEventListener('transitionend', () => {
                 pageLoader.remove();
            }, { once: true });
        }, LOADER_DISPLAY_DURATION);
    }
    // --- END NEW: Page Loader Logic ---

});