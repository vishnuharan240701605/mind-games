/* ==========================================
   LEADERBOARD PAGE
   ========================================== */

import { navigate } from '../router.js';
import { getLeaderboard, isLoggedIn, getUser } from '../utils/storage.js';

export function renderLeaderboard(container) {
    if (!isLoggedIn()) { navigate('/auth'); return; }

    const user = getUser();
    const lb = getLeaderboard().sort((a, b) => b.brainScore - a.brainScore);

    let activeTab = 'global';

    function render() {
        container.innerHTML = `
      <div class="container" style="padding-top:var(--space-2xl);padding-bottom:var(--space-2xl)">
        <div class="text-center" style="margin-bottom:var(--space-2xl)">
          <h2 class="animate-fadeInUp">Leaderboard 🏆</h2>
          <p class="animate-fadeInUp delay-1">See how you rank against other brain trainers!</p>
        </div>

        <div class="flex-center" style="margin-bottom:var(--space-2xl)">
          <div class="tabs">
            <button class="tab ${activeTab === 'global' ? 'active' : ''}" data-tab="global">Global</button>
            <button class="tab ${activeTab === 'weekly' ? 'active' : ''}" data-tab="weekly">Weekly</button>
            <button class="tab ${activeTab === 'daily' ? 'active' : ''}" data-tab="daily">Daily</button>
          </div>
        </div>

        <!-- Top 3 -->
        ${lb.length >= 3 ? `
          <div class="flex-center gap-lg animate-fadeInUp delay-2" style="margin-bottom:var(--space-2xl)">
            ${topPlayerCard(lb[1], 2, 'silver')}
            ${topPlayerCard(lb[0], 1, 'gold')}
            ${topPlayerCard(lb[2], 3, 'bronze')}
          </div>
        ` : ''}

        <!-- Full Table -->
        <div class="card animate-fadeInUp delay-3" style="overflow-x:auto">
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Brain Score</th>
                <th>Level</th>
                <th>Games</th>
              </tr>
            </thead>
            <tbody>
              ${lb.map((entry, i) => {
            const isMe = entry.id === user?.id;
            const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            return `
                  <tr style="${isMe ? 'box-shadow: inset 3px 0 0 var(--primary-500)' : ''}">
                    <td><span class="leaderboard-rank ${rankClass}">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span></td>
                    <td>
                      <div class="flex gap-sm" style="align-items:center">
                        <div class="avatar avatar-sm">${entry.avatar || '🧠'}</div>
                        <span style="font-weight:${isMe ? '700' : '500'}">${entry.username}${isMe ? ' (You)' : ''}</span>
                      </div>
                    </td>
                    <td><span style="font-weight:700;color:var(--primary-500)">${entry.brainScore || 0}</span></td>
                    <td>Lvl ${entry.level || 1}</td>
                    <td>${entry.totalGames || 0}</td>
                  </tr>
                `;
        }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

        // Tab switching
        container.querySelectorAll('.tab[data-tab]').forEach(tab => {
            tab.addEventListener('click', () => {
                activeTab = tab.getAttribute('data-tab');
                render();
            });
        });
    }

    render();
}

function topPlayerCard(entry, rank, color) {
    const sizes = { 1: '120px', 2: '100px', 3: '100px' };
    const heights = { 1: '', 2: 'margin-top:40px', 3: 'margin-top:40px' };
    const colors = { gold: '#fbbf24', silver: '#94a3b8', bronze: '#c2884c' };
    return `
    <div class="card text-center" style="padding:var(--space-xl);min-width:160px;${heights[rank]}">
      <div style="width:${sizes[rank]};height:${sizes[rank]};border-radius:50%;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;font-size:${rank === 1 ? '3.5rem' : '2.5rem'};margin:0 auto var(--space-md);border:3px solid ${colors[color]}">
        ${entry.avatar || '🧠'}
      </div>
      <div style="font-size:1.5rem;margin-bottom:var(--space-xs)">${['🥇', '🥈', '🥉'][rank - 1]}</div>
      <h4 style="margin-bottom:var(--space-xs)">${entry.username}</h4>
      <div style="font-weight:800;font-size:var(--font-xl);color:${colors[color]}">${entry.brainScore || 0}</div>
      <div style="font-size:var(--font-xs);color:var(--text-tertiary)">Brain Score</div>
    </div>
  `;
}
