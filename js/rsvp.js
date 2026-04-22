// ── RSVP STATE ──
let selectedAttendance = null;

const RSVP_STORAGE_KEY = 'wedding_rsvps';
const GUEST_LIST_STORAGE_KEY = 'wedding_guest_list';
const USED_CODES_STORAGE_KEY = 'wedding_used_invite_codes';

const EVENT_TITLE = 'Julie and Arvin Wedding';
const EVENT_LOCATION = 'San Agustin Church, Cavite';
const EVENT_DETAILS = 'Wedding ceremony and celebration.';
const EVENT_START_ISO = '2026-12-29T14:00:00+08:00';
const EVENT_END_ISO = '2026-12-29T18:00:00+08:00';

// Replace these defaults with your real guest list.
const DEFAULT_GUEST_LIST = [
  { code: 'JULIE01', name: 'Julie Dizon', plusOnes: 1 },
  { code: 'ARVIN01', name: 'Arvin Llamera', plusOnes: 1 },
  { code: 'ROSES01', name: 'Guest Roses 1', plusOnes: 0 },
  { code: 'ROSES02', name: 'Guest Roses 2', plusOnes: 0 },
  { code: 'PEONY01', name: 'Guest Peonies 1', plusOnes: 0 },
  { code: 'PEONY02', name: 'Guest Peonies 2', plusOnes: 0 },
  { code: 'JASMN01', name: 'Guest Jasmine 1', plusOnes: 0 },
  { code: 'JASMN02', name: 'Guest Jasmine 2', plusOnes: 0 },
  { code: 'ORCHD01', name: 'Guest Orchids 1', plusOnes: 0 },
  { code: 'LILY01', name: 'Guest Lily 1', plusOnes: 0 },
];

function normalizeName(value) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizeCode(value) {
  return value.trim().toUpperCase();
}

function normalizePlusOnes(value) {
  const parsed = Number.parseInt(String(value ?? 0), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function getGuestList() {
  const imported = JSON.parse(localStorage.getItem(GUEST_LIST_STORAGE_KEY) || 'null');
  return Array.isArray(imported) && imported.length > 0 ? imported : DEFAULT_GUEST_LIST;
}

function findGuestByCode(code) {
  return getGuestList().find((guest) => normalizeCode(guest.code || '') === code) || null;
}

function getUsedInviteCodes() {
  return JSON.parse(localStorage.getItem(USED_CODES_STORAGE_KEY) || '{}');
}

function isInviteCodeUsed(code) {
  const usedCodes = getUsedInviteCodes();
  return Boolean(usedCodes[code]);
}

function markInviteCodeUsed(code, entryId) {
  const usedCodes = getUsedInviteCodes();
  usedCodes[code] = { entryId, usedAt: new Date().toISOString() };
  localStorage.setItem(USED_CODES_STORAGE_KEY, JSON.stringify(usedCodes));
}

function importGuestList(list) {
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('Guest list must be a non-empty array.');
  }

  const normalized = list.map((guest) => ({
    code: normalizeCode(String(guest.code || '')),
    name: String(guest.name || '').trim(),
    plusOnes: normalizePlusOnes(guest.plusOnes),
  }));

  const hasInvalid = normalized.some((guest) => !guest.code || !guest.name);
  if (hasInvalid) {
    throw new Error('Each guest must include both code and name.');
  }

  localStorage.setItem(GUEST_LIST_STORAGE_KEY, JSON.stringify(normalized));
}

function resetImportedGuestList() {
  localStorage.removeItem(GUEST_LIST_STORAGE_KEY);
}

function resetUsedInviteCodes() {
  localStorage.removeItem(USED_CODES_STORAGE_KEY);
}

function toGoogleDateString(isoString) {
  return new Date(isoString).toISOString().replace(/[-:]/g, '').replace('.000', '');
}

function buildGoogleCalendarLink() {
  const start = toGoogleDateString(EVENT_START_ISO);
  const end = toGoogleDateString(EVENT_END_ISO);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: EVENT_TITLE,
    dates: `${start}/${end}`,
    details: EVENT_DETAILS,
    location: EVENT_LOCATION,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function updatePlusOneOptions() {
  const plusOneSelect = document.getElementById('plusOneCount');
  const plusOneHelper = document.getElementById('plusOneHelper');
  const inviteCodeInput = document.getElementById('inviteCode');

  if (!plusOneSelect || !plusOneHelper || !inviteCodeInput) {
    return;
  }

  const inviteCode = normalizeCode(inviteCodeInput.value || '');
  const guest = findGuestByCode(inviteCode);
  const maxPlusOnes = guest ? normalizePlusOnes(guest.plusOnes) : 0;
  const currentValue = normalizePlusOnes(plusOneSelect.value);

  plusOneSelect.innerHTML = '';
  for (let i = 0; i <= maxPlusOnes; i++) {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = i === 0 ? 'No plus one' : `+${i} guest${i > 1 ? 's' : ''}`;
    plusOneSelect.appendChild(option);
  }

  plusOneSelect.value = String(Math.min(currentValue, maxPlusOnes));
  plusOneSelect.disabled = !guest;

  if (!guest) {
    plusOneHelper.textContent = 'Enter a valid invite code to see plus-one allowance.';
    return;
  }

  plusOneHelper.textContent = maxPlusOnes > 0
    ? `This invite allows up to ${maxPlusOnes} plus one${maxPlusOnes > 1 ? 's' : ''}.`
    : 'This invite is for 1 guest only.';
}

window.importGuestList = importGuestList;
window.resetImportedGuestList = resetImportedGuestList;
window.resetUsedInviteCodes = resetUsedInviteCodes;

document.getElementById('inviteCode').addEventListener('input', updatePlusOneOptions);
updatePlusOneOptions();

// ── ATTENDANCE TOGGLE ──
function selectAttendance(choice) {
  selectedAttendance = choice;

  const btnAccept  = document.getElementById('btnAccept');
  const btnDecline = document.getElementById('btnDecline');
  const seatField  = document.getElementById('seatField');
  const plusOneField = document.getElementById('plusOneField');
  const mealField  = document.getElementById('mealField');

  btnAccept.classList.toggle('selected', choice === 'accept');
  btnDecline.classList.toggle('selected', choice === 'decline');

  if (choice === 'decline') {
    seatField.classList.add('hidden');
    plusOneField.classList.add('hidden');
    mealField.classList.add('hidden');
    document.getElementById('seatSelect').value = '';
    document.getElementById('plusOneCount').value = '0';
    document.getElementById('mealSelect').value = '';
    document.getElementById('allergyNotes').value = '';
    document.getElementById('songRequest').value = '';
  } else {
    seatField.classList.remove('hidden');
    plusOneField.classList.remove('hidden');
    mealField.classList.remove('hidden');
  }
}

// ── FORM VALIDATION ──
function validateForm() {
  const name = document.getElementById('guestName').value.trim();
  const inviteCode = normalizeCode(document.getElementById('inviteCode').value);
  const seat = document.getElementById('seatSelect').value;
  const plusOneCount = normalizePlusOnes(document.getElementById('plusOneCount').value);
  const meal = document.getElementById('mealSelect').value;
  const songRequest = document.getElementById('songRequest').value.trim();
  const error = document.getElementById('rsvpError');

  if (!name) {
    error.textContent = '✦ Please enter your full name.';
    return false;
  }
  if (!inviteCode) {
    error.textContent = '✦ Please enter your invite code.';
    return false;
  }

  const guest = findGuestByCode(inviteCode);
  if (!guest) {
    error.textContent = '✦ Invalid invite code. Please check and try again.';
    return false;
  }

  if (guest.name && normalizeName(guest.name) !== normalizeName(name)) {
    error.textContent = '✦ Name and invite code do not match.';
    return false;
  }

  const maxPlusOnes = normalizePlusOnes(guest.plusOnes);
  if (plusOneCount > maxPlusOnes) {
    error.textContent = `✦ This invite only allows up to ${maxPlusOnes} plus one${maxPlusOnes > 1 ? 's' : ''}.`;
    return false;
  }

  if (isInviteCodeUsed(inviteCode)) {
    error.textContent = '✦ This invite code has already submitted an RSVP.';
    return false;
  }

  if (!selectedAttendance) {
    error.textContent = '✦ Please select your attendance.';
    return false;
  }
  if (selectedAttendance === 'accept' && !seat) {
    error.textContent = '✦ Please choose your table and seat.';
    return false;
  }
  if (selectedAttendance === 'accept' && !meal) {
    error.textContent = '✦ Please choose your meal preference.';
    return false;
  }
  if (songRequest.length > 80) {
    error.textContent = '✦ Song request must be 80 characters or less.';
    return false;
  }

  error.textContent = '';
  return true;
}

// ── SAVE TO LOCALSTORAGE ──
function saveRSVP(entry) {
  const existing = JSON.parse(localStorage.getItem(RSVP_STORAGE_KEY) || '[]');
  existing.push(entry);
  localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(existing));
}

// ── SUBMIT ──
async function submitRSVP() {
  if (!validateForm()) return;

  const submitBtn  = document.getElementById('rsvpSubmit');
  const submitText = document.getElementById('rsvpSubmitText');

  const name = document.getElementById('guestName').value.trim();
  const inviteCode = normalizeCode(document.getElementById('inviteCode').value);
  const seat = document.getElementById('seatSelect').value || null;
  const plusOneCount = selectedAttendance === 'accept'
    ? normalizePlusOnes(document.getElementById('plusOneCount').value)
    : 0;
  const mealPreference = document.getElementById('mealSelect').value || null;
  const allergyNotes = document.getElementById('allergyNotes').value.trim() || null;
  const songRequest = document.getElementById('songRequest').value.trim() || null;
  const message = document.getElementById('guestMessage').value.trim() || null;

  submitBtn.disabled = true;
  submitText.textContent = 'Sending...';

  await new Promise(resolve => setTimeout(resolve, 800));

  const entry = {
    id: Date.now(),
    name,
    inviteCode,
    attendance: selectedAttendance,
    seat,
    plusOneCount,
    mealPreference,
    allergyNotes,
    songRequest,
    message,
    submittedAt: new Date().toISOString(),
  };

  saveRSVP(entry);
  markInviteCodeUsed(inviteCode, entry.id);
  showConfirmation(name, selectedAttendance);
}

// ── CONFIRMATION STATE ──
function showConfirmation(name, attendance) {
  const formWrap   = document.getElementById('rsvpFormWrap');
  const confirm    = document.getElementById('rsvpConfirm');
  const confirmName  = document.getElementById('confirmName');
  const confirmTitle = document.getElementById('confirmTitle');
  const confirmMsg   = document.getElementById('confirmMessage');
  const confirmCalendarBtn = document.getElementById('confirmCalendarBtn');
  const confirmLoveNotesBtn = document.getElementById('confirmLoveNotesBtn');

  confirmName.textContent = name;

  if (attendance === 'decline') {
    confirmTitle.textContent = "We'll miss you.";
    confirmMsg.innerHTML = `Thank you, <strong>${name}</strong>.<br>Your response has been received.<br>We'll keep you in our hearts.`;
    confirm.classList.add('declined');
    if (confirmCalendarBtn) {
      confirmCalendarBtn.classList.add('is-hidden');
    }
    if (confirmLoveNotesBtn) {
      confirmLoveNotesBtn.classList.add('is-hidden');
    }
  } else {
    confirm.classList.remove('declined');
    confirmTitle.textContent = "We'll see you there!";
    confirmMsg.innerHTML = `Thank you, <strong>${name}</strong>.<br>Your RSVP has been received.<br>We can't wait to celebrate with you.`;
    if (confirmCalendarBtn) {
      confirmCalendarBtn.href = buildGoogleCalendarLink();
      confirmCalendarBtn.classList.remove('is-hidden');
    }
    if (confirmLoveNotesBtn) {
      confirmLoveNotesBtn.href = `love-notes.html?name=${encodeURIComponent(name)}`;
      confirmLoveNotesBtn.classList.remove('is-hidden');
    }
  }

  formWrap.style.display = 'none';
  confirm.classList.add('visible');

  document.getElementById('rsvp').scrollIntoView({ behavior: 'smooth' });
}