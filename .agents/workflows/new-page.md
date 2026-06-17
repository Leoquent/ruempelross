# Workflow: Neue Seite bauen

> Antigravity-Workflow (wiederholbare Prozedur). Aufrufen, wenn eine neue Seite/Sektion entsteht. Setzt die Regeln aus `AGENTS.md` voraus.

## Schritte

1. **Kontext laden:** Ziel der Seite & Keyword aus `builder_brief.md` (§7 Sitemap / §8 SEO) entnehmen. Sektions-Reihenfolge prüfen (§6).
2. **Plan posten:** kurze Liste der Sektionen/Komponenten dieser Seite + welcher Primär-CTA. Auf Bestätigung warten, wenn etwas unklar ist.
3. **Gerüst:** passendes Layout wählen (`BaseLayout` oder `ServiceLayout`). `BaseHead` mit einzigartigem Title + Meta-Description (Keyword + Stuttgart + Marke) füllen.
4. **Inhalt:** echte Copy nach `builder_brief.md` (Sie-Form, nutzenorientiert). Fehlende Kundeninhalte als `// TODO: vom Kunden` markieren, nicht erfinden.
5. **Komponenten:** vorhandene UI-Primitives & Sektions-Komponenten wiederverwenden. Neues nur, wenn nötig — dann mit Tokens (`tokens.txt`), Comic-Akzente dosiert (`design.md`).
6. **SEO:** genau eine H1, saubere H2/H3, Bild-`alt`, interne Links zu verwandten Seiten, JSON-LD Schema falls relevant (Service/FAQ/LocalBusiness).
7. **Conversion:** Primär-CTA platzieren (oben + am Ende), Telefon als `tel:`-Link, Vertrauenssignal sichtbar.
8. **Self-Check (Definition of Done, AGENTS.md):** Tokens statt Hardcodes · Kontrast AA · Touch ≥ 44px · `prefers-reduced-motion` · NAP aus `site.ts` · keine Türkis-Farbe · mobil getestet.
9. **Audit:** Lighthouse (mobil) laufen lassen, Ziel ≥ 95. Probleme beheben, bevor „fertig".
10. **Verlinken:** neue Seite in Navigation/Footer/Sitemap einhängen.
