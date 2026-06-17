# RümpelRoss – Design Language **v2**

> Single source of truth für das visuelle Design. **v2 ersetzt das Comic-Konzept vollständig** – kein Maskottchen auf der Website, keine Sticker-Optik, keine Sprechblasen. Referenz-Niveau: messner-service.de (ruhig, seriös, modern), aber eigenständiger und dynamischer.
> Maschinenlesbare Werte: `tokens.txt`. Inhalte/Strategie: `builder_brief.md`, `content_optimized.md`. Struktur: `struktur.md`.

---

## 1. Designidee in einem Satz

**Ruhige, dunkle Eleganz mit einem präzisen Gelb-Akzent – die Seite wirkt wie ein aufgeräumter Raum: viel Luft, klare Linien, nichts Überflüssiges.**

Entrümpelung ist ein ernstes Vertrauensthema (Erbfall, Trauer, Stress). Das Design verkauft **Entlastung und Ordnung** – und demonstriert beides durch seine eigene Aufgeräumtheit. Das Gelb (Stuttgarter Wappen, Logo) bleibt als Marken-DNA, wird aber vom Comic-Pop zum **Premium-Signal**: schmal, gezielt, hochwertig – wie ein gelber Markierstreifen auf schwarzem Werkzeug.

**Leitprinzip:** *Die Seite selbst ist der Beweis: aufgeräumt, klar, zuverlässig.*

---

## 2. Logo-Regel

- **Nur das Text-/Schriftzuglogo** (`ruempelross_schriftzug.svg`) – oben rechts im Header. Sonst nirgends Logo-Spielereien.
- Kein Pferdle, kein Wagen, keine Maskottchen-Posen auf der Website.
- Footer: Schriftzug in Weiß/Monochrom erlaubt.

---

## 3. Farben (CI v2)

Gleiche DNA (Gelb + Schwarz + warme Neutrale), neue Gewichtung: **dunkler, ruhiger, edler.** Die Seite wechselt rhythmisch zwischen hellen und dunklen („Ink") Sektionen – das erzeugt die moderne, dynamische Anmutung beim Scrollen.

### Primär

| Rolle | Name | HEX | Einsatz |
|---|---|---|---|
| Signature | **Ross-Gelb** | `#FFC400` | CTAs, aktive Zustände, Akzentlinien, Zahlen-Highlights. **Sehr dosiert** – max. 1 Gelb-Element pro Viewport. |
| Hover/Aktiv | Gold-Dunkel | `#E09600` | Hover gelber Buttons |
| Tinte | **Ross-Schwarz** | `#141414` | Dunkle Sektionen, Headlines, Text |
| Tinte-Soft | Anthrazit | `#1F1F1F` | Karten auf dunklen Sektionen |

### Neutrale (warme Grau-Skala – unverändert aus tokens.txt)

`grey-50 #FAFAF8` Seitenhintergrund hell · `grey-100 #F2F1EE` alternierende Sektionen · `grey-200 #E4E2DD` Rahmen/Trenner · `grey-600 #6E6B66` Sekundärtext · `grey-800 #34322F` Fließtext · `white #FFFFFF` Karten.

### Neue Gewichtung (statt 60-30-10 hell)

- **~45 %** Hell (Off-White/Weiß) – Inhaltssektionen
- **~45 %** Dunkel (Ink/Anthrazit) – Hero, Zwischensektionen, Quiz, Footer
- **~10 %** Ross-Gelb – ausschließlich dort, wo gehandelt werden soll

> Der Hell/Dunkel-Wechsel ist das zentrale visuelle Stilmittel: Er gibt der Seite Tiefe und Kapitel-Gefühl (Scrollytelling) **ohne** ein einziges Bild laden zu müssen.

### Verbote
- Gelb nie als Flächenhintergrund für Fließtext.
- Weißer Text nie auf Gelb. Text auf Gelb = immer `#141414`.
- Keine Verläufe als Dekoration (max. sehr subtile radiale Aufhellung in dunklen Hero-Flächen).
- Kontrast: Fließtext AA (4.5:1), Headlines möglichst AAA.

---

## 4. Typografie

Unverändert in der Familie, geschärft im Einsatz:

| Rolle | Schrift | Einsatz |
|---|---|---|
| Logo | Akko Pro Condensed | nur im SVG-Asset |
| Display/Headlines | **Barlow Semi Condensed** 700/800 | groß, eng, selbstbewusst |
| Fließtext/UI | **Barlow** 400/500/600 | ruhig, exzellent lesbar |

### Stil-Update v2
- **Große, ruhige Headlines** statt Marker-Hinterlegung: Highlight-Wörter bekommen Gelb als **Textfarbe** (auf dunklem Grund) oder eine **2px gelbe Unterstreichung** (auf hellem Grund) – kein gelber Kasten mehr.
- **Oversize-Zahlen** als Gestaltungselement: Schrittnummern (01–04), Statistiken („500+ Aufträge") in 6–8rem Barlow Semi Condensed 800, `grey-200` bzw. `#2A2A2A` auf dunkel – dezent im Hintergrund der Sektion. Gibt Editorial-Charakter ohne Bilder.
- **Kicker-Labels** über jeder Sektion: `UPPERCASE`, 0.8rem, Letter-Spacing 0.1em, `grey-600` bzw. Gelb auf dunkel. (Wie Messners „Schnell, transparent und stressfrei.")
- Schwäbischer Dialekt: **raus aus dem Hauptdesign.** Maximal eine charmante Zeile im Über-uns-Block, nie in Headlines, Buttons, Funnel.
- Type-Scale bleibt (Major Third, fluid via `clamp()`): Display `clamp(2.5rem, 5vw, 4rem)` etc. – siehe `tokens.txt`.

---

## 5. Komponenten-Stil v2 (ersetzt Comic-Komponenten)

### Buttons
- **Primär:** Gelb `#FFC400`, Text `#141414`, **kein Outline, kein Hard-Shadow.** Radius `10px`. Hover: Gold-Dunkel + dezentes Anheben (`translateY(-2px)` + `shadow.soft`).
- **Sekundär (auf hell):** transparent, 1.5px Border `#141414`, Hover: füllt sich schwarz, Text weiß.
- **Sekundär (auf dunkel):** transparent, 1.5px Border `rgba(255,255,255,.3)`, Hover: Border weiß.
- **Ghost:** Text + Pfeil `→`, Pfeil wandert 4px nach rechts beim Hover.

### Karten
- Hell: Weiß, Radius `16px`, 1px Border `grey-200`, `shadow.card`. Hover: `translateY(-4px)` + `shadow.soft`. **Keine schwarzen Comic-Outlines mehr.**
- Dunkel: Anthrazit `#1F1F1F`, 1px Border `rgba(255,255,255,.08)`. Hover: Border `rgba(255,196,0,.5)` – der gelbe Rahmen-Glow ist das Premium-Hover-Signal.
- Feature-Karte (z.B. Nachlasspflege-Teaser): linke 3px-Kante in Gelb.

### Formulare / Quiz
- Große Touch-Flächen (≥ 48px), Radius `12px`, 1.5px Border, Fokus: gelber Ring `0 0 0 3px rgba(255,196,0,.35)`.
- Quiz-Optionen als **wählbare Karten** (Icon + Label), ausgewählt = gelbe Border + Häkchen. Fortschrittsbalken in Gelb.

### Icons
- Lucide/Phosphor, 1.75–2px Stroke, monochrom (Ink bzw. Weiß). Gelb nur für den aktiven/wichtigsten Zustand. Keine bunten Icon-Hintergründe.

### Trennung / Linienführung
- Sektionsübergänge hell↔dunkel: harte, gerade Kante (kein Wellen-/Schrägen-Kitsch).
- Feine `1px`-Linien (`grey-200` / `rgba(255,255,255,.08)`) strukturieren Listen & Grids – Editorial-Look.

---

## 6. Bilder & Bildsprache

- **Echte Fotos** (Team, Einsätze, Vorher/Nachher) sind Pflicht-Content – auf dunklen Sektionen wirken sie automatisch hochwertig.
- Behandlung: leicht entsättigt, konsistente Wärme; auf dunklen Sektionen dezente Abdunklung (`brightness(.9)`) für Text-Overlays.
- **Vorher/Nachher-Slider** = stärkstes Beweis-Element, prominent platzieren.
- Format: `avif/webp`, exakte `width/height`, lazy (außer Hero), `alt` immer.
- Kein Stock-Klischee (lachende Models mit Kartons).

---

## 7. Motion & Scrollytelling (das „Dynamische")

Bewegung erzählt die Geschichte des Aufräumens: **Elemente finden ihren Platz.** Alles GPU-billig (nur `transform` + `opacity`), kein Scroll-Jacking, kein Layout-Shift.

### Prinzipien
1. **Ein Effekt-Vokabular, konsequent:** Einblenden = `opacity 0→1` + `translateY(24px→0)`, 500–700ms, `cubic-bezier(0.22,1,0.36,1)`, einmalig beim ersten Sichtbarwerden (`IntersectionObserver`, threshold ~0.2).
2. **Stagger:** Karten/Listen-Kinder mit 80–100ms Versatz nacheinander – das „Einsortieren"-Gefühl.
3. **Count-up** bei Zahlen (Aufträge, Jahre, Tonnen gespendet) beim Eintritt in den Viewport.
4. **Zeichnende Linien:** Die 4 Prozessschritte verbindet eine vertikale Linie, die sich beim Scrollen füllt (Gelb) – via `stroke-dashoffset` oder `scaleY`, an Scrollposition gekoppelt (`requestAnimationFrame` + passive listener oder CSS `animation-timeline: view()` mit JS-Fallback).
5. **Sticky-Kapitel (1× pro Seite, Desktop):** Im Leistungs- oder Ablauf-Block bleibt die linke Spalte (Headline) sticky, rechts scrollen die Inhalte durch – klassisches, billiges Scrollytelling ohne Library.
6. **Hero:** Headline-Wörter staggern beim Load (CSS-only), dezente Parallax-Tiefe (max. 8px) auf Hintergrund-Element – optional, zuerst messen.
7. **Header:** transparent auf Hero, ab 80px Scroll: kompakt + `backdrop-blur` + Hintergrund Ink/95 %.

### Budget & Disziplin
- **Keine Animations-Library** (kein GSAP/AOS) – ~2–3 KB Vanilla-JS `IntersectionObserver`-Helper reicht für 90 % der Effekte.
- `prefers-reduced-motion: reduce` → alle Animationen aus, Inhalte sofort sichtbar.
- Animierte Elemente bekommen `will-change` nur kurzzeitig; nie `top/left/height` animieren.
- Above-the-fold-Inhalt ist **ohne JS sichtbar** (Animation = Progressive Enhancement: Default sichtbar, `.js`-Klasse aktiviert Startzustände).

---

## 8. Tonalität

- **Sie-Form**, warm, klar, entlastend. „Wir kümmern uns um alles – Sie müssen nichts anfassen."
- Empathisch bei sensiblen Anlässen, sachlich-präzise im Nachlasspflege-Bereich (B2B).
- Konkrete Versprechen statt Floskeln: „Antwort in 24 h", „kostenlose Besichtigung", „Festpreis".
- Humor/Dialekt: fast null. Charakter kommt aus Wärme + Präzision, nicht aus Witz.

---

## 9. Do / Don't v2

**Do:** Hell/Dunkel-Rhythmus · ein Gelb-Akzent pro Viewport · Oversize-Zahlen · feine Linien · echte Fotos · Stagger-Reveals · große ruhige Headlines · ein CTA-Stil, rhythmisch wiederholt.

**Don't:** Maskottchen/Comic-Outlines/Hard-Shadows/Sprechblasen (alles v1, verworfen) · Gelb als Fläche · mehr als ein auffälliger Effekt pro Sektion · Scroll-Jacking · Animations-Libraries · Stockfotos · Dialekt in UI-Texten.

---

*Verbunden: `tokens.txt` (Werte v2) · `struktur.md` (Seitenaufbau & Scrollytelling) · `quiz_funnel.md` (Quiz + Kostenrechner) · `builder_brief.md` (Strategie) · `content_optimized.md` (Copy).*
