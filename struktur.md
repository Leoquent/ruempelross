# RümpelRoss – Seitenstruktur & Scrollytelling **v2**

> Onepager + wenige Unterseiten. Ersetzt die Multi-Page-Sitemap aus `builder_brief.md` §7. Design: `design.md` v2 · Werte: `tokens.txt` · Quiz: `quiz_funnel.md`.

---

## 1. Sitemap v2

| Seite | Zweck | SEO-Fokus |
|---|---|---|
| **/** (Onepager) | Alles Wesentliche + Conversion | „Entrümpelung Stuttgart", „Haushaltsauflösung Stuttgart" |
| **/anfrage** | Quiz-Funnel (eigene URL → verlinkbar, trackbar, teilbar) | Conversion |
| **/nachlasspflege** | B2B-Premium-Service (eigene Tonalität) | „Nachlasspflege Stuttgart", „Beweissicherung Nachlass" |
| **/entruempelung-{ort}** | Lokale Landingpages (Böblingen, Esslingen, Ludwigsburg, Göppingen, Waiblingen) | lokale Keywords |
| **/faq** | Longtail-SEO + Einwände (FAQPage-Schema) | „Entrümpelung Kosten" etc. |
| **/ratgeber/…** | 3 bestehende Artikel (E-E-A-T) | informational |
| /impressum · /datenschutz · /agb | Pflicht | – |

Navigation (Anker auf dem Onepager): **Ablauf · Leistungen · Preise · Über uns · FAQ** + Button „Kostenlos anfragen" (→ /anfrage) + Telefonnummer.

---

## 2. Onepager – Dramaturgie (Sektion für Sektion)

Psychologische Spannungskurve: *Schmerz spiegeln → Entlastung versprechen → Beweis liefern → Risiko entfernen → Handlung leicht machen.* Visuell: Hell/Dunkel-Wechsel als Kapitel.

### S1 · HERO — dunkel (Ink)
- Kicker: „Entrümpelung & Haushaltsauflösung · Stuttgart & Umgebung"
- H1: **„Ihr Haus ist voll. Ihr Kopf auch."** (Hero-Option A aus `content_optimized.md`)
- Sub: „Wir entrümpeln, sortieren und übergeben besenrein – zum Festpreis. Sie müssen nichts anfassen."
- 3 Häkchen-Punkte: Kostenlose Besichtigung · Festpreis mit Wertanrechnung · Besenreine Übergabe
- CTAs: **[In 60 Sekunden zum Angebot →]** (Quiz) · sekundär: „☎ 0711 23178489"
- Trust-Zeile: ★ Google-Sterne · HWK-Betrieb · 100 % versichert
- *Motion:* Wort-Stagger der H1 beim Load (CSS-only), Häkchen staggern nach.
- *Bild:* großes echtes Einsatzfoto rechts/hinten, abgedunkelt – oder zunächst rein typografisch (lädt schneller, wirkt edler; Foto kann später rein).

### S2 · ABLAUF („So einfach geht's") — hell
- Sticky-Scrollytelling (Desktop): links bleibt „In 4 Schritten sorgenfrei" stehen, rechts scrollen die 4 Schritte durch; eine **gelbe Linie füllt sich** mit dem Scrollfortschritt. Mobile: vertikale Timeline.
- Schritte (aus `content_optimized.md`): Anfrage → Kostenlose Besichtigung (verbindlicher Festpreis) → Entrümpelung zum Festpreis → Besenreine Übergabe.
- Oversize-Ghost-Zahlen 01–04 hinter jedem Schritt.

### S3 · LEISTUNGEN — hell (grey-100)
- 6 Karten im Grid (3×2), Messner-Niveau an Klarheit:
  Entrümpelung · Haushaltsauflösung · Wohnungsauflösung · Messie-/Härtefallentrümpelung · Innenausbau & Renovierung · Bodenverlegung.
- Jede Karte: Icon, 2 Sätze Nutzen, „Mehr →" (öffnet Accordion/Detail inline – kein Unterseiten-Zwang).
- **USP-Hinweis-Karte** (gelbe 3px-Kante): „Entrümpeln + Renovieren aus einer Hand – ein Ansprechpartner, eine Rechnung." (Differenzierung ggü. Messner & Co.)

### S4 · ZWISCHEN-CTA QUIZ — dunkel
- „Was kostet meine Entrümpelung?" + 3 Mini-Häkchen (60 Sekunden · unverbindlich · grobe Ersteinschätzung) + **[Jetzt berechnen →]**.
- Disclaimer-Mikrotext: „Basispreis-Einschätzung – Ihr verbindlicher Festpreis entsteht im persönlichen Gespräch nach kostenloser Besichtigung."

### S5 · WARUM RÜMPELROSS (USP-Leiste) — dunkel, fortgesetzt
- 4 Punkte mit Count-up-Zahlen wo möglich: Festpreis-Garantie · 100 % versichert (Gothaer) · Wertanrechnung senkt Ihre Rechnung · Spenden statt Wegwerfen.
- *Motion:* Stagger-Reveal, Zahlen zählen hoch.

### S6 · ERGEBNISSE (Vorher/Nachher) — hell
- 2–3 Vorher/Nachher-Slider (echte Fotos) + 1 Kundenzitat daneben.
- Kicker: „Wir schaffen Platz, damit Neues entstehen kann."

### S7 · BEWERTUNGEN — hell (grey-100)
- 3 Google-Reviews als Karten (Name, Ort, Sterne), Link „Alle Bewertungen auf Google →".

### S8 · ÜBER UNS / FAMILIENBETRIEB — dunkel
- Echtes Teamfoto + kurzer Text: „Vater, Sohn & Cousin – plus Handwerksgesellen. Wir hören nicht beim leeren Raum auf: Wir renovieren gleich mit."
- Hier darf **eine** schwäbische Zeile stehen (Sympathie), sonst nüchtern.
- Nachlasspflege-Teaser als Feature-Karte: „Für Nachlasspfleger, Anwälte & Erben: lückenlose Beweissicherung. [Mehr →]" (→ /nachlasspflege)

### S9 · EINZUGSGEBIET — hell
- Stilisierte Karte/Region + Städte-Grid mit Häkchen (wie Messner, aber als sauberes Spalten-Grid): Stuttgart (alle Bezirke) · Rems-Murr · Böblingen · Esslingen · Ludwigsburg · Göppingen …
- Städte verlinken auf lokale Landingpages (SEO!).

### S10 · PREISE (Transparenz) — hell (grey-100)
- 3 Beispiel-Anker: Keller/Garage **ab 99 €** · Wohnung < 20 m² **ab 199 €** · größere Objekte: individuelles Festpreis-Angebot.
- Kurzer Text „Warum kein m²-Preis?" (aus `content_optimized.md`) + Link zum Quiz.

### S11 · FAQ — hell
- 5–6 wichtigste Fragen als Accordion (Kosten · Dauer · Schäden/Versicherung · Wertanrechnung · Was passiert mit den Sachen · Termin wie schnell). Rest auf /faq. FAQPage-Schema.

### S12 · FINALER CTA + KURZFORMULAR — dunkel
- H2: „Jetzt kostenloses Festpreis-Angebot sichern" · „Antwort in 24 Stunden."
- Zwei Wege nebeneinander: **Quiz starten** (empfohlen, prominent) ODER Kurzformular (Name, Telefon, Anliegen, DSGVO).
- Telefon + Bürozeiten (Mo–Sa 10–18 Uhr).

### FOOTER — dunkel (grey-900)
- Schriftzug-Logo monochrom, NAP, Links, Social, Rechtliches, Trust-Logos.

### Permanent
- **Header:** sticky, transparent über Hero → ab 80px kompakt mit Backdrop-Blur. Logo (Schriftzug) **oben rechts**, Navigation links/mittig — bewusst gespiegelt zum Standard = das „Outside the box"-Detail, das die Seite einzigartig macht, ohne Usability zu kosten. (Alternativ klassisch links, falls beim Testen irritierend.)
- **Mobile Sticky-Bottom-Bar:** [☎ Anrufen] | [Angebot berechnen] – immer sichtbar, höchste Conversion-Wirkung mobil.

---

## 3. Scrollytelling- & Motion-Spezifikation

Vokabular und Budget: siehe `design.md` §7. Zuordnung:

| Sektion | Effekt | Technik | Kosten |
|---|---|---|---|
| Hero | Wort-Stagger, Häkchen-Stagger | reines CSS (`animation-delay`) | 0 KB JS |
| Ablauf | Sticky-Spalte + füllende gelbe Linie | `position: sticky` + rAF-Scrollprogress (oder `animation-timeline: view()` + Fallback) | ~1 KB |
| Alle Sektionen | Reveal (opacity+translateY, Stagger) | 1 gemeinsamer `IntersectionObserver` | ~1.5 KB |
| USP | Count-up Zahlen | gleicher Observer + rAF | ~0.5 KB |
| Vorher/Nachher | Slider (clip-path + Drag) | kleines Vanilla-Island | ~2 KB |
| Header | Scroll-State | 1 Listener (passive) | ~0.3 KB |

Gesamtes Animations-JS < 6 KB. Keine Library. `prefers-reduced-motion` deaktiviert alles. No-JS: Inhalte sichtbar (Startzustände nur bei `.js` auf `<html>`).

---

## 4. Responsive-Verhalten

- **Mobile-first.** Sticky-Scrollytelling (S2) nur ≥ `lg` – darunter lineare Timeline.
- Grids: 1 Spalte → 2 (`sm`) → 3 (`lg`).
- Oversize-Ghost-Zahlen mobil kleiner (`clamp`) und hinter Text, nie Overflow.
- Touch-Targets ≥ 48px, Quiz-Optionen volle Breite.
- Sticky-Bottom-Bar nur < `lg`; Desktop hat Header-CTA.

---

## 5. SEO auf dem Onepager (wichtig bei Anker-Struktur)

- **Eine H1** (Hero). Sektionen = H2 mit Keyword-Substanz („Entrümpelung & Haushaltsauflösung in Stuttgart – unsere Leistungen").
- Die 6 Leistungs-Karten enthalten je 2–3 Sätze indexierbaren Text (nicht nur Icons) – Accordion-Inhalte im DOM (nicht display:none per JS nachgeladen).
- Lokale Landingpages + /faq + /ratgeber fangen die Keyword-Breite auf, die der Onepager nicht abdecken kann. Interne Links aus S9 + Footer.
- Schema: `LocalBusiness` global · `FAQPage` (S11 + /faq) · `Service` auf /nachlasspflege & lokalen Seiten · `BreadcrumbList` auf Unterseiten.
- Title: „Entrümpelung Stuttgart – Festpreis & kostenlose Besichtigung | RümpelRoss" · Description ≤ 155 Z. mit Telefonnummer.
- 301-Redirects der alten Wix-URLs.

---

## 6. Performance-Budget (verbindlich)

- LCP < 2.0 s (mobil) · CLS < 0.05 · Lighthouse ≥ 95 überall.
- Hero ohne großes Bild ODER Hero-Bild als `avif`, preloaded, < 120 KB.
- Fonts: Barlow + Barlow Semi Condensed self-hosted, nur 400/600/700/800, `woff2`, `font-display: swap`, Subset latin.
- JS-Gesamtbudget Startseite: **< 25 KB** (Animation ~6 KB + Nav + Slider). Quiz-JS nur auf /anfrage laden.
- Bilder lazy (außer Hero), exakte Dimensionen, `srcset`.
- Keine externen Embeds above the fold; Google-Reviews als statische Karten (kein Widget-Script).

---

## 7. Offene Punkte
- Echte Fotos (Team, Vorher/Nachher) → bestimmen, ob Hero mit Bild oder typografisch startet.
- Echte Google-Bewertungen (3 Stück, Name + Ort).
- Header-Logo rechts: nach erstem Prototyp kurz testen (5-Sekunden-Test), sonst links.
