// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Login form handler
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // Basic validation
            if (!email || !password) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Here you would typically send the data to your server
            console.log('Login attempt:', { email, password, remember });
            
            // For demo purposes, just show success message
            alert('Login successful! (This is a demo)');
            
            // Redirect to profile page
            window.location.href = 'profile.html';
        });
    }

    // Signup form handler
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const birthdate = document.getElementById('birthdate').value;
            const terms = document.getElementById('terms').checked;
            const newsletter = document.getElementById('newsletter').checked;
            
            // Basic validation
            if (!firstName || !lastName || !username || !email || !password || !confirmPassword || !birthdate) {
                alert('Please fill in all required fields.');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }
            
            if (password.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }
            
            if (!terms) {
                alert('You must agree to the Terms of Service and Privacy Policy.');
                return;
            }
            
            // Here you would typically send the data to your server
            console.log('Signup attempt:', { 
                firstName, 
                lastName, 
                username, 
                email, 
                password, 
                birthdate, 
                terms, 
                newsletter 
            });
            
            // For demo purposes, just show success message
            alert('Account created successfully! (This is a demo)');
            
            // Redirect to profile page
            window.location.href = 'profile.html';
        });
    }

});

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    // At least 6 characters, one letter and one number
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return re.test(password);
}

// Real-time validation feedback
document.addEventListener('input', function(e) {
    if (e.target.type === 'email') {
        const isValid = validateEmail(e.target.value);
        e.target.style.borderColor = isValid ? '#28a745' : '#dc3545';
    }
    
    if (e.target.type === 'password' && e.target.id === 'password') {
        const isValid = validatePassword(e.target.value);
        e.target.style.borderColor = isValid ? '#28a745' : '#dc3545';
    }
    
    if (e.target.id === 'confirmPassword') {
        const password = document.getElementById('password').value;
        const isValid = e.target.value === password;
        e.target.style.borderColor = isValid ? '#28a745' : '#dc3545';
    }
});
