/* ==========================================
   GAME ENGINE — Shared game infrastructure
   ========================================== */

import { saveScore, getUser, updateStreak, isDailyChallengeCompleted, setDailyCompleted } from '../utils/storage.js';
import { checkAchievements } from '../utils/achievements.js';
import { showToast, showConfetti } from '../components/toast.js';

// ---- Game Registry ----
export const GAME_REGISTRY = {
    'memory-match': {
        name: 'Memory Card Match',
        icon: '🃏',
        description: 'Find matching pairs by flipping cards.',
        category: 'Memory',
        duration: '2-5 min',
        gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
        module: () => import('./memory-match.js'),
    },
    'pattern-recognition': {
        name: 'Pattern Recognition',
        icon: '🔷',
        description: 'Identify the next item in a visual pattern.',
        category: 'Logic',
        duration: '2-4 min',
        gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
        module: () => import('./pattern-recognition.js'),
    },
    'number-sequence': {
        name: 'Number Sequence',
        icon: '🔢',
        description: 'Find the missing number in the sequence.',
        category: 'Logic',
        duration: '2-4 min',
        gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
        module: () => import('./number-sequence.js'),
    },
    'reaction-speed': {
        name: 'Reaction Speed',
        icon: '⚡',
        description: 'Test how fast you can react!',
        category: 'Speed',
        duration: '1-2 min',
        gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
        module: () => import('./reaction-speed.js'),
    },
    'odd-one-out': {
        name: 'Find the Odd One',
        icon: '👁️',
        description: 'Spot the different object in each group.',
        category: 'Attention',
        duration: '2-3 min',
        gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
        module: () => import('./odd-one-out.js'),
    },
    'logic-grid': {
        name: 'Logic Grid Puzzle',
        icon: '🧩',
        description: 'Fill the grid using logical deduction.',
        category: 'Logic',
        duration: '3-8 min',
        gradient: 'linear-gradient(135deg, #667eea, #43e97b)',
        module: () => import('./logic-grid.js'),
    },
    'word-scramble': {
        name: 'Word Scramble',
        icon: '🔤',
        description: 'Unscramble jumbled letters to form words.',
        category: 'Language',
        duration: '2-4 min',
        gradient: 'linear-gradient(135deg, #f5576c, #ff922b)',
        module: () => import('./word-scramble.js'),
    },
    'visual-memory': {
        name: 'Visual Memory',
        icon: '👀',
        description: 'Remember and reproduce the pattern.',
        category: 'Memory',
        duration: '2-4 min',
        gradient: 'linear-gradient(135deg, #20c997, #4facfe)',
        module: () => import('./visual-memory.js'),
    },
    'quick-math': {
        name: 'Quick Math',
        icon: '🧮',
        description: 'Solve math problems under time pressure.',
        category: 'Math',
        duration: '2-3 min',
        gradient: 'linear-gradient(135deg, #ff6b6b, #feca57)',
        module: () => import('./quick-math.js'),
    },
    'riddle-solver': {
        name: 'Riddle Solver',
        icon: '🤔',
        description: 'Read the riddle and pick the answer.',
        category: 'Language',
        duration: '2-5 min',
        gradient: 'linear-gradient(135deg, #845ef7, #5c7cfa)',
        module: () => import('./riddle-solver.js'),
    },
};

// ---- Game State Manager ----
export class GameEngine {
    constructor(gameId, container, difficulty = 'medium') {
        this.gameId = gameId;
        this.container = container;
        this.difficulty = difficulty;
        this.score = 0;
        this.timeLeft = 0;
        this.totalTime = 0;
        this.timer = null;
        this.isRunning = false;
        this.correctAnswers = 0;
        this.totalQuestions = 0;
        this.hintsLeft = 3;
        this.onFinish = null;
    }

    getDifficultyConfig() {
        const configs = {
            easy: { time: 120, multiplier: 1, label: 'Easy' },
            medium: { time: 90, multiplier: 1.5, label: 'Medium' },
            hard: { time: 60, multiplier: 2, label: 'Hard' },
        };
        return configs[this.difficulty] || configs.medium;
    }

    startTimer(seconds) {
        this.totalTime = seconds || this.getDifficultyConfig().time;
        this.timeLeft = this.totalTime;
        this.isRunning = true;
        this.updateTimerDisplay();

        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerEl = this.container.querySelector('.timer-bar-fill');
        if (timerEl) {
            const pct = (this.timeLeft / this.totalTime) * 100;
            timerEl.style.width = pct + '%';
            timerEl.className = 'timer-bar-fill' +
                (pct <= 20 ? ' danger' : pct <= 40 ? ' warning' : '');
        }
        const timeText = this.container.querySelector('.time-display');
        if (timeText) {
            const m = Math.floor(this.timeLeft / 60);
            const s = this.timeLeft % 60;
            timeText.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        }
    }

    addScore(points) {
        const multiplier = this.getDifficultyConfig().multiplier;
        this.score += Math.round(points * multiplier);
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        const scoreEl = this.container.querySelector('.score-display');
        if (scoreEl) scoreEl.textContent = this.score;
    }

    recordCorrect() {
        this.correctAnswers++;
        this.totalQuestions++;
    }

    recordWrong() {
        this.totalQuestions++;
    }

    getAccuracy() {
        return this.totalQuestions > 0 ? Math.round((this.correctAnswers / this.totalQuestions) * 100) : 0;
    }

    useHint() {
        if (this.hintsLeft > 0) {
            this.hintsLeft--;
            this.updateHintDisplay();
            return true;
        }
        showToast('No hints remaining!', 'warning');
        return false;
    }

    updateHintDisplay() {
        const hintCount = this.container.querySelector('.hint-count');
        if (hintCount) hintCount.textContent = this.hintsLeft;
    }

    endGame() {
        this.isRunning = false;
        if (this.timer) clearInterval(this.timer);

        const timeTaken = this.totalTime - this.timeLeft;
        const accuracy = this.getAccuracy();

        // Save score
        saveScore(this.gameId, this.score, this.difficulty, timeTaken, accuracy);
        updateStreak();
        checkAchievements();

        // Show results
        this.showResults(timeTaken, accuracy);
    }

    showResults(timeTaken, accuracy) {
        const isGreat = this.score > 50;
        if (isGreat) showConfetti();

        this.container.innerHTML = `
      <div class="game-results">
        <div class="result-icon">${isGreat ? '🏆' : '💪'}</div>
        <h2>${isGreat ? 'Amazing!' : 'Good Effort!'}</h2>
        <p style="color:var(--text-tertiary)">${isGreat ? 'You crushed it!' : 'Keep practicing to improve!'}</p>
        <div class="result-score">${this.score}</div>
        <div style="font-size:var(--font-sm);color:var(--text-tertiary);margin-bottom:var(--space-lg)">points earned</div>
        <div class="result-stats">
          <div class="stat-card">
            <div class="stat-value">${accuracy}%</div>
            <div class="stat-label">Accuracy</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${timeTaken}s</div>
            <div class="stat-label">Time</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${this.correctAnswers}/${this.totalQuestions}</div>
            <div class="stat-label">Correct</div>
          </div>
        </div>
        <div class="game-actions">
          <button class="btn btn-primary" id="replay-btn">🔄 Play Again</button>
          <button class="btn btn-secondary" id="back-games-btn">← All Games</button>
        </div>
      </div>
    `;

        document.getElementById('replay-btn')?.addEventListener('click', () => {
            if (this.onFinish) this.onFinish('replay');
        });
        document.getElementById('back-games-btn')?.addEventListener('click', () => {
            if (this.onFinish) this.onFinish('back');
        });
    }

    renderHeader() {
        return `
      <div class="game-header">
        <div>
          <h3 style="margin-bottom:var(--space-xs)">${GAME_REGISTRY[this.gameId]?.name || 'Game'}</h3>
          <div class="badge badge-primary">${this.getDifficultyConfig().label}</div>
        </div>
        <div class="game-info">
          <div class="game-stat">
            <div class="game-stat-value score-display">0</div>
            <div class="game-stat-label">Score</div>
          </div>
          <div class="game-stat">
            <div class="game-stat-value time-display">${Math.floor(this.getDifficultyConfig().time / 60)}:${(this.getDifficultyConfig().time % 60).toString().padStart(2, '0')}</div>
            <div class="game-stat-label">Time</div>
          </div>
          <button class="btn btn-sm btn-secondary hint-btn" id="hint-btn">
            💡 Hint
            <span class="hint-count">${this.hintsLeft}</span>
          </button>
        </div>
      </div>
      <div class="timer-bar">
        <div class="timer-bar-fill" style="width:100%"></div>
      </div>
    `;
    }

    destroy() {
        if (this.timer) clearInterval(this.timer);
        this.isRunning = false;
    }
}
