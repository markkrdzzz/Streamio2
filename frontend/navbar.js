// Render profile avatar in navbar (if a user is stored) and provide logout
function renderAuthAvatar() {
  const raw = localStorage.getItem('user');
  if (!raw) return;
  let user;
  try { user = JSON.parse(raw); } catch (e) { localStorage.removeItem('user'); return; }
  
  // find the login/signup element specifically so we don't match the search button
  let navAnchor = null;
  const loginAnchor = document.querySelector('a[href="login.html"], a[href="signup.html"]');
  if (loginAnchor) {
    navAnchor = loginAnchor.closest('.custom-button') || loginAnchor;
  } else {
    navAnchor = document.querySelector('.navbar .container-fluid > .btn.custom-button, .navbar .container-fluid > a.custom-button, .custom-button');
  }
  if (!navAnchor) return;
  
  const dropdown = document.createElement('div');
  dropdown.className = 'dropdown';
  dropdown.style.position = 'static';
  
  const img = document.createElement('img');
  img.src = img.src = 'default_pfp.svg'
  img.alt = 'Profile';
  img.style.width = '40px';
  img.style.height = '40px';
  img.style.borderRadius = '50%';
  img.style.cursor = 'pointer';
  img.className = 'dropdown-toggle';
  img.setAttribute('data-bs-toggle', 'dropdown');
  img.setAttribute('aria-expanded', 'false');
  
  const menu = document.createElement('ul');
  menu.className = 'dropdown-menu dropdown-menu-end';
  menu.style.cssText = `
    position: absolute !important;
    top: 100% !important;
    right: 0 !important;
    margin-top: 0.5rem !important;
    background-color: #afd5eb !important;
  `;
  
  const profileItem = document.createElement('li');
  const profileLink = document.createElement('a');
  profileLink.className = 'dropdown-item';
  profileLink.href = 'profile.html';
  profileLink.innerHTML = '<i class="bi bi-person"></i> Profile';
  profileItem.appendChild(profileLink);
  
  
  
  const logoutItem = document.createElement('li');
  const logoutLink = document.createElement('a');
  logoutLink.className = 'dropdown-item';
  logoutLink.href = '#';
  logoutLink.innerHTML = '<i class="bi bi-box-arrow-right"></i> Logout';
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  });
  logoutItem.appendChild(logoutLink);
  
  menu.appendChild(profileItem);
  
  menu.appendChild(logoutItem);
  dropdown.appendChild(img);
  dropdown.appendChild(menu);
  
  navAnchor.replaceWith(dropdown);
  
  // Force the background color after a short delay to override Bootstrap
  setTimeout(() => {
    menu.style.setProperty('background-color', '#afd5eb', 'important');
  }, 0);
}

// Auto-run on page load
document.addEventListener('DOMContentLoaded', () => {
  renderAuthAvatar();
});