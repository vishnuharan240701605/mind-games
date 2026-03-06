/* ==========================================
   PROFILE PAGE
   ========================================== */

import { navigate } from '../router.js';
import { getUser, isLoggedIn, getStreak, getScores, getGameHistory, logout, saveUser, getUnlockedAchievements } from '../utils/storage.js';
import { ACHIEVEMENTS } from '../utils/achievements.js';
import { GAME_REGISTRY } from '../games/engine.js';
import { applyHighContrast, applyFontScale, getCurrentTheme } from '../utils/theme.js';
import { getSettings } from '../utils/storage.js';
import { showToast } from '../components/toast.js';

export function renderProfile(container) {
    if (!isLoggedIn()) { navigate('/auth'); return; }

    const user = getUser();
    const streak = getStreak();
    const scores = getScores();
    const history = getGameHistory();
    const unlocked = getUnlockedAchievements();
    const settings = getSettings();

    // Games played by type
    const gamesPerType = {};
    history.forEach(h => { gamesPerType[h.gameId] = (gamesPerType[h.gameId] || 0) + 1; });

    container.innerHTML = `
    <div class="container" style="padding-top:var(--space-2xl);padding-bottom:var(--space-2xl)">
      <!-- Profile Header -->
      <div class="profile-header animate-fadeInUp">
        <div class="profile-avatar">${user.avatar}</div>
        <div>
          <h2>${user.username}</h2>
          <p>Level ${user.level || 1} Brain Trainer • Joined ${new Date(user.createdAt).toLocaleDateString()}</p>
          <div class="flex gap-sm" style="margin-top:var(--space-sm)">
            <span class="badge" style="background:rgba(255,255,255,0.2);color:white">🧠 Brain Score: ${user.brainScore || 0}</span>
            <span class="badge" style="background:rgba(255,255,255,0.2);color:white">🔥 Streak: ${streak.current}</span>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid animate-fadeInUp delay-1" style="margin-bottom:var(--space-2xl)">
        <div class="stat-card">
          <div class="stat-value" style="color:var(--primary-500)">${user.totalGames || 0}</div>
          <div class="stat-label">Total Games</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:var(--success-500)">${user.xp || 0}</div>
          <div class="stat-label">Total XP</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:var(--accent-500)">${Object.keys(gamesPerType).length}</div>
          <div class="stat-label">Game Types Tried</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:var(--purple-500)">${unlocked.length}</div>
          <div class="stat-label">Achievements</div>
        </div>
      </div>

      <!-- Achievements -->
      <div class="animate-fadeInUp delay-2" style="margin-bottom:var(--space-2xl)">
        <h3 style="margin-bottom:var(--space-lg)">Achievements 🏅</h3>
        <div class="achievement-grid">
          ${ACHIEVEMENTS.map(a => {
        const isUnlocked = unlocked.includes(a.id);
        return `
              <div class="achievement-card ${isUnlocked ? '' : 'locked'}">
                <div class="achievement-icon">${a.icon}</div>
                <h4>${a.name}</h4>
                <p>${a.desc}</p>
                ${isUnlocked ? '<span class="badge badge-success" style="margin-top:var(--space-sm)">Unlocked ✓</span>' : ''}
              </div>
            `;
    }).join('')}
        </div>
      </div>

      <!-- Settings -->
      <div class="animate-fadeInUp delay-3" style="margin-bottom:var(--space-2xl)">
        <h3 style="margin-bottom:var(--space-lg)">Settings ⚙️</h3>
        <div class="card">
          <div style="display:flex;flex-direction:column;gap:var(--space-lg)">
            <div class="flex-between">
              <div>
                <div style="font-weight:600">High Contrast</div>
                <div style="font-size:var(--font-sm);color:var(--text-tertiary)">Improve readability with higher contrast</div>
              </div>
              <label class="switch">
                <input type="checkbox" id="high-contrast-toggle" ${settings.highContrast ? 'checked' : ''} />
                <span class="btn btn-sm ${settings.highContrast ? 'btn-primary' : 'btn-secondary'}" id="hc-btn">${settings.highContrast ? 'ON' : 'OFF'}</span>
              </label>
            </div>
            <div class="flex-between" style="border-top:1px solid var(--border-light);padding-top:var(--space-lg)">
              <div>
                <div style="font-weight:600">Text Size</div>
                <div style="font-size:var(--font-sm);color:var(--text-tertiary)">Adjust text size for readability</div>
              </div>
              <div class="difficulty-pills">
                <button class="pill ${settings.fontScale === 'normal' ? 'active' : ''}" data-scale="normal">Normal</button>
                <button class="pill ${settings.fontScale === 'large' ? 'active' : ''}" data-scale="large">Large</button>
              </div>
            </div>
            <div class="flex-between" style="border-top:1px solid var(--border-light);padding-top:var(--space-lg)">
              <div>
                <div style="font-weight:600">Change Avatar</div>
                <div style="font-size:var(--font-sm);color:var(--text-tertiary)">Pick your favorite avatar</div>
              </div>
              <div class="flex gap-sm" id="avatar-picker">
                ${['🧠', '🎯', '🎮', '🧩', '💡', '🚀', '⭐', '🔥', '🌟', '💎', '👑', '🦊'].map(a => `
                  <button class="btn btn-icon btn-secondary ${user.avatar === a ? 'btn-primary' : ''}" data-avatar="${a}">${a}</button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Logout -->
      <div class="text-center">
        <button class="btn btn-secondary" id="logout-btn" style="color:var(--error-500)">🚪 Sign Out</button>
      </div>
    </div>
  `;

    // High contrast toggle
    document.getElementById('hc-btn')?.addEventListener('click', () => {
        const checkbox = document.getElementById('high-contrast-toggle');
        const newVal = !checkbox.checked;
        checkbox.checked = newVal;
        applyHighContrast(newVal);
        const btn = document.getElementById('hc-btn');
        btn.textContent = newVal ? 'ON' : 'OFF';
        btn.className = `btn btn-sm ${newVal ? 'btn-primary' : 'btn-secondary'}`;
    });

    // Font scale
    container.querySelectorAll('[data-scale]').forEach(pill => {
        pill.addEventListener('click', () => {
            container.querySelectorAll('[data-scale]').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            applyFontScale(pill.getAttribute('data-scale'));
        });
    });

    // Avatar picker
    container.querySelectorAll('[data-avatar]').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('[data-avatar]').forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-secondary');
            });
            btn.classList.add('btn-primary');
            btn.classList.remove('btn-secondary');
            const u = getUser();
            u.avatar = btn.getAttribute('data-avatar');
            saveUser(u);
            showToast('Avatar updated! ' + u.avatar, 'success');
        });
    });

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        logout();
        showToast('Signed out. See you soon!', 'info');
        navigate('/');
    });
}
