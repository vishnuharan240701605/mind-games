/* ==========================================
   GAMES CATALOG PAGE
   ========================================== */

import { navigate } from '../router.js';
import { isLoggedIn, getBestScore } from '../utils/storage.js';
import { GAME_REGISTRY } from '../games/engine.js';

export function renderGames(container) {
    const loggedIn = isLoggedIn();
    const gameEntries = Object.entries(GAME_REGISTRY);

    const categories = ['All', ...new Set(gameEntries.map(([, g]) => g.category))];

    container.innerHTML = `
    <div class="container" style="padding-top:var(--space-2xl);padding-bottom:var(--space-2xl)">
      <div class="text-center" style="margin-bottom:var(--space-2xl)">
        <h2 class="animate-fadeInUp">Game Library 🎮</h2>
        <p class="animate-fadeInUp delay-1" style="max-width:500px;margin:var(--space-md) auto">
          Choose a game to train your brain. Each game targets different cognitive skills.
        </p>
      </div>

      <!-- Category Filter -->
      <div class="flex-center" style="margin-bottom:var(--space-2xl)">
        <div class="tabs" id="category-tabs">
          ${categories.map((cat, i) => `
            <button class="tab ${i === 0 ? 'active' : ''}" data-category="${cat}">${cat}</button>
          `).join('')}
        </div>
      </div>

      <!-- Games Grid -->
      <div class="grid grid-3" id="games-grid">
        ${gameEntries.map(([id, game], i) => {
        const best = loggedIn ? getBestScore(id) : 0;
        return `
            <div class="card card-game card-glow animate-fadeInUp delay-${Math.min(i + 1, 6)}" data-game-id="${id}" data-category="${game.category}">
              <div class="card-icon" style="background:${game.gradient}">${game.icon}</div>
              <div class="card-title">${game.name}</div>
              <div class="card-desc">${game.description}</div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:var(--space-md)">
                <div class="card-meta">
                  <span class="badge badge-primary">${game.category}</span>
                  <span style="font-size:var(--font-xs);color:var(--text-tertiary)">⏱️ ${game.duration}</span>
                </div>
                ${best > 0 ? `<span class="badge badge-success">Best: ${best}</span>` : ''}
              </div>
            </div>
          `;
    }).join('')}
      </div>
    </div>
  `;

    // Category filter
    container.querySelectorAll('.tab[data-category]').forEach(tab => {
        tab.addEventListener('click', () => {
            container.querySelectorAll('.tab[data-category]').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const cat = tab.getAttribute('data-category');
            container.querySelectorAll('[data-game-id]').forEach(card => {
                if (cat === 'All' || card.getAttribute('data-category') === cat) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Game card clicks
    container.querySelectorAll('[data-game-id]').forEach(card => {
        card.addEventListener('click', () => {
            const gameId = card.getAttribute('data-game-id');
            if (loggedIn) {
                navigate(`/play?game=${gameId}`);
            } else {
                navigate('/auth');
            }
        });
    });
}
