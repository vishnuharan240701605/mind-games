/* ==========================================
   DASHBOARD PAGE
   ========================================== */

import { navigate } from '../router.js';
import { getUser, isLoggedIn, getStreak, getScores, getGameHistory, getBestScore, calculateBrainScore } from '../utils/storage.js';
import { getDailyChallengeInfo } from '../utils/daily-challenge.js';
import { isDailyChallengeCompleted } from '../utils/storage.js';
import { GAME_REGISTRY } from '../games/engine.js';

export function renderDashboard(container) {
    if (!isLoggedIn()) { navigate('/auth'); return; }

    const user = getUser();
    const streak = getStreak();
    const scores = getScores();
    const history = getGameHistory();
    const daily = getDailyChallengeInfo();
    const dailyDone = isDailyChallengeCompleted();
    const brainScore = calculateBrainScore();

    // Recommend games the user hasn't played much
    const gameCounts = {};
    history.forEach(h => { gameCounts[h.gameId] = (gameCounts[h.gameId] || 0) + 1; });
    const recommended = Object.keys(GAME_REGISTRY)
        .sort((a, b) => (gameCounts[a] || 0) - (gameCounts[b] || 0))
        .slice(0, 3);

    const totalGames = user.totalGames || 0;
    const avgAccuracy = history.length > 0
        ? Math.round(history.slice(0, 20).reduce((s, h) => s + (h.accuracy || 0), 0) / Math.min(history.length, 20))
        : 0;

    container.innerHTML = `
    <div class="container" style="padding-top:var(--space-2xl);padding-bottom:var(--space-2xl)">
      <!-- Welcome -->
      <div class="flex-between" style="margin-bottom:var(--space-2xl);flex-wrap:wrap;gap:var(--space-md)">
        <div>
          <h2 class="animate-fadeInUp">Welcome back, ${user.username}! ${user.avatar}</h2>
          <p class="animate-fadeInUp delay-1">Level ${user.level || 1} • ${user.xp || 0} XP</p>
        </div>
        <div class="flex gap-sm">
          <span class="badge badge-primary" style="font-size:var(--font-sm);padding:0.5rem 1rem">
            🔥 ${streak.current} day streak
          </span>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid animate-fadeInUp delay-1" style="margin-bottom:var(--space-2xl)">
        <div class="stat-card">
          <div class="stat-value" style="background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${brainScore}</div>
          <div class="stat-label">Brain Score</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:var(--accent-500)">${totalGames}</div>
          <div class="stat-label">Games Played</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:var(--success-500)">${avgAccuracy}%</div>
          <div class="stat-label">Avg Accuracy</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:var(--purple-500)">${streak.best}</div>
          <div class="stat-label">Best Streak</div>
        </div>
      </div>

      <!-- Two column layout -->
      <div class="grid grid-2" style="margin-bottom:var(--space-2xl)">
        <!-- Daily Challenge -->
        <div class="card animate-fadeInUp delay-2" style="background:var(--gradient-hero);color:white;border:none">
          <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-lg)">
            <div style="font-size:2.5rem">${daily.gameIcon}</div>
            <div>
              <div style="font-size:var(--font-xs);opacity:0.8;text-transform:uppercase;letter-spacing:0.05em">Daily Challenge</div>
              <h3 style="color:white">${daily.gameName}</h3>
              <div class="badge" style="background:rgba(255,255,255,0.2);color:white;margin-top:var(--space-xs)">
                ${daily.difficulty.toUpperCase()} • +${daily.bonusPoints} bonus
              </div>
            </div>
          </div>
          ${dailyDone
            ? '<p style="color:rgba(255,255,255,0.8)">✅ Completed today! Come back tomorrow.</p>'
            : `<button class="btn btn-accent" id="daily-challenge-btn" style="width:100%">🎯 Start Challenge</button>`
        }
        </div>

        <!-- Level Progress -->
        <div class="card animate-fadeInUp delay-3">
          <h4 style="margin-bottom:var(--space-md)">Level Progress</h4>
          <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-md)">
            <div class="avatar avatar-lg" style="font-size:2rem">${user.avatar}</div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-xs)">
                <span style="font-weight:700">Level ${user.level || 1}</span>
                <span style="color:var(--text-tertiary);font-size:var(--font-sm)">${(user.xp || 0) % 500}/500 XP</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill" style="width:${((user.xp || 0) % 500) / 5}%"></div>
              </div>
            </div>
          </div>
          <p style="font-size:var(--font-sm);color:var(--text-tertiary)">
            ${500 - ((user.xp || 0) % 500)} XP to next level
          </p>
        </div>
      </div>

      <!-- Recommended Games -->
      <div class="animate-fadeInUp delay-3" style="margin-bottom:var(--space-2xl)">
        <h3 style="margin-bottom:var(--space-lg)">Recommended for You 🎮</h3>
        <div class="grid grid-3">
          ${recommended.map(id => {
            const g = GAME_REGISTRY[id];
            return `
              <div class="card card-game card-glow" data-game-id="${id}" style="cursor:pointer">
                <div class="card-icon" style="background:${g.gradient}">${g.icon}</div>
                <div class="card-title">${g.name}</div>
                <div class="card-desc">${g.description}</div>
                <div class="card-meta">
                  <span class="badge badge-primary">${g.category}</span>
                </div>
              </div>
            `;
        }).join('')}
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="animate-fadeInUp delay-4">
        <h3 style="margin-bottom:var(--space-lg)">Recent Activity 📊</h3>
        ${history.length > 0 ? `
          <div class="card" style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="border-bottom:1px solid var(--border-light)">
                  <th style="text-align:left;padding:var(--space-sm) var(--space-md);color:var(--text-tertiary);font-size:var(--font-xs);text-transform:uppercase">Game</th>
                  <th style="text-align:center;padding:var(--space-sm) var(--space-md);color:var(--text-tertiary);font-size:var(--font-xs);text-transform:uppercase">Score</th>
                  <th style="text-align:center;padding:var(--space-sm) var(--space-md);color:var(--text-tertiary);font-size:var(--font-xs);text-transform:uppercase">Accuracy</th>
                  <th style="text-align:right;padding:var(--space-sm) var(--space-md);color:var(--text-tertiary);font-size:var(--font-xs);text-transform:uppercase">When</th>
                </tr>
              </thead>
              <tbody>
                ${history.slice(0, 8).map(h => {
            const g = GAME_REGISTRY[h.gameId];
            const ago = timeAgo(h.date);
            return `
                    <tr style="border-bottom:1px solid var(--border-light)">
                      <td style="padding:var(--space-sm) var(--space-md)">
                        <span style="margin-right:var(--space-sm)">${g?.icon || '🎮'}</span>
                        ${g?.name || h.gameId}
                      </td>
                      <td style="text-align:center;padding:var(--space-sm) var(--space-md);font-weight:700">${h.score}</td>
                      <td style="text-align:center;padding:var(--space-sm) var(--space-md)">${h.accuracy || 0}%</td>
                      <td style="text-align:right;padding:var(--space-sm) var(--space-md);color:var(--text-tertiary);font-size:var(--font-sm)">${ago}</td>
                    </tr>
                  `;
        }).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="card text-center" style="padding:var(--space-2xl)">
            <div style="font-size:3rem;margin-bottom:var(--space-md)">🎮</div>
            <h4>No games played yet</h4>
            <p style="margin-bottom:var(--space-lg)">Start playing to see your activity here!</p>
            <button class="btn btn-primary" id="start-playing-btn">Start Playing</button>
          </div>
        `}
      </div>
    </div>
  `;

    // Event listeners
    document.getElementById('daily-challenge-btn')?.addEventListener('click', () => {
        navigate(`/play?game=${daily.gameId}&difficulty=${daily.difficulty}&daily=true`);
    });

    document.getElementById('start-playing-btn')?.addEventListener('click', () => {
        navigate('/games');
    });

    container.querySelectorAll('[data-game-id]').forEach(card => {
        card.addEventListener('click', () => {
            navigate(`/play?game=${card.getAttribute('data-game-id')}`);
        });
    });
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}
