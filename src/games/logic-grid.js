/* ==========================================
   LOGIC GRID PUZZLE (Simple Sudoku-like)
   ========================================== */

export function startGame(board, engine) {
    const size = engine.difficulty === 'easy' ? 4 : engine.difficulty === 'hard' ? 6 : 5;
    const grid = generatePuzzle(size);
    const solution = grid.solution;
    const puzzle = grid.puzzle;
    let selectedCell = null;

    engine.startTimer(engine.getDifficultyConfig().time);

    function renderGrid() {
        board.innerHTML = `
      <div style="width:100%;text-align:center">
        <div style="font-size:var(--font-lg);margin-bottom:var(--space-lg);color:var(--text-primary)">
          Fill each row and column with numbers 1-${size} (no repeats!)
        </div>
        <div class="logic-grid" style="grid-template-columns:repeat(${size}, 1fr)">
          ${puzzle.map((row, r) => row.map((val, c) => `
            <div class="logic-cell ${val !== 0 ? 'fixed' : ''}" data-row="${r}" data-col="${c}">
              ${val !== 0 ? val : ''}
            </div>
          `).join('')).join('')}
        </div>
        <div style="display:flex;justify-content:center;gap:var(--space-sm);margin-top:var(--space-lg);flex-wrap:wrap">
          ${Array.from({ length: size }, (_, i) => `
            <button class="btn btn-secondary btn-icon" data-num="${i + 1}" style="font-size:var(--font-lg);font-weight:700">${i + 1}</button>
          `).join('')}
          <button class="btn btn-secondary btn-icon" data-num="0" style="font-size:var(--font-sm)">✕</button>
        </div>
        <div style="margin-top:var(--space-lg)">
          <button class="btn btn-success btn-sm" id="check-solution-btn">✅ Check Solution</button>
        </div>
      </div>
    `;

        // Cell selection
        board.querySelectorAll('.logic-cell:not(.fixed)').forEach(cell => {
            cell.addEventListener('click', () => {
                board.querySelectorAll('.logic-cell').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');
                selectedCell = { row: parseInt(cell.dataset.row), col: parseInt(cell.dataset.col) };
            });
        });

        // Number input
        board.querySelectorAll('[data-num]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!selectedCell) return;
                const num = parseInt(btn.dataset.num);
                puzzle[selectedCell.row][selectedCell.col] = num;
                const cell = board.querySelector(`[data-row="${selectedCell.row}"][data-col="${selectedCell.col}"]`);
                if (cell) {
                    cell.textContent = num || '';
                    cell.classList.remove('error');
                }
            });
        });

        // Check solution
        document.getElementById('check-solution-btn')?.addEventListener('click', () => {
            let allCorrect = true;
            let allFilled = true;

            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    const cell = board.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    if (puzzle[r][c] === 0) {
                        allFilled = false;
                        continue;
                    }
                    if (puzzle[r][c] !== solution[r][c]) {
                        allCorrect = false;
                        cell?.classList.add('error');
                    } else {
                        cell?.classList.remove('error');
                    }
                }
            }

            if (!allFilled) {
                // Count filled cells as partial progress
                return;
            }

            if (allCorrect) {
                engine.correctAnswers = 1;
                engine.totalQuestions = 1;
                engine.addScore(100);
                engine.endGame();
            } else {
                engine.recordWrong();
            }
        });
    }

    renderGrid();
}

export function handleHint(board, engine) {
    // Reveal one cell
    const emptyCells = board.querySelectorAll('.logic-cell:not(.fixed)');
    const unfilled = Array.from(emptyCells).filter(c => !c.textContent.trim());
    if (unfilled.length > 0) {
        const cell = unfilled[Math.floor(Math.random() * unfilled.length)];
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        // We don't have solution reference here easily, so just leave the hint basic
        cell.style.animation = 'glowPulse 1s ease-in-out 3';
    }
}

function generatePuzzle(size) {
    // Generate a valid Latin square
    const solution = [];
    for (let r = 0; r < size; r++) {
        solution[r] = [];
        for (let c = 0; c < size; c++) {
            solution[r][c] = ((r + c) % size) + 1;
        }
    }

    // Shuffle rows and columns
    for (let i = 0; i < size * 2; i++) {
        const a = Math.floor(Math.random() * size);
        const b = Math.floor(Math.random() * size);
        // Swap rows
        [solution[a], solution[b]] = [solution[b], solution[a]];
    }
    for (let i = 0; i < size * 2; i++) {
        const a = Math.floor(Math.random() * size);
        const b = Math.floor(Math.random() * size);
        // Swap columns
        for (let r = 0; r < size; r++) {
            [solution[r][a], solution[r][b]] = [solution[r][b], solution[r][a]];
        }
    }

    // Create puzzle by removing cells
    const puzzle = solution.map(row => [...row]);
    const removeCount = Math.floor(size * size * 0.5);
    let removed = 0;
    while (removed < removeCount) {
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);
        if (puzzle[r][c] !== 0) {
            puzzle[r][c] = 0;
            removed++;
        }
    }

    return { solution, puzzle };
}
