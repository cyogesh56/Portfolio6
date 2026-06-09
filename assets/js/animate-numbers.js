/* =======================================================
   ANIMATE NUMBERS SCRIPT
   Dynamically animates numbers from 0 to target when scrolled into view.
   Supports prefixes ($) and suffixes (K, %, m+, /5).
   ======================================================= */

function animateValue(obj, start, end, duration, prefix, suffix, decimals) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // easeOutQuart for smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const current = start + easeOut * (end - start);
        
        obj.innerHTML = prefix + current.toFixed(decimals) + suffix;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            // Ensure exact final value
            obj.innerHTML = prefix + end.toFixed(decimals) + suffix;
        }
    };
    window.requestAnimationFrame(step);
}

document.addEventListener("DOMContentLoaded", () => {
    const animateElements = () => {
        document.querySelectorAll('.animate-number').forEach(el => {
            el.classList.add("is-visible");
            
            const text = el.innerText.trim();
            const numMatch = text.match(/[\d.]+/);
            
            if (numMatch) {
                const targetValue = parseFloat(numMatch[0]);
                const decimals = numMatch[0].includes('.') ? numMatch[0].split('.')[1].length : 0;
                const prefix = text.substring(0, numMatch.index);
                const suffix = text.substring(numMatch.index + numMatch[0].length);
                
                // Animate over 750ms
                animateValue(el, 0, targetValue, 750, prefix, suffix, decimals);
            }
        });
    };

    document.querySelectorAll('.animate-number').forEach(el => {
        // Add js-ready class to hide the number ONLY if JS successfully runs
        el.classList.add('js-ready');
    });

    // Play animation right after page load with 1s delay
    setTimeout(animateElements, 1000);
});
