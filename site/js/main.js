/* RümpelRoss – main.js · Vanilla, kein Framework, ~4 KB */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var openProjectModal = null;
  var activeSlider = null;
  var touchStartX = 0;
  var touchStartY = 0;
  var dragDirection = null;
  var isTouchMode = false;

  function setPos(slider, clientX) {
    var after = slider.querySelector('.ba-after');
    var handle = slider.querySelector('.ba-handle');
    if (!after || !handle) return;
    var r = slider.getBoundingClientRect();
    var pct = Math.min(Math.max((clientX - r.left) / r.width, 0.05), 0.95) * 100;
    after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
    handle.style.left = pct + '%';
  }


  /* ---------- Header Scroll-State ---------- */
  var header = document.getElementById('header');
  // Unterseiten ohne dunklen Video-Hero: Header bleibt dauerhaft im
  // "scrolled"-Zustand (gelb, dunkle Schrift) – via data-solid am <header>.
  var solidHeader = header && header.hasAttribute('data-solid');
  function onScroll() {
    header.classList.toggle('scrolled', solidHeader || window.scrollY > 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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
        // Nach einem Wort mit Komma in die nächste Zeile umbrechen (auf mobile via CSS ausgeblendet)
        if (/,$/.test(w)) {
          h1.appendChild(document.createTextNode(' '));
          h1.appendChild(document.createElement('br'));
        } else {
          h1.appendChild(document.createTextNode(' '));
        }
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
    // Mittelpunkt eines Punktes relativ zum Timeline-Anfang (dot: top:4px, Höhe 22px)
    function dotCenter(li) { return li.offsetTop + 4 + 11; }
    function updateLine() {
      ticking = false;
      if (!items.length) return;
      var rect = timeline.getBoundingClientRect();
      var vh = window.innerHeight;
      var trigger = vh * 0.6;            // Linie "kommt an", wenn ein Punkt diese Höhe kreuzt
      var startY = dotCenter(items[0]);  // Punkt 1
      var endY = dotCenter(items[items.length - 1]); // Punkt 4
      var span = endY - startY;
      // Linien exakt von Punkt 1 bis Punkt 4 spannen (kein Überlauf danach)
      timeline.style.setProperty('--line-start', startY + 'px');
      timeline.style.setProperty('--line-span', span + 'px');
      // Füllkopf in Timeline-Koordinaten
      var fillHead = trigger - rect.top;
      var fillPx = Math.min(Math.max(fillHead - startY, 0), span);
      if (progress) progress.style.height = fillPx + 'px';
      // Punkt leuchtet erst, wenn die Fülllinie ihn erreicht
      items.forEach(function (li) {
        li.classList.toggle('active', dotCenter(li) <= startY + fillPx + 1);
      });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateLine); }
    }, { passive: true });
    window.addEventListener('resize', updateLine, { passive: true });
    updateLine();
  }

  /* ---------- Ablauf: feste Hintergrund-Figur, Frames laufen mit Scroll ---------- */
  (function () {
    var canvas = document.getElementById('ablaufCanvas');
    var sec = document.getElementById('ablauf');
    if (!canvas || !sec) return;
    var ctx = canvas.getContext('2d');
    // Pfad relativ zur Seite auflösen (EN-Seite liegt in /en/)
    var PREFIX = document.documentElement.lang === 'en' ? '../' : '';
    var BASE = PREFIX + 'assets/video_seq/ezgif-frame-';
    // Nur jeder 2. Frame (001, 003, … 097) – halbiert die Datenmenge, optisch kein Unterschied
    var FRAME_FILES = [];
    for (var fn = 1; fn <= 97; fn += 2) FRAME_FILES.push(fn);
    var FRAMES = FRAME_FILES.length;
    var imgs = new Array(FRAMES), ready = false, lastIdx = -1, raf = false;
    var reducedMo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      // Sichtbarkeit wird rein per CSS geclippt (.ablauf-bg · clip-path);
      // hier nur noch den passenden Frame rendern.
      if (ready && !raf) { raf = true; requestAnimationFrame(render); }
    }
    function preload() {
      ready = true;
      FRAME_FILES.forEach(function (fileNo, i) {
        var im = new Image();
        im.onload = function () { lastIdx = -1; render(); };
        im.src = BASE + ('00' + fileNo).slice(-3) + '.jpg';
        imgs[i] = im;
      });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { preload(); io.disconnect(); } });
      }, { rootMargin: '800px 0px' });
      io.observe(sec);
    } else { preload(); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { lastIdx = -1; onScroll(); }, { passive: true });
    onScroll(); // Initiales Rendering
  })();

  /* ---------- Vorher/Nachher-Slider & Showcase-Tabs ---------- */
  var sliders = document.querySelectorAll('.ba-slider');

  if (sliders.length > 0) {
    sliders.forEach(function (slider) {
      slider.addEventListener('mousedown', function (e) {
        isTouchMode = false;
        activeSlider = slider;
        setPos(slider, e.clientX);
      });
      slider.addEventListener('touchstart', function (e) {
        isTouchMode = true;
        activeSlider = slider;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        dragDirection = null;
      }, { passive: true });
    });

    window.addEventListener('mousemove', function (e) {
      if (activeSlider && !isTouchMode) {
        setPos(activeSlider, e.clientX);
      }
    });

    window.addEventListener('touchmove', function (e) {
      if (!activeSlider || !isTouchMode) return;

      var touch = e.touches[0];
      var dx = touch.clientX - touchStartX;
      var dy = touch.clientY - touchStartY;
      var absDx = Math.abs(dx);
      var absDy = Math.abs(dy);

      if (dragDirection === null) {
        if (absDx > 6 || absDy > 6) {
          if (absDx > absDy) {
            dragDirection = 'horizontal';
          } else {
            dragDirection = 'vertical';
            activeSlider = null; // Release slider to allow normal page scrolling
          }
        }
      }

      if (dragDirection === 'horizontal') {
        setPos(activeSlider, touch.clientX);
        if (e.cancelable) {
          e.preventDefault(); // Prevent page scroll
        }
      }
    }, { passive: false });

    window.addEventListener('mouseup', function () {
      activeSlider = null;
    });

    window.addEventListener('touchend', function (e) {
      if (activeSlider && isTouchMode) {
        var touch = e.changedTouches[0];
        var dx = touch.clientX - touchStartX;
        var dy = touch.clientY - touchStartY;
        var absDx = Math.abs(dx);
        var absDy = Math.abs(dy);

        // Tap detection (minimal movement)
        if (absDx < 8 && absDy < 8) {
          var project = activeSlider.closest('.showcase-project');
          if (project && !activeSlider.closest('.project-modal-container') && window.innerWidth < 768) {
            if (typeof openProjectModal === 'function') {
              openProjectModal(project);
            }
          }
        }
      }
      activeSlider = null;
      dragDirection = null;
    });
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

  /* ---------- Google Maps – DSGVO Consent-Gate ---------- */
  (function () {
    var STORE = 'rr_maps_consent';
    var gates = [].slice.call(document.querySelectorAll('.map-consent'));
    if (!gates.length) return;

    function load(gate) {
      if (gate.classList.contains('is-loaded')) return;
      var url = gate.getAttribute('data-map-embed');
      if (!url) return;
      var iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.title = 'Standort von RümpelRoss auf Google Maps';
      iframe.loading = 'lazy';
      iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      iframe.setAttribute('allowfullscreen', '');
      gate.insertBefore(iframe, gate.firstChild);
      gate.classList.add('is-loaded');
    }

    var remembered = false;
    try { remembered = window.localStorage.getItem(STORE) === '1'; } catch (e) {}

    gates.forEach(function (gate) {
      if (remembered) { load(gate); return; }
      var btn = gate.querySelector('[data-map-load]');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var remember = gate.querySelector('[data-map-remember]');
        if (remember && remember.checked) {
          try { window.localStorage.setItem(STORE, '1'); } catch (e) {}
        }
        load(gate);
      });
    });
  })();

  /* ---------- Bewertungen-Karussell (Fade-Übergang) ---------- */
  (function () {
    var root = document.querySelector('.reviews-carousel');
    if (!root) return;
    var track = root.querySelector('.rev-track');
    var prevBtn = root.querySelector('.rev-prev');
    var nextBtn = root.querySelector('.rev-next');
    var dotsWrap = root.querySelector('.rev-dots');
    if (!track) return;

    var cards = Array.prototype.slice.call(track.querySelectorAll('.rev-card'));
    var count = cards.length;
    if (count < 2) return;

    var current = 0;
    var animating = false;

    // Dots erstellen
    var dots = [];
    for (var i = 0; i < count; i++) {
      (function (idx) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'rev-dot' + (idx === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Bewertung ' + (idx + 1));
        d.addEventListener('click', function () { goTo(idx); restart(); });
        dotsWrap.appendChild(d);
        dots.push(d);
      })(i);
    }

    // Track-Höhe dynamisch anpassen um Layout-Verschiebungen zu verhindern
    function setTrackHeight() {
      var maxH = 0;
      cards.forEach(function (c) {
        var prevPos = c.style.position;
        var prevVis = c.style.visibility;
        var prevTrans = c.style.transform;
        var prevTransition = c.style.transition;
        var prevOpacity = c.style.opacity;

        c.style.position = 'relative';
        c.style.visibility = 'hidden';
        c.style.transform = 'none';
        c.style.transition = 'none';
        c.style.opacity = '1';

        var h = c.offsetHeight;
        if (h > maxH) maxH = h;

        c.style.position = prevPos;
        c.style.visibility = prevVis;
        c.style.transform = prevTrans;
        c.style.transition = prevTransition;
        c.style.opacity = prevOpacity;
      });
      track.style.height = maxH + 'px';
    }

    // Initiale Höhenberechnung
    setTrackHeight();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(setTrackHeight);
    }
    
    // Bei Resize neu berechnen
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setTrackHeight, 100);
    });

    // Erste Karte aktivieren
    cards[0].classList.add('is-active');

    function updateDots() {
      for (var k = 0; k < dots.length; k++) {
        dots[k].classList.toggle('active', k === current);
      }
    }

    function goTo(next, dir) {
      if (animating || next === current) return;
      animating = true;

      var outCard = cards[current];
      var inCard  = cards[next];

      if (!dir) {
        dir = (next > current) ? 'left' : 'right';
      }

      var exitClass = (dir === 'left') ? 'is-exit-left' : 'is-exit-right';
      var enterClass = (dir === 'left') ? 'is-enter-right' : 'is-enter-left';

      // Austretende Karte
      outCard.classList.remove('is-active');
      outCard.classList.add(exitClass);

      // Eintretende Karte initial platzieren, dann aktivieren
      inCard.classList.add(enterClass);
      void inCard.offsetHeight; // Reflow erzwingen
      inCard.classList.remove(enterClass);
      inCard.classList.add('is-active');

      // Nach der Transition aufräumen
      var cleanup = function (e) {
        if (e && e.propertyName !== 'opacity') return;
        outCard.removeEventListener('transitionend', cleanup);
        outCard.classList.remove(exitClass);
        animating = false;
      };
      outCard.addEventListener('transitionend', cleanup);

      current = next;
      updateDots();
    }

    function next() { goTo((current + 1) % count, 'left'); }
    function prev() { goTo((current - 1 + count) % count, 'right'); }

    // Autoplay
    var timer = null, DELAY = 5200;
    function startAuto() {
      if (reduced) return;
      stopAuto();
      timer = setInterval(function () {
        if (!document.hidden && !dragging) next();
      }, DELAY);
    }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stopAuto(); startAuto(); }

    if (nextBtn) nextBtn.addEventListener('click', function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restart(); });
    root.addEventListener('mouseenter', stopAuto);
    root.addEventListener('mouseleave', startAuto);

    // Touch/Drag Swipe – Richtung bestimmt next/prev
    var dragging = false, startXp = 0, dx = 0;
    function down(e) {
      dragging = true; dx = 0;
      startXp = e.touches ? e.touches[0].clientX : e.clientX;
      stopAuto();
    }
    function move(e) {
      if (!dragging) return;
      dx = (e.touches ? e.touches[0].clientX : e.clientX) - startXp;
      if (Math.abs(dx) > 6 && e.cancelable) e.preventDefault();
    }
    function up() {
      if (!dragging) return;
      dragging = false;
      var threshold = 50;
      if (dx <= -threshold) next();
      else if (dx >= threshold) prev();
      restart();
    }
    track.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move, { passive: false });
    window.addEventListener('mouseup', up);
    track.addEventListener('touchstart', down, { passive: true });
    track.addEventListener('touchmove', move, { passive: false });
    track.addEventListener('touchend', up);

    // Keyboard
    root.setAttribute('tabindex', '-1');
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { prev(); restart(); }
      else if (e.key === 'ArrowRight') { next(); restart(); }
    });

    startAuto();
  })();

  /* ---------- Einzugsgebiet: Akkordeon für Landkreise ---------- */
  (function () {
    var items = document.querySelectorAll('.ort-item[data-accordion]');
    items.forEach(function (item) {
      var trigger = item.querySelector('.ort-trigger');
      var panel = item.querySelector('.ort-panel');
      if (!trigger || !panel) return;

      trigger.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        
        // Close other open accordions
        items.forEach(function (other) {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            var otherTrigger = other.querySelector('.ort-trigger');
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
            var otherPanel = other.querySelector('.ort-panel');
            if (otherPanel) otherPanel.style.maxHeight = null;
          }
        });

        if (isOpen) {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
          panel.style.maxHeight = null;
        } else {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });

    window.addEventListener('resize', function () {
      var openItem = document.querySelector('.ort-item.is-open[data-accordion]');
      if (openItem) {
        var panel = openItem.querySelector('.ort-panel');
        if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    }, { passive: true });
  })();

  /* ---------- Ergebnisse Showcase: Projekt-Details Modal ---------- */
  (function () {
    var projects = document.querySelectorAll('.showcase-project');
    if (projects.length === 0) return;

    // Create modal element
    var modalOverlay = document.createElement('div');
    modalOverlay.className = 'project-modal-overlay';
    modalOverlay.id = 'projectDetailsModal';
    modalOverlay.setAttribute('role', 'dialog');
    modalOverlay.setAttribute('aria-modal', 'true');
    modalOverlay.setAttribute('aria-hidden', 'true');

    // Create inner structure
    modalOverlay.innerHTML =
      '<div class="project-modal-container">' +
        '<button type="button" class="project-modal-close-btn" aria-label="Schließen">' +
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<line x1="18" y1="6" x2="6" y2="18"></line>' +
            '<line x1="6" y1="6" x2="18" y2="18"></line>' +
          '</svg>' +
        '</button>' +
        '<div class="project-modal-content">' +
          '<div class="project-modal-slider-col">' +
            '<!-- Slider will be inserted here -->' +
          '</div>' +
          '<div class="project-modal-details-col">' +
            '<div>' +
              '<div class="project-modal-meta-top">' +
                '<span class="project-modal-num"></span>' +
                '<span class="project-modal-category"></span>' +
              '</div>' +
              '<h3 class="project-modal-title"></h3>' +
              '<div class="project-modal-body"></div>' +
            '</div>' +
            '<a href="" class="project-modal-cta btn btn-primary"></a>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modalOverlay);

    var closeBtn = modalOverlay.querySelector('.project-modal-close-btn');
    var sliderCol = modalOverlay.querySelector('.project-modal-slider-col');
    var modalNum = modalOverlay.querySelector('.project-modal-num');
    var modalCat = modalOverlay.querySelector('.project-modal-category');
    var modalTitle = modalOverlay.querySelector('.project-modal-title');
    var modalBody = modalOverlay.querySelector('.project-modal-body');
    var modalCta = modalOverlay.querySelector('.project-modal-cta');

    // Find lang
    var isEnglish = document.documentElement.lang === 'en';
    if (closeBtn) {
      closeBtn.setAttribute('aria-label', isEnglish ? 'Close' : 'Schließen');
    }

    function openModal(project) {
      // 1. Get info
      var number = project.querySelector('.project-number') ? project.querySelector('.project-number').innerText : '';
      var title = project.querySelector('.project-title-meta h3') ? project.querySelector('.project-title-meta h3').innerText : '';
      var shortMeta = project.querySelector('.project-short-meta') ? project.querySelector('.project-short-meta').innerText : '';

      // Split shortMeta to get the category (first part before dot)
      var category = '';
      if (shortMeta) {
        var parts = shortMeta.split('·');
        category = parts[0].trim();
      }

      // Details HTML
      var listHtml = project.querySelector('.project-meta-list') ? project.querySelector('.project-meta-list').outerHTML : '';
      var descHtml = project.querySelector('.project-details-expand .expand-inner p') ? project.querySelector('.project-details-expand .expand-inner p').outerHTML : '';
      if (!descHtml) {
        descHtml = project.querySelector('.project-details-expand p') ? project.querySelector('.project-details-expand p').outerHTML : '';
      }
      var ctaEl = project.querySelector('.project-cta-link');
      var ctaText = ctaEl ? ctaEl.innerText : (isEnglish ? 'Request similar project →' : 'Ähnliches Projekt anfragen →');
      var ctaHref = ctaEl ? ctaEl.getAttribute('href') : '#kontakt';

      // 2. Insert text
      modalNum.innerText = number;
      modalCat.innerText = category;
      modalTitle.innerText = title;
      modalBody.innerHTML = listHtml + descHtml;
      modalCta.innerText = ctaText;
      modalCta.setAttribute('href', ctaHref);

      // 3. Build Slider
      var beforeImg = project.querySelector('.ba-before img');
      var afterImg = project.querySelector('.ba-after img');
      if (beforeImg && afterImg) {
        sliderCol.innerHTML =
          '<div class="ba-slider" aria-label="Vorher-Nachher-Vergleich">' +
            '<div class="ba-img ba-before"><img src="' + beforeImg.getAttribute('src') + '" alt="' + beforeImg.alt + '"></div>' +
            '<div class="ba-img ba-after"><img src="' + afterImg.getAttribute('src') + '" alt="' + afterImg.alt + '"></div>' +
            '<span class="ba-label before">' + (isEnglish ? 'Before' : 'Vorher') + '</span>' +
            '<span class="ba-label after">' + (isEnglish ? 'After' : 'Nachher') + '</span>' +
            '<div class="ba-handle"></div>' +
          '</div>';

        // Initialize drag events for this specific slider
        var newSlider = sliderCol.querySelector('.ba-slider');
        initModalSlider(newSlider);
      } else {
        sliderCol.innerHTML = '';
      }

      // 4. Show modal
      modalOverlay.classList.add('open');
      modalOverlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('project-modal-open');

      // Focus close button
      if (closeBtn) closeBtn.focus();
    }

    // Expose the openModal function to shared scope
    openProjectModal = openModal;

    function closeModal() {
      modalOverlay.classList.remove('open');
      modalOverlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('project-modal-open');
    }

    function initModalSlider(slider) {
      slider.addEventListener('mousedown', function (e) {
        isTouchMode = false;
        activeSlider = slider;
        setPos(slider, e.clientX);
      });
      slider.addEventListener('touchstart', function (e) {
        isTouchMode = true;
        activeSlider = slider;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        dragDirection = null;
      }, { passive: true });
    }

    // Close triggers
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
        closeModal();
      }
    });

    // CTA in modal closes the modal
    modalCta.addEventListener('click', function () {
      closeModal();
    });

    // Add click listeners to project cards
    projects.forEach(function (project) {
      var header = project.querySelector('.project-header');
      if (header) {
        header.addEventListener('click', function (e) {
          if (window.innerWidth >= 768) {
            openModal(project);
          }
        });
      }

      // Mobile click/tap handler on the whole card
      var tapStartX = 0;
      var tapStartY = 0;
      project.addEventListener('touchstart', function (e) {
        tapStartX = e.touches[0].clientX;
        tapStartY = e.touches[0].clientY;
      }, { passive: true });

      project.addEventListener('touchend', function (e) {
        if (window.innerWidth < 768) {
          var dx = e.changedTouches[0].clientX - tapStartX;
          var dy = e.changedTouches[0].clientY - tapStartY;
          // Only trigger openModal if it's a click/tap (minimal movement)
          // and they clicked on the header or slider card (excluding active drags)
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
            openModal(project);
          }
        }
      });
    });
  })();

})();
