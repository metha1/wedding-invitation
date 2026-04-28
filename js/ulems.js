// Splash screen handler
const splashScreen = document.getElementById('splash-screen');
const mainContent = document.getElementById('main-content');
const openInvitationBtn = document.getElementById('open-invitation-btn');
const audio = document.getElementById('bgm');

// Auto-play music with user interaction
if (audio) {
  audio.play().catch(err => {
    console.log('Autoplay blocked, will play on button click');
  });
}

// Open invitation button
if (openInvitationBtn && splashScreen && mainContent) {
  openInvitationBtn.addEventListener('click', () => {
    splashScreen.style.display = 'none';
    mainContent.style.display = 'block';
    
    // Ensure audio plays after splash closes
    if (audio && audio.paused) {
      audio.play().catch(err => console.log('Play failed:', err));
    }

    // Initialize AOS after splash closes
    if (window.AOS) {
      AOS.init({ duration: 1000, once: false });
    }
  });
}

// Initialize AOS (Animate On Scroll)
if (window.AOS && mainContent.style.display !== 'none') {
  AOS.init({ duration: 1000, once: false });
}

// Get guest name from query param
const params = new URLSearchParams(location.search);
const guestName = params.get('to') ? decodeURIComponent(params.get('to')) : null;

// Update greeting if guest name provided
if (guestName) {
  const greetingHero = document.getElementById('greeting-hero');
  const rsvpGreeting = document.getElementById('rsvp-greeting');
  const guestInput = document.getElementById('guest-name');
  const splashGuestName = document.getElementById('splash-guest-name');
  
  if (greetingHero) greetingHero.textContent = `For ${guestName},`;
  if (rsvpGreeting) rsvpGreeting.textContent = `Thank you ${guestName}, for visiting our wedding invitation.`;
  if (guestInput) guestInput.value = guestName;
  if (splashGuestName) {
    splashGuestName.textContent = `Dear ${guestName},`;
    splashGuestName.style.display = 'block';
  }
}

// Countdown Timer - Fixed
function updateCountdown() {
  const weddingDate = new Date('2026-05-29T12:00:00').getTime();
  const now = new Date().getTime();
  const distance = weddingDate - now;

  const dayEl = document.getElementById('day');
  const hourEl = document.getElementById('hour');
  const minuteEl = document.getElementById('minute');
  const secondEl = document.getElementById('second');

  if (!dayEl || !hourEl || !minuteEl || !secondEl) {
    console.warn('Countdown elements not found');
    return;
  }

  if (distance < 0) {
    dayEl.textContent = '0';
    hourEl.textContent = '0';
    minuteEl.textContent = '0';
    secondEl.textContent = '0';
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  dayEl.textContent = String(days).padStart(1, '0');
  hourEl.textContent = String(hours).padStart(2, '0');
  minuteEl.textContent = String(minutes).padStart(2, '0');
  secondEl.textContent = String(seconds).padStart(2, '0');
}

// Run countdown after short delay to ensure DOM is ready
setTimeout(() => {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}, 100);

// Music Control
const musicBtn = document.getElementById('play-music');

if (musicBtn && audio) {
  musicBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(err => console.log('Autoplay blocked:', err));
      musicBtn.innerHTML = '<i class="fas fa-pause me-2"></i>Pause Music';
    } else {
      audio.pause();
      musicBtn.innerHTML = '<i class="fas fa-music me-2"></i>Play Music';
    }
  });
}

// Confetti Animation
const confettiBtn = document.getElementById('confetti-btn');
if (confettiBtn) {
  confettiBtn.addEventListener('click', () => {
    if (window.confetti) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        window.confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        }));
      }, 250);
    }
  });
}

// RSVP Form Handler
const rsvpForm = document.getElementById('rsvp-form');
if (rsvpForm) {
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('guest-name').value;
    const count = document.getElementById('guest-count').value;
    const attendance = document.getElementById('attendance').value;
    const message = document.getElementById('message').value;

    const rsvp = {
      name,
      count,
      attendance,
      message,
      timestamp: new Date().toISOString()
    };

    try {
      const rsvps = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
      rsvps.push(rsvp);
      localStorage.setItem('wedding_rsvps', JSON.stringify(rsvps));

      // Send RSVP data to Netlify function
      fetch('/.netlify/functions/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rsvp)
      }).catch(err => console.log('Server notification failed, but RSVP saved locally'));
    } catch (err) {
      console.error('RSVP save error:', err);
    }

    alert(`Thank you ${name}! We have received your RSVP.`);
    
    // Trigger confetti
    if (document.getElementById('confetti-btn')) {
      document.getElementById('confetti-btn').click();
    }

    rsvpForm.reset();
  });
}
