/* ==========================================
   WORD SCRAMBLE GAME
   ========================================== */

const WORDS = {
    easy: ['BRAIN', 'THINK', 'SMART', 'LOGIC', 'FOCUS', 'LEARN', 'SKILL', 'QUEST', 'BRAIN', 'GAMES'],
    medium: ['PUZZLE', 'MEMORY', 'REASON', 'CLEVER', 'RIDDLE', 'NEURON', 'WISDOM', 'GENIUS', 'MENTAL', 'MASTER'],
    hard: ['COGNITION', 'CHALLENGE', 'CREATIVE', 'STRATEGY', 'THINKING', 'DISCOVER', 'ABSTRACT', 'LEARNING', 'REMEMBER', 'ACADEMIC'],
};

export function startGame(board, engine) {
    const wordList = shuffle([...(WORDS[engine.difficulty] || WORDS.medium)]);
    let currentIdx = 0;

    engine.startTimer(engine.getDifficultyConfig().time);

    function renderWord() {
        if (currentIdx >= wordList.length) {
            engine.addScore(30);
            engine.endGame();
            return;
        }

        const word = wordList[currentIdx];
        const scrambled = shuffle(word.split(''));
        let selected = [];
        let usedIndices = new Set();

        board.innerHTML = `
      <div style="width:100%;text-align:center">
        <div style="font-size:var(--font-sm);color:var(--text-tertiary);margin-bottom:var(--space-md)">
          Word ${currentIdx + 1} of ${wordList.length}
        </div>
        <div style="font-size:var(--font-lg);margin-bottom:var(--space-xl);color:var(--text-primary)">
          Unscramble the letters! 🔤
        </div>
        <div class="word-slots" id="word-slots">
          ${word.split('').map(() => `<div class="word-slot"></div>`).join('')}
        </div>
        <div class="scramble-letters" id="scramble-letters">
          ${scrambled.map((letter, i) => `
            <div class="scramble-letter" data-letter="${letter}" data-idx="${i}">${letter}</div>
          `).join('')}
        </div>
        <div style="margin-top:var(--space-lg)">
          <button class="btn btn-secondary btn-sm" id="clear-word-btn">↩️ Clear</button>
        </div>
      </div>
    `;

        const letters = board.querySelectorAll('.scramble-letter');
        const slots = board.querySelectorAll('.word-slot');

        letters.forEach(letter => {
            letter.addEventListener('click', () => {
                const idx = parseInt(letter.dataset.idx);
                if (usedIndices.has(idx)) return;
                usedIndices.add(idx);
                letter.classList.add('used');
                selected.push({ letter: letter.dataset.letter, idx });

                // Fill next empty slot
                const slotIdx = selected.length - 1;
                if (slots[slotIdx]) {
                    slots[slotIdx].textContent = letter.dataset.letter;
                    slots[slotIdx].classList.add('filled');
                }

                // Check if word is complete
                if (selected.length === word.length) {
                    const attempt = selected.map(s => s.letter).join('');
                    if (attempt === word) {
                        engine.recordCorrect();
                        engine.addScore(20);
                        slots.forEach(s => { s.style.borderColor = 'var(--success-500)'; s.style.background = 'var(--success-50)'; });
                        setTimeout(() => { currentIdx++; renderWord(); }, 800);
                    } else {
                        engine.recordWrong();
                        slots.forEach(s => { s.style.borderColor = 'var(--error-500)'; s.style.animation = 'wrongShake 0.4s ease'; });
                        setTimeout(() => {
                            // Reset
                            selected = [];
                            usedIndices.clear();
                            letters.forEach(l => l.classList.remove('used'));
                            slots.forEach(s => { s.textContent = ''; s.classList.remove('filled'); s.style.borderColor = ''; s.style.animation = ''; s.style.background = ''; });
                        }, 600);
                    }
                }
            });
        });

        // Clear button
        document.getElementById('clear-word-btn')?.addEventListener('click', () => {
            selected = [];
            usedIndices.clear();
            letters.forEach(l => l.classList.remove('used'));
            slots.forEach(s => { s.textContent = ''; s.classList.remove('filled'); s.style.borderColor = ''; s.style.animation = ''; s.style.background = ''; });
        });
    }

    renderWord();
}

export function handleHint(board) {
    // Reveal first unrevealed letter
    const slots = board.querySelectorAll('.word-slot');
    for (const slot of slots) {
        if (!slot.textContent) {
            slot.style.animation = 'glowPulse 1s ease 2';
            break;
        }
    }
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
