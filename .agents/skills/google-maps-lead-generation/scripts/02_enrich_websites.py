"""
Step 2: Website Enrichment (Email + Geschäftsführer)
=====================================================
Scrapes the Impressum / Kontakt page of each lead's website to extract:
  - Email address (prioritizing info@ > kontakt@ > office@ > mail@)
  - Geschäftsführer / Inhaber name

Also generates a LinkedIn search URL for any found GF name.

Usage:
    python 02_enrich_websites.py

Input:  leads_raw.csv  (from Step 1)
Output: leads_enriched.csv
"""

import csv
import re
import time
import os
import sys
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, quote_plus

# ============================================================
# CONFIG
# ============================================================
INPUT_FILE = "leads_raw.csv"
OUTPUT_FILE = "leads_enriched.csv"
DELIMITER = ";"
REQUEST_TIMEOUT = 10
DELAY_BETWEEN_REQUESTS = 1.5  # seconds between different domains
DELAY_SAME_DOMAIN = 0.5       # seconds between pages on the same domain

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
}
# ============================================================

# --- Regex patterns ---
EMAIL_RE = re.compile(
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
    re.IGNORECASE,
)

GF_PATTERNS = [
    re.compile(r'Geschäftsführer[:\s]*([A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+)', re.UNICODE),
    re.compile(r'Inhaber[:\s]*([A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+)', re.UNICODE),
    re.compile(r'Geschäftsführerin[:\s]*([A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+)', re.UNICODE),
    re.compile(r'Geschäftsleitung[:\s]*([A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+)', re.UNICODE),
    re.compile(r'Inh\.\s*([A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+)', re.UNICODE),
    re.compile(r'Betriebsleiter[:\s]*([A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+)', re.UNICODE),
    re.compile(r'Meisterbetrieb\s+([A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+)', re.UNICODE),
]

SKIP_EMAIL_FRAGMENTS = [
    "@example.", "@test.", "@sentry.", "wix.com", "wordpress.",
    "@wpro.de", "@gc-gruppe.de",  # generic service provider emails
]


def scrape_website(url: str) -> dict:
    """
    Visit a website, find Impressum/Kontakt, extract email + GF name.
    Returns {"email": ..., "geschaeftsfuehrer": ...}
    """
    result = {"email": "", "geschaeftsfuehrer": ""}
    if not url:
        return result

    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
    except Exception:
        return result

    # Collect pages to check: homepage, impressum, kontakt
    pages = [(url, soup)]
    impressum_url = _find_link(soup, url, ["impressum", "imprint"])
    kontakt_url = _find_link(soup, url, ["kontakt", "contact"])

    for extra_url in [impressum_url, kontakt_url]:
        if extra_url and extra_url != url:
            try:
                time.sleep(DELAY_SAME_DOMAIN)
                r = requests.get(extra_url, headers=HEADERS, timeout=REQUEST_TIMEOUT, allow_redirects=True)
                r.raise_for_status()
                pages.append((extra_url, BeautifulSoup(r.text, "html.parser")))
            except Exception:
                pass

    # Extract data from all pages
    all_text = ""
    all_emails = set()

    for page_url, page_soup in pages:
        text = page_soup.get_text(separator=" ", strip=True)
        all_text += " " + text

        # Emails from text
        for email in EMAIL_RE.findall(text):
            all_emails.add(email.lower().strip())

        # Emails from mailto: links
        for a in page_soup.select("a[href^='mailto:']"):
            raw = a["href"].replace("mailto:", "").split("?")[0].strip()
            if EMAIL_RE.match(raw):
                all_emails.add(raw.lower().strip())

    # Filter junk emails
    all_emails = {
        e for e in all_emails
        if len(e) > 5 and not any(s in e for s in SKIP_EMAIL_FRAGMENTS)
    }

    # Pick best email
    if all_emails:
        for prefix in ["info@", "kontakt@", "office@", "mail@"]:
            match = next((e for e in sorted(all_emails) if e.startswith(prefix)), None)
            if match:
                result["email"] = match
                break
        if not result["email"]:
            result["email"] = sorted(all_emails)[0]

    # Extract Geschäftsführer
    for pattern in GF_PATTERNS:
        m = pattern.search(all_text)
        if m:
            name = m.group(1).strip()
            if 2 <= len(name.split()) <= 4 and len(name) < 50:
                result["geschaeftsfuehrer"] = name
                break

    return result


def _find_link(soup, base_url: str, keywords: list) -> str | None:
    """Find an <a> link whose text or href contains one of the keywords."""
    for a in soup.find_all("a", href=True):
        text = a.get_text(strip=True).lower()
        href = a["href"].lower()
        if any(kw in text or kw in href for kw in keywords):
            return urljoin(base_url, a["href"])
    return None


def main():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Input file not found: {INPUT_FILE}")
        sys.exit(1)

    # Load leads
    leads = []
    with open(INPUT_FILE, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f, delimiter=DELIMITER)
        for row in reader:
            leads.append(dict(row))

    total = len(leads)
    with_website = sum(1 for l in leads if l.get("Website"))
    print(f"📋 Loaded {total} leads ({with_website} with website)")
    print(f"🔍 Starting enrichment...\n")

    enriched = 0

    for i, lead in enumerate(leads, 1):
        name = lead.get("Firmenname", "").strip()
        website = lead.get("Website", "").strip()
        if not name:
            continue

        if website:
            print(f"[{i}/{total}] 🏢 {name}")
            data = scrape_website(website)

            if data["email"] and not lead.get("Email"):
                lead["Email"] = data["email"]
                print(f"  ✅ Email: {data['email']}")

            if data["geschaeftsfuehrer"] and not lead.get("Geschaeftsfuehrer"):
                lead["Geschaeftsfuehrer"] = data["geschaeftsfuehrer"]
                print(f"  ✅ GF: {data['geschaeftsfuehrer']}")

                # Generate LinkedIn search URL
                lead["LinkedIn"] = (
                    "https://www.linkedin.com/search/results/people/"
                    f"?keywords={quote_plus(data['geschaeftsfuehrer'] + ' ' + name)}"
                )

            enriched += 1
            time.sleep(DELAY_BETWEEN_REQUESTS)
        else:
            print(f"[{i}/{total}] ⏭️  {name} — no website, skipping")

    # Save
    fieldnames = [
        "Firmenname", "Telefon", "Adresse", "Spezialisierung",
        "Rating", "ReviewCount", "Website", "Email", "Geschaeftsfuehrer", "LinkedIn"
    ]

    with open(OUTPUT_FILE, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=DELIMITER)
        writer.writeheader()
        for lead in leads:
            writer.writerow({k: lead.get(k, "") for k in fieldnames})

    e = sum(1 for l in leads if l.get("Email"))
    g = sum(1 for l in leads if l.get("Geschaeftsfuehrer"))

    print(f"\n{'=' * 60}")
    print(f"✅ DONE! Saved to: {OUTPUT_FILE}")
    print(f"{'=' * 60}")
    print(f"   📊 {total} leads enriched")
    print(f"   📧 {e} with email")
    print(f"   👤 {g} with Geschäftsführer")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
