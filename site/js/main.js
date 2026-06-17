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

  /* ---------- Ablauf: feste Hintergrund-Figur, Frames laufen mit Scroll ---------- */
  (function () {
    var canvas = document.getElementById('ablaufCanvas');
    var sec = document.getElementById('ablauf');
    if (!canvas || !sec) return;
    var ctx = canvas.getContext('2d');
    var FRAMES = 97, BASE = 'assets/video_seq/ezgif-frame-';
    var imgs = new Array(FRAMES), ready = false, lastIdx = -1, raf = false;
    var reducedMo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mqDesktop = window.matchMedia('(min-width:1024px)');

    function draw(idx) {
      var img = imgs[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
      var cw = canvas.clientWidth, ch = canvas.clientHeight;
      if (!cw || !ch) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var bw = Math.round(cw * dpr), bh = Math.round(ch * dpr);
      if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      // Video als Vollbild-Hintergrund (object-fit: cover)
      var ir = img.naturalWidth / img.naturalHeight;
      var cr = cw / ch;
      var dh, dw, dx, dy;
      if (ir > cr) {
        dh = ch;
        dw = ch * ir;
        dx = (cw - dw) / 2;
        dy = 0;
      } else {
        dw = cw;
        dh = cw / ir;
        dx = 0;
        dy = (ch - dh) / 2;
      }
      ctx.drawImage(img, dx, dy, dw, dh);
      lastIdx = idx;
    }
    function progress() {
      var r = sec.getBoundingClientRect();
      var vh = window.innerHeight;
      var dist = sec.offsetHeight + vh; // The amount of scroll from entering viewport bottom to leaving viewport top
      var passed = vh - r.top;
      if (passed <= 0) return 0;
      return Math.min(Math.max(passed / dist, 0), 1);
    }
    function render() {
      raf = false;
      if (!ready) return;
      var p = reducedMo ? 0.5 : progress();
      var idx = Math.round(p * (FRAMES - 1));
      if (idx < 0) idx = 0; if (idx > FRAMES - 1) idx = FRAMES - 1;
      if (idx !== lastIdx) draw(idx);
    }
    function onScroll() {
      // Parallax-Fixierung (wirkt wie position: fixed aber auf die Sektion beschnitten)
      var r = sec.getBoundingClientRect();
      var headerHeight = header ? header.offsetHeight : 60;
      var pin = document.querySelector('.ablauf-bg-pin');
      if (pin) pin.style.transform = 'translate3d(0, ' + (headerHeight - r.top) + 'px, 0)';

      if (ready && !raf) { raf = true; requestAnimationFrame(render); }
    }
    function preload() {
      ready = true;
      for (var i = 1; i <= FRAMES; i++) {
        (function (n) {
          var im = new Image();
          im.onload = function () { lastIdx = -1; render(); };
          im.src = BASE + ('00' + n).slice(-3) + '.jpg';
          imgs[n - 1] = im;
        })(i);
      }
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { preload(); io.disconnect(); } });
      }, { rootMargin: '800px 0px' });
      io.observe(sec);
    } else { preload(); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { lastIdx = -1; onScroll(); }, { passive: true });
    onScroll(); // Initiale Positionierung
  })();

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

  /* ---------- WhatsApp Chat-Simulation ---------- */
  (function () {
    var chat = document.getElementById('waChat');
    if (!chat) return;
    var msgs = Array.prototype.slice.call(chat.querySelectorAll('.chat-msg'));
    if (!msgs.length) return;

    chat.classList.add('js-anim');
    msgs.forEach(function (m) { m.classList.add('is-hidden'); });

    function scrollDown() { chat.scrollTop = chat.scrollHeight; }

    var statusEl = document.getElementById('waStatus');
    function setStatus(on) {
      if (!statusEl) return;
      statusEl.textContent = on ? 'schreibt …' : 'online';
      statusEl.classList.toggle('typing', !!on);
    }

    function reveal(m) {
      m.classList.remove('is-hidden');
      void m.offsetHeight;           // force reflow so the transition runs
      m.classList.add('is-in');
      scrollDown();
    }

    // Turn the latest visible client message's ticks blue (operator "read" it)
    function markRead() {
      for (var k = msgs.length - 1; k >= 0; k--) {
        if (!msgs[k].classList.contains('is-in')) continue;
        var t = msgs[k].querySelector('.chat-ticks');
        if (t) { t.classList.add('read'); }
        break;
      }
    }

    var i = 0, started = false;
    function step() {
      if (i >= msgs.length) return;
      var m = msgs[i];
      var pre = parseInt(m.getAttribute('data-delay') || '500', 10);
      var typing = parseInt(m.getAttribute('data-typing') || '0', 10);
      setTimeout(function () {
        if (typing) {
          markRead();
          setStatus(true);
          var t = document.createElement('div');
          t.className = 'chat-typing';
          t.innerHTML = '<span></span><span></span><span></span>';
          chat.appendChild(t);
          void t.offsetHeight;
          t.classList.add('is-in');
          scrollDown();
          setTimeout(function () {
            if (t.parentNode) chat.removeChild(t);
            setStatus(false);
            reveal(m); i++; step();
          }, typing);
        } else {
          reveal(m); i++; step();
        }
      }, pre);
    }

    function showAll() {
      msgs.forEach(function (m) {
        m.classList.remove('is-hidden');
        m.classList.add('is-in');
        var t = m.querySelector('.chat-ticks');
        if (t) t.classList.add('read');
      });
      scrollDown();
    }

    function start() {
      if (started) return;
      started = true;
      if (reduced) { showAll(); return; }
      step();
    }

    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { start(); io2.disconnect(); }
        });
      }, { threshold: 0.4 });
      io2.observe(chat);
    } else {
      start();
    }
  })();
})();


