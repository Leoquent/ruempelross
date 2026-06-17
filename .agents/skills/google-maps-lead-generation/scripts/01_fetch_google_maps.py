"""
Step 1: Google Maps Lead Extraction via Apify
==============================================
Extracts business leads from Google Maps using the Apify actor
'compass/crawler-google-places'.

Usage:
    python 01_fetch_google_maps.py

Configuration:
    Edit the CONFIG section below before running.

Output:
    leads_raw.csv (semicolon-delimited, UTF-8)
"""

import os
import csv
from apify_client import ApifyClient

# ============================================================
# CONFIG — Edit these values for each new run
# ============================================================
APIFY_TOKEN = os.environ.get("APIFY_TOKEN", "apify_api_Fw1IK4h05W9fBjepYBmTmETkcxgpWS0Vn22l")

SEARCH_QUERIES = [
    "SHK Betrieb Düsseldorf",
    "Sanitär Heizung Düsseldorf",
    "Heizungsbauer Düsseldorf",
    "Klempner Düsseldorf",
    "Badsanierung Düsseldorf",
    "Wärmepumpen Installation Düsseldorf",
]

LOCATION = "Düsseldorf, Germany"
MAX_PER_SEARCH = 60  # max results per search query

OUTPUT_FILE = "leads_raw.csv"
DELIMITER = ";"

# Domains that indicate a directory, not a real company website
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

FIELDNAMES = [
    "Firmenname", "Telefon", "Adresse", "Spezialisierung",
    "Rating", "ReviewCount", "Website", "Email", "Geschaeftsfuehrer", "LinkedIn"
]
# ============================================================


def is_directory_url(url: str) -> bool:
    """Check if a URL belongs to a business directory instead of a real company."""
    url_lower = url.lower()
    return any(domain in url_lower for domain in SKIP_DOMAINS)


def main():
    print("🚀 Step 1: Google Maps Lead Extraction")
    print("=" * 60)
    print(f"   Queries:  {len(SEARCH_QUERIES)}")
    print(f"   Location: {LOCATION}")
    print(f"   Max/query: {MAX_PER_SEARCH}")
    print("=" * 60)

    client = ApifyClient(APIFY_TOKEN)

    run_input = {
        "searchStringsArray": SEARCH_QUERIES,
        "locationQuery": LOCATION,
        "maxCrawledPlacesPerSearch": MAX_PER_SEARCH,
        "scrapePlaceDetailPage": True,
        "language": "de",
        "maxImages": 0,
        "maxReviews": 0,
        "scrapeAdvertisers": True,
        "oneReviewPerRow": False,
        "allPlacesNoSearchAction": "",
    }

    print("📡 Sending job to Apify (compass/crawler-google-places)...")
    run = client.actor("compass/crawler-google-places").call(run_input=run_input)
    print(f"✅ Job complete! Dataset ID: {run['defaultDatasetId']}")

    # --- Parse results ---
    leads = {}  # keyed by lowercase name for dedup
    raw_count = 0

    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        title = (item.get("title") or "").strip()
        if not title:
            continue

        raw_count += 1
        key = title.lower()

        website = item.get("website", "") or ""
        # Strict directory filter: if it's a directory, clear the website field
        if is_directory_url(website):
            website = ""

        # Parse Rating and Review Count
        total_score = item.get("totalScore")
        reviews_count = item.get("reviewsCount")
        
        # Ensure numeric values or empty string (handle None explicitly)
        rating = str(total_score) if total_score is not None else ""
        review_count = str(reviews_count) if reviews_count is not None else "0"

        lead = {
            "Firmenname": title,
            "Telefon": item.get("phone", "") or "",
            "Adresse": item.get("address", "") or "",
            "Spezialisierung": item.get("categoryName", "") or "",
            "Rating": rating,
            "ReviewCount": review_count,
            "Website": website,
            "Email": "",
            "Geschaeftsfuehrer": "",
            "LinkedIn": "",
        }

        if key not in leads:
            leads[key] = lead
        else:
            # Merge: fill in missing fields from the new entry
            existing = leads[key]
            for field, value in lead.items():
                if value and not existing.get(field):
                    existing[field] = value

    # --- Sort by rating (best first) ---
    def get_rating(lead):
        try:
            return float(lead["Rating"])
        except (ValueError, TypeError):
            return 0.0

    sorted_leads = sorted(leads.values(), key=get_rating, reverse=True)

    # --- Save ---
    with open(OUTPUT_FILE, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES, delimiter=DELIMITER)
        writer.writeheader()
        writer.writerows(sorted_leads)

    # --- Stats ---
    w = sum(1 for l in sorted_leads if l["Website"])
    t = sum(1 for l in sorted_leads if l["Telefon"])

    print(f"\n{'=' * 60}")
    print(f"✅ DONE! Saved to: {OUTPUT_FILE}")
    print(f"{'=' * 60}")
    print(f"   📊 {len(sorted_leads)} unique leads (from {raw_count} raw results)")
    print(f"   📞 {t} with phone")
    print(f"   🌐 {w} with website")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
