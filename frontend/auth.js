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
