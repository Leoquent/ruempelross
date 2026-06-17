# Example Configuration
# =====================
# Copy these values into the CONFIG section of each script.

# --- Common ---
APIFY_TOKEN = "apify_api_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
DELIMITER = ";"

# --- Step 1: Google Maps ---
SEARCH_QUERIES = [
    "SHK Betrieb Düsseldorf",
    "Sanitär Heizung Düsseldorf",
    "Heizungsbauer Düsseldorf",
    "Klempner Düsseldorf",
    "Badsanierung Düsseldorf",
    "Wärmepumpen Installation Düsseldorf",
]
LOCATION = "Düsseldorf, Germany"
MAX_PER_SEARCH = 60

# --- Example for a different industry/city ---
# SEARCH_QUERIES = [
#     "Elektriker München",
#     "Elektroinstallation München",
#     "Elektrotechnik München",
# ]
# LOCATION = "München, Germany"
# MAX_PER_SEARCH = 80

# --- Output filenames ---
# Step 1 output → Step 2 input
STEP1_OUTPUT = "leads_raw.csv"
# Step 2 output → Step 3 input
STEP2_OUTPUT = "leads_enriched.csv"
# Step 3 output (final)
STEP3_OUTPUT = "leads_final.csv"
