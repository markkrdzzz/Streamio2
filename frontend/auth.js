// auth.js

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
      alert("❌ Passwords do not match");
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
      alert("❌ Failed to create account: " + errorText);
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
      alert(`👋 Welcome back, ${user.username}!`);
      window.location.href = "homepage.html"; // redirect to homepage
    } else {
      const errorText = await res.text();
      alert("❌ " + errorText);
    }
  });
}

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
    // fallback: try to find a top-right .custom-button but avoid matching the search button inside forms
    navAnchor = document.querySelector('.navbar .container-fluid > .btn.custom-button, .navbar .container-fluid > a.custom-button, .custom-button');
  }
  if (!navAnchor) return;

  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '8px';

  const img = document.createElement('img');
  img.src = user.avatar || (`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || user.email || user.name || '')}&background=0D8ABC&color=fff&size=128`);
  img.alt = 'Profile';
  img.style.width = '40px';
  img.style.height = '40px';
  img.style.borderRadius = '50%';
  img.style.cursor = 'pointer';
  img.addEventListener('click', () => window.location.href = 'profile.html');

  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'btn btn-sm btn-outline-secondary';
  logoutBtn.textContent = 'Logout';
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  });

  wrapper.appendChild(img);
  wrapper.appendChild(logoutBtn);
  navAnchor.replaceWith(wrapper);
}

document.addEventListener('DOMContentLoaded', renderAuthAvatar);
