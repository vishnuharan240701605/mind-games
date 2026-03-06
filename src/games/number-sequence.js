/* ==========================================
   NUMBER SEQUENCE CHALLENGE
   ========================================== */

const SEQUENCES = {
    easy: [
        { seq: [2, 4, 6, 8], answer: 10, hint: 'Add 2' },
        { seq: [5, 10, 15, 20], answer: 25, hint: 'Add 5' },
        { seq: [1, 3, 5, 7], answer: 9, hint: 'Add 2' },
        { seq: [10, 20, 30, 40], answer: 50, hint: 'Add 10' },
        { seq: [3, 6, 9, 12], answer: 15, hint: 'Add 3' },
        { seq: [100, 90, 80, 70], answer: 60, hint: 'Subtract 10' },
    ],
    medium: [
        { seq: [1, 1, 2, 3, 5], answer: 8, hint: 'Fibonacci' },
        { seq: [2, 4, 8, 16], answer: 32, hint: 'Multiply by 2' },
        { seq: [1, 4, 9, 16], answer: 25, hint: 'Perfect squares' },
        { seq: [3, 7, 11, 15], answer: 19, hint: 'Add 4' },
        { seq: [100, 50, 25], answer: 12.5, hint: 'Divide by 2' },
        { seq: [1, 8, 27, 64], answer: 125, hint: 'Cubes' },
        { seq: [2, 6, 18, 54], answer: 162, hint: 'Multiply by 3' },
    ],
    hard: [
        { seq: [1, 1, 2, 3, 5, 8], answer: 13, hint: 'Fibonacci' },
        { seq: [1, 4, 9, 16, 25], answer: 36, hint: 'n²' },
        { seq: [2, 3, 5, 7, 11], answer: 13, hint: 'Prime numbers' },
        { seq: [1, 3, 6, 10, 15], answer: 21, hint: 'Triangular numbers' },
        { seq: [1, 8, 27, 64, 125], answer: 216, hint: 'n³' },
        { seq: [0, 1, 1, 2, 3, 5, 8], answer: 13, hint: 'Fibonacci from 0' },
        { seq: [2, 6, 12, 20, 30], answer: 42, hint: 'n(n+1)' },
        { seq: [1, 2, 4, 7, 11, 16], answer: 22, hint: 'Add 1, add 2, add 3...' },
    ],
};

export function startGame(board, engine) {
    const seqs = shuffle([...(SEQUENCES[engine.difficulty] || SEQUENCES.medium)]);
    let currentIdx = 0;

    engine.startTimer(engine.getDifficultyConfig().time);

    function renderQuestion() {
        if (currentIdx >= seqs.length) {
            engine.addScore(30);
            engine.endGame();
            return;
        }

        const q = seqs[currentIdx];
        const wrongOpts = generateWrongOptions(q.answer, 3);
        const options = shuffle([q.answer, ...wrongOpts]);

        board.innerHTML = `
      <div style="width:100%;text-align:center">
        <div style="font-size:var(--font-sm);color:var(--text-tertiary);margin-bottom:var(--space-md)">
          Question ${currentIdx + 1} of ${seqs.length}
        </div>
        <div style="font-size:var(--font-lg);margin-bottom:var(--space-lg);color:var(--text-primary)">
          What number comes next?
        </div>
        <div class="math-display">
          ${q.seq.join('  →  ')}  →  <span style="color:var(--primary-500);animation:pulse 1s infinite">?</span>
        </div>
        <div class="answer-options">
          ${options.map(opt => `
            <button class="answer-option" data-answer="${opt}">${opt}</button>
          `).join('')}
        </div>
        <div id="hint-text" style="margin-top:var(--space-lg);font-size:var(--font-sm);color:var(--text-tertiary);display:none">
          💡 Hint: ${q.hint}
        </div>
      </div>
    `;

        board.querySelectorAll('.answer-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const opts = board.querySelectorAll('.answer-option');
                opts.forEach(o => o.style.pointerEvents = 'none');

                if (parseFloat(btn.dataset.answer) === q.answer) {
                    btn.classList.add('correct');
                    engine.recordCorrect();
                    engine.addScore(15);
                } else {
                    btn.classList.add('wrong');
                    engine.recordWrong();
                    board.querySelector(`[data-answer="${q.answer}"]`)?.classList.add('correct');
                }

                setTimeout(() => { currentIdx++; renderQuestion(); }, 900);
            });
        });
    }

    renderQuestion();
}

export function handleHint(board) {
    const hintEl = board.querySelector('#hint-text');
    if (hintEl) hintEl.style.display = 'block';
}

function generateWrongOptions(correct, count) {
    const options = new Set();
    while (options.size < count) {
        const offset = Math.floor(Math.random() * 10) - 5;
        const wrong = correct + (offset === 0 ? 1 : offset);
        if (wrong !== correct) options.add(wrong);
    }
    return [...options];
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
