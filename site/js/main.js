/* RümpelRoss – main.js · Vanilla, kein Framework, ~4 KB */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header Scroll-State ---------- */
  var header = document.getElementById('header');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Parallax Scrolling ---------- */
  if (!reduced) {
    var parallaxEls = document.querySelectorAll('[data-parallax]');
    var tickingParallax = false;
    function updateParallax() {
      tickingParallax = false;
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax-speed') || 0.08);
        var parent = el.parentElement;
        if (!parent) return;
        var parentRect = parent.getBoundingClientRect();
        if (parentRect.top < vh && parentRect.bottom > 0) {
          var yPos = -(parentRect.top * speed);
          el.style.transform = 'translate3d(0, ' + yPos + 'px, 0)';
        }
      });
    }
    window.addEventListener('scroll', function () {
      if (!tickingParallax) {
        tickingParallax = true;
        requestAnimationFrame(updateParallax);
      }
    }, { passive: true });
    setTimeout(updateParallax, 50);
  }

  /* ---------- Mobile Nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.querySelectorAll('.main-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Hero Wort-Stagger ---------- */
  var h1 = document.getElementById('heroTitle');
  if (h1 && !reduced) {
    var words = h1.textContent.trim().split(' ');
    h1.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      s.style.animationDelay = (0.08 * i) + 's';
      h1.appendChild(s);
      if (i < words.length - 1) {
        // Nach einem Wort mit Komma in die nächste Zeile umbrechen
        h1.appendChild(/,$/.test(w) ? document.createElement('br') : document.createTextNode(' '));
      }
    });
  }

  /* ---------- Scroll-Reveals (ein Observer für alles) ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    // Stagger innerhalb von Gruppen
    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
      group.querySelectorAll('[data-reveal]').forEach(function (el, i) {
        el.style.transitionDelay = (i * 0.09) + 's';
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Timeline: gelbe Linie füllt sich, Punkte aktivieren ---------- */
  var timeline = document.getElementById('timeline');
  if (timeline) {
    var progress = timeline.querySelector('.progress');
    var items = timeline.querySelectorAll('li');
    var ticking = false;
    function updateLine() {
      ticking = false;
      var rect = timeline.getBoundingClientRect();
      var vh = window.innerHeight;
      // Fortschritt: wie weit die Timeline durch den Viewport gescrollt ist
      var total = rect.height + vh * 0.4;
      var passed = Math.min(Math.max(vh * 0.7 - rect.top, 0), total);
      var pct = passed / total;
      if (progress) progress.style.height = (pct * 100) + '%';
      items.forEach(function (li) {
        var lr = li.getBoundingClientRect();
        li.classList.toggle('active', lr.top < vh * 0.7);
      });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateLine); }
    }, { passive: true });
    updateLine();
  }

  /* ---------- Vorher/Nachher-Slider ---------- */
  var slider = document.getElementById('baSlider');
  if (slider) {
    var after = slider.querySelector('.ba-after');
    var handle = slider.querySelector('.ba-handle');
    function setPos(clientX) {
      var r = slider.getBoundingClientRect();
      var pct = Math.min(Math.max((clientX - r.left) / r.width, 0.05), 0.95) * 100;
      after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
      handle.style.left = pct + '%';
    }
    var dragging = false;
    function start(e) { dragging = true; move(e); }
    function move(e) {
      if (!dragging) return;
      setPos(e.touches ? e.touches[0].clientX : e.clientX);
      e.preventDefault();
    }
    function end() { dragging = false; }
    slider.addEventListener('mousedown', start);
    slider.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    slider.addEventListener('mouseup', end);
    slider.addEventListener('touchend', end);
  }

  /* ---------- Kicker City Loop ---------- */
  var kickerWrapper = document.querySelector('.kicker-city-wrapper');
  if (kickerWrapper && !reduced) {
    var kickerItems = kickerWrapper.querySelectorAll('.kicker-city-item');
    var activeIndex = 0;

    function sizeWrapper(item) {
      kickerWrapper.style.width = item.offsetWidth + 'px';
      // height is handled by CSS (1.15em); don't override
    }

    function rotateCity() {
      var current = kickerItems[activeIndex];
      activeIndex = (activeIndex + 1) % kickerItems.length;
      var next = kickerItems[activeIndex];

      // Snap next to "below" position, disable transition momentarily
      next.style.transition = 'none';
      next.style.opacity = '0';
      next.style.transform = 'translateY(100%)';
      next.classList.remove('active', 'exit');

      // Force reflow
      void next.offsetHeight;

      // Now let CSS transitions run: slide next in
      next.style.transition = '';
      next.classList.add('active');
      // Clear inline overrides so CSS .active rules take over
      next.style.opacity = '';
      next.style.transform = '';

      // Slide current out via .exit class
      current.classList.remove('active');
      current.classList.add('exit');

      // Resize wrapper to new city width
      sizeWrapper(next);

      // Cleanup: remove .exit and inline styles from old item
      setTimeout(function () {
        current.classList.remove('exit');
        current.style.transform = '';
        current.style.opacity = '';
        current.style.transition = '';
      }, 600);
    }

    // Init: size wrapper to the first active city as soon as fonts/layout settle
    var activeItem = kickerWrapper.querySelector('.kicker-city-item.active');
    if (activeItem) {
      requestAnimationFrame(function () {
        sizeWrapper(activeItem);
        setInterval(rotateCity, 3500);
      });
    }

    window.addEventListener('resize', function () {
      var active = kickerItems[activeIndex];
      if (active) sizeWrapper(active);
    });
  }
})();


