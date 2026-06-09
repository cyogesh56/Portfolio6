/* =======================================================
   UX ENHANCEMENTS SCRIPT
   Handles Instant Pre-fetching and Smart Image Loading
   ======================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Instant Page Pre-fetching (Speculation Rules API)
    // We dynamically inject this so we don't have to bloat every HTML file.
    if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
        const specScript = document.createElement('script');
        specScript.type = 'speculationrules';
        const specRules = {
            "prefetch": [{
                "where": { "href_matches": "/*" },
                "eagerness": "moderate" // Fetches when user hovers over a link for a moment
            }]
        };
        specScript.textContent = JSON.stringify(specRules);
        document.body.appendChild(specScript);
    }

    // 2. Smart Image Loading (Skeletons)
    // We find all images. If they are already complete (cached), we mark them loaded immediately.
    // Otherwise, we wait for the 'load' event to remove the skeleton background.
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('is-loaded');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('is-loaded');
            });
            // Fallback in case of error
            img.addEventListener('error', () => {
                img.classList.add('is-loaded'); 
            });
        }
    });

});

// Global copy to clipboard function with Toast
window.copyEmailToClipboard = function(event, text) {
    event.preventDefault(); // Prevent default if inside anchor
    
    // Get button position before async clipboard
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    const topPos = rect.bottom + window.scrollY + 10; // 10px below button
    const leftPos = rect.left + window.scrollX + (rect.width / 2); // Center of button

    navigator.clipboard.writeText(text).then(() => {
        // Remove existing toast
        const existing = document.getElementById('copy-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'copy-toast';
        
        // Add bootstrap check icon and text
        toast.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16" style="margin-right: 8px;">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
            <span style="font-weight: 500;">Email copied to clipboard!</span>
        `;
        
        toast.style.cssText = `
            position: absolute;
            top: ${topPos}px;
            left: ${leftPos}px;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            color: #fff;
            padding: 8px 16px;
            border-radius: 24px;
            font-size: 0.95rem;
            z-index: 100000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: fadeInOutToast 2.5s forwards;
            display: flex;
            align-items: center;
            white-space: nowrap;
            pointer-events: none;
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
        
        // Add tiny keyframe animation dynamically if not exists
        if (!document.getElementById('toast-animation-style')) {
            const style = document.createElement('style');
            style.id = 'toast-animation-style';
            style.textContent = `
                @keyframes fadeInOutToast {
                    0% { opacity: 0; transform: translate(-50%, -10px); }
                    15% { opacity: 1; transform: translate(-50%, 0); }
                    85% { opacity: 1; transform: translate(-50%, 0); }
                    100% { opacity: 0; transform: translate(-50%, 10px); }
                }
            `;
            document.head.appendChild(style);
        }
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
};
