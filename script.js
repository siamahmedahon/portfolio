'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const body = document.body;

  /* ── THEME CONFIG ── */
  const THEMES = ['theme-dark','theme-minimal','theme-glass','theme-neo','theme-liquid'];
  const CURSOR_COLORS = {
    'theme-dark':   'rgba(58,141,255,0.12)',
    'theme-minimal':'rgba(0,0,0,0.05)',
    'theme-glass':  'rgba(167,139,250,0.12)',
    'theme-neo':    'rgba(255,77,0,0.08)',
    'theme-liquid': 'rgba(255,111,216,0.12)'
  };

  /* ─────────────────────────────────────────────────────
     1. THEME SWITCHER (side nav orb)
  ───────────────────────────────────────────────────── */
  const snThemeBtn      = document.getElementById('snThemeBtn');
  const snThemeDropdown = document.getElementById('snThemeDropdown');
  const snTdOpts        = document.querySelectorAll('.sn-td-opt');

  function applyTheme(theme) {
    THEMES.forEach(t => body.classList.remove(t));
    body.classList.add(theme);
    snTdOpts.forEach(o => o.classList.toggle('active', o.dataset.theme === theme));
    localStorage.setItem('aa-theme', theme);
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow) {
      const c = CURSOR_COLORS[theme] || CURSOR_COLORS['theme-dark'];
      cursorGlow.style.background = `radial-gradient(circle, ${c} 0%, transparent 70%)`;
    }
    // Re-trigger skill bars
    document.querySelectorAll('.skill-card.visible .skill-fill').forEach(f => {
      const m = f.getAttribute('style').match(/--w:\s*([^;]+)/);
      if (m) { f.style.width = '0'; setTimeout(() => { f.style.width = m[1].trim(); }, 60); }
    });
  }

  const saved = localStorage.getItem('aa-theme') || 'theme-dark';
  applyTheme(saved);

  snThemeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = snThemeDropdown.classList.toggle('open');
    snThemeBtn.classList.toggle('open', open);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.sn-theme-wrap')) {
      snThemeDropdown?.classList.remove('open');
      snThemeBtn?.classList.remove('open');
    }
  });

  snTdOpts.forEach(opt => opt.addEventListener('click', () => applyTheme(opt.dataset.theme)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      snThemeDropdown?.classList.remove('open');
      snThemeBtn?.classList.remove('open');
    }
  });


  /* ─────────────────────────────────────────────────────
     2. SCROLL PROGRESS (right panel)
  ───────────────────────────────────────────────────── */
  const progressBar = document.getElementById('scrollProgress');
  const rightPanel  = document.getElementById('rightPanel');

  function updateProgress() {
    if (!progressBar || !rightPanel) return;
    const max = rightPanel.scrollHeight - rightPanel.clientHeight;
    progressBar.style.width = max > 0 ? (rightPanel.scrollTop / max * 100) + '%' : '0%';
  }


  /* ─────────────────────────────────────────────────────
     3. ACTIVE SIDE NAV LINK (based on right panel scroll)
  ───────────────────────────────────────────────────── */
  const snLinks  = document.querySelectorAll('.sn-link');
  const sections = document.querySelectorAll('.right-panel section[id], .right-panel .logo-strip-section[id]');

  function updateActiveLink() {
    if (!rightPanel) return;
    const scrollTop = rightPanel.scrollTop + 140;
    sections.forEach(s => {
      const top = s.offsetTop;
      const bot = top + s.offsetHeight;
      if (scrollTop >= top && scrollTop < bot) {
        snLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + s.id));
      }
    });
  }


  /* ─────────────────────────────────────────────────────
     4. TIMELINE LINE DRAW
  ───────────────────────────────────────────────────── */
  function updateTimelineLine() {
    const fill    = document.getElementById('timelineFill');
    const section = document.getElementById('experience');
    if (!fill || !section || !rightPanel) return;
    const panelTop  = rightPanel.scrollTop;
    const secTop    = section.offsetTop;
    const secH      = section.offsetHeight;
    const vh        = rightPanel.clientHeight;
    const progress  = Math.max(0, Math.min(1, (panelTop + vh - secTop) / (vh + secH * 0.5)));
    fill.style.height = (progress * 100) + '%';
  }


  /* ─────────────────────────────────────────────────────
     5. SCROLL TO TOP BUTTON
  ───────────────────────────────────────────────────── */
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  function scrollToTop() {
    const rp = document.getElementById('rightPanel');
    const isMobile = window.innerWidth <= 860;
    if (rp && !isMobile) {
      rp.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function checkScrollTopVisibility() {
    const rp = document.getElementById('rightPanel');
    const isMobile = window.innerWidth <= 860;
    const st = (rp && !isMobile) ? rp.scrollTop : window.scrollY;
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', st > 300);
  }

  scrollTopBtn?.addEventListener('click', scrollToTop);


  /* ─────────────────────────────────────────────────────
     6. RIGHT PANEL SCROLL HANDLER
  ───────────────────────────────────────────────────── */
  function onRightScroll() {
    updateProgress();
    updateActiveLink();
    updateTimelineLine();
    checkScrollTopVisibility();
  }

  if (rightPanel) {
    rightPanel.addEventListener('scroll', onRightScroll, { passive: true });
  }

  // Also handle mobile (window scroll)
  window.addEventListener('scroll', () => {
    const isMobile = window.innerWidth <= 860;
    if (isMobile) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressBar) progressBar.style.width = max > 0 ? (window.scrollY / max * 100) + '%' : '0%';
    }
    checkScrollTopVisibility();
  }, { passive: true });


  /* ─────────────────────────────────────────────────────
     7. SMOOTH ANCHOR SCROLLING (right panel aware)
  ───────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id     = a.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();

      if (rightPanel && window.innerWidth > 860) {
        // Desktop: scroll inside right panel
        const offset = target.offsetTop - 40;
        rightPanel.scrollTo({ top: offset, behavior: 'smooth' });
      } else {
        // Mobile: normal window scroll
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 70,
          behavior: 'smooth'
        });
      }

      // Close mobile nav if open
      mobHamburger?.classList.remove('open');
      mobNavOverlay?.classList.remove('open');
      body.style.overflow = '';
    });
  });


  /* ─────────────────────────────────────────────────────
     8. MOBILE HAMBURGER
  ───────────────────────────────────────────────────── */
  const mobHamburger  = document.getElementById('mobHamburger');
  const mobNavOverlay = document.getElementById('mobNavOverlay');

  mobHamburger?.addEventListener('click', () => {
    const open = mobHamburger.classList.toggle('open');
    mobNavOverlay?.classList.toggle('open', open);
    body.style.overflow = open ? 'hidden' : '';
  });


  /* ─────────────────────────────────────────────────────
     9. INTERSECTION OBSERVERS (right panel root)
  ───────────────────────────────────────────────────── */
  const obsOpts = (threshold) => ({
    root: window.innerWidth > 860 ? rightPanel : null,
    threshold,
    rootMargin: '0px 0px -40px 0px'
  });

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, obsOpts(0.1));
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  const cardObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, obsOpts(0.08));
  document.querySelectorAll('.reveal-card').forEach(el => cardObs.observe(el));

  const slideObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, obsOpts(0.1));
  document.querySelectorAll('.reveal-slide').forEach(el => slideObs.observe(el));

  // Section title headings
  const headingObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.opacity   = '1';
      e.target.style.transform = 'translateY(0) scale(1)';
      headingObs.unobserve(e.target);
    });
  }, obsOpts(0.2));
  document.querySelectorAll('.section-title').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(22px) scale(0.97)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    headingObs.observe(el);
  });

  // About heading line stagger
  const aboutHdObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); aboutHdObs.unobserve(e.target); } });
  }, obsOpts(0.3));
  document.querySelectorAll('.about-heading').forEach(el => aboutHdObs.observe(el));


  /* ─────────────────────────────────────────────────────
     10. SKILL BARS
  ───────────────────────────────────────────────────── */
  const skillObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const fill = e.target.querySelector('.skill-fill');
      if (fill) {
        const m = fill.getAttribute('style').match(/--w:\s*([^;]+)/);
        if (m) setTimeout(() => { fill.style.width = m[1].trim(); }, 300);
      }
      skillObs.unobserve(e.target);
    });
  }, obsOpts(0.3));
  document.querySelectorAll('.skill-card').forEach(c => skillObs.observe(c));


  /* ─────────────────────────────────────────────────────
     11. COUNTER ANIMATION (left panel stats)
  ───────────────────────────────────────────────────── */
  function animateCounter(el) {
    const target   = parseFloat(el.dataset.target) || 0;
    const suffix   = el.dataset.suffix || '';
    const duration = 1600;
    const start    = performance.now();
    function tick(now) {
      const t     = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val   = eased * target;
      el.textContent = (target >= 10 ? Math.round(val) : val.toFixed(1).replace('.0','')) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Counters are in left panel — observe them from window
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      animateCounter(e.target);
      counterObs.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));


  /* ─────────────────────────────────────────────────────
     12. DUAL CURSOR
  ───────────────────────────────────────────────────── */
  const cursorGlow = document.getElementById('cursorGlow');
  const cursorDot  = document.getElementById('cursorDot');
  let mx = 0, my = 0, gx = 0, gy = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (cursorGlow) cursorGlow.style.opacity = '1';
    if (cursorDot)  { cursorDot.style.opacity = '1'; cursorDot.style.left = mx + 'px'; cursorDot.style.top = my + 'px'; }
  });
  document.addEventListener('mouseleave', () => {
    if (cursorGlow) cursorGlow.style.opacity = '0';
    if (cursorDot)  cursorDot.style.opacity  = '0';
  });
  document.querySelectorAll('a, button, .bento-card, .skill-card, .cert-card, .timeline-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursorDot?.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorDot?.classList.remove('hovering'));
  });
  (function animateGlow() {
    if (cursorGlow) {
      gx += (mx - gx) * 0.07; gy += (my - gy) * 0.07;
      cursorGlow.style.left = gx + 'px'; cursorGlow.style.top = gy + 'px';
    }
    requestAnimationFrame(animateGlow);
  })();


  /* ─────────────────────────────────────────────────────
     13. FLOATING PARTICLES (left panel)
  ───────────────────────────────────────────────────── */
  const particlesEl = document.getElementById('particles');
  if (particlesEl) {
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 3 + 1;
      p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;animation-duration:${Math.random()*10+8}s;animation-delay:${Math.random()*12}s`;
      particlesEl.appendChild(p);
    }
  }


  /* ─────────────────────────────────────────────────────
     14. CARD 3D TILT
  ───────────────────────────────────────────────────── */
  document.querySelectorAll('.bento-card, .skill-card, .cert-card, .timeline-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (body.classList.contains('theme-neo')) return;
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
      const ry = ((e.clientX - r.left) / r.width  - 0.5) *  6;
      card.style.transform  = `translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.transition = 'transform 0.08s linear';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)';
    });
  });


  /* ─────────────────────────────────────────────────────
     15. MARQUEE PAUSE ON HOVER
  ───────────────────────────────────────────────────── */
  const logoTrack = document.querySelector('.logo-strip-track');
  logoTrack?.closest('.logo-strip-track-wrap')?.addEventListener('mouseenter', () => { if (logoTrack) logoTrack.style.animationPlayState = 'paused'; });
  logoTrack?.closest('.logo-strip-track-wrap')?.addEventListener('mouseleave', () => { if (logoTrack) logoTrack.style.animationPlayState = 'running'; });


  /* ─────────────────────────────────────────────────────
     16. CONTACT FORM — Formspree
     Setup (30 seconds):
     1. Go to https://formspree.io → Sign up free
     2. Click "New Form" → enter your email → copy the form ID
     3. In index.html find the form's action attribute and
        replace YOUR_FORM_ID with your actual ID (e.g. xpwzgkqr)
        action="https://formspree.io/f/xpwzgkqr"
  ───────────────────────────────────────────────────── */
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = form.querySelector('#name').value.trim();
    const email   = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    // Validation
    if (!name || !email || !message) {
      showStatus('⚠ Please fill in all fields.', 'error'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus('⚠ Please enter a valid email address.', 'error'); return;
    }

    // Sending state
    const origHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending…</span>';
    submitBtn.style.opacity = '0.7';
    formStatus.className = 'form-status';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        showStatus('✓ Message sent! I\'ll get back to you soon.', 'success');
        form.reset();
      } else {
        const data = await response.json();
        const msg  = data?.errors?.map(e => e.message).join(', ') || 'Something went wrong.';
        showStatus('✗ ' + msg, 'error');
      }
    } catch {
      showStatus('✗ Network error. Please try again or email me directly.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origHTML;
      submitBtn.style.opacity = '1';
    }
  });

  function showStatus(msg, type) {
    if (!formStatus) return;
    formStatus.textContent = msg;
    formStatus.className = `form-status ${type}`;
  }


  /* ─────────────────────────────────────────────────────
     17. TITLE CHIP ENTRANCE
  ───────────────────────────────────────────────────── */
  const chipStyle = document.createElement('style');
  chipStyle.textContent = `@keyframes chipIn{from{opacity:0;transform:translateY(8px) scale(0.88)}to{opacity:1;transform:translateY(0) scale(1)}}`;
  document.head.appendChild(chipStyle);
  document.querySelectorAll('.title-chip').forEach((c, i) => {
    c.style.opacity = '0';
    c.style.animation = `chipIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards`;
    c.style.animationDelay = `${0.6 + i * 0.12}s`;
  });


  /* ─────────────────────────────────────────────────────
     18. LEFT PANEL CONTENT ENTRANCE
  ───────────────────────────────────────────────────── */
  document.querySelectorAll('.lp-content > *').forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.6s ease ${0.1 + i * 0.09}s, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${0.1 + i * 0.09}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    }));
  });


  /* ─────────────────────────────────────────────────────
     PROJECT POPUP
  ───────────────────────────────────────────────────── */
  const popup         = document.getElementById('projectPopup');
  const popupBackdrop = document.getElementById('projectPopupBackdrop');
  const ppImage       = document.getElementById('ppImage');
  const ppType        = document.getElementById('ppType');
  const ppTitle       = document.getElementById('ppTitle');
  const ppDesc        = document.getElementById('ppDesc');
  const ppTags        = document.getElementById('ppTags');
  const ppClose       = document.getElementById('ppClose');

  function openPopup(card) {
    const data = card.dataset;
    ppImage.src       = data.img  || '';
    ppImage.alt       = data.title || '';
    ppType.textContent  = data.type  || '';
    ppTitle.textContent = data.title || '';
    ppDesc.textContent  = data.desc  || '';

    // Build tags
    ppTags.innerHTML = '';
    (data.tags || '').split('·').forEach(tag => {
      const span = document.createElement('span');
      span.className = 'pp-tag';
      span.textContent = tag.trim();
      ppTags.appendChild(span);
    });

    popup?.classList.add('open');
    popupBackdrop?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    popup?.classList.remove('open');
    popupBackdrop?.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Open on View button click
  document.querySelectorAll('.bento-popup-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.bento-card');
      if (card) openPopup(card);
    });
  });

  // Close on X button
  ppClose?.addEventListener('click', closePopup);

  // Close on backdrop click
  popupBackdrop?.addEventListener('click', closePopup);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopup();
  });

  /* ── INIT ── */
  updateProgress();
  updateActiveLink();
  console.log('%c[AA] Portfolio — Split Layout loaded ✓', 'color:#3A8DFF;font-weight:bold;font-family:monospace');
});
/* ─────────────────────────────────────────────────────
   CERTIFICATE PHOTO CAROUSEL
───────────────────────────────────────────────────── */
(function () {
  const carousel  = document.getElementById('certCarousel');
  const dotsWrap  = document.getElementById('certDots');
  const prevBtn   = document.getElementById('certPrev');
  const nextBtn   = document.getElementById('certNext');
  if (!carousel) return;

  const slides    = Array.from(carousel.querySelectorAll('.cert-slide'));
  let current     = 0;
  let autoTimer   = null;
  let isDragging  = false;
  let dragStartX  = 0;
  let dragScrollX = 0;
  const INTERVAL  = 3200; // ms between auto-advances

  /* ── Build dots ── */
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'cert-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to certificate ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.querySelectorAll('.cert-dot'));

  /* ── Core: go to slide index ── */
  function goTo(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    // Scroll so active slide is centred
    const slide      = slides[current];
    const trackW     = carousel.offsetWidth;
    const slideLeft  = slide.offsetLeft;
    const slideW     = slide.offsetWidth;
    carousel.scrollTo({
      left: slideLeft - trackW / 2 + slideW / 2,
      behavior: 'smooth'
    });
  }

  /* ── Auto-advance ── */
  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), INTERVAL);
  }
  function stopAuto()  { clearInterval(autoTimer); }

  /* ── Arrows ── */
  prevBtn?.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  /* ── Pause on hover ── */
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  /* ── Drag / swipe ── */
  carousel.addEventListener('mousedown', (e) => {
    isDragging  = true;
    dragStartX  = e.pageX;
    dragScrollX = carousel.scrollLeft;
    stopAuto();
  });
  carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    carousel.scrollLeft = dragScrollX - (e.pageX - dragStartX);
  });
  carousel.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = dragStartX - e.pageX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    startAuto();
  });
  carousel.addEventListener('mouseleave', () => { isDragging = false; });

  /* Touch swipe */
  let touchStartX = 0;
  carousel.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
  carousel.addEventListener('touchend',   (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    startAuto();
  }, { passive: true });

  /* ── Init ── */
  goTo(0);
  startAuto();
})();
/* ─────────────────────────────────────────────────────
   MOBILE VIBRATION ON SCROLL
───────────────────────────────────────────────────── */
(function () {
  if (!navigator.vibrate) return; // silently skip if not supported

  const isMobile = () => window.innerWidth <= 860;
  let lastSection = null;

  function onScrollVibrate() {
    if (!isMobile()) return;

    // Vibrate on section change
    const scrollTop = (rightPanel && window.innerWidth > 860)
      ? rightPanel.scrollTop
      : window.scrollY;

    document.querySelectorAll('section[id]').forEach(section => {
      const top = section.offsetTop;
      const bot = top + section.offsetHeight;
      if (scrollTop + 160 >= top && scrollTop + 160 < bot) {
        if (lastSection !== section.id) {
          lastSection = section.id;
          navigator.vibrate(18); // short tap pulse on section entry
        }
      }
    });
  }

  // Attach to both right panel and window scroll
  const rightPanel = document.getElementById('rightPanel');
  if (rightPanel) rightPanel.addEventListener('scroll', onScrollVibrate, { passive: true });
  window.addEventListener('scroll', onScrollVibrate, { passive: true });
})();