// auth.js

const API_URL = "http://localhost:4000"; // your backend URL

// --- SIGNUP ---
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (res.ok) {
      alert("✅ Account created successfully!");
      window.location.href = "login.html";
    } else {
      alert("❌ Failed to create account");
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
      window.location.href = "index.html"; // redirect to homepage
    } else {
      alert("❌ Invalid email or password");
    }
  });
}
