# RümpelRoss – Gesamtstrategie & Fahrplan **v2**

> Einstiegspunkt. **Richtungswechsel (Juni 2026):** Das Comic-Konzept ist verworfen. Neue Referenz: messner-service.de – ruhig, seriös, modern. RümpelRoss setzt darauf auf, aber dunkler/edler, mit Scrollytelling und einem Quiz-Funnel als zentralem Conversion-Werkzeug.

## Kernentscheidungen v2 (beschlossen)

1. **Kein Comic.** Kein Maskottchen, keine Outlines/Hard-Shadows/Sprechblasen. Nur das **Schriftzug-Logo, oben rechts** im Header.
2. **Farbwelt bleibt Gelb/Schwarz**, aber edel: Hell/Dunkel-Sektionsrhythmus, Gelb nur als präziser Akzent (~10 %).
3. **Onepager + wenige Unterseiten:** Start = scrollytelling Onepager; dazu /anfrage (Quiz), /nachlasspflege, lokale Landingpages, /faq, /ratgeber, Recht.
4. **Quiz + Kostenrechner = ein Funnel** (`/anfrage`): klickbare Fragen → grobe **Basispreis-Spanne** (immer mit Disclaimer: verbindlicher Festpreis nur im persönlichen Gespräch nach kostenloser Besichtigung) → Kontaktdaten → strukturierte Mail an info@ruempelross.de als Rückruf-Briefing.
5. **Performance hat Vorrang:** kein Animations-Framework, JS-Budget Startseite < 25 KB, Lighthouse ≥ 95.

## Die Dateien (Wahrheits-Hierarchie)

| Datei | Status | Frage, die sie beantwortet |
|---|---|---|
| `tokens.txt` | **v2** | Konkrete Werte (Farben, Typo, Spacing, Motion) |
| `design.md` | **v2** | Look & Motion-Konzept (ohne Comic) |
| `struktur.md` | **v2 NEU** | Sitemap, Onepager-Dramaturgie, Scrollytelling, SEO, Performance-Budget |
| `quiz_funnel.md` | **v2 NEU** | Quiz-Schritte, Preislogik, Mail-Format, Technik, Recht |
| `builder_brief.md` | v1, inhaltlich weiter gültig | Zielgruppen, Psychologie, SEO-Keywords. §7 (Sitemap) ersetzt durch `struktur.md`; Comic-Bezüge ignorieren. |
| `content_optimized.md` | v1, Copy weiter nutzbar | Wordings (Hero A, 4 Schritte, USPs, Nachlasspflege). Pferdle-/Dialekt-Passagen nicht mehr verwenden (max. 1 Zeile in Über uns). |
| `scaffold.md` | v1, Technik gültig | Astro + Tailwind, Ordnerstruktur. Ergänzen: `/anfrage`-Island, SpeechBubble/Mascot-Komponenten streichen. |
| `stitch_prompts.md` | **veraltet (Comic)** | Bei Bedarf neu generieren auf Basis design.md v2 |

## Empfohlener Ablauf

**Phase 1 – Fundament v2 (✅ erledigt).** design.md, tokens.txt, struktur.md, quiz_funnel.md.

**Phase 2 – Prototyp.** Startseite als statischer Prototyp (HTML/Astro) mit echtem Design-System: Hero + Ablauf + Leistungen zuerst → Look am echten Scrollverhalten beurteilen, Logo-rechts-Frage testen.

**Phase 3 – Build komplett.** Restliche Sektionen, Quiz-Funnel `/anfrage`, Unterseiten (/nachlasspflege, lokale Seiten, /faq).

**Phase 4 – Inhalte & SEO.** Echte Fotos/Bewertungen, Schema, Sitemap, 301-Redirects alte Wix-URLs, Preislogik mit Betreiber kalibrieren.

**Phase 5 – Audit & Launch.** Lighthouse ≥ 95, a11y, Formular-/Quiz-Test, Domainumzug.

## Vom Betreiber noch benötigt
Echte Team- & Vorher/Nachher-Fotos · 3 echte Google-Bewertungen (Name + Ort) · Siegel/Mitgliedschaften · **Kalibrierung der Quiz-Preisfaktoren** (quiz_funnel.md §3) · Rechtstexte · Versicherungsbestätigung (Gothaer) fürs Wording.

## Nächster Schritt
Phase 2: Prototyp der Startseite (Hero + Ablauf + Leistungen) bauen und im Browser erleben.
