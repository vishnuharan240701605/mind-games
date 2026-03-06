/* ==========================================
   ACHIEVEMENTS SYSTEM
   ========================================== */

import { getUnlockedAchievements, unlockAchievement, getUser, getStreak, getScores, getGameHistory } from './storage.js';
import { showToast } from '../components/toast.js';

export const ACHIEVEMENTS = [
    { id: 'first_game', name: 'First Steps', icon: '👶', desc: 'Complete your first game', condition: u => u.totalGames >= 1 },
    { id: 'ten_games', name: 'Getting Hooked', icon: '🎮', desc: 'Complete 10 games', condition: u => u.totalGames >= 10 },
    { id: 'fifty_games', name: 'Brain Warrior', icon: '⚔️', desc: 'Complete 50 games', condition: u => u.totalGames >= 50 },
    { id: 'streak_3', name: 'On a Roll', icon: '🔥', desc: '3-day streak', condition: (u, s) => s.current >= 3 },
    { id: 'streak_7', name: 'Week Champion', icon: '🏆', desc: '7-day streak', condition: (u, s) => s.current >= 7 },
    { id: 'streak_30', name: 'Monthly Master', icon: '👑', desc: '30-day streak', condition: (u, s) => s.current >= 30 },
    { id: 'brain_100', name: 'Smart Cookie', icon: '🍪', desc: 'Brain score 100+', condition: u => u.brainScore >= 100 },
    { id: 'brain_500', name: 'Genius Mind', icon: '🧠', desc: 'Brain score 500+', condition: u => u.brainScore >= 500 },
    { id: 'brain_1000', name: 'Legendary Brain', icon: '💎', desc: 'Brain score 1000+', condition: u => u.brainScore >= 1000 },
    { id: 'level_5', name: 'Rising Star', icon: '⭐', desc: 'Reach level 5', condition: u => u.level >= 5 },
    { id: 'level_10', name: 'Elite Thinker', icon: '🌟', desc: 'Reach level 10', condition: u => u.level >= 10 },
    { id: 'all_games', name: 'Explorer', icon: '🗺️', desc: 'Play all 10 game types', condition: (u, s, scores) => Object.keys(scores).length >= 10 },
    { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', desc: 'Reaction time under 250ms', condition: () => false }, // Checked in-game
    { id: 'perfect_memory', name: 'Perfect Memory', icon: '🎯', desc: 'Complete Memory Match with no mistakes', condition: () => false },
    { id: 'math_whiz', name: 'Math Whiz', icon: '🧮', desc: 'Score 100+ in Quick Math', condition: () => false },
    { id: 'daily_first', name: 'Daily Devotee', icon: '📅', desc: 'Complete your first daily challenge', condition: () => false },
];

export function checkAchievements() {
    const user = getUser();
    if (!user) return [];

    const streak = getStreak();
    const scores = getScores();
    const unlocked = getUnlockedAchievements();
    const newlyUnlocked = [];

    ACHIEVEMENTS.forEach(achievement => {
        if (unlocked.includes(achievement.id)) return;
        try {
            if (achievement.condition(user, streak, scores)) {
                if (unlockAchievement(achievement.id)) {
                    newlyUnlocked.push(achievement);
                }
            }
        } catch { }
    });

    newlyUnlocked.forEach(a => {
        showToast(`🏅 Achievement Unlocked: ${a.name}!`, 'success');
    });

    return newlyUnlocked;
}

export function checkSpecialAchievement(id) {
    const unlocked = getUnlockedAchievements();
    if (unlocked.includes(id)) return false;
    if (unlockAchievement(id)) {
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (achievement) {
            showToast(`🏅 Achievement Unlocked: ${achievement.name}!`, 'success');
        }
        return true;
    }
    return false;
}
