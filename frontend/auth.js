const API_URL = "http://localhost:4000"; // your backend URL

// --- SIGNUP ---
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Check if passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const fullName = `${firstName} ${lastName}`;

    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, name: fullName }),
    });

    if (res.ok) {
      alert("✅ Account created successfully!");
      window.location.href = "login.html";
    } else {
      const errorText = await res.text();
      alert("Failed to create account: " + errorText);
    }
  });
}

// --- LOGIN ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const user = await res.json();
      localStorage.setItem("user", JSON.stringify(user));
      alert(`Welcome back, ${user.username}!`);
      window.location.href = "homepage.html"; // redirect to homepage
    } else {
      const errorText = await res.text();
      alert(errorText);
    }
  });
}

// Render profile avatar in navbar (if a user is stored) and provide logout
function renderAuthAvatar() {
  const raw = localStorage.getItem('user');
  if (!raw) return;
  let user;
  try { user = JSON.parse(raw); } catch (e) { localStorage.removeItem('user'); return; }
  
  // Ensure user has a name property (fallback to username)
  if (!user.name) {
    user.name = user.username;
  }
  
  // find the login/signup element specifically so we don't match the search button
  let navAnchor = null;
  const loginAnchor = document.querySelector('a[href="login.html"], a[href="signup.html"]');
  if (loginAnchor) {
    navAnchor = loginAnchor.closest('.custom-button') || loginAnchor;
  } else {
    // fallback: try to find a top-right .custom-button but avoid matching the search button inside forms
    navAnchor = document.querySelector('.navbar .container-fluid > .btn.custom-button, .navbar .container-fluid > a.custom-button, .custom-button');
  }
  if (!navAnchor) return;
  
  // Create dropdown wrapper
  const dropdown = document.createElement('div');
  dropdown.className = 'dropdown';
  dropdown.style.position = 'static';
  
  // Create profile image button
  const img = document.createElement('img');
  img.src = 'default_pfp.svg'
  img.alt = 'Profile';
  img.style.width = '40px';
  img.style.height = '40px';
  img.style.borderRadius = '50%';
  img.style.cursor = 'pointer';
  img.className = 'dropdown-toggle';
  img.setAttribute('data-bs-toggle', 'dropdown');
  img.setAttribute('aria-expanded', 'false');
  
  // Create dropdown menu
  const menu = document.createElement('ul');
  menu.className = 'dropdown-menu dropdown-menu-end';
  menu.style.cssText = `
    position: absolute !important;
    top: 100% !important;
    right: 0 !important;
    margin-top: 0.5rem !important;
    background-color: #afd5eb !important;
  `;
  
  // Add user name header
  const nameHeader = document.createElement('li');
  const nameText = document.createElement('h6');
  nameText.className = 'dropdown-header';
  nameText.textContent = user.name || user.username;
  nameText.style.fontWeight = 'bold';
  nameText.style.color = '#333';
  nameHeader.appendChild(nameText);
  
  const divider = document.createElement('li');
  divider.innerHTML = '<hr class="dropdown-divider">';
  
  // Profile link
  const profileItem = document.createElement('li');
  const profileLink = document.createElement('a');
  profileLink.className = 'dropdown-item';
  profileLink.href = `profile.html?user=${user.username}`;
  profileLink.innerHTML = '<i class="bi bi-person"></i> Profile';
  profileItem.appendChild(profileLink);
  
  // Logout link
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
  
  // Assemble dropdown
  menu.appendChild(nameHeader);
  menu.appendChild(divider);
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

document.addEventListener('DOMContentLoaded', renderAuthAvatar);