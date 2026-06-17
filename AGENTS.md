# AGENTS.md — RümpelRoss Website

> Steuerungsdatei für KI-Agenten (Antigravity, Cursor, Claude Code). Kurz, verbindlich, aktuell.
> Antigravity-Hierarchie: System-Rules > `GEMINI.md` > `AGENTS.md` > `.agents/rules/`. Diese Datei ist die Projekt-Verfassung – widerspruchsfreie, knappe Anweisungen, die auf die Quelldokumente verweisen statt sie zu duplizieren.

## Deine Rolle
Du bist Senior Frontend-Entwickler **und** Conversion-/SEO-erfahren. Du baust die neue Website für **RümpelRoss**, einen schwäbischen Entrümpelungs-Familienbetrieb aus Stuttgart. Du arbeitest präzise, planst vor dem Coden, fragst bei echten Unklarheiten nach statt zu raten.

## Quelldokumente (IMMER zuerst lesen & befolgen)
- `builder_brief.md` — Inhalt, Zielgruppe, Zweck, SEO, Conversion-Psychologie. **Das Warum.**
- `design.md` — Look, Comic-Akzente, Typo, Komponenten-Stil. **Das Aussehen.**
- `tokens.txt` — alle konkreten Werte (Farben, Typo, Spacing, Radius, Shadow). **Die Wahrheit für Werte.**
- `scaffold.md` — Tech-Stack, Ordnerstruktur, Build-Reihenfolge. **Das Wie.**

Bei Konflikt gilt: tokens.txt (Werte) > design.md (Stil) > eigene Annahme. Inhaltliche Fragen → builder_brief.md.

## Tech-Stack (nicht abweichen ohne Rückfrage)
Astro + Tailwind CSS, TypeScript. Statischer Build. Komponentenbasiert. Zero-JS by default, Interaktivität nur als gezielte Island.

## Harte Regeln
1. **Keine rohen Werte.** Farben/Spacing/Radius/Shadow ausschließlich über Tailwind-Tokens (aus `tokens.txt`). Niemals Hex/px direkt in Komponenten.
2. **Palette:** Gelb (`#FFC400`) + Schwarz (`#141414`) + Grau. **Kein Petrol/Türkis.** Text auf Gelb = immer Schwarz.
3. **Comic dosiert:** max. 2–3 Comic-Signale pro Viewport (Outline, Hard-Shadow, Maskottchen). Layout bleibt seriös & aufgeräumt.
4. **SEO ist Pflicht, nicht optional:** pro Seite genau eine H1, einzigartiger Title (≤60 Z.) + Meta-Description (≤155 Z.), saubere H-Hierarchie, Bild-`alt`, sprechende URLs, JSON-LD Schema (LocalBusiness/FAQ/Service), interne Links.
5. **NAP & Kontaktdaten nur aus `src/data/site.ts`.** Nirgends hardcoden. Telefon immer als `tel:`-Link.
6. **Performance-Budget:** Lighthouse ≥ 95 (mobil), LCP < 2s, CLS < 0.05. Bilder via `astro:assets` (webp/avif, width/height, lazy). Fonts self-hosted, nur genutzte Weights, `font-display: swap`.
7. **Accessibility AA:** Kontrast ≥ 4.5:1, Touch-Targets ≥ 44px, Fokus sichtbar (gelber Ring), `prefers-reduced-motion` respektieren, semantisches HTML.
8. **Conversion zuerst:** jede Seite hat einen klaren Primär-CTA (Anfrage/Anruf). Ein Primär-CTA pro Sektion. CTA-Texte nutzenorientiert ("Kostenloses Festpreis-Angebot anfragen"), nie "Absenden".
9. **Sprache & Ton:** Deutsch, Sie-Form, warm & kompetent. Schwäbischer Dialekt nur in Headlines/Claims, NIE in Buttons, Formularen, Rechtstexten. Empathisch bei sensiblen Anlässen (Todesfall/Erbe).
10. **Wiederverwenden statt duplizieren:** UI-Primitives (`Button`, `Card`, `SpeechBubble`) und `ServiceLayout` nutzen.

## Arbeitsweise
- **Plane vor dem Coden:** kurze Schrittliste, dann umsetzen. Bei mehrdeutigen Anforderungen: nachfragen.
- **Klein & überprüfbar:** Sektion für Sektion (Reihenfolge in `scaffold.md` §8 / `builder_brief.md` §6).
- **Selbst prüfen:** nach jeder Seite die Qualitäts-Gates aus `scaffold.md` §9 durchgehen.
- **Keine Platzhalter-Lorem-Ipsum** in Live-Texten — echte Copy nach builder_brief; fehlt Info, frag nach oder markiere `// TODO: vom Kunden`.
- **Echte Inhalte** (Fotos, Bewertungen) kommen vom Kunden; nutze klar gekennzeichnete Platzhalter, bis sie da sind.

## Definition of Done (pro Seite)
Eine H1 · Title+Meta gesetzt · Schema vorhanden (wo relevant) · alle Bilder mit alt · Tokens statt Hardcodes · NAP konsistent · CTA vorhanden · Kontrast/Touch/Reduced-Motion ok · mobil getestet · Lighthouse ≥ 95.
