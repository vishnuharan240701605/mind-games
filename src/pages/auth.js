/* ==========================================
   AUTH PAGE — Login / Sign Up
   ========================================== */

import { navigate } from '../router.js';
import { createUser, loginUser, saveUser, getUser } from '../utils/storage.js';
import { showToast } from '../components/toast.js';

export function renderAuth(container) {
    let isLogin = true;

    function render() {
        container.innerHTML = `
      <div class="auth-page">
        <div class="auth-card animate-scaleIn">
          <div style="text-align:center;font-size:3rem;margin-bottom:var(--space-md)">🧠</div>
          <h2>${isLogin ? 'Welcome Back!' : 'Join MindGames'}</h2>
          <p class="auth-subtitle">${isLogin ? 'Sign in to continue training' : 'Create your account to start'}</p>
          
          <form class="auth-form" id="auth-form">
            ${!isLogin ? `
              <div class="input-group">
                <label for="username">Username</label>
                <input class="input-field" type="text" id="username" placeholder="Choose a username" required minlength="3" />
              </div>
            ` : ''}
            <div class="input-group">
              <label for="email">Email</label>
              <input class="input-field" type="email" id="email" placeholder="you@example.com" required />
            </div>
            <div class="input-group">
              <label for="password">Password</label>
              <input class="input-field" type="password" id="password" placeholder="••••••••" required minlength="4" />
            </div>
            <button class="btn btn-primary btn-lg" type="submit" style="width:100%;margin-top:var(--space-sm)">
              ${isLogin ? '🚀 Sign In' : '✨ Create Account'}
            </button>
          </form>

          <div class="auth-toggle">
            ${isLogin ? "Don't have an account?" : 'Already have an account?'}
            <a id="toggle-auth"> ${isLogin ? 'Sign Up' : 'Sign In'}</a>
          </div>

          <div style="margin-top:var(--space-lg);padding-top:var(--space-lg);border-top:1px solid var(--border-light)">
            <button class="btn btn-secondary" id="demo-login-btn" style="width:100%">
              🎮 Try Demo Account
            </button>
          </div>
        </div>
      </div>
    `;

        // Toggle auth mode
        document.getElementById('toggle-auth')?.addEventListener('click', () => {
            isLogin = !isLogin;
            render();
        });

        // Demo login
        document.getElementById('demo-login-btn')?.addEventListener('click', () => {
            let user = getUser();
            if (!user) {
                user = createUser('DemoPlayer', 'demo@mindgames.com', 'demo1234');
            }
            user.loggedIn = true;
            saveUser(user);
            showToast('Welcome to MindGames! 🧠', 'success');
            navigate('/dashboard');
        });

        // Form submit
        document.getElementById('auth-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (isLogin) {
                const user = loginUser(email, password);
                if (user) {
                    user.loggedIn = true;
                    saveUser(user);
                    showToast(`Welcome back, ${user.username}! 🎉`, 'success');
                    navigate('/dashboard');
                } else {
                    showToast('Invalid email or password', 'error');
                }
            } else {
                const username = document.getElementById('username').value.trim();
                if (username.length < 3) {
                    showToast('Username must be at least 3 characters', 'error');
                    return;
                }
                const user = createUser(username, email, password);
                user.loggedIn = true;
                saveUser(user);
                showToast(`Account created! Welcome, ${username}! 🎉`, 'success');
                navigate('/dashboard');
            }
        });
    }

    render();
}
