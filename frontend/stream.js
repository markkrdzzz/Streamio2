(function() {
  const API_URL = 'http://localhost:4000';

  // Check if user has an active stream on page load
  async function checkForActiveStream() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id && !user.user_id) return;

    const userId = user.id || user.user_id;

    try {
      // Check if user has an active livestream
      const response = await fetch(`${API_URL}/livestreams?user_id=${userId}`);
      if (!response.ok) return;

      const streams = await response.json();
      const userStream = streams.find(s => s.user_id === userId);

      if (userStream) {
        // User has an active stream
        showReturnToStreamBanner(userStream);
      } else {
        // No active stream - remove banner if it exists
        const existingBanner = document.getElementById('activeStreamBanner');
        if (existingBanner) {
          existingBanner.remove();
          const main = document.querySelector('main');
          if (main) main.style.paddingTop = '80px';
        }
      }
    } catch (error) {
      console.error('Error checking for active stream:', error);
    }
  }

  function showReturnToStreamBanner(stream) {
    // Don't show banner if already on broadcast page
    if (window.location.pathname.includes('broadcast.html')) return;

    // Check if banner already exists
    if (document.getElementById('activeStreamBanner')) return;

    // Create banner
    const banner = document.createElement('div');
    banner.id = 'activeStreamBanner';
    banner.style.cssText = `
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      background: linear-gradient(90deg, #ff0000, #ff4444);
      color: white;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 9999;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      animation: slideDown 0.3s ease-out;
    `;

    banner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px;">
        <span style="display: inline-block; width: 10px; height: 10px; background: white; border-radius: 50%; animation: pulse 2s infinite;"></span>
        <span style="font-weight: 600; font-size: 15px;">🔴 You are currently live: "${stream.title}"</span>
      </div>
      <div style="display: flex; gap: 10px;">
        <button id="returnToStreamBtn" style="
          background: white;
          color: #ff0000;
          border: none;
          padding: 8px 20px;
          border-radius: 5px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        ">Return to Stream</button>
        <button id="dismissBannerBtn" style="
          background: transparent;
          color: white;
          border: 2px solid white;
          padding: 8px 15px;
          border-radius: 5px;
          cursor: pointer;
          transition: opacity 0.2s;
        ">×</button>
      </div>
    `;

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      #returnToStreamBtn:hover {
        transform: scale(1.05);
      }
      #dismissBannerBtn:hover {
        opacity: 0.8;
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(banner);

    // Adjust main content padding to account for banner
    const main = document.querySelector('main');
    if (main) {
      main.style.paddingTop = '140px';
    }

    // Add event listeners
    document.getElementById('returnToStreamBtn').addEventListener('click', () => {
      window.location.href = 'broadcast.html';
    });

    document.getElementById('dismissBannerBtn').addEventListener('click', () => {
      banner.remove();
      if (main) {
        main.style.paddingTop = '80px';
      }
    });
  }

  // Run check when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForActiveStream);
  } else {
    checkForActiveStream();
  }

  // Re-check every 30 seconds
  setInterval(checkForActiveStream, 30000);
})();