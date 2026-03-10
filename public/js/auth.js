// public/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    // Only allow guests on auth pages
    requireGuest();

    const loginForm = document.querySelector('[data-purpose="login-form"]');
    const signupForm = document.querySelector('[data-purpose="signup-form"]');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Signing in...';
            submitBtn.disabled = true;

            try {
                const data = await fetchAPI('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });

                if (data && data.success) {
                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('user', JSON.stringify({
                        name: data.data.name,
                        email: data.data.email
                    }));
                    
                    showToast('Login successful! Redirecting...');
                    setTimeout(() => {
                        window.location.href = '/financial_dashboard.html';
                    }, 1000);
                }
            } catch (error) {
                // Toast handles error message
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('full-name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const termsChecked = document.getElementById('terms').checked;

            if (!termsChecked) {
                showToast('You must agree to the Terms', 'error');
                return;
            }
            
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;

            try {
                const data = await fetchAPI('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password })
                });

                if (data && data.success) {
                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('user', JSON.stringify({
                        name: data.data.name,
                        email: data.data.email
                    }));
                    
                    showToast('Account created successfully!');
                    setTimeout(() => {
                        window.location.href = '/financial_dashboard.html';
                    }, 1000);
                }
            } catch (error) {
                 // Toast handles error message
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});
