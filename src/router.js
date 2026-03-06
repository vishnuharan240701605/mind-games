/* ==========================================
   HASH-BASED SPA ROUTER
   ========================================== */

import { renderNavbar, updateActiveNav } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderLanding } from './pages/landing.js';
import { renderAuth } from './pages/auth.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderGames } from './pages/games.js';
import { renderGamePlay } from './pages/game-play.js';
import { renderProfile } from './pages/profile.js';
import { renderLeaderboard } from './pages/leaderboard.js';

const routes = {
    '/': renderLanding,
    '/auth': renderAuth,
    '/dashboard': renderDashboard,
    '/games': renderGames,
    '/play': renderGamePlay,
    '/profile': renderProfile,
    '/leaderboard': renderLeaderboard,
};

export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

function handleRoute() {
    const hash = location.hash.slice(1) || '/';
    const [path, query] = hash.split('?');

    // Parse query params
    const params = {};
    if (query) {
        query.split('&').forEach(p => {
            const [k, v] = p.split('=');
            params[decodeURIComponent(k)] = decodeURIComponent(v || '');
        });
    }

    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;

    // Fade out
    pageContent.style.opacity = '0';
    pageContent.style.transform = 'translateY(8px)';

    setTimeout(() => {
        // Re-render nav on route change
        renderNavbar();
        renderFooter();

        // Find matching route
        const renderFn = routes[path];
        if (renderFn) {
            renderFn(pageContent, params);
        } else {
            pageContent.innerHTML = `
        <div class="flex-center" style="min-height:60vh;flex-direction:column;gap:var(--space-md)">
          <div style="font-size:5rem">🔍</div>
          <h2>Page Not Found</h2>
          <p>The page you're looking for doesn't exist.</p>
          <a class="btn btn-primary" data-link="/">Go Home</a>
        </div>
      `;
            pageContent.querySelector('[data-link]')?.addEventListener('click', (e) => {
                e.preventDefault();
                navigate('/');
            });
        }

        // Fade in
        requestAnimationFrame(() => {
            pageContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            pageContent.style.opacity = '1';
            pageContent.style.transform = 'translateY(0)';
        });

        updateActiveNav();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 150);
}

export function navigate(path) {
    location.hash = path;
}
