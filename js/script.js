// ── MUSIC TOGGLE ──
const btn = document.getElementById('musicBtn');
const label = document.getElementById('musicLabel');
let playing = false;
let audio = null;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollToTarget(target, offset = 28, duration = 1100) {
  if (!target) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, target.getBoundingClientRect().top + window.pageYOffset - offset);
    return;
  }

  const startY = window.pageYOffset;
  const targetY = target.getBoundingClientRect().top + window.pageYOffset - offset;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

window.smoothScrollToTarget = smoothScrollToTarget;

function toggleMusic() {
  playing = !playing;
  btn.classList.toggle('playing', playing);
  label.textContent = playing ? 'Now Playing' : 'Play Music';

  // Uncomment and set src when you have the actual audio file
  // if (!audio) audio = new Audio('assets/music.mp3');
  // playing ? audio.play() : audio.pause();
}

// ── SMOOTH SCROLL FOR CTA ──
document.addEventListener('DOMContentLoaded', () => {
  const cta = document.querySelector('.hero-cta');
  if (cta) {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScrollToTarget(document.querySelector('#rsvp'));
    });
  }
});