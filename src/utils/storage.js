/* ==========================================
   LOCAL STORAGE WRAPPER
   ========================================== */

const STORAGE_KEYS = {
  USER: 'mg_user',
  SCORES: 'mg_scores',
  ACHIEVEMENTS: 'mg_achievements',
  STREAK: 'mg_streak',
  DAILY: 'mg_daily',
  SETTINGS: 'mg_settings',
  LEADERBOARD: 'mg_leaderboard',
  GAME_HISTORY: 'mg_game_history',
};

function get(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { console.warn('Storage error:', e); }
}

// ---- User ----
export function getUser() {
  return get(STORAGE_KEYS.USER);
}

export function saveUser(user) {
  set(STORAGE_KEYS.USER, user);
}

export function createUser(username, email, password) {
  const avatars = ['🧠','🎯','🎮','🧩','💡','🚀','⭐','🔥','🌟','💎'];
  const user = {
    id: Date.now().toString(36),
    username,
    email,
    password,
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
    createdAt: new Date().toISOString(),
    brainScore: 0,
    level: 1,
    xp: 0,
    totalGames: 0,
    totalCorrect: 0,
    bestStreak: 0,
  };
  saveUser(user);
  initUserData();
  addToLeaderboard(user);
  return user;
}

export function loginUser(email, password) {
  const user = getUser();
  if (user && user.email === email && user.password === password) return user;
  return null;
}

export function logout() {
  // Keep data but clear user session flag
  const user = getUser();
  if (user) {
    user.loggedIn = false;
    saveUser(user);
  }
}

export function isLoggedIn() {
  const user = getUser();
  return user && user.loggedIn !== false;
}

// ---- Scores ----
export function getScores() {
  return get(STORAGE_KEYS.SCORES) || {};
}

export function saveScore(gameId, score, difficulty, timeTaken, accuracy) {
  const scores = getScores();
  if (!scores[gameId]) scores[gameId] = [];
  const entry = {
    score,
    difficulty,
    timeTaken,
    accuracy,
    date: new Date().toISOString(),
  };
  scores[gameId].push(entry);
  set(STORAGE_KEYS.SCORES, scores);

  // Update user stats
  const user = getUser();
  if (user) {
    user.totalGames = (user.totalGames || 0) + 1;
    user.brainScore = calculateBrainScore();
    user.xp = (user.xp || 0) + score;
    user.level = Math.floor(user.xp / 500) + 1;
    saveUser(user);
    updateLeaderboard(user);
  }

  // Add to game history
  addGameHistory(gameId, entry);

  return entry;
}

export function getBestScore(gameId) {
  const scores = getScores();
  if (!scores[gameId] || scores[gameId].length === 0) return 0;
  return Math.max(...scores[gameId].map(s => s.score));
}

export function calculateBrainScore() {
  const scores = getScores();
  let total = 0;
  let count = 0;
  Object.values(scores).forEach(gameScores => {
    gameScores.slice(-5).forEach(s => {
      total += s.score;
      count++;
    });
  });
  return count > 0 ? Math.round(total / count) : 0;
}

// ---- Game History ----
export function getGameHistory() {
  return get(STORAGE_KEYS.GAME_HISTORY) || [];
}

function addGameHistory(gameId, entry) {
  const history = getGameHistory();
  history.unshift({ gameId, ...entry });
  if (history.length > 50) history.pop();
  set(STORAGE_KEYS.GAME_HISTORY, history);
}

// ---- Streaks ----
export function getStreak() {
  return get(STORAGE_KEYS.STREAK) || { current: 0, best: 0, lastDate: null };
}

export function updateStreak() {
  const streak = getStreak();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (streak.lastDate === today) return streak;

  if (streak.lastDate === yesterday) {
    streak.current++;
  } else {
    streak.current = 1;
  }
  streak.lastDate = today;
  streak.best = Math.max(streak.best, streak.current);
  set(STORAGE_KEYS.STREAK, streak);
  return streak;
}

// ---- Daily Challenge ----
export function getDailyChallenge() {
  return get(STORAGE_KEYS.DAILY);
}

export function setDailyCompleted(gameId) {
  const daily = getDailyChallenge() || {};
  daily.completedToday = true;
  daily.completedGame = gameId;
  daily.date = new Date().toDateString();
  set(STORAGE_KEYS.DAILY, daily);
}

export function isDailyChallengeCompleted() {
  const daily = getDailyChallenge();
  return daily && daily.date === new Date().toDateString() && daily.completedToday;
}

// ---- Settings ----
export function getSettings() {
  return get(STORAGE_KEYS.SETTINGS) || {
    theme: 'light',
    highContrast: false,
    fontScale: 'normal',
    soundEnabled: true,
  };
}

export function saveSettings(settings) {
  set(STORAGE_KEYS.SETTINGS, settings);
}

// ---- Leaderboard ----
export function getLeaderboard() {
  return get(STORAGE_KEYS.LEADERBOARD) || [];
}

function addToLeaderboard(user) {
  const lb = getLeaderboard();
  lb.push({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    brainScore: 0,
    totalGames: 0,
    updatedAt: new Date().toISOString(),
  });
  set(STORAGE_KEYS.LEADERBOARD, lb);
}

function updateLeaderboard(user) {
  const lb = getLeaderboard();
  const entry = lb.find(e => e.id === user.id);
  if (entry) {
    entry.brainScore = user.brainScore;
    entry.totalGames = user.totalGames;
    entry.level = user.level;
    entry.updatedAt = new Date().toISOString();
  }
  set(STORAGE_KEYS.LEADERBOARD, lb);
}

// ---- Achievements ----
export function getUnlockedAchievements() {
  return get(STORAGE_KEYS.ACHIEVEMENTS) || [];
}

export function unlockAchievement(achievementId) {
  const unlocked = getUnlockedAchievements();
  if (!unlocked.includes(achievementId)) {
    unlocked.push(achievementId);
    set(STORAGE_KEYS.ACHIEVEMENTS, unlocked);
    return true;
  }
  return false;
}

// ---- Init ----
function initUserData() {
  if (!get(STORAGE_KEYS.SCORES)) set(STORAGE_KEYS.SCORES, {});
  if (!get(STORAGE_KEYS.ACHIEVEMENTS)) set(STORAGE_KEYS.ACHIEVEMENTS, []);
  if (!get(STORAGE_KEYS.STREAK)) set(STORAGE_KEYS.STREAK, { current: 0, best: 0, lastDate: null });
  if (!get(STORAGE_KEYS.GAME_HISTORY)) set(STORAGE_KEYS.GAME_HISTORY, []);
}

// Seed some demo leaderboard entries
export function seedLeaderboard() {
  const lb = getLeaderboard();
  if (lb.length > 1) return;
  const demoUsers = [
    { id: 'd1', username: 'BrainMaster', avatar: '🧠', brainScore: 850, totalGames: 120, level: 15 },
    { id: 'd2', username: 'PuzzleQueen', avatar: '👑', brainScore: 790, totalGames: 98, level: 13 },
    { id: 'd3', username: 'LogicNinja', avatar: '🥷', brainScore: 720, totalGames: 85, level: 11 },
    { id: 'd4', username: 'MemoryPro', avatar: '💎', brainScore: 680, totalGames: 76, level: 10 },
    { id: 'd5', username: 'QuickThinker', avatar: '⚡', brainScore: 650, totalGames: 70, level: 9 },
    { id: 'd6', username: 'MindWizard', avatar: '🧙', brainScore: 610, totalGames: 62, level: 8 },
    { id: 'd7', username: 'NeuroStar', avatar: '⭐', brainScore: 580, totalGames: 55, level: 7 },
    { id: 'd8', username: 'CogniKid', avatar: '🚀', brainScore: 520, totalGames: 48, level: 6 },
    { id: 'd9', username: 'ThinkFast', avatar: '🔥', brainScore: 480, totalGames: 40, level: 5 },
  ];
  demoUsers.forEach(u => {
    u.updatedAt = new Date().toISOString();
    lb.push(u);
  });
  set(STORAGE_KEYS.LEADERBOARD, lb);
}
