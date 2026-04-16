async function shareContent() {
  const shareData = {
    title: document.title,
    text: 'Check this out!',
    url: window.location.href
  };

  // Try Web Share API first (mobile)
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      console.log('Share failed or cancelled:', error);
      // Fall through to copy methods
    }
  }

  // Try modern clipboard API (requires HTTPS)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(shareData.url);
      showToast('Link copied to clipboard!');
      return;
    } catch (error) {
      console.log('Clipboard API failed:', error);
    }
  }

  // Fallback for HTTP or older browsers
  try {
    copyToClipboardFallback(shareData.url);
    showToast('Link copied to clipboard!');
  } catch (error) {
    console.log('All copy methods failed:', error);
    showToast('Please copy the link manually');
  }
}

function copyToClipboardFallback(text) {
  // Create temporary input element
  const tempInput = document.createElement('input');
  tempInput.value = text;
  tempInput.style.position = 'absolute';
  tempInput.style.left = '-9999px';
  tempInput.style.top = '-9999px';
  
  document.body.appendChild(tempInput);
  tempInput.select();
  tempInput.setSelectionRange(0, 99999); // For mobile devices
  
  const successful = document.execCommand('copy');
  document.body.removeChild(tempInput);
  
  if (!successful) {
    throw new Error('Fallback copy failed');
  }
}

function showToast(message) {
  // Remove existing toast
  const existing = document.getElementById('share-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'share-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(16px);
    color: #1a1a1a;
    padding: 8px 16px;
    border-radius: 24px;
    border: 1px solid rgba(256, 256, 256, 0.2);
    font-size: clamp(0.8rem, 1vw, 1.2rem);
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}