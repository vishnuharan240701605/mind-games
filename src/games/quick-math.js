/* ==========================================
   QUICK MATH CHALLENGE
   ========================================== */

import { checkSpecialAchievement } from '../utils/achievements.js';

export function startGame(board, engine) {
    const totalQuestions = engine.difficulty === 'easy' ? 8 : engine.difficulty === 'hard' ? 15 : 10;
    let currentQ = 0;

    engine.startTimer(engine.getDifficultyConfig().time);

    function generateProblem() {
        const ops = engine.difficulty === 'easy'
            ? ['+', '-']
            : engine.difficulty === 'hard'
                ? ['+', '-', '×', '÷']
                : ['+', '-', '×'];

        const op = ops[Math.floor(Math.random() * ops.length)];
        let a, b, answer;

        switch (op) {
            case '+':
                a = rand(1, engine.difficulty === 'hard' ? 99 : 50);
                b = rand(1, engine.difficulty === 'hard' ? 99 : 50);
                answer = a + b;
                break;
            case '-':
                a = rand(10, engine.difficulty === 'hard' ? 99 : 50);
                b = rand(1, a);
                answer = a - b;
                break;
            case '×':
                a = rand(2, engine.difficulty === 'hard' ? 15 : 12);
                b = rand(2, engine.difficulty === 'hard' ? 15 : 12);
                answer = a * b;
                break;
            case '÷':
                b = rand(2, 12);
                answer = rand(2, 12);
                a = b * answer;
                break;
        }

        return { a, b, op, answer };
    }

    function renderQuestion() {
        if (currentQ >= totalQuestions) {
            if (engine.score >= 100) checkSpecialAchievement('math_whiz');
            engine.addScore(30);
            engine.endGame();
            return;
        }

        const problem = generateProblem();
        const wrongOpts = generateWrongOptions(problem.answer, 3);
        const options = shuffle([problem.answer, ...wrongOpts]);

        board.innerHTML = `
      <div style="width:100%;text-align:center">
        <div style="font-size:var(--font-sm);color:var(--text-tertiary);margin-bottom:var(--space-md)">
          Question ${currentQ + 1} of ${totalQuestions}
        </div>
        <div class="math-display">
          ${problem.a} ${problem.op} ${problem.b} = ?
        </div>
        <div class="answer-options">
          ${options.map(opt => `
            <button class="answer-option" data-answer="${opt}">${opt}</button>
          `).join('')}
        </div>
      </div>
    `;

        board.querySelectorAll('.answer-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const opts = board.querySelectorAll('.answer-option');
                opts.forEach(o => o.style.pointerEvents = 'none');

                if (parseFloat(btn.dataset.answer) === problem.answer) {
                    btn.classList.add('correct');
                    engine.recordCorrect();
                    engine.addScore(10);
                } else {
                    btn.classList.add('wrong');
                    engine.recordWrong();
                    board.querySelector(`[data-answer="${problem.answer}"]`)?.classList.add('correct');
                }

                currentQ++;
                setTimeout(renderQuestion, 700);
            });
        });
    }

    renderQuestion();
}

export function handleHint(board) {
    // Remove one wrong answer
    const opts = board.querySelectorAll('.answer-option:not(.correct):not(.wrong)');
    if (opts.length > 1) {
        opts[0].style.opacity = '0.3';
        opts[0].style.pointerEvents = 'none';
    }
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateWrongOptions(correct, count) {
    const options = new Set();
    while (options.size < count) {
        const offset = Math.floor(Math.random() * 20) - 10;
        const wrong = correct + (offset === 0 ? 1 : offset);
        if (wrong !== correct && wrong >= 0) options.add(wrong);
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
