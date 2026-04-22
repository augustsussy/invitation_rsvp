// ── MUSIC TOGGLE ──
const btn = document.getElementById('musicBtn');
const label = document.getElementById('musicLabel');
let playing = false;
let audio = null;

function toggleMusic() {
  playing = !playing;
  btn.classList.toggle('playing', playing);
  label.textContent = playing ? 'Now Playing' : 'Play Music';

  // Uncomment and set src when you have the actual audio file
  // if (!audio) audio = new Audio('assets/music.mp3');
  // playing ? audio.play() : audio.pause();
}

// ── SMOOTH SCROLL FOR CTA ──
document.querySelector('.hero-cta').addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelector('#rsvp').scrollIntoView({ behavior: 'smooth' });
});