# Strategie: Mobile-Optimierung & Englische Zielgruppe

_Stand: 25.06.2026 · Basis: aktueller Code in `site/` (finaler Stand)_

Zwei Baustellen, eine Reihenfolge: **erst Mobile fixen, dann Englisch bauen.** Begründung am Ende von Teil 2 — kurz: die EN-Seite teilt sich CSS/JS mit der DE-Seite und erbt die Mobile-Fixes automatisch. Andersrum müsstest du alles doppelt reparieren.

---

## Teil 1 · Mobile

### Diagnose: nicht „kein Mobile", sondern „Desktop-Choreografie, die mobil bricht"

Das CSS hat reichlich Mobile-Logik (Hamburger-Drawer, Sticky-Bar, Mobile-First-Breakpoints, Hero-Anpassungen). Das Problem ist nicht fehlende Responsiveness — es sind ein paar aufwendige Scroll-Effekte, die auf dem Desktop beeindrucken und auf dem Handy ruckeln, springen oder Daten fressen. Genau das fühlt sich als „gar nicht optimiert" an.

### Die konkreten Bruchstellen (im Code gefunden)

| # | Problem | Befund | Hebel |
|---|---------|--------|-------|
| **A** | **Ablauf-Scrollytelling** | Lädt **97 Frames / 7 MB** (`video_seq/`) auch auf Mobile vor und rendert eine `position:fixed`-Canvas mit `clip-path`-Neuberechnung bei **jedem** Scroll-Event. Die `mqDesktop`-Abfrage ist in `main.js` definiert, aber **nie angewendet** → läuft ungebremst auf dem Handy. `position:fixed` + dynamische Adressleiste + clip-path = das klassische iOS-Safari-Ruckel-/Sprung-Muster. | **Größter Hebel.** Mobil komplett deaktivieren: statt Canvas ein statisches Bild oder simple gestapelte Schritt-Karten. Spart 7 MB + behebt das Hauptruckeln. |
| **B** | **Sticky-Video-Hero** | `position:sticky; height:100svh` + Autoplay-MP4 (1,3 MB), über das sich `.reveal-content` schiebt. Sticky-Reveal reagiert empfindlich auf die ein-/ausfahrende Adressleiste → Höhensprünge. Autoplay-Video kostet Daten/Akku; iOS-Stromsparmodus spielt es gar nicht ab. | Mobil: Video durch Poster/AVIF ersetzen (oder erst nach Interaktion laden), Höhe mit `svh`/`dvh` an echten Geräten prüfen, Reveal-Effekt vereinfachen. |
| **C** | **Parallax + Scroll-Reveals** | `[data-parallax]` und `[data-reveal]` laufen scrollgebunden auch auf Touch — unnötig, ruckelig, lenkt vom schnellen Conversion-Pfad ab. | Mobil aus (Breakpoint + `prefers-reduced-motion` greift schon teilweise). |
| **D** | **Gesamt-Performance** | Mobiler Lade-Ballast: `video_seq` 7 MB (via Canvas — entfällt mit Fix A) + `header.mp4` 1,3 MB Autoplay + render-blockende Google-Fonts. Schlechtes LCP, hoher Datenverbrauch auf mobilem Netz. Zusatzbefund: `assets/ablauf/` (5,5 MB) und `hero-header.avif` werden **nirgends referenziert** → toter Ballast. | Effekt-Assets Desktop-only, Fonts self-hosten (oder `preload`), Bilder konsequent `loading="lazy"`; ungenutzte Assets löschen. |
| **E** | **Detail-Polish** | Buttons ok (min-height 48 px). Zu prüfen an echten Geräten: horizontale Overflows (Kicker-Städte-Animation, Ticker), Nav-Drawer-Verhalten, Sticky-Bar-Überlappung (Padding ist gesetzt — gut), Touch des Vorher/Nachher-Sliders. | Systematischer Real-Device-QA-Pass. |
| **F** | **Abstände stimmen mobil nicht** | `--sec-y: clamp(64px, 9vw, 112px)`: der mittlere Wert (9vw) unterschreitet die 64px-Untergrenze erst ab ~711px Breite. Heißt: **jedes** Handy bekommt fix 64px oben/unten pro Sektion — eine Desktop-Größe, die mobil nie kleiner wird → zu viel Leerraum, Sektionen wirken zusammenhanglos. Dazu Rhythmus-Brecher durch Inline-Overrides (`style="padding-top:0"` an S5, verstreute feste `margin-top`-px). | Responsive Spacing-Skala: Mobile-Untergrenze runter auf ~40–48px (z.B. `clamp(44px, 8vw, 112px)`), `sec-head`-Margin analog; Inline-Overrides durch saubere Klassen ersetzen. |

### Logo: Weiß-Überblendung über dem Hero (betrifft alle Viewports)

**Befund:** Über dem Video filtert das CSS das Logo mit `filter:brightness(0) invert(1)` zu reinem Weiß. Das plättet das **ganze** Logo inkl. des detaillierten Pferdle-Maskottchens zu einer konturlosen weißen Silhouette — genau dein „sieht aus wie ein Fehler". Das Maskottchen ist euer stärkstes Markenelement; als weißer Blob wirkt es billig.

**Zur Opacity-Idee — eher nein:** Weniger Deckkraft macht die weiße Silhouette nur *blasser*, die Details kommen nicht zurück. Ein halbtransparentes Logo sieht aus wie ein Wasserzeichen/Platzhalter — also noch mehr nach Fehler.

**Empfehlung (Asset existiert schon):** Über dem Hero `logo-full-white.png` einsetzen — dort ist nur der Schriftzug weiß, das Pferdle bleibt **farbig und detailliert**. Also das Bild austauschen statt CSS-Filter: nicht-gescrollt → `logo-full-white.png`, gescrollte gelbe Leiste → farbiges `logo-full.png` (wie bisher). Den Kontrast auf hellen Videostellen liefert der vorhandene dunkle Overlay-Verlauf oben; optional ein dezenter Schatten. So bleibt die Marke erkennbar und der „Fehler-Look" ist weg.

### Prinzip

**Mobil ist eine eigene Erfahrung, kein geschrumpfter Desktop.** Die Scroll-Choreografie ist Desktop-Kür. Mobil zählen drei Dinge: Speed, Daumen-Reichweite, schneller Conversion-Pfad (Anruf / WhatsApp / Quiz). Alles, was diese drei nicht bedient, fliegt mobil raus oder wird statisch.

### Priorisierte Umsetzung

1. **Ablauf-Scrollytelling mobil killen** → statisches Bild / Schritt-Karten. (Hoher Impact, kleiner Aufwand)
2. **Logo-Fix** → `logo-full-white.png` statt CSS-Weißfilter. (Schnell, behebt den sichtbaren „Fehler")
3. **Abstände** → responsive Spacing-Skala, Mobile-Untergrenze runter, Inline-Overrides raus.
4. **Hero mobil stabilisieren** → Poster statt Autoplay-Video, Höhe robust, Reveal simpel.
5. **Parallax/Reveals mobil aus.**
6. **Performance-Diät** → Effekt-Assets Desktop-only, Fonts, Lazy-Loading.
7. **QA-Pass an echten Geräten** (iPhone Safari + Android Chrome + Lighthouse Mobile).

---

## Teil 2 · Englische Zielgruppe & SEO

### Warum sich das lohnt (Marktgröße)

- **US-Militärgemeinde Stuttgart: ~20.000–28.000 Personen** (Soldaten, zivile Mitarbeiter, Vertragspartner, Familien) über **5 Standorte**: Patch, Kelley, Robinson Barracks, Panzer Kaserne, Stuttgart Army Airfield.
- **Große Expat-/Konzern-Szene**: Bosch, Mercedes-Benz/Daimler, Porsche, HP, IBM u.a.; ~40 % der Stuttgarter mit Migrationshintergrund; „Stuttgart Expats" ist die größte internationale Community der Region.
- **Perfekter Fit zur Leistung:** Diese Leute machen **PCS-Umzüge / Relocations** — oft kurzfristig, mit festem Budget/Allowance, und mit genau einem Schmerzpunkt: Wohnung leerräumen, Möbel demontieren & entsorgen, **besenrein zum Festpreis übergeben** — auf Englisch, damit der Vermieter die Kaution zurückgibt.
- **Wettbewerb dünn:** Für englisches *Clearance* gibt es kaum jemanden (Aulfinger hat eine `/en/`-Seite, entrumpelt.com). Englischsprachige Anbieter sind fast alle *Reinigung*. Die Lücke — besonders der **Military/PCS-Winkel** — ist offen.

### Deine zwei Fragen, direkt beantwortet

**Frage: Komplette Seite übersetzen oder nur einen Teil einfügen?**

→ **Eigene, vollständige englische Version unter eigener URL (`/en/`) — kein Teil-Einschub auf der deutschen Seite.**

- **SEO:** Nur eine eigene, crawlbare URL kann für „house clearance Stuttgart" ranken. Ein englischer Absatz auf der deutschen URL rankt nicht und mischt zwei Sprachen auf einer Seite (schlecht für Google *und* Nutzer).
- **Conversion:** Wer auf Englisch landet, braucht die ganze Reise auf Englisch (Hero → Leistungen → Preise → Quiz → Kontakt), nicht einen einzelnen Absatz.
- **Pragmatisch aber phasen, nicht 1:1 alles übersetzen:** Phase 1 = eine **fokussierte englische Landingpage** mit dem Conversion-Kern (Hero, Leistungen inkl. *dismantling*, Festpreis, Ablauf, Trust, Kontakt/WhatsApp/Quiz). Phase 2 = ausbauen (FAQ, Einzugsgebiet, eigene PCS-Seite). Die conversion-relevanten 80 % zuerst.

**Frage: Switch einbauen? Logo-Icon platzieren oder gleich auf Englisch switchen?**

→ **Sichtbarer Text-Switch im Header: „DE | EN" — keine Flagge.**

- **Keine Flagge:** Flaggen stehen für Länder, nicht Sprachen. Für Englisch welche — UK oder US? Beide sind falsch für eine internationale Zielgruppe. Text „DE/EN" ist eindeutig und barrierearm.
- **Platzierung:** oben rechts, vor/neben dem CTA. Mobil zusätzlich in den Nav-Drawer.
- **Kein Auto-Redirect** nach Browsersprache oder IP (Google rät ab, nervt Nutzer, verwirrt den Crawler). Nutzer wählt selbst. Optional ein **einmaliger, dezenter Hinweis** („This site is also available in English →"), wenn die Browsersprache nicht Deutsch ist.
- Jede Seite verlinkt per Switch auf ihr direktes Gegenstück (DE-Home ↔ EN-Home).

### Technisches SEO-Fundament (Pflicht)

- **URL-Struktur: Unterordner `/en/`** (z.B. `ruempelross.de/en/`). Für eine Marke auf einer Domain besser als Subdomain/zweite Domain — bündelt die Domain-Autorität, einfach zu pflegen. (Genau das Modell von Aulfinger.)
- **hreflang-Annotationen**, reziprok auf beiden Versionen: `de`, `en` und `x-default`. Im `<head>` oder via Sitemap.
- **Alles Relevante übersetzen:** sichtbarer Text, `<title>` + Meta-Description, `lang="en"`, Alt-Texte — **und das JSON-LD-Schema** (LocalBusiness/FAQ) in der EN-Version auf Englisch.
- **Eigene englische Keywords — nicht wörtlich übersetzt.** Das ist der Copy-/SEO-Kern:

| Deutsch | Englische Keywords (Zielgruppen-Sprache) |
|---|---|
| Entrümpelung | house clearance, flat / apartment clearance, junk removal |
| Möbel raus | furniture disposal & **dismantling** _(dein Muss-Begriff)_ |
| Haushaltsauflösung / Nachlass | (deceased) estate clearance |
| Wohnungsauflösung (Vermieter) | move-out / end-of-tenancy clearance, **broom-clean handover** |
| Messie | hoarder / extreme clearance |
| Festpreis | **fixed price, in writing** |
| Team | **English-speaking team**, fully insured |
| Nische | **PCS clearance, military move-out, expat relocation clearance** |

### Conversion & Psychologie für diese Zielgruppe

Nicht nur Sprache — die Hebel sind andere als bei deutschen Kunden:

- **„Fixed price, in writing"** → Militär/Expats planen mit Budget/Umzugs-Allowance. Planbarkeit schlägt alles.
- **„English-speaking team — we handle it"** → Sprachbarriere ist die Hauptangst. Direkt entkräften.
- **„A broom-clean handover your landlord will accept"** → Kautionsrückgabe / Übergabeprotokoll ist *der* Schmerzpunkt beim Auszug aus einer deutschen Mietwohnung.
- **„Short-notice & PCS timelines"** → kurzfristige Termine sind ein Verkaufsargument.
- **WhatsApp-Foto-Angebot** ist für diese Gruppe ideal (international Standard) — nur die vorbefüllten Texte auf Englisch.
- **Trust übersetzen:** insured (Gothaer), Handwerkskammer-Betrieb, „as seen on SWR/ARD". Mittelfristig ein paar **englische Google-Reviews** sammeln.

### Umsetzung passend zu deinem Stack

Statischer Vanilla-Onepager → unkompliziert, **kein i18n-Framework nötig**:

- `/en/index.html` als Kopie mit übersetztem Inhalt, eigenem JSON-LD und hreflang. **CSS/JS/Assets werden geteilt** → die Mobile-Fixes aus Teil 1 gelten automatisch auch für EN.
- Text in JS (Quiz, WhatsApp-Strings): zweite Strings-Datei oder ein `data-lang`-Schalter.
- Bei nur zwei Sprachen ist **zwei HTML-Dateien pflegen völlig ok** — wichtig nur: eine kleine Checkliste, damit Inhaltsänderungen in beiden landen.

### Roadmap

- **Phase 0 (jetzt):** Mobile-Optimierung der DE-Seite (Teil 1).
- **Phase 1:** EN-Landingpage `/en/` (Conversion-Kern) + Header-Switch + hreflang + EN-Schema + englische WhatsApp-/Quiz-/Formular-Strings.
- **Phase 2:** EN ausbauen (FAQ, Einzugsgebiet) + dedizierte **„PCS / Military move-out"**-Sektion oder eigene Seite `/en/pcs-clearance/`; Google Business Profile feinjustieren (englische Service-Hinweise/Posts — nur *ein* Profil, nicht doppeln).
- **Phase 3:** Reichweite über Expat-Kanäle (stuttgartexpats.com, Facebook-Gruppen, Base-Newcomer-Guides) für Backlinks; englische Reviews sammeln.

---

## Entscheidungen, die ich von dir brauche

1. **EN-Umfang Phase 1:** schlanke Landingpage zuerst (empfohlen) — oder gleich Vollübersetzung aller Sektionen?
2. **Military/PCS-Winkel aktiv bespielen?** Hoher Hebel, etwas mehr Arbeit (eigene Sektion/Seite + spezifische Sprache). Ja/Nein?
3. **Copy:** Ich schreibe die englische Copy native-level + SEO-optimiert (empfohlen) — ok für dich?
4. **Pfad `/en/`** technisch bei deinem Hosting machbar (Unterordner + hreflang)? Bestätigen.

→ Sobald du 1–4 beantwortest, fange ich mit **Phase 0 (Mobile)** an.
