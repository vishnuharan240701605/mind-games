/* ==========================================
   LANDING PAGE
   ========================================== */

import { navigate } from '../router.js';
import { isLoggedIn } from '../utils/storage.js';
import { GAME_REGISTRY } from '../games/engine.js';

export function renderLanding(container) {
    const loggedIn = isLoggedIn();
    const games = Object.entries(GAME_REGISTRY).slice(0, 6);

    container.innerHTML = `
    <!-- HERO SECTION -->
    <section class="hero">
      <div class="hero-particles" id="hero-particles"></div>
      <div class="container" style="position:relative;z-index:2">
        <div class="hero-content animate-fadeInUp">
          <div class="hero-badge">
            <span>🎯</span> Brain Training for All Ages
          </div>
          <h1>Train Your Brain with<br><span style="background:linear-gradient(135deg,#ffd43b,#ff922b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Fun Mind Games</span></h1>
          <p>Improve your memory, sharpen your logic, and boost your focus with 10+ interactive brain training puzzles designed for ages 8 to 70+.</p>
          <div class="hero-cta">
            <button class="btn btn-accent btn-lg" id="hero-play-btn">
              🚀 Play Now
            </button>
            <button class="btn btn-secondary btn-lg" id="hero-explore-btn" style="background:rgba(255,255,255,0.15);color:white;border:2px solid rgba(255,255,255,0.3)">
              Explore Games
            </button>
          </div>
        </div>
      </div>
      <div class="hero-visual">🧠</div>
    </section>

    <!-- BENEFITS SECTION -->
    <section class="section" style="background:var(--bg-secondary)">
      <div class="container">
        <div class="text-center" style="margin-bottom:var(--space-3xl)">
          <h2 class="animate-fadeInUp">Why Train Your Brain? 🧩</h2>
          <p style="max-width:600px;margin:var(--space-md) auto;font-size:var(--font-lg)">
            Just like your body, your brain needs regular exercise to stay sharp and healthy.
          </p>
        </div>
        <div class="grid grid-3">
          ${benefitCard('🧠', 'Boost Memory', 'Strengthen your working memory and recall ability with pattern-based challenges.', 'var(--gradient-primary)')}
          ${benefitCard('🎯', 'Sharpen Focus', 'Train your concentration and attention span through timed puzzles.', 'var(--gradient-accent)')}
          ${benefitCard('💡', 'Logical Thinking', 'Develop problem-solving skills with number sequences and logic grids.', 'var(--gradient-success)')}
          ${benefitCard('⚡', 'Reaction Speed', 'Test and improve your reflexes with speed-based challenges.', 'var(--gradient-warm)')}
          ${benefitCard('📈', 'Track Progress', 'Monitor your Brain Score, streaks, and achievements over time.', 'var(--gradient-cool)')}
          ${benefitCard('🏆', 'Compete & Win', 'Challenge friends and climb the global leaderboard.', 'linear-gradient(135deg, var(--purple-500), var(--pink-500))')}
        </div>
      </div>
    </section>

    <!-- GAMES PREVIEW -->
    <section class="section">
      <div class="container">
        <div class="text-center" style="margin-bottom:var(--space-3xl)">
          <h2 class="animate-fadeInUp">Featured Games 🎮</h2>
          <p style="max-width:600px;margin:var(--space-md) auto;font-size:var(--font-lg)">
            Choose from our collection of brain-boosting games, each targeting different cognitive skills.
          </p>
        </div>
        <div class="grid grid-3" id="game-preview-grid">
          ${games.map(([id, game]) => gamePreviewCard(id, game)).join('')}
        </div>
        <div class="text-center" style="margin-top:var(--space-2xl)">
          <button class="btn btn-primary btn-lg" id="view-all-games-btn">
            View All Games →
          </button>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section" style="background:var(--bg-secondary)">
      <div class="container">
        <div class="text-center" style="margin-bottom:var(--space-3xl)">
          <h2>How It Works ✨</h2>
        </div>
        <div class="grid grid-3">
          ${stepCard('1', '🎮', 'Choose a Game', 'Pick from 10+ brain games targeting memory, logic, speed, and more.')}
          ${stepCard('2', '🧠', 'Train Daily', 'Play daily challenges and track your cognitive progress over time.')}
          ${stepCard('3', '🏆', 'Level Up', 'Earn points, unlock achievements, and climb the leaderboard.')}
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section">
      <div class="container">
        <div class="card text-center" style="padding:var(--space-4xl);background:var(--gradient-hero);border:none;border-radius:var(--radius-xl)">
          <h2 style="color:white;margin-bottom:var(--space-md)">Ready to Challenge Your Mind? 🚀</h2>
          <p style="color:rgba(255,255,255,0.85);font-size:var(--font-lg);max-width:500px;margin:0 auto var(--space-xl)">
            Join thousands of brain trainers. It's free, fun, and takes just 5 minutes a day.
          </p>
          <button class="btn btn-accent btn-lg" id="cta-play-btn">
            Start Training Now
          </button>
        </div>
      </div>
    </section>
  `;

    // Generate particles
    generateParticles();

    // Event listeners
    const playBtn = () => navigate(loggedIn ? '/games' : '/auth');
    document.getElementById('hero-play-btn')?.addEventListener('click', playBtn);
    document.getElementById('cta-play-btn')?.addEventListener('click', playBtn);
    document.getElementById('hero-explore-btn')?.addEventListener('click', () => navigate('/games'));
    document.getElementById('view-all-games-btn')?.addEventListener('click', () => navigate('/games'));

    // Game preview cards click
    container.querySelectorAll('[data-game-id]').forEach(card => {
        card.addEventListener('click', () => {
            const gameId = card.getAttribute('data-game-id');
            if (loggedIn) {
                navigate(`/play?game=${gameId}`);
            } else {
                navigate('/auth');
            }
        });
    });
}

function benefitCard(icon, title, desc, gradient) {
    return `
    <div class="card card-glow animate-fadeInUp" style="text-align:center;padding:var(--space-2xl)">
      <div style="width:60px;height:60px;border-radius:var(--radius-md);background:${gradient};display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin:0 auto var(--space-md);box-shadow:0 4px 15px rgba(0,0,0,0.1)">${icon}</div>
      <h4 style="margin-bottom:var(--space-sm)">${title}</h4>
      <p style="font-size:var(--font-sm)">${desc}</p>
    </div>
  `;
}

function gamePreviewCard(id, game) {
    return `
    <div class="card card-game card-glow animate-fadeInUp" data-game-id="${id}">
      <div class="card-icon" style="background:${game.gradient || 'var(--gradient-primary)'}">${game.icon}</div>
      <div class="card-title">${game.name}</div>
      <div class="card-desc">${game.description}</div>
      <div class="card-meta">
        <span class="badge badge-primary">${game.category}</span>
        <span>⏱️ ${game.duration}</span>
      </div>
    </div>
  `;
}

function stepCard(num, icon, title, desc) {
    return `
    <div class="card text-center animate-fadeInUp" style="padding:var(--space-2xl);position:relative">
      <div style="position:absolute;top:-16px;left:50%;transform:translateX(-50%);width:36px;height:36px;border-radius:50%;background:var(--gradient-primary);color:white;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:var(--font-sm)">${num}</div>
      <div style="font-size:3rem;margin:var(--space-md) 0">${icon}</div>
      <h4 style="margin-bottom:var(--space-sm)">${title}</h4>
      <p style="font-size:var(--font-sm)">${desc}</p>
    </div>
  `;
}

function generateParticles() {
    const container = document.getElementById('hero-particles');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'hero-particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 4 + 's';
        p.style.animationDuration = (3 + Math.random() * 3) + 's';
        p.style.width = (4 + Math.random() * 6) + 'px';
        p.style.height = p.style.width;
        container.appendChild(p);
    }
}
