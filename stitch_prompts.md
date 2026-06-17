# Google Stitch / Gemini — Design-Prompts (explorativ)

> **So nutzt du es:** Zuerst den **Master-Style-Prompt** schicken (das sind die Leitplanken: Farben, Ton, Comic-Dosis — die bleiben fest). Danach pro Screen den **Screen-Prompt** — der gibt nur das *Ziel* der Sektion vor und lässt Stitch bewusst kreativen Spielraum + bittet um mehrere Varianten. Du pickst die beste, dann schärfst du mit dem Spickzettel unten nach.
> Werte/Stil-Hintergrund: `design.md` + `tokens.txt`. Inhaltsziele: `builder_brief.md`.

## Prinzip: feste Leitplanken, freie Komposition
- **Fest (immer einhalten):** Palette Gelb/Schwarz/Grau (kein Türkis/Blau), Ton (warm, seriös, vertrauenswürdig), Comic dosiert (max. 2–3 Signale/Screen, Pferdle als Guide), Ziel = Anfrage generieren.
- **Frei (Stitch darf überraschen):** konkretes Layout, Anordnung, Bildkomposition, Einbindung des Maskottchens, Microinteractions.
- Pixel-genaue Abstände/Hex aus `tokens.txt` brauchst du in Stitch **nicht** — Präzision kommt erst beim Code-Build (Phase 3). Stitch liefert die Richtung.

---

## 0) MASTER STYLE PROMPT (immer zuerst — die Leitplanken)

```
Design a modern, trustworthy website for "RümpelRoss", a family-run junk-removal and
house-clearance business from Stuttgart, Germany. Overall feel: clean, spacious, professional —
with SUBTLE comic accents, not cartoonish.

Brand palette (STRICT): signature yellow #FFC400, ink black #141414, warm neutral greys
(#FAFAF8, #F2F1EE, #E4E2DD, #6E6B66, #34322F), white. NO teal, NO turquoise, NO blue.
Yellow is an accent only (CTAs, one highlight per section), never a text background.
Text on yellow is always black.

Comic accents, sparingly (max 2–3 per screen): bold 2–3px black outlines on buttons and feature
cards, hard offset shadow "4px 4px 0 #141414" (sticker look, no blur), a friendly cartoon HORSE
mascot ("Pferdle") as a guide, occasional speech bubbles, very subtle halftone dot texture.

Typography: bold condensed sans headlines (like Barlow Semi Condensed, weight 800), clean humanist
sans body (like Barlow). Generous whitespace, 12-col grid, ~1200px max width, mobile-first, large
tap targets, rounded corners 12–16px.

Tone: warm, competent, reassuring (audience often deals with inherited estates / stressful moves).
German UI. Every screen's job: drive a free, no-obligation fixed-price quote request (button + phone).

You have creative freedom on layout and composition within these guardrails. When I ask for a
section, propose 2–3 distinct directions rather than one fixed solution.
```

---

> Die folgenden Screen-Prompts beschreiben **Ziel + Pflichtinhalte**, nicht die exakte Anordnung. Stitch soll Varianten liefern.

## 1) HERO / STARTSEITE
```
Design the homepage hero for RümpelRoss. Goal: in 3 seconds make clear WHAT (Entrümpelung &
Haushaltsauflösung), WHERE (Stuttgart & Umland) and the main reason to choose them, then drive a
quote request. Must include: a strong headline, one primary yellow CTA ("Kostenloses
Festpreis-Angebot anfragen"), a clickable phone number, a small trust signal (review stars /
"versichert" / Handwerkskammer-Betrieb), the Pferdle mascot somewhere, and a sticky header.
Give me 3 distinct layout directions (e.g. mascot-led, photo-led, bold-typography-led). Show desktop
+ a mobile version with a sticky call/request bottom bar. Surprise me within the brand guardrails.
```

## 2) ABLAUF IN 4 SCHRITTEN
```
Design a section that makes the process feel effortless: Anfrage → Besichtigung (kostenlos &
unverbindlich) → Entrümpelung (zum Festpreis) → Freuen. Goal: reduce the customer's perceived effort.
Propose 2–3 visual treatments (e.g. horizontal stepper, timeline, cards with connecting line).
Keep it calm; yellow only as a light accent.
```

## 3) LEISTUNGEN
```
Design a services overview for three offerings: Entrümpelung & Haushaltsauflösung, Innenausbau &
Renovierung, Bodenverlegung. Goal: communicate the unique "everything from one source" strength and
lead each to a detail page. Each needs a real photo, a clear title, a one-line benefit, a link.
Give me 2–3 layout ideas (cards, alternating rows, etc.).
```

## 4) WARUM RÜMPELROSS (Vertrauen/USP)
```
Design a trust strip highlighting: Festpreis-Garantie, versicherte Entrümpelung, nachhaltig &
umweltschonend, termingerecht & besenrein. Goal: lower risk and build credibility fast. Try one light
version and one dark ink-background version (white text, yellow icons) so I can compare rhythm.
```

## 5) FAMILIENBETRIEB-STORY
```
Design an "about the family business" section. Goal: build trust through real people — Vater, Sohn &
Cousin plus trained craftsmen; clearance + renovation + flooring from one team. Needs space for an
authentic team photo and warm copy; the mascot may add a friendly schwäbisch line. Show me 2 directions
(photo-dominant vs. story-dominant). Minimal yellow, human and credible.
```

## 6) NACHHALTIGKEIT
```
Design a sustainability section around "Spenden statt Wegwerfen": on-site sorting, donation and
value-recovery that lowers the customer's disposal costs. Goal: differentiate + turn eco into a
money-saving argument. Credible, no greenwashing clichés. 2 layout ideas.
```

## 7) EINZUGSGEBIET
```
Design a service-area section for Stuttgart (Großraum + Rems-Murr), Böblingen, Esslingen, Ludwigsburg,
Göppingen. Goal: signal local presence (also for SEO). Try a map-based version and a clean tile/list
version. One yellow pin accent.
```

## 8) SOCIAL PROOF / BEWERTUNGEN
```
Design a testimonials + trust section using real Google reviews (name + stars), plus a row of
partner/membership logos and a Google rating badge. Goal: social proof. Speech bubbles are a nice comic
fit but propose at least one non-bubble variant too.
```

## 9) VORHER / NACHHER
```
Design a before/after proof section showing a cluttered space turned clean and broom-swept. Goal: visual
proof of results. Offer a paired-images version and an interactive slider version. Let the photos lead.
```

## 10) FINALER CTA + FORMULAR
```
Design the final conversion section to capture a quote request. Fields: Name, Telefon, E-Mail, Anliegen,
optional photo upload, DSGVO checkbox. Must include a reassurance line ("Antwort innerhalb von 24
Stunden"), a prominent phone alternative, and a big yellow submit button with black text. Goal: maximize
completed requests. Give me 2 directions (form-centered vs. split with mascot/reassurance side).
```

## 11) FOOTER
```
Design a footer on ink-black (#141414): logo, contact/NAP, Bürozeiten Mo–Sa 10–18, resource links
(Kontakt, FAQ, Tipps, AGB, Impressum, Datenschutz), social icons, trademark note. Yellow only for
hover/links. Clean and organized. One or two layout options.
```

---

## Iterations-Spickzettel (zum Nachschärfen der gewählten Variante)
- Richtung wählen: „I like direction 2 — refine that one."
- Ruhe: „More whitespace, calmer, fewer elements."
- Fokus: „Make the primary CTA the clear focal point."
- Comic dosieren: „Reduce comic elements to max 2 in this view." · „Mascot smaller / more professional pose."
- Charakter: „Stronger black outline + hard sticker shadow on buttons." · „Highlight one keyword in the headline like a yellow marker."
- Mobile: „Show the mobile version with a sticky call+request bottom bar."
- Farb-Check: „No teal/blue anywhere — yellow accent only, black text on yellow."
