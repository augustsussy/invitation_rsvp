// ── MUSIC TOGGLE ──
const btn = document.getElementById('musicBtn');
const label = document.getElementById('musicLabel');
let playing = false;

function toggleMusic() {
  playing = !playing;
  btn.classList.toggle('playing', playing);
  label.textContent = playing ? 'Now Playing' : 'Play Music';
}

// ── SMOOTH SCROLL ──
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollToTarget(target, offset = 28, duration = 1100) {
  if (!target) return;
  const startY = window.pageYOffset;
  const targetY = target.getBoundingClientRect().top + window.pageYOffset - offset;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

window.smoothScrollToTarget = smoothScrollToTarget;

// ── CTA BUTTON ──
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('heroCta').addEventListener('click', function () {
    smoothScrollToTarget(document.getElementById('rsvp'));
  });
});