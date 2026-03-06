/* ==========================================
   REACTION SPEED TEST
   ========================================== */

import { checkSpecialAchievement } from '../utils/achievements.js';

export function startGame(board, engine) {
    const rounds = engine.difficulty === 'easy' ? 5 : engine.difficulty === 'hard' ? 10 : 7;
    let currentRound = 0;
    let times = [];
    let waiting = false;
    let timeout = null;
    let startTime = 0;

    function showRound() {
        if (currentRound >= rounds) {
            const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
            const best = Math.min(...times);
            if (best < 250) checkSpecialAchievement('speed_demon');
            engine.score = Math.max(0, Math.round((500 - avg) * 0.3 * rounds));
            engine.correctAnswers = times.length;
            engine.totalQuestions = rounds;
            engine.endGame();
            return;
        }

        waiting = true;
        board.innerHTML = `
      <div style="width:100%;text-align:center">
        <div style="font-size:var(--font-sm);color:var(--text-tertiary);margin-bottom:var(--space-lg)">
          Round ${currentRound + 1} of ${rounds}
        </div>
        <div class="reaction-zone waiting" id="reaction-zone">
          <div>Wait for green...</div>
        </div>
        ${times.length > 0 ? `
          <div style="margin-top:var(--space-lg);font-size:var(--font-sm);color:var(--text-tertiary)">
            Last: ${times[times.length - 1]}ms • Best: ${Math.min(...times)}ms • Avg: ${Math.round(times.reduce((a, b) => a + b, 0) / times.length)}ms
          </div>
        ` : ''}
      </div>
    `;

        const zone = document.getElementById('reaction-zone');
        const delay = 1500 + Math.random() * 3500;

        timeout = setTimeout(() => {
            if (!zone) return;
            waiting = false;
            zone.className = 'reaction-zone ready';
            zone.innerHTML = '<div>TAP NOW!</div>';
            startTime = performance.now();
        }, delay);

        zone?.addEventListener('click', handleClick);
    }

    function handleClick() {
        if (waiting) {
            // Clicked too early
            if (timeout) clearTimeout(timeout);
            board.innerHTML = `
        <div style="width:100%;text-align:center">
          <div class="reaction-zone" style="background:var(--error-400);color:white;animation:shake 0.5s ease">
            <div>Too early! ⏳</div>
          </div>
          <p style="margin-top:var(--space-lg);color:var(--text-tertiary)">Wait for the green signal!</p>
        </div>
      `;
            setTimeout(showRound, 1500);
        } else {
            // Record time
            const reaction = Math.round(performance.now() - startTime);
            times.push(reaction);
            currentRound++;

            board.innerHTML = `
        <div style="width:100%;text-align:center">
          <div class="reaction-zone clicked">
            <div style="font-size:var(--font-3xl);font-weight:800">${reaction}ms</div>
          </div>
          <p style="margin-top:var(--space-lg);color:var(--text-tertiary)">
            ${reaction < 200 ? '⚡ Lightning fast!' : reaction < 300 ? '🎯 Great reaction!' : reaction < 400 ? '👍 Good job!' : '💪 Keep practicing!'}
          </p>
        </div>
      `;

            engine.addScore(Math.max(0, Math.round((500 - reaction) * 0.2)));
            engine.recordCorrect();

            setTimeout(showRound, 1200);
        }
    }

    showRound();
}

export function handleHint() {
    // No hints for reaction speed
}
