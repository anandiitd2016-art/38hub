// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

navToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

siteNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ---------- Count-up stats, triggered when scrolled into view ----------
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';

  if (prefersReducedMotion) {
    el.textContent = target.toLocaleString('en-IN') + suffix;
    return;
  }

  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = Math.round(target * eased);
    el.textContent = value.toLocaleString('en-IN') + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.count').forEach(el => statObserver.observe(el));

// ---------- Reliable in-page anchor scrolling ----------
// Browsers only auto-scroll when the URL hash actually changes, so clicking
// a link to the same hash you're already on (e.g. #login twice) silently
// does nothing. Handling this ourselves fixes that, and also covers links
// added later by auth.js (like the dynamic Login/Logout button), since this
// listens on the whole page rather than on specific elements.
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const id = link.getAttribute('href').slice(1);
  const target = document.getElementById(id);
  if (!target) return;

  e.preventDefault();
  target.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start'
  });
  history.pushState(null, '', `#${id}`);
});

// ---------- Subtle ticket tilt on pointer move (desktop, motion allowed) ----------
const ticket = document.getElementById('ticket');
if (ticket && window.matchMedia('(hover: hover)').matches && !prefersReducedMotion) {
  const heroVisual = ticket.closest('.hero-visual');
  heroVisual.addEventListener('mousemove', (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ticket.style.transform = `rotate(${3 - x * 6}deg) translateY(${y * -6}px)`;
  });
  heroVisual.addEventListener('mouseleave', () => {
    ticket.style.transform = '';
  });
}
