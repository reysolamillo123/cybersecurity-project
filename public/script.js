document.addEventListener('DOMContentLoaded', () => {
    
    // --- Elements ---
    const regForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    // Registration elements
    const regPassword = document.getElementById('regPassword');
    const regConfirmPassword = document.getElementById('regConfirmPassword');
    const meterBar = document.getElementById('meterBar');
    const strengthText = document.getElementById('strengthText');
    const regBtn = document.getElementById('regBtn');
    
    // Requirements list elements
    const reqLower = document.getElementById('reqLower');
    const reqUpper = document.getElementById('reqUpper');
    const reqDigit = document.getElementById('reqDigit');
    const reqSymbol = document.getElementById('reqSymbol');
    const reqLength = document.getElementById('reqLength');

    // --- Password Strength Meter Logic ---
    if (regPassword) {
        regPassword.addEventListener('input', () => {
            const val = regPassword.value;
            
            // Validation criteria
            const hasLower = /[a-z]/.test(val);
            const hasUpper = /[A-Z]/.test(val);
            const hasDigit = /\d/.test(val);
            const hasSymbol = /[\W_]/.test(val);
            const isLongEnough = val.length >= 12;

            // Update list UI
            updateReqUI(reqLower, hasLower);
            updateReqUI(reqUpper, hasUpper);
            updateReqUI(reqDigit, hasDigit);
            updateReqUI(reqSymbol, hasSymbol);
            updateReqUI(reqLength, isLongEnough);

            // Calculate strength score (0 to 5)
            let score = 0;
            if (hasLower) score++;
            if (hasUpper) score++;
            if (hasDigit) score++;
            if (hasSymbol) score++;
            if (isLongEnough) score++;

            // Update meter bar UI
            updateMeterUI(score, val.length);
        });

        // Add input listener for confirm password to check match
        regConfirmPassword.addEventListener('input', checkPasswordsMatch);
    }

    function updateReqUI(element, isValid) {
        if (!element) return;
        const icon = element.querySelector('i');
        if (isValid) {
            element.classList.add('valid');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-check');
        } else {
            element.classList.remove('valid');
            icon.classList.remove('fa-check');
            icon.classList.add('fa-times');
        }
        checkPasswordsMatch();
    }

    function updateMeterUI(score, length) {
        if (length === 0) {
            meterBar.style.width = '0%';
            meterBar.style.backgroundColor = 'transparent';
            strengthText.textContent = 'None';
            strengthText.style.color = 'var(--text-muted)';
            return;
        }

        // According to requirements:
        // Weak: < 3 requirements met or length < 8
        // Medium: 3-4 requirements met
        // Strong: All 5 requirements met
        
        if (score === 5) {
            meterBar.style.width = '100%';
            meterBar.style.backgroundColor = 'var(--success-color)';
            strengthText.textContent = 'Strong';
            strengthText.style.color = 'var(--success-color)';
        } else if (score >= 3) {
            meterBar.style.width = '60%';
            meterBar.style.backgroundColor = 'var(--warning-color)';
            strengthText.textContent = 'Medium';
            strengthText.style.color = 'var(--warning-color)';
        } else {
            meterBar.style.width = '30%';
            meterBar.style.backgroundColor = 'var(--error-color)';
            strengthText.textContent = 'Weak';
            strengthText.style.color = 'var(--error-color)';
        }
        
        checkPasswordsMatch();
    }

    function checkPasswordsMatch() {
        if (!regBtn || !regPassword || !regConfirmPassword) return;
        
        const pwd = regPassword.value;
        const confirmPwd = regConfirmPassword.value;
        
        const isStrong = document.querySelectorAll('.req-list li.valid').length === 5;
        const doMatch = pwd === confirmPwd && pwd.length > 0;
        
        if (isStrong && doMatch) {
            regBtn.disabled = false;
        } else {
            regBtn.disabled = true;
        }
    }

    // --- API Calls ---

    // Registration Form Submit
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const password = regPassword.value;
            const confirmPassword = regConfirmPassword.value;
            const msgBox = document.getElementById('registerMessage');

            if (password !== confirmPassword) {
                showMessage(msgBox, 'Passwords do not match.', 'error');
                return;
            }

            try {
                regBtn.disabled = true;
                regBtn.textContent = 'Registering...';
                
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showMessage(msgBox, data.message, 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    showMessage(msgBox, data.error, 'error');
                    regBtn.disabled = false;
                    regBtn.textContent = 'Register Securely';
                }
            } catch (err) {
                showMessage(msgBox, 'Network error. Please try again.', 'error');
                regBtn.disabled = false;
                regBtn.textContent = 'Register Securely';
            }
        });
    }

    // Login Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            const msgBox = document.getElementById('loginMessage');
            const loginBtn = loginForm.querySelector('button');

            try {
                loginBtn.disabled = true;
                loginBtn.textContent = 'Authenticating...';
                
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showMessage(msgBox, data.message, 'success');
                    // Simulate login session
                    localStorage.setItem('loggedIn', 'true');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    // "Invalid Username or Password"
                    showMessage(msgBox, data.error, 'error');
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Login Securely';
                }
            } catch (err) {
                showMessage(msgBox, 'Network error. Please try again.', 'error');
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login Securely';
            }
        });
    }

    function showMessage(element, text, type) {
        element.textContent = text;
        element.className = `message ${type}`;
        // Automatically hide after 5 seconds
        setTimeout(() => {
            element.style.display = 'none';
            element.className = 'message';
            element.style.display = '';
        }, 5000);
    }
});
