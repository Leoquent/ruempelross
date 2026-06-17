"""
Step 3: LinkedIn Profile Enrichment (Optional)
===============================================
Uses Apify's google-search-scraper to find real LinkedIn /in/ profiles
for each lead's Geschäftsführer.

IMPORTANT: The `queries` parameter for apify/google-search-scraper must
be a NEWLINE-SEPARATED STRING, not a Python list!

Usage:
    python 03_enrich_linkedin.py

Input:  leads_enriched.csv (from Step 2)
Output: leads_final.csv
"""

import csv
import os
from urllib.parse import quote_plus
from apify_client import ApifyClient

# ============================================================
# CONFIG
# ============================================================
APIFY_TOKEN = os.environ.get("APIFY_TOKEN", "apify_api_Fw1IK4h05W9fBjepYBmTmETkcxgpWS0Vn22l")
INPUT_FILE = "leads_enriched.csv"
OUTPUT_FILE = "leads_final.csv"
DELIMITER = ";"
# ============================================================


def main():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Input file not found: {INPUT_FILE}")
        return

    print(f"📂 Loading {INPUT_FILE}...")
    leads = []
    with open(INPUT_FILE, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f, delimiter=DELIMITER)
        for row in reader:
            leads.append(dict(row))

    # Find leads that need LinkedIn enrichment
    targets = []
    for i, lead in enumerate(leads):
        gf = lead.get("Geschaeftsfuehrer", "").strip()
        company = lead.get("Firmenname", "").strip()
        current_li = lead.get("LinkedIn", "")

        # Only search if we have a GF name but no real profile yet
        has_real_profile = "linkedin.com/in/" in current_li
        if gf and company and not has_real_profile:
            targets.append({
                "index": i,
                "query": f'site:linkedin.com/in/ "{gf}" "{company}"',
                "gf": gf,
                "company": company,
            })

    if not targets:
        print("✅ No leads to enrich. Saving copy as final.")
        _save(leads)
        return

    print(f"🚀 Searching LinkedIn for {len(targets)} Geschäftsführer...")

    client = ApifyClient(APIFY_TOKEN)

    # CRITICAL: queries must be a newline-separated string!
    queries_str = "\n".join(str(t["query"]) for t in targets)

    run_input = {
        "queries": queries_str,
        "maxPagesPerQuery": 1,
        "resultsPerPage": 1,
        "countryCode": "de",
        "languageCode": "de",
        "mobileResults": False,
        "saveHtml": False,
        "saveHtmlToKeyValueStore": False,
        "includeUnfilteredResults": False,
    }

    print("📡 Sending to Apify (apify/google-search-scraper)...")
    try:
        run = client.actor("apify/google-search-scraper").call(run_input=run_input)
    except Exception as e:
        print(f"❌ API error: {e}")
        _save(leads)
        return

    print(f"✅ Done! Processing results (Dataset: {run['defaultDatasetId']})...")

    # Map query → LinkedIn URL
    found = {}
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        query = item.get("searchQuery", {}).get("term", "")
        organic = item.get("organicResults", [])
        if organic:
            url = organic[0].get("url", "")
            if "linkedin.com/in/" in url:
                found[query] = url

    # Write back
    success = 0
    for t in targets:
        q = t["query"]
        if q in found:
            leads[t["index"]]["LinkedIn"] = found[q]
            success += 1
            print(f"  ✅ {t['gf']} → {found[q]}")
        else:
            # Keep search-link fallback if nothing better exists
            if not leads[t["index"]].get("LinkedIn"):
                leads[t["index"]]["LinkedIn"] = (
                    "https://www.linkedin.com/search/results/people/"
                    f"?keywords={quote_plus(t['gf'] + ' ' + t['company'])}"
                )

    print(f"\n🎉 {success} of {len(targets)} real profiles found!")
    _save(leads)


def _save(leads):
    fieldnames = [
        "Firmenname", "Telefon", "Adresse", "Spezialisierung",
        "Rating", "ReviewCount", "Website", "Email", "Geschaeftsfuehrer", "LinkedIn"
    ]

    with open(OUTPUT_FILE, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=DELIMITER)
        writer.writeheader()
        for lead in leads:
            writer.writerow({k: lead.get(k, "") for k in fieldnames})

    print(f"💾 Saved: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
