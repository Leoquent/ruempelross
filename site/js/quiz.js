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

  // Language detection
  var lang = document.documentElement.lang === 'en' ? 'en' : 'de';

  var TRANSLATIONS = {
    de: {
      approx: 'ca. ',
      indivEst: 'Individuelle Einschätzung nötig',
      messieLabel: 'Messie / Härtefall – wir besprechen das persönlich:',
      messieNote: 'Bei besonderen Situationen erstellen wir nach einer kostenlosen Besichtigung ein individuelles Angebot für Sie.',
      sending: 'Wird gesendet …',
      alertTermin: 'Bitte wählen Sie einen Zeitraum.',
      alertPlz: 'Bitte geben Sie eine gültige Postleitzahl ein.',
      alertName: 'Bitte geben Sie Ihren Namen an.',
      alertTel: 'Bitte geben Sie eine gültige Telefonnummer an.',
      alertDsgvo: 'Bitte stimmen Sie der Datenverarbeitung zu.',
      objekt: 'Objekt',
      fuellgrad: 'Füllgrad',
      ort: 'Ort',
      plzPrefix: 'PLZ ',
      wunschtermin: 'Wunschtermin',
      einschaetzung: 'Einschätzung',
      individuell: 'individuell',
      waTextTemplate: 'Hallo RümpelRoss, ich habe gerade die Anfrage gesendet.\n' +
        'Objekt: {objekt} ({groesse}, {fuellgrad})\n' +
        'PLZ: {plz}\n' +
        'Hier sind die Fotos für das Angebot:',
      labels: {
        'Wohnung': 'Wohnung',
        'Haus': 'Haus',
        'Keller': 'Keller',
        'Dachboden': 'Dachboden',
        'Garage': 'Garage',
        'Gewerbe': 'Gewerbe / Büro',
        'Messie-Wohnung': 'Messie-Wohnung',
        'Sonstiges': 'Sonstiges',
        'bis zu 1/4 voll': 'bis zu 1/4 voll',
        'ca. halb voll': 'ca. halb voll',
        'ca. 3/4 voll': 'ca. 3/4 voll',
        'komplett voll': 'komplett voll',
        'Messie / Härtefall': 'Messie / Härtefall',
        'so schnell wie möglich': 'so schnell wie möglich',
        'innerhalb 2 Wochen': 'innerhalb 2 Wochen',
        'in 2 bis 6 Wochen': 'in 2 bis 6 Wochen',
        'später als 6 Wochen': 'später als 6 Wochen',
        'unter 50 m²': 'unter 50 m²',
        '50 – 70 m²': '50 – 70 m²',
        '70 – 90 m²': '70 – 90 m²',
        '90 – 110 m²': '90 – 110 m²',
        'über 110 m²': 'über 110 m²',
        'einstöckig, unter 100 m²': 'einstöckig, unter 100 m²',
        'einstöckig, über 100 m²': 'einstöckig, über 100 m²',
        '1½-stöckig, unter 100 m²': '1½-stöckig, unter 100 m²',
        '1½-stöckig, über 100 m²': '1½-stöckig, über 100 m²',
        '2-stöckig, unter 100 m²': '2-stöckig, unter 100 m²',
        '2-stöckig, über 100 m²': '2-stöckig, über 100 m²',
        'unter 15 m²': 'unter 15 m²',
        'über 15 m²': 'über 15 m²',
        'unter 20 m²': 'unter 20 m²',
        'über 20 m²': 'über 20 m²',
        'unter 100 m²': 'unter 100 m²',
        '100 – 300 m²': '100 – 300 m²',
        'über 300 m²': 'über 300 m²',
        '50 – 90 m²': '50 – 90 m²',
        'über 90 m²': 'über 90 m²',
        'klein (Raum/Keller)': 'klein (Raum/Keller)',
        'mittel (Wohnung)': 'mittel (Wohnung)',
        'groß (Haus/Halle)': 'groß (Haus/Halle)'
      }
    },
    en: {
      approx: 'approx. ',
      indivEst: 'Individual assessment required',
      messieLabel: 'Hoarder / hardship case – we will discuss this personally:',
      messieNote: 'For special situations, we will provide an individual offer after a free inspection.',
      sending: 'Sending...',
      alertTermin: 'Please select a timeframe.',
      alertPlz: 'Please enter a valid ZIP code.',
      alertName: 'Please enter your name.',
      alertTel: 'Please enter a valid phone number.',
      alertDsgvo: 'Please agree to the data processing.',
      objekt: 'Property',
      fuellgrad: 'Volume',
      ort: 'Location',
      plzPrefix: 'ZIP code ',
      wunschtermin: 'Requested date',
      einschaetzung: 'Estimate',
      individuell: 'individual',
      waTextTemplate: 'Hello RümpelRoss, I just submitted the request.\n' +
        'Property: {objekt} ({groesse}, {fuellgrad})\n' +
        'ZIP code: {plz}\n' +
        'Here are the photos for the quote:',
      labels: {
        'Wohnung': 'Flat',
        'Haus': 'House',
        'Keller': 'Cellar',
        'Dachboden': 'Attic',
        'Garage': 'Garage',
        'Gewerbe': 'Commercial / office',
        'Messie-Wohnung': 'Hoarder flat',
        'Sonstiges': 'Other',
        'bis zu 1/4 voll': 'Up to 1/4 full',
        'ca. halb voll': 'Approx. half full',
        'ca. 3/4 voll': 'Approx. 3/4 full',
        'komplett voll': 'Completely full',
        'Messie / Härtefall': 'Hoarder / hardship case',
        'so schnell wie möglich': 'As soon as possible',
        'innerhalb 2 Wochen': 'Within 2 weeks',
        'in 2 bis 6 Wochen': 'In 2 to 6 weeks',
        'später als 6 Wochen': 'Later than 6 weeks',
        'unter 50 m²': 'under 50 m²',
        '50 – 70 m²': '50 – 70 m²',
        '70 – 90 m²': '70 – 90 m²',
        '90 – 110 m²': '90 – 110 m²',
        'über 110 m²': 'over 110 m²',
        'einstöckig, unter 100 m²': 'single-story, under 100 m²',
        'einstöckig, über 100 m²': 'single-story, over 100 m²',
        '1½-stöckig, unter 100 m²': '1½-story, under 100 m²',
        '1½-stöckig, über 100 m²': '1½-story, over 100 m²',
        '2-stöckig, unter 100 m²': '2-story, under 100 m²',
        '2-stöckig, über 100 m²': '2-story, over 100 m²',
        'unter 15 m²': 'under 15 m²',
        'über 15 m²': 'over 15 m²',
        'unter 20 m²': 'under 20 m²',
        'über 20 m²': 'over 20 m²',
        'unter 100 m²': 'under 100 m²',
        '100 – 300 m²': '100 – 300 m²',
        'über 300 m²': 'over 300 m²',
        '50 – 90 m²': '50 – 90 m²',
        'über 90 m²': 'over 90 m²',
        'klein (Raum/Keller)': 'small (room/cellar)',
        'mittel (Wohnung)': 'medium (flat)',
        'groß (Haus/Halle)': 'large (house/hall)'
      }
    }
  };

  /* ---------- WhatsApp Link Prefill Management ---------- */
  function updateAllWhatsAppLinks() {
    var completedState = null;
    try {
      completedState = JSON.parse(sessionStorage.getItem('rr_quiz_completed'));
    } catch (e) {}
    
    var waLinks = document.querySelectorAll('a[href*="wa.me/"], a[href*="whatsapp.com"], a#dankeWaBtn');
    
    if (completedState && completedState.objekt) {
      var textObj = TRANSLATIONS[lang].labels[completedState.objekt] || completedState.objekt || '';
      var textSize = TRANSLATIONS[lang].labels[completedState.groesse] || completedState.groesse || '';
      var textFuell = TRANSLATIONS[lang].labels[completedState.fuellgrad] || completedState.fuellgrad || '';
      
      var waText = TRANSLATIONS[lang].waTextTemplate
        .replace('{objekt}', textObj)
        .replace('{groesse}', textSize)
        .replace('{fuellgrad}', textFuell)
        .replace('{plz}', completedState.plz || '');
      
      var newHref = 'https://wa.me/4917642723702?text=' + encodeURIComponent(waText);
      waLinks.forEach(function (link) {
        if (!link.getAttribute('data-original-href')) {
          link.setAttribute('data-original-href', link.href);
        }
        link.href = newHref;
      });
    } else {
      waLinks.forEach(function (link) {
        var orig = link.getAttribute('data-original-href');
        if (orig) {
          link.href = orig;
        }
      });
    }
  }

  // Initial call on script load
  updateAllWhatsAppLinks();

  /* ---------- Overlay öffnen / schließen ---------- */
  var lastFocus = null;
  function openQuiz() {
    // Clear completed state if starting a new quiz
    sessionStorage.removeItem('rr_quiz_completed');
    updateAllWhatsAppLinks();

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
  var FUELL_LABELS = ['bis zu 1/4 voll', 'ca. halb voll', 'ca. 3/4 voll', 'komplett voll', 'Messie / Härtefall'];

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
    if (!state.termin) { alert(TRANSLATIONS[lang].alertTermin); return; }
    if (!/^\d{5}$/.test(plz)) { alert(TRANSLATIONS[lang].alertPlz); return; }
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
      
      var displayLabel = TRANSLATIONS[lang].labels[s.label] || s.label;
      var pathPrefix = lang === 'en' ? '../' : '';
      b.innerHTML = '<img class="q-icon" src="' + pathPrefix + 'assets/icons/quadratmeter.png" alt="" /> ' + displayLabel;
      
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
    // Messie / Härtefall (aus Füllgrad oder Objektart) → immer individuell
    if (state.fuellgrad === 'Messie / Härtefall') return null;
    var conf = ERWT[state.objekt];
    if (!conf) return null;
    var size = null;
    conf.sizes.forEach(function (s) { if (s.label === state.groesse) size = s; });
    if (!size || !size.v) return null;
    var fi = FUELL_LABELS.indexOf(state.fuellgrad);
    if (fi < 0 || fi > 3) fi = 1; // nur Index 0-3 haben Preiswerte
    var base = size.v[fi];
    var lo = Math.round(base * 0.95 / 10) * 10;
    var hi = Math.round(base * 1.2 / 10) * 10;
    return { lo: lo, hi: hi, base: base };
  }
  
  function fmt(n) {
    if (lang === 'en') {
      return '€' + n.toLocaleString('en-US');
    }
    return n.toLocaleString('de-DE') + ' €';
  }

  function renderResult() {
    var p = calcPrice();
    var range = document.getElementById('dankePriceRange');
    if (!range) return;
    if (p) {
      range.textContent = TRANSLATIONS[lang].approx + fmt(p.lo) + ' – ' + fmt(p.hi);
      state.einschaetzung = fmt(p.lo) + ' – ' + fmt(p.hi);
    } else {
      var isMessie = state.fuellgrad === 'Messie / Härtefall' || state.objekt === 'Messie-Wohnung';
      range.textContent = TRANSLATIONS[lang].indivEst;
      // Angepasster Hinweis im Preis-Label
      var pLabel = document.querySelector('.quiz-danke-price .p-label');
      if (pLabel && isMessie) {
        pLabel.textContent = TRANSLATIONS[lang].messieLabel;
      }
      var pNote = document.querySelector('.quiz-danke-price .p-note');
      if (pNote && isMessie) {
        pNote.textContent = TRANSLATIONS[lang].messieNote;
      }
      var displayObj = TRANSLATIONS[lang].labels[state.objekt] || state.objekt || 'Objekt';
      state.einschaetzung = TRANSLATIONS[lang].individuell + ' (' + displayObj + ')';
    }
    save();

    // Update WhatsApp link on thank you screen with context
    var dankeWaBtn = document.getElementById('dankeWaBtn');
    if (dankeWaBtn) {
      var textObj = TRANSLATIONS[lang].labels[state.objekt] || state.objekt;
      var textSize = TRANSLATIONS[lang].labels[state.groesse] || state.groesse;
      var textFuell = TRANSLATIONS[lang].labels[state.fuellgrad] || state.fuellgrad;
      
      var waText = TRANSLATIONS[lang].waTextTemplate
        .replace('{objekt}', textObj)
        .replace('{groesse}', textSize)
        .replace('{fuellgrad}', textFuell)
        .replace('{plz}', state.plz);
      
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
    if (name.length < 2) { err.textContent = TRANSLATIONS[lang].alertName; err.style.display = 'block'; return; }
    if (tel.replace(/\D/g, '').length < 6) { err.textContent = TRANSLATIONS[lang].alertTel; err.style.display = 'block'; return; }
    if (!document.getElementById('dsgvo').checked) { err.textContent = TRANSLATIONS[lang].alertDsgvo; err.style.display = 'block'; return; }

    state.name = name; state.tel = tel; state.email = email;
    save();

    var subject = 'Anfrage: ' + state.objekt + ', ' + state.groesse + ', ' + state.fuellgrad +
      ' – ' + state.plz + ' – ' + state.termin;
    var lines = [
      'KONTAKT',
      '  Name:      ' + state.name,
      '  Telefon:   ' + state.tel,
      '  E-Mail:    ' + (state.email || '–'),
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
    btn.disabled = true; btn.textContent = TRANSLATIONS[lang].sending;

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

      // Save completed state to sessionStorage
      sessionStorage.setItem('rr_quiz_completed', JSON.stringify(state));
      // Update all WhatsApp links on the page with completed answers
      updateAllWhatsAppLinks();

      var sum = document.getElementById('finalSummary');
      sum.innerHTML = '';
      
      var objLabel = TRANSLATIONS[lang].labels[state.objekt] || state.objekt;
      var sizeLabel = TRANSLATIONS[lang].labels[state.groesse] || state.groesse;
      var fuellLabel = TRANSLATIONS[lang].labels[state.fuellgrad] || state.fuellgrad;
      var terminLabel = TRANSLATIONS[lang].labels[state.termin] || state.termin;
      var einschLabel = state.einschaetzung;

      var rows = [
        [TRANSLATIONS[lang].objekt, objLabel + ', ' + sizeLabel],
        [TRANSLATIONS[lang].fuellgrad, fuellLabel],
        [TRANSLATIONS[lang].ort, TRANSLATIONS[lang].plzPrefix + state.plz],
        [TRANSLATIONS[lang].wunschtermin, terminLabel],
        [TRANSLATIONS[lang].einschaetzung, einschLabel]
      ];

      rows.forEach(function (row) {
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
