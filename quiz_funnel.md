# RümpelRoss – Quiz-Funnel + Kostenrechner (`/anfrage`)

> Ein einziger Funnel: mehrstufiges Quiz, das am Ende eine **grobe Basispreis-Spanne** zeigt und die Kontaktdaten abfragt. Der Betreiber bekommt alle Antworten strukturiert per E-Mail und weiß beim Rückruf sofort, was Sache ist.
> **Eiserne Regel:** Jede Preisangabe trägt den Hinweis „unverbindliche Basispreis-Einschätzung – der verbindliche Festpreis entsteht im persönlichen Gespräch nach kostenloser Besichtigung."

---

## 1. Psychologie des Funnels

- **Commitment-Treppe:** Erst leichte Klick-Fragen (kein Tippen!), Kontaktdaten ganz am Ende – wer 5 Fragen beantwortet hat, bricht selten ab (Sunk-Cost + Konsistenz).
- **Preis als Belohnung:** Die Spanne wird erst nach Eingabe der Kontaktdaten angezeigt? **Nein** – Gegenentscheidung: Spanne **vor** den Kontaktdaten zeigen (Reziprozität & Fairness, passt zur Ehrlichkeits-Positionierung). Die Kontaktdaten-Stufe formuliert dann: „Sichern Sie sich Ihren verbindlichen Festpreis – meist günstiger als die Einschätzung dank Wertanrechnung."
- **Risiko-Entschärfung in jedem Schritt:** Fortschrittsbalken, „unverbindlich", „dauert 60 Sekunden", zurück-Button.
- **Ein Gedanke pro Screen.** Max. 6 Optionen, Karten mit Icon, mobil volle Breite.

---

## 2. Die Schritte

**Schritt 0 – Einstieg** (kommt vom CTA, kein eigener Screen nötig)
Headline auf /anfrage: „In 60 Sekunden zur Preis-Einschätzung." Sub: „Unverbindlich · kostenlos · Antwort in 24 h."

**1/6 · Was soll entrümpelt werden?**
Wohnung · Haus · Keller/Dachboden/Garage · Gewerbe/Büro · Messie-Wohnung · Sonstiges

**2/6 · Wie groß ist die Fläche (ungefähr)?**
bis 20 m² · 20–50 m² · 50–80 m² · 80–120 m² · über 120 m² · weiß nicht
*(Bei „Keller/Dachboden/Garage": bis 10 / 10–20 / über 20 m²)*

**3/6 · Wie voll ist es?**
Visuelle Skala mit 3 Karten (Illustration/Foto-Schema): Locker befüllt (man kann gut durchlaufen) · Normal voll (Möbel + Hausrat) · Sehr voll (bis zur Decke / Messie)

**4/6 · Wie ist der Zugang?**
Erdgeschoss/ebenerdig · Etage **mit** Aufzug · Etage **ohne** Aufzug (+ Auswahl Stockwerk 1–5+)

**5/6 · Wann soll es passieren?**
So schnell wie möglich · innerhalb 2 Wochen · innerhalb 1–2 Monate · bin noch am Planen
*(+ optional: PLZ/Ort – Pflichtfeld, 5-stellig, für Einsatzgebiet-Check)*

**6/6 · Gibt es Besonderheiten?** (Mehrfachauswahl, optional)
Wertgegenstände vorhanden (Wertanrechnung möglich) · Erbfall/Nachlass · besenreine Übergabe gewünscht · Renovierung danach gewünscht · Fotos vorhanden (Upload optional, max. 5 × 5 MB)

**→ ERGEBNIS-SCREEN**
> **Ihre unverbindliche Basispreis-Einschätzung: ca. 800 – 1.400 €**
> Diese Spanne ist eine erste Orientierung auf Basis Ihrer Angaben. Ihren **verbindlichen Festpreis** nennen wir Ihnen nach einer kostenlosen, unverbindlichen Besichtigung – oft fällt er dank **Wertanrechnung** niedriger aus.
> *Keine versteckten Kosten. 100 % versichert. Besenreine Übergabe.*

**→ KONTAKT-SCREEN**
Name* · Telefon* · E-Mail · bevorzugte Rückrufzeit (vormittags/nachmittags/abends) · DSGVO-Checkbox*
Button: **[Kostenlosen Besichtigungstermin anfragen]** (nie „Absenden")

**→ DANKE-SCREEN**
„Vielen Dank! Wir melden uns innerhalb von 24 Stunden – meist noch am selben Tag." + Zusammenfassung der Angaben + „Dringend? ☎ 0711 23178489".

---

## 3. Preislogik (Basispreis-Modell)

> Platzhalter-Kalkulation auf Marktbasis (Mitbewerber ~39 €/m³; eigene Anker: Keller ab 99 €, Wohnung < 20 m² ab 199 €). **Vor Launch mit dem Betreiber kalibrieren** – die Faktoren sind bewusst einfach als JSON konfigurierbar.

```
Basis (€/m² nach Objektart, normal voll):
  Wohnung/Haus:            18 €/m²
  Keller/Dachboden/Garage: 14 €/m²
  Gewerbe/Büro:            15 €/m²
  Messie:                  28 €/m²

Füllgrad-Faktor:   locker ×0.7 · normal ×1.0 · sehr voll ×1.6
Zugangs-Faktor:    EG ×1.0 · Etage mit Aufzug ×1.05 · ohne Aufzug ×(1.10 + 0.05/Stockwerk)
Spanne:            Ergebnis ±25 %, gerundet auf 50 €
Untergrenzen:      nie unter 99 € (Keller) / 199 € (Wohnung)
„weiß nicht":      keine Zahl → „Das schätzen wir bei der kostenlosen Besichtigung
                   für Sie ein" + direkt zum Kontakt-Screen
```

Anzeige immer als **Spanne**, nie als Einzelbetrag. Wertanrechnung wird nie eingerechnet, nur als „kann den Preis senken" kommuniziert (positive Überraschung statt gebrochenes Versprechen).

---

## 4. Technik

- **Eigene Seite `/anfrage`** (Astro-Island, Vanilla JS oder Preact-Island, ~8–10 KB). Onepager bleibt davon JS-frei.
- State im Speicher + `sessionStorage` (Reload-sicher). Browser-Back = Schritt zurück (History API).
- **Versand:** POST an Form-Endpoint (Web3Forms o.ä., kostenlos, DSGVO-tauglich mit AVV; alternativ Astro-Serverless-Endpoint mit Resend) → E-Mail an info@ruempelross.de. Honeypot + Zeit-Falle gegen Spam. Foto-Upload: nur wenn der gewählte Dienst es kann, sonst „Fotos gern per WhatsApp nachreichen"-Hinweis auf dem Danke-Screen.
- Fallback ohne JS: `/anfrage` zeigt das klassische Kurzformular (alle Felder, ein Submit).
- Tracking (optional, cookielos z.B. Plausible): Schritt-Abschlüsse als Events → Abbruchstellen erkennen.

### E-Mail-Format an den Betreiber (Rückruf-Briefing)

```
Betreff: 🆕 Anfrage: Wohnung 50–80 m², sehr voll, Stuttgart-West – ab sofort

Kontakt:   Maria Müller · 0176 1234567 · maria@web.de · Rückruf: nachmittags
Objekt:    Wohnung · 50–80 m² · sehr voll · 3. OG ohne Aufzug · 70197 Stuttgart
Termin:    so schnell wie möglich
Extras:    Erbfall/Nachlass · Wertgegenstände vorhanden
Einschätzung gezeigt: 1.600 – 2.700 €
Fotos:     2 Anhänge
Quelle:    Quiz /anfrage · 11.06.2026 14:32
```

Der Betreff allein reicht für die Priorisierung; der Block ist das komplette Rückruf-Briefing.

---

## 5. Rechtliches / Wording-Pflichten

- Disclaimer an **jeder** Preisanzeige (Ergebnis-Screen, Zwischen-CTA, Preise-Sektion): „Unverbindliche Basispreis-Einschätzung. Der verbindliche Festpreis wird im persönlichen Gespräch nach kostenloser Besichtigung vereinbart."
- Kein „Garantie"-Wording auf die Quiz-Spanne.
- DSGVO: Checkbox mit Link zur Datenschutzerklärung, Zweckbindung nennen („zur Bearbeitung Ihrer Anfrage"), Foto-Upload erwähnt personenbezogene Daten → Hinweis.
- Pflichtfelder minimal halten (Name, Telefon, PLZ, DSGVO).
