/* ==========================================
   NAVBAR COMPONENT
   ========================================== */

import { toggleTheme, getCurrentTheme } from '../utils/theme.js';
import { getUser, isLoggedIn } from '../utils/storage.js';
import { navigate } from '../router.js';

export function renderNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;

    const loggedIn = isLoggedIn();
    const user = getUser();
    const theme = getCurrentTheme();

    nav.innerHTML = `
    <div class="navbar">
      <div class="navbar-inner">
        <a class="nav-logo" data-link="/">
          <span class="nav-logo-icon">🧠</span>
          <span>MindGames</span>
        </a>

        <div class="nav-links">
          <a class="nav-link" data-link="/" data-nav="home">Home</a>
          <a class="nav-link" data-link="/games" data-nav="games">Games</a>
          ${loggedIn ? `
            <a class="nav-link" data-link="/dashboard" data-nav="dashboard">Dashboard</a>
            <a class="nav-link" data-link="/leaderboard" data-nav="leaderboard">Leaderboard</a>
          ` : ''}
        </div>

        <div class="nav-actions">
          <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
            ${theme === 'dark' ? '☀️' : '🌙'}
          </button>
          ${loggedIn ? `
            <a class="nav-link hide-mobile" data-link="/profile" data-nav="profile">
              <div class="avatar avatar-sm">${user?.avatar || '🧠'}</div>
            </a>
          ` : `
            <a class="btn btn-primary btn-sm hide-mobile" data-link="/auth">Play Now</a>
          `}
          <button class="hamburger" id="hamburger-btn" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <div class="mobile-menu" id="mobile-menu">
        <a class="nav-link" data-link="/" data-mobile-link>Home</a>
        <a class="nav-link" data-link="/games" data-mobile-link>Games</a>
        ${loggedIn ? `
          <a class="nav-link" data-link="/dashboard" data-mobile-link>Dashboard</a>
          <a class="nav-link" data-link="/leaderboard" data-mobile-link>Leaderboard</a>
          <a class="nav-link" data-link="/profile" data-mobile-link>Profile</a>
        ` : `
          <a class="nav-link" data-link="/auth" data-mobile-link>Sign In</a>
        `}
      </div>
    </div>
  `;

    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        const newTheme = toggleTheme();
        document.getElementById('theme-toggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });

    // Hamburger
    document.getElementById('hamburger-btn')?.addEventListener('click', () => {
        document.getElementById('mobile-menu')?.classList.toggle('open');
    });

    // Nav links
    nav.querySelectorAll('[data-link]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('mobile-menu')?.classList.remove('open');
            navigate(link.getAttribute('data-link'));
        });
    });

    updateActiveNav();
}

export function updateActiveNav() {
    const hash = location.hash.slice(1) || '/';
    document.querySelectorAll('.nav-link[data-nav]').forEach(link => {
        const path = link.getAttribute('data-link');
        if (path === hash || (hash.startsWith(path) && path !== '/')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
