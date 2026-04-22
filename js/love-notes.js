const LOVE_NOTES_STORAGE_KEY = 'wedding_love_notes';
const LOVE_NOTES_MAX_ITEMS = 40;
const LOVE_NOTES_VISIBLE_ITEMS = 18;
const NOTES_AUTO_REFRESH_MS = 8000;
const NOTES_AUTO_REFRESH_RECEPTION_MS = 4000;
const ORGANIZER_PIN = 'LOVE2026';
const ORGANIZER_UNLOCK_KEY = 'love_notes_organizer_unlocked';

const noteNameInput = document.getElementById('noteName');
const noteMessageInput = document.getElementById('noteMessage');
const wallError = document.getElementById('wallError');
const wallSubmit = document.getElementById('wallSubmit');
const notesTrackA = document.getElementById('notesTrackA');
const notesTrackB = document.getElementById('notesTrackB');
const lettersLayer = document.getElementById('lettersLayer');
const receptionModeToggle = document.getElementById('receptionModeToggle');
const organizerUnlockBtn = document.getElementById('organizerUnlockBtn');
const wallBackLink = document.querySelector('.wall-back');
const wallModeHint = document.getElementById('wallModeHint');

let autoRefreshTimer = null;

wallSubmit.addEventListener('click', submitLoveNote);
receptionModeToggle.addEventListener('click', toggleReceptionMode);
organizerUnlockBtn.addEventListener('click', toggleOrganizerLock);
wallBackLink.addEventListener('click', guardBackNavigation);

prefillNameFromQuery();
createFloatingLetters();
applyModeFromQuery();
renderMovingNotes();
startAutoRefresh();

function prefillNameFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const name = (params.get('name') || '').trim();
  if (name) {
    noteNameInput.value = name;
  }
}

function isReceptionModeActive() {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'reception';
}

function applyModeFromQuery() {
  const receptionMode = isReceptionModeActive();
  document.body.classList.toggle('reception-mode', receptionMode);
  applyOrganizerLockState();

  receptionModeToggle.textContent = receptionMode
    ? 'Reception Mode: On'
    : 'Reception Mode: Off';

  wallModeHint.textContent = receptionMode
    ? 'Reception Mode: Auto-refreshing notes display for screen projection.'
    : 'Interactive Mode: Guests can post notes here.';

  if (receptionMode && isOrganizerLocked()) {
    wallModeHint.textContent += ' Controls are locked.';
  }
}

function toggleReceptionMode() {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  if (isReceptionModeActive()) {
    params.delete('mode');
  } else {
    params.set('mode', 'reception');
  }

  url.search = params.toString();
  window.location.href = url.toString();
}

function startAutoRefresh() {
  if (autoRefreshTimer) {
    window.clearInterval(autoRefreshTimer);
  }

  const refreshRate = isReceptionModeActive()
    ? NOTES_AUTO_REFRESH_RECEPTION_MS
    : NOTES_AUTO_REFRESH_MS;

  autoRefreshTimer = window.setInterval(() => {
    renderMovingNotes();
  }, refreshRate);
}

function isOrganizerLocked() {
  if (!isReceptionModeActive()) {
    return false;
  }

  return sessionStorage.getItem(ORGANIZER_UNLOCK_KEY) !== 'true';
}

function applyOrganizerLockState() {
  const locked = isOrganizerLocked();
  document.body.classList.toggle('organizer-locked', locked);

  receptionModeToggle.disabled = locked;
  organizerUnlockBtn.textContent = locked ? 'Organizer Unlock' : 'Lock Controls';
}

function toggleOrganizerLock() {
  if (!isReceptionModeActive()) {
    window.alert('Switch to Reception Mode first to use organizer lock controls.');
    return;
  }

  if (!isOrganizerLocked()) {
    sessionStorage.removeItem(ORGANIZER_UNLOCK_KEY);
    applyModeFromQuery();
    return;
  }

  const pin = window.prompt('Enter organizer PIN to unlock controls:');
  if (!pin) {
    return;
  }

  if (pin.trim() !== ORGANIZER_PIN) {
    wallModeHint.textContent = 'Reception Mode: Auto-refreshing notes display for screen projection. Incorrect PIN.';
    return;
  }

  sessionStorage.setItem(ORGANIZER_UNLOCK_KEY, 'true');
  applyModeFromQuery();
}

function guardBackNavigation(event) {
  if (!isOrganizerLocked()) {
    return;
  }

  event.preventDefault();
  wallModeHint.textContent = 'Reception Mode: Auto-refreshing notes display for screen projection. Unlock controls to navigate away.';
}

function createFloatingLetters() {
  const charset = 'LOVEHEARTS';

  for (let i = 0; i < 24; i++) {
    const node = document.createElement('span');
    node.className = 'float-letter';
    node.textContent = charset[Math.floor(Math.random() * charset.length)];
    node.style.left = `${Math.random() * 100}%`;
    node.style.fontSize = `${12 + Math.random() * 22}px`;
    node.style.animationDuration = `${11 + Math.random() * 14}s`;
    node.style.animationDelay = `${Math.random() * 10}s`;
    lettersLayer.appendChild(node);
  }
}

function getLoveNotes() {
  const notes = JSON.parse(localStorage.getItem(LOVE_NOTES_STORAGE_KEY) || '[]');
  return Array.isArray(notes) ? notes : [];
}

function saveLoveNotes(notes) {
  localStorage.setItem(
    LOVE_NOTES_STORAGE_KEY,
    JSON.stringify(notes.slice(0, LOVE_NOTES_MAX_ITEMS))
  );
}

function submitLoveNote() {
  const name = noteNameInput.value.trim();
  const message = noteMessageInput.value.trim();

  if (name.length < 2) {
    wallError.textContent = 'Please enter your name (at least 2 characters).';
    return;
  }

  if (message.length < 4) {
    wallError.textContent = 'Please write a longer note (at least 4 characters).';
    return;
  }

  if (message.length > 220) {
    wallError.textContent = 'Love note must be 220 characters or less.';
    return;
  }

  const notes = getLoveNotes();
  notes.unshift({
    id: Date.now(),
    name,
    message,
    createdAt: new Date().toISOString(),
  });

  saveLoveNotes(notes);
  renderMovingNotes();

  wallError.textContent = '';
  noteMessageInput.value = '';
}

function renderMovingNotes() {
  const notes = getLoveNotes().slice(0, LOVE_NOTES_VISIBLE_ITEMS);

  if (notes.length === 0) {
    const empty = '<div class="note-card note-card-empty">No notes yet. Be the first to share your wishes.</div>';
    notesTrackA.innerHTML = `${empty}${empty}`;
    notesTrackB.innerHTML = `${empty}${empty}`;
    return;
  }

  const markup = notes.map((note) => {
    const date = new Date(note.createdAt || Date.now());
    const dateText = date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return `
      <article class="note-card">
        <p class="note-card-name">${escapeHtml(note.name)}</p>
        <p class="note-card-text">"${escapeHtml(note.message)}"</p>
        <p class="note-card-time">${dateText}</p>
      </article>
    `;
  }).join('');

  notesTrackA.innerHTML = `${markup}${markup}`;
  notesTrackB.innerHTML = `${markup}${markup}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
