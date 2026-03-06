/* ==========================================
   APP ENTRY POINT
   ========================================== */

import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/animations.css';
import './styles/games.css';

import { initTheme } from './utils/theme.js';
import { initRouter } from './router.js';
import { seedLeaderboard } from './utils/storage.js';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    seedLeaderboard();
    initRouter();
});
