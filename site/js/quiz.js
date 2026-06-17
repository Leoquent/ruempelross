/* ============================================================
   RümpelRoss Quiz-Funnel · als Overlay auf der Startseite
   Preisbasis: interne ERWT (Entrümpelungsrichtwerttabelle)
   Füllgrad-Index: 0=1/4 · 1=1/2 · 2=3/4 · 3=voll
   KONFIG: E-Mail-Empfänger unten bei MAIL_TO ändern.
   ============================================================ */
(function () {
  'use strict';
  var MAIL_TO = 'info@ruempelross.de';
  // FormSubmit (kostenlos): erste eingehende Anfrage löst eine Aktivierungs-Mail
  // an MAIL_TO aus – einmal bestätigen, danach läuft der Versand automatisch.
  var ENDPOINT = 'https://formsubmit.co/ajax/' + MAIL_TO;

  var overlay = document.getElementById('quizOverlay');
  if (!overlay) return;

  /* ---------- Overlay öffnen / schließen ---------- */
  var lastFocus = null;
  function openQuiz() {
    lastFocus = document.activeElement;
    overlay.classList.add('open');
    document.body.classList.add('quiz-open');
    overlay.scrollTop = 0;
    if (history.replaceState) history.replaceState(null, '', '#anfrage');
  }
  function closeQuiz() {
    overlay.classList.remove('open');
    document.body.classList.remove('quiz-open');
    if (history.replaceState) history.replaceState(null, '', window.location.pathname);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll('[data-quiz-open]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); openQuiz(); });
  });
  document.querySelectorAll('[data-quiz-close]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); closeQuiz(); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeQuiz();
  });
  /* Direktlink (index.html#anfrage) öffnet das Overlay sofort */
  if (window.location.hash === '#anfrage') openQuiz();
  window.addEventListener('hashchange', function () {
    if (window.location.hash === '#anfrage') openQuiz();
  });

  /* ---------- ERWT-Preistabelle ---------- */
  var ERWT = {
    Wohnung: {
      sizes: [
        { label: 'unter 50 m²',  v: [1170, 1560, 1690, 1950] },
        { label: '50 – 70 m²',   v: [1560, 1950, 2145, 2405] },
        { label: '70 – 90 m²',   v: [1950, 2210, 2470, 2730] },
        { label: '90 – 110 m²',  v: [2275, 2535, 2860, 3250] },
        { label: 'über 110 m²',  v: [2860, 3250, 3575, 3900] }
      ]
    },
    Haus: {
      sizes: [
        { label: 'einstöckig, unter 100 m²',  v: [2470, 2730, 2990, 3250] },
        { label: 'einstöckig, über 100 m²',   v: [2730, 2990, 3250, 3510] },
        { label: '1½-stöckig, unter 100 m²',  v: [2990, 3250, 3510, 3770] },
        { label: '1½-stöckig, über 100 m²',   v: [3250, 3510, 3770, 4030] },
        { label: '2-stöckig, unter 100 m²',   v: [3510, 3770, 4030, 4290] },
        { label: '2-stöckig, über 100 m²',    v: [3770, 4160, 4550, 4940] }
      ]
    },
    Keller: {
      sizes: [
        { label: 'unter 15 m²', v: [130, 195, 260, 325] },
        { label: 'über 15 m²',  v: [195, 260, 325, 390] }
      ]
    },
    Dachboden: {
      sizes: [
        { label: 'unter 20 m²', v: [195, 260, 325, 390] },
        { label: 'über 20 m²',  v: [325, 455, 585, 780] }
      ]
    },
    Garage: {
      sizes: [
        { label: 'unter 20 m²', v: [195, 260, 325, 455] },
        { label: 'über 20 m²',  v: [260, 455, 520, 650] }
      ]
    },
    /* Ohne Tabellenwert → individuelle Einschätzung */
    Gewerbe: { sizes: [
      { label: 'unter 100 m²' }, { label: '100 – 300 m²' }, { label: 'über 300 m²' }
    ]},
    'Messie-Wohnung': { sizes: [
      { label: 'unter 50 m²' }, { label: '50 – 90 m²' }, { label: 'über 90 m²' }
    ]},
    Sonstiges: { sizes: [
      { label: 'klein (Raum/Keller)' }, { label: 'mittel (Wohnung)' }, { label: 'groß (Haus/Halle)' }
    ]}
  };
  var FUELL_LABELS = ['bis zu 1/4 voll', 'ca. halb voll', 'ca. 3/4 voll', 'komplett voll'];

  /* ---------- State & Navigation ---------- */
  var state = JSON.parse(sessionStorage.getItem('rr_quiz') || '{}');
  state.extras = state.extras || [];
  var steps = Array.prototype.slice.call(overlay.querySelectorAll('.quiz-step'));
  var order = ['objekt', 'groesse', 'fuellgrad', 'zugang', 'termin', 'extras', 'kontakt', 'danke'];
  var bar = document.getElementById('bar');
  var current = 0;

  function save() { sessionStorage.setItem('rr_quiz', JSON.stringify(state)); }

  function show(i) {
    current = Math.max(0, Math.min(i, order.length - 1));
    steps.forEach(function (s) {
      s.classList.toggle('active', s.getAttribute('data-step') === order[current]);
    });
    bar.style.width = ((current) / (order.length - 2) * 100) + '%';
    if (order[current] === 'groesse') buildSizeOptions();
    overlay.scrollTo({ top: 0, behavior: 'smooth' });
  }

  overlay.querySelectorAll('[data-back]').forEach(function (b) {
    b.addEventListener('click', function () { show(current - 1); });
  });

  /* ---------- Optionen (Single-Select mit Auto-Weiter) ---------- */
  function bindOptions(stepEl, key) {
    stepEl.querySelectorAll('.quiz-opt:not([data-multi])').forEach(function (btn) {
      btn.addEventListener('click', function () {
        stepEl.querySelectorAll('.quiz-opt').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        state[key] = btn.getAttribute('data-value');
        save();
        setTimeout(function () { show(current + 1); }, 220);
      });
    });
  }
  bindOptions(overlay.querySelector('[data-step="objekt"]'), 'objekt');
  bindOptions(overlay.querySelector('[data-step="fuellgrad"]'), 'fuellgrad');
  bindOptions(overlay.querySelector('[data-step="zugang"]'), 'zugang');

  /* Termin: Auswahl ohne Auto-Weiter (PLZ-Feld darunter) */
  var terminStep = overlay.querySelector('[data-step="termin"]');
  terminStep.querySelectorAll('.quiz-opt').forEach(function (btn) {
    btn.addEventListener('click', function () {
      terminStep.querySelectorAll('.quiz-opt').forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      state.termin = btn.getAttribute('data-value');
      save();
    });
  });
  document.getElementById('terminNext').addEventListener('click', function () {
    var plz = document.getElementById('plz').value.trim();
    if (!state.termin) { alert('Bitte wählen Sie einen Zeitraum.'); return; }
    if (!/^\d{5}$/.test(plz)) { alert('Bitte geben Sie eine gültige Postleitzahl ein.'); return; }
    state.plz = plz; save(); show(current + 1);
  });

  /* Extras: Multi-Select */
  overlay.querySelectorAll('[data-multi]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var v = btn.getAttribute('data-value');
      var i = state.extras.indexOf(v);
      if (i >= 0) { state.extras.splice(i, 1); btn.classList.remove('selected'); }
      else { state.extras.push(v); btn.classList.add('selected'); }
      save();
    });
  });
  document.getElementById('extrasNext').addEventListener('click', function () { show(current + 1); });

  /* ---------- Größen-Optionen je Objektart ---------- */
  function buildSizeOptions() {
    var wrap = document.getElementById('sizeOptions');
    wrap.innerHTML = '';
    var conf = ERWT[state.objekt] || ERWT.Sonstiges;
    conf.sizes.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'quiz-opt';
      b.setAttribute('data-value', s.label);
      b.innerHTML = '<svg class="q-icon" aria-hidden="true"><use href="assets/icons.svg#i-masz"/></svg> ' + s.label;
      if (state.groesse === s.label) b.classList.add('selected');
      b.addEventListener('click', function () {
        wrap.querySelectorAll('.quiz-opt').forEach(function (x) { x.classList.remove('selected'); });
        b.classList.add('selected');
        state.groesse = s.label; save();
        setTimeout(function () { show(current + 1); }, 220);
      });
      wrap.appendChild(b);
    });
  }

  /* ---------- Preisberechnung (ERWT) ---------- */
  function calcPrice() {
    var conf = ERWT[state.objekt];
    if (!conf) return null;
    var size = null;
    conf.sizes.forEach(function (s) { if (s.label === state.groesse) size = s; });
    if (!size || !size.v) return null;
    var fi = FUELL_LABELS.indexOf(state.fuellgrad);
    if (fi < 0) fi = 1;
    var base = size.v[fi];
    var lo = Math.round(base * 0.95 / 10) * 10;
    var hi = Math.round(base * 1.2 / 10) * 10;
    return { lo: lo, hi: hi, base: base };
  }
  function fmt(n) { return n.toLocaleString('de-DE') + ' €'; }

  function renderResult() {
    var p = calcPrice();
    var range = document.getElementById('dankePriceRange');
    if (!range) return;
    if (p) {
      range.textContent = 'ca. ' + fmt(p.lo) + ' – ' + fmt(p.hi);
      state.einschaetzung = fmt(p.lo) + ' – ' + fmt(p.hi);
    } else {
      range.textContent = 'Individuelle Einschätzung';
      state.einschaetzung = 'individuell (' + (state.objekt || 'Objekt') + ')';
    }
    save();

    // Update WhatsApp link on thank you screen with context
    var dankeWaBtn = document.getElementById('dankeWaBtn');
    if (dankeWaBtn) {
      var waText = 'Hallo RümpelRoss, ich habe gerade die Anfrage gesendet.\n' +
        'Objekt: ' + state.objekt + ' (' + state.groesse + ', ' + state.fuellgrad + ')\n' +
        'PLZ: ' + state.plz + '\n' +
        'Einschätzung: ' + state.einschaetzung + '\n' +
        'Hier sind die Fotos für das Angebot:';
      dankeWaBtn.href = 'https://wa.me/4917642723702?text=' + encodeURIComponent(waText);
    }
  }

  /* ---------- Absenden ---------- */
  document.getElementById('quiz').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('name').value.trim();
    var tel = document.getElementById('tel').value.trim();
    var email = document.getElementById('email').value.trim();
    var err = document.getElementById('formError');
    err.style.display = 'none';
    if (document.getElementById('firma').value) return; // Honeypot
    if (name.length < 2) { err.textContent = 'Bitte geben Sie Ihren Namen an.'; err.style.display = 'block'; return; }
    if (tel.replace(/\D/g, '').length < 6) { err.textContent = 'Bitte geben Sie eine gültige Telefonnummer an.'; err.style.display = 'block'; return; }
    if (!document.getElementById('dsgvo').checked) { err.textContent = 'Bitte stimmen Sie der Datenverarbeitung zu.'; err.style.display = 'block'; return; }

    state.name = name; state.tel = tel; state.email = email;
    state.rueckruf = document.getElementById('rueckruf').value;
    save();

    var subject = 'Anfrage: ' + state.objekt + ', ' + state.groesse + ', ' + state.fuellgrad +
      ' – ' + state.plz + ' – ' + state.termin;
    var lines = [
      'KONTAKT',
      '  Name:      ' + state.name,
      '  Telefon:   ' + state.tel,
      '  E-Mail:    ' + (state.email || '–'),
      '  Rückruf:   ' + state.rueckruf,
      '',
      'OBJEKT',
      '  Art:       ' + state.objekt,
      '  Größe:     ' + state.groesse,
      '  Füllgrad:  ' + state.fuellgrad,
      '  Zugang:    ' + state.zugang,
      '  PLZ:       ' + state.plz,
      '  Termin:    ' + state.termin,
      '  Extras:    ' + (state.extras.length ? state.extras.join(', ') : '–'),
      '',
      'Gezeigte Einschätzung: ' + state.einschaetzung,
      'Quelle: Online-Anfrage (Quiz) · ' + new Date().toLocaleString('de-DE')
    ];
    var body = lines.join('\n');

    var btn = document.getElementById('submitBtn');
    btn.disabled = true; btn.textContent = 'Wird gesendet …';

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ _subject: subject, Zusammenfassung: body, _template: 'box' })
    }).then(function (r) {
      if (!r.ok) throw new Error('send failed');
      finish();
    }).catch(function () {
      // Fallback: E-Mail-Programm öffnen
      window.location.href = 'mailto:' + MAIL_TO + '?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      finish();
    });

    function finish() {
      renderResult(); // Berechne Preis und erstelle WhatsApp-Link

      var sum = document.getElementById('finalSummary');
      sum.innerHTML = '';
      [['Objekt', state.objekt + ', ' + state.groesse],
       ['Füllgrad', state.fuellgrad],
       ['Ort', 'PLZ ' + state.plz],
       ['Wunschtermin', state.termin],
       ['Einschätzung', state.einschaetzung]].forEach(function (row) {
        var li = document.createElement('li');
        li.innerHTML = row[0] + ' <b>' + row[1] + '</b>';
        sum.appendChild(li);
      });
      sessionStorage.removeItem('rr_quiz');
      show(order.indexOf('danke'));
      bar.style.width = '100%';
    }
  });

  show(0);
})();
