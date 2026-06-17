---
name: generating-google-maps-leads
description: >
  Generates B2B leads from Google Maps using Apify, enriches them with website data
  (email, managing director from Impressum), and optionally finds LinkedIn profiles.
  Use when the user mentions lead generation, Google Maps scraping, SHK leads,
  Handwerker leads, B2B prospecting, or business contact extraction for a specific
  industry and city.
---

# Google Maps Lead Generation Pipeline

End-to-end lead generation: Google Maps → Website Enrichment → LinkedIn → Clean CSV.

## When to Use This Skill

- User wants to generate B2B leads for a specific industry + city
- User mentions Google Maps scraping or Apify lead extraction
- User asks for SHK/Handwerker/trade business contacts
- User wants to repeat a lead generation run for a new city or industry

## Prerequisites

- Python 3.9+
- Apify API token (stored in env var `APIFY_TOKEN` or passed as config)
- Python packages: `apify-client`, `requests`, `beautifulsoup4`

Install if needed:
```bash
pip install apify-client requests beautifulsoup4
```

## Pipeline Overview

```
┌─────────────────────────┐
│  STEP 1: Google Maps    │  Apify actor: compass/crawler-google-places
│  Extract raw leads      │  Output: leads_raw.csv
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  STEP 2: Enrich         │  Scrape each website's Impressum/Kontakt
│  Email + Geschäftsführer│  Output: leads_enriched.csv
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  STEP 3: LinkedIn       │  Apify actor: apify/google-search-scraper
│  (Optional)             │  Output: leads_final.csv
└─────────────────────────┘
```

## Configuration

Before running, the user must provide:

- [ ] **Industry keywords** — e.g. `["SHK Betrieb", "Sanitär Heizung", "Heizungsbauer"]`
- [ ] **City / location** — e.g. `"Düsseldorf, Germany"`
- [ ] **Max results per search** — default `60`
- [ ] **Apify API token** — env var `APIFY_TOKEN` or hardcoded in config
- [ ] **Output filename** — default `leads_final.csv`

## Step 1: Google Maps Extraction

Run `scripts/01_fetch_google_maps.py` with the user's config.

### Apify Actor Config

```python
# Actor: compass/crawler-google-places
run_input = {
    "searchStringsArray": SEARCH_QUERIES,   # list of keyword strings
    "locationQuery": LOCATION,              # e.g. "Düsseldorf, Germany"
    "maxCrawledPlacesPerSearch": MAX_PER_SEARCH,  # default 60
    "language": "de",
    "maxImages": 0,
    "maxReviews": 0,
    "scrapeAdvertisers": True,
    "oneReviewPerRow": False,
    "allPlacesNoSearchAction": "",
}
```

### Field Mapping (Apify → CSV)

| Apify Field       | CSV Column          |
|--------------------|---------------------|
| `title`            | `Firmenname`        |
| `phone`            | `Telefon`           |
| `address`          | `Adresse`           |
| `categoryName`     | `Spezialisierung`   |
| `totalScore`       | `Rating`            |
| `reviewsCount`     | `ReviewCount`       |
| `website`          | `Website`           |
| —                  | `Email`             |
| —                  | `Geschaeftsfuehrer` |
| —                  | `LinkedIn`          |
| —                  | (Source column removed) |

### Deduplication

Deduplicate on normalized company name (lowercase, stripped). If a duplicate is found,
keep the entry with more filled fields (prefer the one with a website).

### Validation Checklist (after Step 1)

- [ ] CSV has all 10 columns
- [ ] No entries have empty `Firmenname`
- [ ] `Website` field does NOT contain directory URLs (see blocklist below)
- [ ] Rating format is `"X.X (N)"` or empty

## Step 2: Website Enrichment

Run `scripts/02_enrich_websites.py`.

For each lead that has a `Website`:

1. **GET the homepage** → parse HTML with BeautifulSoup
2. **Find Impressum link** → look for `<a>` containing "impressum" or "imprint"
3. **Find Kontakt link** → fallback, look for `<a>` containing "kontakt" or "contact"
4. **Scrape all found pages** for:
   - **Emails**: regex `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}` + `mailto:` links
   - **Geschäftsführer**: regex patterns for `Geschäftsführer:`, `Inhaber:`, `Inh.`, `Geschäftsleitung:`, `Betriebsleiter:`
5. **Email priority**: `info@` > `kontakt@` > `office@` > `mail@` > any other
6. **Generate LinkedIn search URL** if a GF name was found (as placeholder):
   `https://www.linkedin.com/search/results/people/?keywords={name}+{company}`

### Blocklist (skip these domains as "not a real website")

```python
SKIP_DOMAINS = [
    "gelbeseiten.de", "dasoertliche.de", "11880.com", "golocal.de",
    "yelp.de", "goyellow.de", "firmenwissen.de", "northdata.de",
    "kompass.com", "dastelefonbuch.de", "meinestadt.de", "yellowmap.de",
    "facebook.com", "instagram.com", "linkedin.com", "youtube.com",
    "xing.com", "google.com", "bundes-telefonbuch.de",
    "haus-experten.org", "fliesenleger24.com", "branchen-info.net",
    "wasserwaermeluft.de", "heizungsbau.net", "heizungsbau-adressen.de",
    "infoisinfo.com", "pointoo.de", "rocketreach.co", "jooble.org",
    "sellwerk.de", "online-optimierung.com", "repair.ivof.com",
]
```

If a lead's website matches any of these, clear it — it's not a real company site.

### Rate Limiting

- 1.5 seconds between requests
- 0.5 seconds between pages on the same domain
- 10 second timeout per request

## Step 3: LinkedIn Enrichment (Optional)

Run `scripts/03_enrich_linkedin.py`.

Only for leads where `Geschaeftsfuehrer` is filled and `LinkedIn` does not yet contain
`linkedin.com/in/` (i.e., it's still just a search link or empty).

### Apify Actor Config

```python
# Actor: apify/google-search-scraper
# IMPORTANT: queries must be a newline-separated STRING, not a list!
run_input = {
    "queries": "\n".join(queries),  # each: site:linkedin.com/in/ "Name" "Company"
    "maxPagesPerQuery": 1,
    "resultsPerPage": 1,
    "countryCode": "de",
    "languageCode": "de",
    "mobileResults": False,
    "saveHtml": False,
    "saveHtmlToKeyValueStore": False,
    "includeUnfilteredResults": False,
}
```

### Matching Logic

- Parse `organicResults[0].url` from each result
- Only accept if URL contains `linkedin.com/in/`
- If no match found, keep the search-link fallback

## Output Format

Final CSV: semicolon-delimited (`;`), UTF-8 encoding, sorted by rating (best first).

```
Firmenname;Telefon;Adresse;Spezialisierung;Rating;ReviewCount;Website;Email;Geschaeftsfuehrer;LinkedIn
```

## Execution Checklist

```markdown
- [ ] 1. Confirm config: industry keywords, city, max results, API token
- [ ] 2. Run Step 1: `python scripts/01_fetch_google_maps.py`
- [ ] 3. Verify: row count, no empty names, no directory URLs
- [ ] 4. Run Step 2: `python scripts/02_enrich_websites.py`
- [ ] 5. Verify: email count, GF count
- [ ] 6. (Optional) Run Step 3: `python scripts/03_enrich_linkedin.py`
- [ ] 7. Final review of `leads_final.csv`
```

## Common Pitfalls

- **Apify google-search-scraper `queries` parameter must be a newline-separated string**, not a Python list. Passing a list will silently fail or produce garbage.
- **Website URLs from Google Maps are generally trustworthy.** Do NOT mix in GelbeSeiten or other directory data — it creates cleanup work.
- **Some websites use JavaScript rendering** — `requests` won't see the content. Accept the miss and move on.
- **Encoding**: Always use `utf-8-sig` for reading CSVs that may have a BOM, and `utf-8` for writing.

## Resources

- [Scripts](scripts/) — Ready-to-run Python scripts
- [Examples](examples/) — Example config and output
