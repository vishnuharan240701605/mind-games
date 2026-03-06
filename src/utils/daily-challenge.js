/* ==========================================
   DAILY CHALLENGE GENERATOR
   ========================================== */

import { GAME_REGISTRY } from '../games/engine.js';

// Use the date as a seed for deterministic daily challenges
function dateSeed() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export function getDailyGameId() {
    const gameIds = Object.keys(GAME_REGISTRY);
    const seed = dateSeed();
    const index = Math.floor(seededRandom(seed) * gameIds.length);
    return gameIds[index];
}

export function getDailyDifficulty() {
    const seed = dateSeed() + 1;
    const difficulties = ['easy', 'medium', 'hard'];
    const index = Math.floor(seededRandom(seed) * difficulties.length);
    return difficulties[index];
}

export function getDailyChallengeInfo() {
    const gameId = getDailyGameId();
    const difficulty = getDailyDifficulty();
    const game = GAME_REGISTRY[gameId];
    return {
        gameId,
        difficulty,
        gameName: game ? game.name : 'Brain Challenge',
        gameIcon: game ? game.icon : '🧠',
        bonusPoints: difficulty === 'hard' ? 100 : difficulty === 'medium' ? 50 : 25,
    };
}
