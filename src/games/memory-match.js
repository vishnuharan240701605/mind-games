/* ==========================================
   MEMORY CARD MATCH GAME
   ========================================== */

import { checkSpecialAchievement } from '../utils/achievements.js';

const EMOJI_SETS = {
    easy: ['🍎', '🍋', '🍇', '🌸', '🐱', '🎈'],
    medium: ['🍎', '🍋', '🍇', '🌸', '🐱', '🎈', '🦋', '🌟'],
    hard: ['🍎', '🍋', '🍇', '🌸', '🐱', '🎈', '🦋', '🌟', '🎯', '🧩'],
};

export function startGame(board, engine) {
    const config = engine.getDifficultyConfig();
    const emojis = EMOJI_SETS[engine.difficulty] || EMOJI_SETS.medium;
    const pairs = [...emojis, ...emojis];
    shuffle(pairs);

    const cols = engine.difficulty === 'easy' ? 3 : engine.difficulty === 'hard' ? 5 : 4;

    let flipped = [];
    let matched = 0;
    let canFlip = true;
    let mistakes = 0;

    board.innerHTML = `
    <div class="memory-grid" style="grid-template-columns: repeat(${cols}, 1fr)">
      ${pairs.map((emoji, i) => `
        <div class="memory-card" data-index="${i}" data-emoji="${emoji}">
          <div class="memory-card-inner">
            <div class="memory-card-face memory-card-front">?</div>
            <div class="memory-card-face memory-card-back">${emoji}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

    engine.startTimer(config.time);

    board.querySelectorAll('.memory-card').forEach(card => {
        card.addEventListener('click', () => {
            if (!canFlip || !engine.isRunning) return;
            if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

            card.classList.add('flipped');
            flipped.push(card);

            if (flipped.length === 2) {
                canFlip = false;
                const [a, b] = flipped;
                engine.totalQuestions++;

                if (a.dataset.emoji === b.dataset.emoji) {
                    // Match!
                    setTimeout(() => {
                        a.classList.add('matched');
                        b.classList.add('matched');
                        matched++;
                        engine.correctAnswers++;
                        engine.addScore(10);

                        if (matched === emojis.length) {
                            // Perfect game?
                            if (mistakes === 0) checkSpecialAchievement('perfect_memory');
                            engine.addScore(50); // Completion bonus
                            engine.endGame();
                        }
                        flipped = [];
                        canFlip = true;
                    }, 400);
                } else {
                    // No match
                    mistakes++;
                    setTimeout(() => {
                        a.classList.remove('flipped');
                        b.classList.remove('flipped');
                        flipped = [];
                        canFlip = true;
                    }, 800);
                }
            }
        });
    });
}

export function handleHint(board, engine) {
    // Briefly show all unmatched cards
    const unmatched = board.querySelectorAll('.memory-card:not(.matched):not(.flipped)');
    unmatched.forEach(c => c.classList.add('flipped'));
    setTimeout(() => {
        unmatched.forEach(c => c.classList.remove('flipped'));
    }, 600);
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
