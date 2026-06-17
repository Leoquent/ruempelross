# RümpelRoss – Scaffold (Tech-Architektur)

> Wie die Seite technisch aufgebaut wird. Stack: **Astro + Tailwind CSS**. Ziel: blitzschnell, SEO-stark, einfach in Antigravity zu pflegen. Werte aus `tokens.txt`, Look aus `design.md`, Inhalt aus `builder_brief.md`.

---

## 1. Warum dieser Stack

**Astro** rendert statisches HTML (Zero-JS by default) → Top-Ladezeit & Lighthouse-Scores, ideal für eine SEO-getriebene Service-Seite. Komponentenbasiert (gut wartbar), Bild-Optimierung eingebaut (`astro:assets`), Content Collections für Blog/Ratgeber & lokale Seiten. Interaktives (Slider, mobile Nav, Formular) wird gezielt als „Island" nachgeladen.
**Tailwind** = schnelles, konsistentes Styling direkt an den Tokens.

---

## 2. Ordnerstruktur

```
ruempelross/
├─ public/                      # statische Assets, 1:1 ausgeliefert
│  ├─ images/                   # optimierte Fotos (webp/avif)
│  ├─ mascot/                   # Pferdle-Posen (SVG)
│  ├─ logo/                     # Logo-Varianten (SVG)
│  ├─ favicon.svg
│  ├─ robots.txt
│  └─ site.webmanifest
├─ src/
│  ├─ components/
│  │  ├─ layout/   Header.astro · Footer.astro · MobileNav.astro · StickyCallBar.astro
│  │  ├─ ui/       Button.astro · Card.astro · Badge.astro · SpeechBubble.astro · SectionHeading.astro
│  │  ├─ sections/ Hero.astro · Steps4.astro · Services.astro · UspBar.astro ·
│  │  │            FamilyStory.astro · Sustainability.astro · ServiceArea.astro ·
│  │  │            Testimonials.astro · BeforeAfter.astro · Partners.astro · CtaForm.astro · FaqAccordion.astro
│  │  └─ seo/      BaseHead.astro · SchemaLocalBusiness.astro · SchemaFaq.astro
│  ├─ layouts/
│  │  ├─ BaseLayout.astro       # html, head (SEO), Header, Footer, slot
│  │  └─ ServiceLayout.astro    # Vorlage für Leistungsseiten
│  ├─ pages/
│  │  ├─ index.astro            # Start
│  │  ├─ entruempelung.astro
│  │  ├─ innenausbau.astro
│  │  ├─ bodenverlegung.astro
│  │  ├─ preise.astro
│  │  ├─ ueber-uns.astro
│  │  ├─ galerie.astro
│  │  ├─ kontakt.astro
│  │  ├─ faq.astro
│  │  ├─ einzugsgebiete/
│  │  │  ├─ index.astro                 # Hub
│  │  │  └─ [ort].astro                 # generiert je Ort (Böblingen, Esslingen, …)
│  │  ├─ ratgeber/
│  │  │  ├─ index.astro
│  │  │  └─ [...slug].astro             # Blog aus Content Collection
│  │  ├─ impressum.astro · datenschutz.astro · agb.astro
│  │  └─ 404.astro              # mit Pferdle
│  ├─ content/
│  │  ├─ config.ts              # Schemas (Zod)
│  │  ├─ ratgeber/              # .md/.mdx Artikel
│  │  └─ orte/                  # Daten je Einzugsgebiet
│  ├─ data/
│  │  ├─ site.ts                # NAP, Telefon, Öffnungszeiten, Social (zentral!)
│  │  ├─ services.ts            # Leistungen
│  │  └─ testimonials.ts        # Bewertungen
│  ├─ styles/
│  │  └─ global.css             # @tailwind + CSS-Variablen aus tokens.txt + Font-Faces
│  └─ assets/                   # Bilder, die Astro optimieren soll
├─ astro.config.mjs            # site-URL, sitemap-Integration, compress
├─ tailwind.config.js          # Theme.extend = Tokens (Snippet in tokens.txt)
├─ tsconfig.json
├─ package.json
└─ AGENTS.md + .agents/rules/  # Antigravity-Steuerung (siehe agent-rules)
```

---

## 3. Komponenten-Prinzipien

- **Atomar & wiederverwendbar:** `Button`, `Card`, `SpeechBubble` einmal definieren (mit den Comic-Tokens), überall nutzen.
- **Sektionen sind Komponenten:** Startseite = Komposition aus `<Hero/>`, `<Steps4/>` … → leicht umsortierbar, leicht testbar.
- **Daten aus einer Quelle:** NAP/Telefon/Öffnungszeiten **nur** in `src/data/site.ts`. Verhindert Inkonsistenz (auch SEO-kritisch).
- **Keine Hardcodes:** Farben/Spacing/Radius immer über Tailwind-Tokens, nie rohe Hex-Werte in Komponenten.
- **Props statt Copy-Paste:** Leistungsseiten teilen `ServiceLayout`.

---

## 4. SEO-Setup (technisch)

- `BaseHead.astro`: dynamische `<title>`, `meta description`, Canonical, Open-Graph/Twitter, `<html lang="de">`.
- `@astrojs/sitemap` → automatische `sitemap.xml`; `robots.txt` in `public/`.
- **JSON-LD Schema:** `LocalBusiness` (NAP, Geo, openingHours, areaServed, sameAs, aggregateRating) global; `FAQPage` auf FAQ; `BreadcrumbList`; `Service` auf Leistungsseiten.
- Bilder via `astro:assets` (`<Image/>`) → automatisch webp/avif, `width/height`, lazy.
- Eine H1 pro Seite, saubere Hierarchie (lint im Review).
- Lokale Seiten: Ort in Title/H1/Text, eigener einzigartiger Content (kein Duplicate).

---

## 5. Performance-Budget (Zielwerte)

- Lighthouse Performance/SEO/Best-Practices/Accessibility **≥ 95** (mobil).
- LCP < 2.0s, CLS < 0.05, kein blockierendes JS.
- Fonts: Barlow & Barlow Semi Condensed self-hosted (`woff2`, `font-display: swap`, nur genutzte Weights), **preload** der Hero-Schrift. Akko nur im Logo-SVG.
- JS nur als Island wo nötig (mobile Nav, Vorher/Nachher-Slider, Formular-Validierung).

---

## 6. Formular / Anfrage

- Felder minimal: Name, Telefon, E-Mail, Anliegen (Textarea), optional Foto-Upload, DSGVO-Checkbox.
- Versand: Serverless (z.B. Astro Endpoint / Form-Service) → E-Mail an info@ruempelross.de. Spam-Schutz (Honeypot + ggf. Captcha).
- Erfolgs-State mit Pferdle + Reaktionszeit-Versprechen („Antwort in 24 h").
- Telefon überall als `tel:`-Link.

---

## 7. Hosting / Deployment

- Statischer Build → Hosting auf Netlify/Vercel/Cloudflare Pages (CDN, schnell, günstig, HTTPS).
- Domain `ruempelross.de` umziehen, **301-Redirects** von alten Wix-URLs auf neue Pfade (SEO-Rankings erhalten!).
- `site:` in `astro.config.mjs` auf finale Domain setzen.

---

## 8. Build-Reihenfolge (Empfehlung)

1. Projekt-Setup: Astro + Tailwind, `global.css` mit Tokens & Fonts, `site.ts`.
2. Layout-Grundgerüst: `BaseLayout`, `Header`, `Footer`, `Button`/`Card`/UI-Primitives (Design-System zuerst!).
3. Startseite Sektion für Sektion (nach Reihenfolge in builder_brief §6).
4. Leistungsseiten über `ServiceLayout`.
5. Preise, Über uns, FAQ (+ Schema), Kontakt, Galerie.
6. Einzugsgebiete (Hub + dynamische Orte) + Ratgeber-Collection.
7. SEO-Feinschliff, Schema, Sitemap, Redirects, Rechtstexte.
8. Performance-/Accessibility-Audit (Lighthouse, axe) → Launch.

---

## 9. Qualitäts-Gates (vor jedem „fertig")

Eine H1 pro Seite · alle Bilder mit alt · Kontrast AA · Touch-Targets ≥ 44px · keine rohen Hex-Werte · NAP konsistent · `prefers-reduced-motion` respektiert · Lighthouse ≥ 95 · funktionierendes Formular · mobile getestet.
