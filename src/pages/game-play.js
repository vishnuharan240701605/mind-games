/* ==========================================
   GAME PLAY PAGE — Container that loads games
   ========================================== */

import { navigate } from '../router.js';
import { isLoggedIn, setDailyCompleted } from '../utils/storage.js';
import { GAME_REGISTRY, GameEngine } from '../games/engine.js';
import { showToast } from '../components/toast.js';

export function renderGamePlay(container, params) {
    if (!isLoggedIn()) { navigate('/auth'); return; }

    const gameId = params.game;
    const game = GAME_REGISTRY[gameId];
    if (!game) {
        container.innerHTML = `<div class="flex-center" style="min-height:60vh;flex-direction:column"><h2>Game not found</h2><button class="btn btn-primary" id="back-btn">Back to Games</button></div>`;
        document.getElementById('back-btn')?.addEventListener('click', () => navigate('/games'));
        return;
    }

    let difficulty = params.difficulty || 'medium';
    const isDaily = params.daily === 'true';

    // Show pre-game screen
    function showPreGame() {
        container.innerHTML = `
      <div class="game-wrapper animate-fadeInUp">
        <div class="card text-center" style="padding:var(--space-3xl)">
          <div style="font-size:5rem;margin-bottom:var(--space-lg);animation:brainPulse 3s ease-in-out infinite">${game.icon}</div>
          <h2 style="margin-bottom:var(--space-sm)">${game.name}</h2>
          <p style="margin-bottom:var(--space-xl);max-width:400px;margin-left:auto;margin-right:auto">${game.description}</p>
          ${isDaily ? `
            <div class="badge badge-warning" style="font-size:var(--font-sm);padding:0.5rem 1rem;margin-bottom:var(--space-xl)">
              📅 Daily Challenge • Bonus Points!
            </div>
          ` : ''}
          <div style="margin-bottom:var(--space-xl)">
            <div style="font-size:var(--font-sm);color:var(--text-tertiary);margin-bottom:var(--space-sm)">Select Difficulty</div>
            <div class="difficulty-pills" style="justify-content:center">
              <button class="pill ${difficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy</button>
              <button class="pill ${difficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
              <button class="pill ${difficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard</button>
            </div>
          </div>
          <button class="btn btn-primary btn-lg" id="start-game-btn">🚀 Start Game</button>
          <div style="margin-top:var(--space-md)">
            <button class="btn btn-secondary btn-sm" id="back-to-games">← Back to Games</button>
          </div>
        </div>
      </div>
    `;

        // Difficulty selection
        container.querySelectorAll('.pill[data-diff]').forEach(pill => {
            pill.addEventListener('click', () => {
                container.querySelectorAll('.pill[data-diff]').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                difficulty = pill.getAttribute('data-diff');
            });
        });

        document.getElementById('start-game-btn')?.addEventListener('click', startGame);
        document.getElementById('back-to-games')?.addEventListener('click', () => navigate('/games'));
    }

    async function startGame() {
        const engine = new GameEngine(gameId, container, difficulty);
        engine.onFinish = (action) => {
            engine.destroy();
            if (action === 'replay') {
                startGame();
            } else {
                navigate('/games');
            }
        };

        try {
            const module = await game.module();
            const gameBoard = document.createElement('div');
            gameBoard.className = 'game-wrapper';
            gameBoard.innerHTML = engine.renderHeader() + '<div class="game-board" id="game-board"></div>';
            container.innerHTML = '';
            container.appendChild(gameBoard);

            const board = document.getElementById('game-board');
            if (board && module.startGame) {
                module.startGame(board, engine);
            }

            // Hint button
            document.getElementById('hint-btn')?.addEventListener('click', () => {
                if (engine.useHint() && module.handleHint) {
                    module.handleHint(board, engine);
                }
            });

            // Mark daily as done on completion
            if (isDaily) {
                const origEnd = engine.endGame.bind(engine);
                engine.endGame = function () {
                    setDailyCompleted(gameId);
                    origEnd();
                };
            }
        } catch (err) {
            console.error('Failed to load game:', err);
            showToast('Failed to load game', 'error');
        }
    }

    showPreGame();
}
