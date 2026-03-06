/* ==========================================
   FIND THE ODD ONE OUT
   ========================================== */

const LEVELS = {
    easy: [
        { items: ['🍎', '🍎', '🍎', '🍎', '🍎', '🍐'], odd: '🍐', gridCols: 3 },
        { items: ['🐱', '🐱', '🐱', '🐱', '🐶', '🐱'], odd: '🐶', gridCols: 3 },
        { items: ['🔵', '🔵', '🔵', '🔵', '🔵', '🔴'], odd: '🔴', gridCols: 3 },
        { items: ['⭐', '⭐', '⭐', '🌟', '⭐', '⭐'], odd: '🌟', gridCols: 3 },
        { items: ['🌸', '🌸', '🌸', '🌸', '🌺', '🌸'], odd: '🌺', gridCols: 3 },
        { items: ['🎈', '🎈', '🎈', '🎈', '🎈', '🎀'], odd: '🎀', gridCols: 3 },
    ],
    medium: [
        { items: ['🐱', '🐱', '🐱', '🐱', '🐱', '🐱', '🐱', '🐈', '🐱'], odd: '🐈', gridCols: 3 },
        { items: ['🔴', '🔴', '🔴', '🔴', '🔴', '🔴', '🔴', '🔴', '🟠'], odd: '🟠', gridCols: 3 },
        { items: ['🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🎄', '🌲'], odd: '🎄', gridCols: 3 },
        { items: ['💎', '💎', '💎', '💎', '💎', '💎', '💎', '💎', '💠'], odd: '💠', gridCols: 3 },
        { items: ['🏀', '🏀', '🏀', '🏀', '🏀', '🏀', '🏀', '🏐', '🏀'], odd: '🏐', gridCols: 3 },
        { items: ['🎵', '🎵', '🎵', '🎵', '🎵', '🎵', '🎵', '🎵', '🎶'], odd: '🎶', gridCols: 3 },
        { items: ['👀', '👀', '👀', '👀', '👁️', '👀', '👀', '👀', '👀'], odd: '👁️', gridCols: 3 },
    ],
    hard: [
        { items: ['😀', '😀', '😀', '😀', '😀', '😀', '😀', '😀', '😀', '😀', '😀', '😃', '😀', '😀', '😀', '😀'], odd: '😃', gridCols: 4 },
        { items: ['🟦', '🟦', '🟦', '🟦', '🟦', '🟦', '🟦', '🟦', '🟦', '🟦', '🟦', '🟦', '🟦', '🟦', '🟪', '🟦'], odd: '🟪', gridCols: 4 },
        { items: ['🐶', '🐶', '🐶', '🐶', '🐶', '🐶', '🐶', '🐶', '🐶', '🐶', '🐶', '🐶', '🐶', '🐶', '🐶', '🐕'], odd: '🐕', gridCols: 4 },
        { items: ['🌼', '🌼', '🌼', '🌼', '🌼', '🌼', '🌼', '🌼', '🌼', '🌻', '🌼', '🌼', '🌼', '🌼', '🌼', '🌼'], odd: '🌻', gridCols: 4 },
        { items: ['🔷', '🔷', '🔷', '🔷', '🔷', '🔷', '🔷', '🔷', '🔷', '🔷', '🔷', '🔹', '🔷', '🔷', '🔷', '🔷'], odd: '🔹', gridCols: 4 },
    ],
};

export function startGame(board, engine) {
    const levels = shuffle([...(LEVELS[engine.difficulty] || LEVELS.medium)]);
    let currentIdx = 0;

    engine.startTimer(engine.getDifficultyConfig().time);

    function renderLevel() {
        if (currentIdx >= levels.length) {
            engine.addScore(30);
            engine.endGame();
            return;
        }

        const lvl = levels[currentIdx];
        const shuffled = shuffle([...lvl.items]);

        board.innerHTML = `
      <div style="width:100%;text-align:center">
        <div style="font-size:var(--font-sm);color:var(--text-tertiary);margin-bottom:var(--space-md)">
          Round ${currentIdx + 1} of ${levels.length}
        </div>
        <div style="font-size:var(--font-lg);margin-bottom:var(--space-xl);color:var(--text-primary)">
          Find the odd one out! 👁️
        </div>
        <div class="odd-grid" style="grid-template-columns:repeat(${lvl.gridCols}, 1fr)">
          ${shuffled.map((item, i) => `
            <div class="odd-item" data-item="${item}" data-idx="${i}">${item}</div>
          `).join('')}
        </div>
      </div>
    `;

        board.querySelectorAll('.odd-item').forEach(item => {
            item.addEventListener('click', () => {
                const isOdd = item.dataset.item === lvl.odd;

                if (isOdd) {
                    item.style.background = 'var(--success-50)';
                    item.style.borderColor = 'var(--success-500)';
                    item.style.animation = 'correctPop 0.4s ease';
                    engine.recordCorrect();
                    engine.addScore(15);
                } else {
                    item.style.background = 'var(--error-50)';
                    item.style.borderColor = 'var(--error-500)';
                    item.style.animation = 'wrongShake 0.4s ease';
                    engine.recordWrong();
                    // Highlight the correct one
                    board.querySelectorAll('.odd-item').forEach(o => {
                        if (o.dataset.item === lvl.odd) {
                            o.style.background = 'var(--success-50)';
                            o.style.borderColor = 'var(--success-500)';
                        }
                    });
                }

                setTimeout(() => { currentIdx++; renderLevel(); }, 900);
            });
        });
    }

    renderLevel();
}

export function handleHint(board) {
    // Subtle highlight on the odd item
    const items = board.querySelectorAll('.odd-item');
    items.forEach(item => {
        item.style.transition = 'transform 0.3s ease';
    });
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
