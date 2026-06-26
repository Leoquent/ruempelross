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
      // Use clip-path to restrict the fixed canvas to the section's visible area
      var r = sec.getBoundingClientRect();
      var vh = window.innerHeight;
      var headerH = header ? header.offsetHeight : 60;
      var pin = document.querySelector('.ablauf-bg-pin');
      if (pin) {
        var clipTop    = Math.max(r.top - headerH, 0);
        var clipBottom = Math.max(vh - r.bottom, 0);
        if (r.top > vh || r.bottom < headerH) {
          pin.style.clipPath = 'inset(0 0 100% 0)'; // fully hidden outside section
        } else {
          pin.style.clipPath = 'inset(' + clipTop + 'px 0px ' + clipBottom + 'px 0px)';
        }
      }

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

})();
