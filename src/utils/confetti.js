/**
 * Confetti celebration animation
 * Lightweight confetti effect for correct answers
 */

const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

/**
 * Create a confetti particle
 */
function createParticle(container) {
  const particle = document.createElement('div');
  particle.className = 'confetti-particle';
  
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const size = Math.random() * 10 + 5;
  const left = Math.random() * 100;
  const animationDuration = Math.random() * 2 + 2;
  const animationDelay = Math.random() * 0.5;
  
  particle.style.cssText = `
    position: fixed;
    width: ${size}px;
    height: ${size}px;
    background-color: ${color};
    left: ${left}%;
    top: -20px;
    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
    transform: rotate(${Math.random() * 360}deg);
    animation: confetti-fall ${animationDuration}s ease-out ${animationDelay}s forwards;
    pointer-events: none;
    z-index: 9999;
  `;
  
  container.appendChild(particle);
  
  // Clean up after animation
  setTimeout(() => {
    particle.remove();
  }, (animationDuration + animationDelay) * 1000 + 100);
}

/**
 * Add confetti CSS animation if not already present
 */
function ensureStyles() {
  if (document.getElementById('confetti-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'confetti-styles';
  style.textContent = `
    @keyframes confetti-fall {
      0% {
        transform: translateY(0) rotate(0deg) scale(1);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg) scale(0.5);
        opacity: 0;
      }
    }
    
    @keyframes confetti-burst {
      0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 1;
      }
      50% {
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(2);
        opacity: 0;
      }
    }
    
    .confetti-burst {
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,215,0,0.8) 0%, transparent 70%);
      animation: confetti-burst 0.5s ease-out forwards;
      pointer-events: none;
      z-index: 9998;
    }
    
    .star-burst {
      position: fixed;
      font-size: 48px;
      animation: star-pop 0.6s ease-out forwards;
      pointer-events: none;
      z-index: 9999;
    }
    
    @keyframes star-pop {
      0% {
        transform: translate(-50%, -50%) scale(0) rotate(0deg);
        opacity: 1;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(0.5) rotate(360deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Trigger confetti celebration
 * @param {number} intensity - Number of particles (default 30)
 */
export function celebrateConfetti(intensity = 30) {
  ensureStyles();
  
  // Create container
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  
  // Create particles
  for (let i = 0; i < intensity; i++) {
    setTimeout(() => createParticle(container), i * 30);
  }
  
  // Clean up container after all animations
  setTimeout(() => {
    container.remove();
  }, 4000);
}

/**
 * Show a burst effect at center of screen
 */
export function showBurst() {
  ensureStyles();
  
  const burst = document.createElement('div');
  burst.className = 'confetti-burst';
  document.body.appendChild(burst);
  
  setTimeout(() => burst.remove(), 500);
}

/**
 * Show a star popup
 * @param {number} x - X position
 * @param {number} y - Y position
 */
export function showStar(x, y) {
  ensureStyles();
  
  const star = document.createElement('div');
  star.className = 'star-burst';
  star.textContent = '⭐';
  star.style.left = `${x}px`;
  star.style.top = `${y}px`;
  document.body.appendChild(star);
  
  setTimeout(() => star.remove(), 600);
}

/**
 * Big celebration for streaks
 * @param {number} streak - Current streak count
 */
export function celebrateStreak(streak) {
  showBurst();
  
  // More confetti for bigger streaks
  const intensity = Math.min(streak * 10, 100);
  setTimeout(() => celebrateConfetti(intensity), 200);
  
  // Show multiple stars
  for (let i = 0; i < Math.min(streak, 5); i++) {
    setTimeout(() => {
      const x = Math.random() * window.innerWidth * 0.6 + window.innerWidth * 0.2;
      const y = Math.random() * window.innerHeight * 0.4 + window.innerHeight * 0.2;
      showStar(x, y);
    }, i * 150);
  }
}
