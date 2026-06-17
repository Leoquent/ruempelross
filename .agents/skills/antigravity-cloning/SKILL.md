---
name: antigravity-cloning
description: Clones the SHK website template for a new business. Use when the user provides a URL of an SHK (Sanitär, Heizung, Klima) business website and wants to create a branded clone of the kirschbaum1site template with that business's data, logo, colors, and content. Triggers include website cloning, SHK site duplication, new client site, or brand swap.
---

# Antigravity SHK Website Cloning

## When to use this skill
- User provides a URL of an SHK business website and wants a clone
- User says "clone", "neue Website", "nächster Kunde", "Brand swap"
- User wants to create a new SHK site based on the template
- User mentions creating site number 2, 3, 4... etc.

## Prerequisites
- Template project exists at: `d:/Coding/Apps/ersteseite/kirschbaum1site/`
- Template uses centralized `constants.ts` for all business data
- Template uses Tailwind CSS v4 with `@theme` in `index.css`

## Workflow Checklist

Copy and track progress with this checklist:

```markdown
## Clone Progress: [FIRMENNAME]
- [ ] **Phase 1: Data Extraction**
  - [ ] 1.1 Scrape homepage for company info
  - [ ] 1.2 Scrape /impressum for legal data
  - [ ] 1.3 Identify brand colors from website
  - [ ] 1.4 Find and download logo URL
- [ ] **Phase 2: Clone & Configure**
  - [ ] 2.1 Clone template folder
  - [ ] 2.2 Download logo to /public/logo.png
  - [ ] 2.3 Remove old logo files
  - [ ] 2.4 Update constants.ts
  - [ ] 2.5 Update index.css colors
  - [ ] 2.6 Update logo paths in Navbar.tsx & Footer.tsx
  - [ ] 2.7 Update vite.config.ts base path
  - [ ] 2.8 Update App.tsx router basename
- [ ] **Phase 3: Content**
  - [ ] 3.1 Update Home.tsx (reviews, stats, founding year)
  - [ ] 3.2 Update About.tsx (history, founding year, generation)
  - [ ] 3.3 Update References.tsx reviews (if needed)
- [ ] **Phase 4: Verify**
  - [ ] 4.1 Install dependencies
  - [ ] 4.2 Start dev server
  - [ ] 4.3 Verify in browser
```

---

## Phase 1: Data Extraction

### 1.1 Scrape Homepage
Use `read_url_content` on the provided URL. Extract:
- Company name (short + full legal name)
- Phone number
- Email address
- Street address (street, zip, city)
- Service areas (Heizung, Sanitär, Klima, etc.)
- Founding year (if mentioned)
- Slogan or tagline

### 1.2 Scrape Impressum
Navigate to `{url}/impressum` or `{url}/impressum/`. Extract ALL of:

| Field | Example |
|---|---|
| `managingDirector` | "Christian Klemm" |
| `court` | "Amtsgericht Düsseldorf" |
| `registrationNumber` | "HRB 52900" |
| `vatId` | "DE246798128" |
| `profession` | "Gas- und Wasserinstallateurmeister..." |
| `chamber` | "Handwerkskammer Düsseldorf" |
| `chamberNumber` | "1710053" |

> If any field is missing, use placeholder: `"[BITTE ERGÄNZEN]"`

### 1.3 Identify Brand Colors
Look at the website's primary color (header, buttons, accents). Use browser subagent or inspect CSS:
```javascript
// Run in browser console to detect primary colors
getComputedStyle(document.querySelector('header')).backgroundColor
getComputedStyle(document.querySelector('a')).color
```

Set two derived colors:
- `primary`: Main brand color (headers, text)
- `accent`: Secondary/darker shade (buttons, CTAs)

### 1.4 Find & Download Logo
Use browser subagent to navigate to the homepage and extract logo:
```javascript
// Find logo images
document.querySelectorAll('header img, .logo img, [class*="logo"] img, nav img')
  .forEach(img => console.log(img.src, img.alt, img.width, img.height))
```
Note the highest resolution logo URL for download in Phase 2.

---

## Phase 2: Clone & Configure

### 2.1 Clone Template
```powershell
Copy-Item -Path 'd:/Coding/Apps/ersteseite/kirschbaum1site' -Destination 'd:/Coding/Apps/ersteseite/{folder-name}' -Recurse -Exclude 'node_modules','.git'
```

**Folder naming convention:** `shk-website-{N}` where N is the next sequential number, OR use a slug of the company name (e.g., `niepmann-site`).

### 2.2 Download Logo
```powershell
Invoke-WebRequest -Uri '{logo-url}' -OutFile 'd:/Coding/Apps/ersteseite/{folder-name}/public/logo.png'
```

### 2.3 Remove Old Logo Files
```powershell
Remove-Item 'd:/Coding/Apps/ersteseite/{folder-name}/public/Kirschbaum-Logo_transparent.png'
Remove-Item 'd:/Coding/Apps/ersteseite/{folder-name}/public/Kirschbaum-Logo_2025_final_quer_RGB.jpg'
```

### 2.4 Update `src/constants.ts`
**Overwrite the entire file** with the extracted data:

```typescript
export const COLORS = {
  primary: "{PRIMARY_HEX}",
  accent: "{ACCENT_HEX}",
  background: "#FFFFFF",
  text: "#666666",
  link: "{PRIMARY_HEX}",
  emergency: "#dc2626",
};

export const COMPANY_NAME = "{SHORT_NAME}";
export const COMPANY_FULL_NAME = "{LEGAL_NAME}";
export const LOCATION = "{CITY}";
export const SLOGAN = "{SLOGAN}";

export const CONTACT = {
  phone: "{PHONE}",
  phoneLink: "{PHONE_LINK}",
  email: "{EMAIL}",
  street: "{STREET}",
  zip: "{ZIP}",
  city: "{CITY}",
  address: "{STREET}, {ZIP} {CITY}",
  openingHours: "{OPENING_HOURS}",
  emergencyHours: "24h Notdienst",
};

export const SOCIALS = {
  instagram: "{INSTAGRAM_URL}",
  facebook: "{FACEBOOK_URL}",
};

export const LEGAL = {
  managingDirector: "{GESCHAEFTSFUEHRER}",
  court: "{REGISTERGERICHT}",
  registrationNumber: "{HRB_NUMMER}",
  vatId: "{UST_ID}",
  profession: "{BERUFSBEZEICHNUNG}",
  chamber: "{KAMMER}",
  chamberNumber: "{KAMMER_NUMMER}",
};

export const GOOGLE_MAPS_LINK = "{GOOGLE_MAPS_URL}";

export const getAssetPath = (path: string) => {
  const base = import.meta.env.BASE_URL || '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
};
```

### 2.5 Update `src/index.css`
Replace the two color lines inside `@theme {}`:

```css
--color-primary: {PRIMARY_HEX};
--color-accent: {ACCENT_HEX};
```

### 2.6 Update Logo Paths
In the cloned project, replace ALL occurrences of the old logo filename with `logo.png`:

**Files to update:**
- `src/components/layout/Navbar.tsx` — two `src={getAssetPath(...)}` references
- `src/components/layout/Footer.tsx` — one `src={getAssetPath(...)}` reference

Replace: `getAssetPath("/Kirschbaum-Logo_transparent.png")` → `getAssetPath("/logo.png")`

> Use `grep_search` with query `Kirschbaum-Logo` to find any remaining references.

### 2.7 Update `vite.config.ts`
Change the `base` property:
```typescript
base: '/{folder-name}/',
```

### 2.8 Update `src/App.tsx`
Change the Router basename:
```tsx
<Router basename="/{folder-name}">
```

---

## Phase 3: Content Updates

### 3.1 Update `src/pages/Home.tsx`

**Reviews (lines ~29-78):** Replace ALL 8 hardcoded reviews with either:
- Real Google reviews scraped from Maps (preferred)
- Plausible dummy reviews mentioning the new company name

**Hero badge (line ~243):** Change founding year:
```tsx
<span>Meisterbetrieb seit {FOUNDING_YEAR}</span>
```

**Hero subtitle (line ~253):** Update service description and year:
```tsx
{SERVICE_DESCRIPTION} – von Meisterhand in {LOCATION}. Seit {FOUNDING_YEAR}.
```

**Stats counter (lines ~290-294):** Adjust numbers:
```typescript
{ value: {YEARS}, suffix: "+", label: "Jahre Erfahrung" },
{ value: {GENERATION}, suffix: ".", label: "Generation" },
{ value: {CUSTOMERS}, suffix: "+", label: "Zufriedene Kunden" },
{ value: 365, suffix: "", label: "Tage im Einsatz" },
```

**Rating badge (line ~466):** Update average rating if known.

### 3.2 Update `src/pages/About.tsx`

- History text (line ~32): Update years and generation count
- Founded year display (line ~40): Change to `{FOUNDING_YEAR}`
- Generation display (line ~44): Change to `{GENERATION}.`

### 3.3 Update `src/pages/References.tsx` (Optional)

If real project references are available, update the `projects` array and the testimonials section. Otherwise, the generic Düsseldorf project descriptions can remain as placeholders.

---

## Phase 4: Verify

### 4.1 Install Dependencies
```powershell
npm install
```
Run from the cloned project directory.

### 4.2 Start Dev Server
```powershell
npx vite --port {NEXT_FREE_PORT} --host 127.0.0.1
```

Use sequential ports: 5174, 5175, 5176, etc.

> **Important:** Always use `--host 127.0.0.1` to avoid IPv6-only binding issues on Windows.

### 4.3 Verify in Browser
Open `http://127.0.0.1:{PORT}/{folder-name}/` and check:

- [ ] Logo displays correctly in navbar and footer
- [ ] Colors match the new brand (not blue/Kirschbaum)
- [ ] Company name appears in navbar alt-text, footer, copyright
- [ ] Contact page shows correct address, phone, email
- [ ] Impressum page shows correct legal data
- [ ] Reviews section shows new reviews (not Kirschbaum)
- [ ] Stats section shows correct founding year and numbers
- [ ] Hero section shows correct founding year and slogan

---

## Quick Reference: Files Modified Per Clone

| File | What Changes |
|---|---|
| `src/constants.ts` | ALL business data |
| `src/index.css` | Brand colors (2 lines) |
| `src/components/layout/Navbar.tsx` | Logo path (2 places) |
| `src/components/layout/Footer.tsx` | Logo path (1 place) |
| `vite.config.ts` | Base URL path |
| `src/App.tsx` | Router basename |
| `src/pages/Home.tsx` | Reviews, stats, founding year |
| `src/pages/About.tsx` | History text, founding year |
| `public/logo.png` | New logo file |

## Error Handling
- If Impressum page is not at `/impressum`, try `/impressum/`, `/imprint`, or search the footer for the link
- If logo cannot be downloaded via PowerShell, use browser subagent to save it
- If brand colors are unclear, use a neutral dark gray `#333333` as primary and a medium tone as accent
- If founding year is unknown, use placeholder `"Ihr Meisterbetrieb in {CITY}"` without year
- If Google Maps link is unknown, use `"https://maps.google.com/?q={COMPANY_NAME}+{CITY}"`
