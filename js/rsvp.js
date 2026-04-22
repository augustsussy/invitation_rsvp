// ── RSVP STATE ──
let selectedAttendance = null;

// ── ATTENDANCE TOGGLE ──
function selectAttendance(choice) {
  selectedAttendance = choice;

  const btnAccept  = document.getElementById('btnAccept');
  const btnDecline = document.getElementById('btnDecline');
  const seatField  = document.getElementById('seatField');

  btnAccept.classList.toggle('selected', choice === 'accept');
  btnDecline.classList.toggle('selected', choice === 'decline');

  // Hide seat selector if declining
  if (choice === 'decline') {
    seatField.classList.add('hidden');
    document.getElementById('seatSelect').value = '';
  } else {
    seatField.classList.remove('hidden');
  }
}

// ── FORM VALIDATION ──
function validateForm() {
  const name    = document.getElementById('guestName').value.trim();
  const seat    = document.getElementById('seatSelect').value;
  const error   = document.getElementById('rsvpError');

  if (!name) {
    error.textContent = '✦ Please enter your full name.';
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

  error.textContent = '';
  return true;
}

// ── SUBMIT ──
async function submitRSVP() {
  if (!validateForm()) return;

  const submitBtn  = document.getElementById('rsvpSubmit');
  const submitText = document.getElementById('rsvpSubmitText');

  const name    = document.getElementById('guestName').value.trim();
  const seat    = document.getElementById('seatSelect').value || null;
  const message = document.getElementById('guestMessage').value.trim() || null;

  // Loading state
  submitBtn.disabled = true;
  submitText.textContent = 'Sending...';

  try {
    // ── SUPABASE INSERT ──
    // Uncomment this block once you have Supabase connected:
    //
    // const { error } = await supabase
    //   .from('rsvps')
    //   .insert([{
    //     name,
    //     attendance: selectedAttendance,
    //     seat,
    //     message,
    //   }]);
    //
    // if (error) throw error;

    // Simulate network delay for now (remove once Supabase is live)
    await new Promise(resolve => setTimeout(resolve, 800));

    // ── SHOW CONFIRMATION ──
    showConfirmation(name, selectedAttendance);

  } catch (err) {
    console.error('RSVP error:', err);
    document.getElementById('rsvpError').textContent = '✦ Something went wrong. Please try again.';
    submitBtn.disabled = false;
    submitText.textContent = 'Send with Love ◆';
  }
}

// ── CONFIRMATION STATE ──
function showConfirmation(name, attendance) {
  const formWrap   = document.getElementById('rsvpFormWrap');
  const confirm    = document.getElementById('rsvpConfirm');
  const confirmName  = document.getElementById('confirmName');
  const confirmTitle = document.getElementById('confirmTitle');
  const confirmMsg   = document.getElementById('confirmMessage');

  confirmName.textContent = name;

  if (attendance === 'decline') {
    confirmTitle.textContent = "We'll miss you.";
    confirmMsg.innerHTML = `Thank you, <strong>${name}</strong>.<br>Your response has been received.<br>We'll keep you in our hearts.`;
    confirm.classList.add('declined');
  } else {
    confirmTitle.textContent = "We'll see you there!";
    confirmMsg.innerHTML = `Thank you, <strong>${name}</strong>.<br>Your RSVP has been received.<br>We can't wait to celebrate with you.`;
  }

  // Swap form for confirmation
  formWrap.style.display = 'none';
  confirm.classList.add('visible');

  // Smooth scroll to confirmation
  document.getElementById('rsvp').scrollIntoView({ behavior: 'smooth' });
}