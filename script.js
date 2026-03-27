/* =========================================================
    Vanisha S — Portfolio Script
    Features: typing effect · scroll reveal · navbar · 
              hamburger menu · contact form · visitor counter
    ========================================================= */

'use strict';

import { analytics, db } from './firebase-config.js';
import { logEvent } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ---------------------------------------------------------
   1. TYPING ANIMATION
   --------------------------------------------------------- */
const ROLES = [
  'BCA Student',
  'Programmer',
  'Athletics Enthusiast',
  'Tech Learner',
];

const typedEl  = document.getElementById('typed');
let roleIndex  = 0;
let charIndex  = 0;
let isDeleting = false;

function type() {
  const current = ROLES[roleIndex];
  const displayed = isDeleting
    ? current.slice(0, charIndex - 1)
    : current.slice(0, charIndex + 1);

  typedEl.textContent = displayed;
  isDeleting ? charIndex-- : charIndex++;

  let delay = isDeleting ? 60 : 110;

  if (!isDeleting && charIndex === current.length) {
    delay = 1800; // pause at end
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex  = (roleIndex + 1) % ROLES.length;
    delay = 400;
  }

  setTimeout(type, delay);
}

type();

/* ---------------------------------------------------------
   2. NAVBAR — scroll styling + active link
   --------------------------------------------------------- */
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function onScroll() {
  // Scrolled style
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  // Active nav link based on scroll position
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 90;
    if (window.scrollY >= top) current = sec.id;
  });

  navLinks.forEach(link => {
    link.classList.toggle(
      'active',
      link.getAttribute('href') === `#${current}`
    );
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

/* ---------------------------------------------------------
   3. HAMBURGER MENU
   --------------------------------------------------------- */
const hamburger  = document.getElementById('hamburger');
const navLinkUl  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinkUl.classList.toggle('open');
});

// Close on link click (mobile)
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinkUl.classList.remove('open');
  });
});

/* ---------------------------------------------------------
   4. SCROLL REVEAL  (Intersection Observer)
   --------------------------------------------------------- */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => el.classList.add('visible'), delay);
      revealObserver.unobserve(el);
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach(el => revealObserver.observe(el));

/* ---------------------------------------------------------
   5. SKILL BAR ANIMATION  (triggered on scroll)
   --------------------------------------------------------- */
const skillFills = document.querySelectorAll('.skill-fill');

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill  = entry.target;
      const width = fill.dataset.width || '0';
      fill.style.width = width + '%';
      skillObserver.unobserve(fill);
    });
  },
  { threshold: 0.5 }
);

skillFills.forEach(el => skillObserver.observe(el));

/* ---------------------------------------------------------
   6. CONTACT FORM  →  Flask /api/contact
   --------------------------------------------------------- */
const form       = document.getElementById('contactForm');
const submitBtn  = document.getElementById('submitBtn');
const btnText    = document.getElementById('btnText');
const btnIcon    = document.getElementById('btnIcon');
const btnSpinner = document.getElementById('btnSpinner');
const formStatus = document.getElementById('formStatus');

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.textContent = loading ? 'Sending…' : 'Send Message';
  btnIcon.classList.toggle('hidden', loading);
  btnSpinner.classList.toggle('hidden', !loading);
}

function showStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className   = `form-status ${type}`;
  formStatus.classList.remove('hidden');
  setTimeout(() => formStatus.classList.add('hidden'), 5000);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = document.getElementById('fname').value.trim();
  const email   = document.getElementById('femail').value.trim();
  const message = document.getElementById('fmessage').value.trim();

  if (!name || !email || !message) {
    showStatus('Please fill in all fields.', 'error');
    return;
  }

  setLoading(true);

  try {
    // 1. Save to Firestore
    await addDoc(collection(db, 'contacts'), {
      name,
      email,
      message,
      submittedAt: serverTimestamp()
    });

    // 2. Success Feedback
    showStatus('Message sent! I\'ll get back to you soon. 🎉', 'success');
    form.reset();
    
    // 3. Track Firebase Analytics
    logEvent(analytics, 'contact_form_submission', {
      method: 'firestore'
    });

  } catch (err) {
    console.error("Firestore Error:", err);
    showStatus('Something went wrong with the connection. Try again.', 'error');
  } finally {
    setLoading(false);
  }
});

/* ---------------------------------------------------------
   7. VISITOR COUNTER  →  Firebase Firestore
   --------------------------------------------------------- */
async function loadVisitorCount() {
  const visitorCountEl = document.getElementById('visitorCount');
  const statsDocRef    = doc(db, 'stats', 'visitors');

  try {
    // 1. Atomically increment the count (or it fails if doc doesn't exist)
    await updateDoc(statsDocRef, {
      count: increment(1)
    });
  } catch (err) {
    // 2. If it fails (doc doesn't exist), initialize it
    await setDoc(statsDocRef, { count: 1 });
  }

  // 3. Fetch the updated count to display
  try {
    const snap = await getDoc(statsDocRef);
    if (snap.exists()) {
      visitorCountEl.textContent = snap.data().count.toLocaleString();
    }
  } catch (err) {
    console.error("Failed to load visitor count:", err);
    visitorCountEl.textContent = '—';
  }
}

loadVisitorCount();

/* ---------------------------------------------------------
   8. SMOOTH-SCROLL for anchor links (fallback for old browsers)
   --------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
