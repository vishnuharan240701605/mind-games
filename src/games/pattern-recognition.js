/* ==========================================
   PATTERN RECOGNITION GAME
   ========================================== */

const PATTERNS = {
    easy: [
        { sequence: ['🔴', '🔵', '🔴', '🔵', '🔴'], answer: '🔵', options: ['🔵', '🟢', '🔴', '🟡'] },
        { sequence: ['⬛', '⬜', '⬛', '⬜', '⬛'], answer: '⬜', options: ['⬜', '⬛', '🟫', '🔲'] },
        { sequence: ['🟢', '🟢', '🔵', '🟢', '🟢'], answer: '🔵', options: ['🔵', '🟢', '🟡', '🔴'] },
        { sequence: ['🔺', '🔻', '🔺', '🔻', '🔺'], answer: '🔻', options: ['🔻', '🔺', '🔷', '🔶'] },
        { sequence: ['🌙', '⭐', '🌙', '⭐', '🌙'], answer: '⭐', options: ['⭐', '🌙', '☀️', '💫'] },
    ],
    medium: [
        { sequence: ['🔴', '🔵', '🟢', '🔴', '🔵', '🟢', '🔴'], answer: '🔵', options: ['🔵', '🟢', '🔴', '🟡'] },
        { sequence: ['🔷', '🔷', '🔶', '🔷', '🔷', '🔶', '🔷'], answer: '🔷', options: ['🔷', '🔶', '🔹', '🔸'] },
        { sequence: ['⬛', '⬜', '⬜', '⬛', '⬜', '⬜', '⬛'], answer: '⬜', options: ['⬜', '⬛', '🔲', '🟫'] },
        { sequence: ['🌸', '🌺', '🌸', '🌻', '🌸', '🌺', '🌸'], answer: '🌻', options: ['🌻', '🌸', '🌺', '🌹'] },
        { sequence: ['1️⃣', '2️⃣', '3️⃣', '1️⃣', '2️⃣', '3️⃣', '1️⃣'], answer: '2️⃣', options: ['2️⃣', '3️⃣', '1️⃣', '4️⃣'] },
        { sequence: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🔴'], answer: '🟠', options: ['🟠', '🔴', '🟡', '🟣'] },
    ],
    hard: [
        { sequence: ['🔴', '🔵', '🔴', '🟢', '🔴', '🔵', '🔴', '🟢', '🔴'], answer: '🔵', options: ['🔵', '🟢', '🔴', '🟡'] },
        { sequence: ['⬛', '⬜', '⬜', '⬛', '⬛', '⬜', '⬜', '⬛', '⬛'], answer: '⬜', options: ['⬜', '⬛', '🔲', '🟫'] },
        { sequence: ['🔷', '🔶', '🔹', '🔷', '🔶', '🔹', '🔷', '🔶'], answer: '🔹', options: ['🔹', '🔷', '🔶', '🔸'] },
        { sequence: ['🌸', '🌺', '🌸', '🌻', '🌺', '🌸', '🌻', '🌺', '🌸'], answer: '🌻', options: ['🌻', '🌸', '🌺', '🌹'] },
        { sequence: ['🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟥', '🟧', '🟨'], answer: '🟩', options: ['🟩', '🟦', '🟪', '🟥'] },
        { sequence: ['♠️', '♥️', '♦️', '♣️', '♠️', '♥️', '♦️', '♣️', '♠️'], answer: '♥️', options: ['♥️', '♦️', '♣️', '♠️'] },
        { sequence: ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌑'], answer: '🌒', options: ['🌒', '🌓', '🌔', '🌑'] },
    ],
};

export function startGame(board, engine) {
    const patterns = shuffle([...(PATTERNS[engine.difficulty] || PATTERNS.medium)]);
    let currentIdx = 0;

    engine.startTimer(engine.getDifficultyConfig().time);

    function renderQuestion() {
        if (currentIdx >= patterns.length) {
            engine.addScore(30); // completion bonus
            engine.endGame();
            return;
        }

        const p = patterns[currentIdx];
        board.innerHTML = `
      <div style="width:100%;text-align:center">
        <div style="font-size:var(--font-sm);color:var(--text-tertiary);margin-bottom:var(--space-md)">
          Question ${currentIdx + 1} of ${patterns.length}
        </div>
        <div style="font-size:var(--font-lg);margin-bottom:var(--space-lg);color:var(--text-primary)">
          What comes next in the pattern?
        </div>
        <div style="display:flex;justify-content:center;gap:var(--space-sm);flex-wrap:wrap;margin-bottom:var(--space-2xl)">
          ${p.sequence.map(s => `<span style="font-size:2.5rem;padding:var(--space-sm)">${s}</span>`).join('')}
          <span style="font-size:2.5rem;padding:var(--space-sm);color:var(--primary-500);animation:pulse 1s infinite">❓</span>
        </div>
        <div class="answer-options" style="max-width:300px;margin:0 auto">
          ${shuffle([...p.options]).map(opt => `
            <button class="answer-option" data-answer="${opt}">${opt}</button>
          `).join('')}
        </div>
      </div>
    `;

        board.querySelectorAll('.answer-option').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.answered) return;
                btn.dataset.answered = 'true';

                if (btn.dataset.answer === p.answer) {
                    btn.classList.add('correct');
                    engine.recordCorrect();
                    engine.addScore(15);
                } else {
                    btn.classList.add('wrong');
                    engine.recordWrong();
                    board.querySelector(`[data-answer="${p.answer}"]`)?.classList.add('correct');
                }

                setTimeout(() => {
                    currentIdx++;
                    renderQuestion();
                }, 800);
            });
        });
    }

    renderQuestion();
}

export function handleHint(board, engine) {
    // Remove one wrong option
    const wrongs = board.querySelectorAll('.answer-option:not(.correct):not(.wrong)');
    const wrongOnes = Array.from(wrongs).filter(b => {
        const parent = board.closest('.game-wrapper') || board.parentElement;
        return !b.classList.contains('correct');
    });
    if (wrongOnes.length > 1) {
        wrongOnes[0].style.opacity = '0.3';
        wrongOnes[0].style.pointerEvents = 'none';
    }
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
