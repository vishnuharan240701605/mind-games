/* ==========================================
   VISUAL PATTERN MEMORY
   ========================================== */

export function startGame(board, engine) {
    const gridSize = engine.difficulty === 'easy' ? 3 : engine.difficulty === 'hard' ? 5 : 4;
    const patternSize = engine.difficulty === 'easy' ? 3 : engine.difficulty === 'hard' ? 7 : 5;
    const rounds = engine.difficulty === 'easy' ? 5 : engine.difficulty === 'hard' ? 8 : 6;

    let currentRound = 0;
    let pattern = [];
    let userSelection = new Set();
    let phase = 'show'; // 'show' or 'input'

    engine.startTimer(engine.getDifficultyConfig().time);

    function nextRound() {
        if (currentRound >= rounds) {
            engine.addScore(30);
            engine.endGame();
            return;
        }

        const currentPatternSize = Math.min(patternSize + currentRound, gridSize * gridSize - 1);
        pattern = generatePattern(gridSize, currentPatternSize);
        userSelection.clear();
        phase = 'show';

        renderBoard('Memorize the pattern! 👀', true);

        setTimeout(() => {
            phase = 'input';
            renderBoard('Reproduce the pattern! 🎯', false);
        }, 1500 + currentRound * 200);
    }

    function renderBoard(message, showPattern) {
        board.innerHTML = `
      <div style="width:100%;text-align:center">
        <div style="font-size:var(--font-sm);color:var(--text-tertiary);margin-bottom:var(--space-sm)">
          Round ${currentRound + 1} of ${rounds}
        </div>
        <div style="font-size:var(--font-lg);margin-bottom:var(--space-lg);color:var(--text-primary)">
          ${message}
        </div>
        <div class="pattern-grid" style="grid-template-columns:repeat(${gridSize}, 1fr)">
          ${Array.from({ length: gridSize * gridSize }, (_, i) => {
            const isPattern = pattern.includes(i);
            const isSelected = userSelection.has(i);
            let cls = 'pattern-cell';
            if (showPattern && isPattern) cls += ' highlighted';
            if (!showPattern && isSelected) cls += ' selected';
            return `<div class="${cls}" data-idx="${i}"></div>`;
        }).join('')}
        </div>
        ${!showPattern ? `
          <div style="margin-top:var(--space-lg)">
            <button class="btn btn-success btn-sm" id="submit-pattern-btn">✅ Submit</button>
          </div>
        ` : ''}
      </div>
    `;

        if (!showPattern) {
            board.querySelectorAll('.pattern-cell').forEach(cell => {
                cell.addEventListener('click', () => {
                    const idx = parseInt(cell.dataset.idx);
                    if (userSelection.has(idx)) {
                        userSelection.delete(idx);
                        cell.classList.remove('selected');
                    } else {
                        userSelection.add(idx);
                        cell.classList.add('selected');
                    }
                });
            });

            document.getElementById('submit-pattern-btn')?.addEventListener('click', () => {
                checkAnswer();
            });
        }
    }

    function checkAnswer() {
        const patternSet = new Set(pattern);
        let correct = 0;
        let wrong = 0;

        board.querySelectorAll('.pattern-cell').forEach(cell => {
            const idx = parseInt(cell.dataset.idx);
            const isPattern = patternSet.has(idx);
            const isSelected = userSelection.has(idx);

            if (isPattern && isSelected) {
                cell.classList.add('correct');
                correct++;
            } else if (!isPattern && isSelected) {
                cell.classList.add('wrong');
                wrong++;
            } else if (isPattern && !isSelected) {
                cell.classList.add('highlighted');
            }
        });

        if (correct === pattern.length && wrong === 0) {
            engine.recordCorrect();
            engine.addScore(20);
        } else {
            engine.recordWrong();
            if (correct > 0) engine.addScore(5);
        }

        currentRound++;
        setTimeout(nextRound, 1200);
    }

    nextRound();
}

export function handleHint(board) {
    // Flash the pattern briefly
    board.querySelectorAll('.pattern-cell').forEach(cell => {
        cell.style.transition = 'all 0.3s ease';
    });
}

function generatePattern(gridSize, count) {
    const total = gridSize * gridSize;
    const indices = Array.from({ length: total }, (_, i) => i);
    const pattern = [];
    while (pattern.length < count && indices.length > 0) {
        const idx = Math.floor(Math.random() * indices.length);
        pattern.push(indices.splice(idx, 1)[0]);
    }
    return pattern;
}
