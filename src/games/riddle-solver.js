/* ==========================================
   RIDDLE SOLVER GAME
   ========================================== */

const RIDDLES = {
    easy: [
        { question: "I have hands but can't clap. What am I?", answer: "Clock", options: ["Clock", "Tree", "Robot", "Doll"] },
        { question: "I have a face and two hands but no arms or legs. What am I?", answer: "Clock", options: ["Clock", "Scarecrow", "Robot", "Puppet"] },
        { question: "What has keys but no locks?", answer: "Piano", options: ["Piano", "Map", "Safe", "House"] },
        { question: "What has a head and a tail but no body?", answer: "Coin", options: ["Coin", "Snake", "Arrow", "Kite"] },
        { question: "What gets wetter the more it dries?", answer: "Towel", options: ["Towel", "Sponge", "Rain", "Ice"] },
        { question: "I'm full of holes but still hold water. What am I?", answer: "Sponge", options: ["Sponge", "Bucket", "Cloud", "Net"] },
    ],
    medium: [
        { question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", answer: "Echo", options: ["Echo", "Ghost", "Wind", "Shadow"] },
        { question: "The more you take, the more you leave behind. What am I?", answer: "Footsteps", options: ["Footsteps", "Time", "Breath", "Money"] },
        { question: "I can fly without wings. I can cry without eyes. What am I?", answer: "Cloud", options: ["Cloud", "Wind", "Time", "Bird"] },
        { question: "What has cities but no houses, forests but no trees, and water but no fish?", answer: "Map", options: ["Map", "Dream", "Book", "Painting"] },
        { question: "I am always coming but never arrive. What am I?", answer: "Tomorrow", options: ["Tomorrow", "Wind", "Future", "Dream"] },
        { question: "What can run but never walks, has a mouth but never talks?", answer: "River", options: ["River", "Clock", "Computer", "Road"] },
        { question: "I have teeth but don't bite. What am I?", answer: "Comb", options: ["Comb", "Zipper", "Saw", "Gear"] },
    ],
    hard: [
        { question: "I am not alive, but I grow. I don't have lungs, but I need air. I don't have a mouth, but water kills me. What am I?", answer: "Fire", options: ["Fire", "Mold", "Rust", "Coral"] },
        { question: "What disappears as soon as you say its name?", answer: "Silence", options: ["Silence", "Darkness", "Shadow", "Time"] },
        { question: "I have branches but no fruit, trunk, or leaves. What am I?", answer: "Bank", options: ["Bank", "Coral", "Lightning", "Antler"] },
        { question: "What can travel around the world while staying in a corner?", answer: "Stamp", options: ["Stamp", "Shadow", "Compass", "Spider"] },
        { question: "The person who makes it, sells it. The person who buys it never uses it. The person who uses it never knows they're using it. What is it?", answer: "Coffin", options: ["Coffin", "Medicine", "Insurance", "Gift"] },
        { question: "What word in the English language does the following: The first two letters signify a male, the first three letters signify a female, and the whole word signifies a great thing?", answer: "Heroine", options: ["Heroine", "Heritage", "Herself", "Hermit"] },
        { question: "I turn once, what is out will not get in. I turn again, what is in will not get out. What am I?", answer: "Key", options: ["Key", "Door", "Lock", "Wheel"] },
    ],
};

export function startGame(board, engine) {
    const riddles = shuffle([...(RIDDLES[engine.difficulty] || RIDDLES.medium)]);
    let currentIdx = 0;

    engine.startTimer(engine.getDifficultyConfig().time);

    function renderRiddle() {
        if (currentIdx >= riddles.length) {
            engine.addScore(30);
            engine.endGame();
            return;
        }

        const r = riddles[currentIdx];
        const shuffledOpts = shuffle([...r.options]);

        board.innerHTML = `
      <div style="width:100%;text-align:center">
        <div style="font-size:var(--font-sm);color:var(--text-tertiary);margin-bottom:var(--space-md)">
          Riddle ${currentIdx + 1} of ${riddles.length}
        </div>
        <div class="riddle-text">
          "${r.question}"
        </div>
        <div class="answer-options" style="max-width:400px;margin:0 auto">
          ${shuffledOpts.map(opt => `
            <button class="answer-option" data-answer="${opt}">${opt}</button>
          `).join('')}
        </div>
      </div>
    `;

        board.querySelectorAll('.answer-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const opts = board.querySelectorAll('.answer-option');
                opts.forEach(o => o.style.pointerEvents = 'none');

                if (btn.dataset.answer === r.answer) {
                    btn.classList.add('correct');
                    engine.recordCorrect();
                    engine.addScore(15);
                } else {
                    btn.classList.add('wrong');
                    engine.recordWrong();
                    board.querySelector(`[data-answer="${r.answer}"]`)?.classList.add('correct');
                }

                currentIdx++;
                setTimeout(renderRiddle, 1000);
            });
        });
    }

    renderRiddle();
}

export function handleHint(board) {
    const opts = board.querySelectorAll('.answer-option:not(.correct):not(.wrong)');
    const arr = Array.from(opts);
    if (arr.length > 2) {
        arr[0].style.opacity = '0.3';
        arr[0].style.pointerEvents = 'none';
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
