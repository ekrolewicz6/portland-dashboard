#!/bin/bash
# ============================================================================
# Zillow Monthly Data Refresh
# Run on the 1st of each month to pull latest Zillow research data
# Usage: ./scripts/refresh-zillow-data.sh
# ============================================================================

set -e

BASE="https://files.zillowstatic.com/research/public_csvs"
DIR="data/zillow"
PORTLAND="Portland, OR"
DB="portland_dashboard"

echo "$(date) — Zillow Monthly Data Refresh"
echo "========================================"

mkdir -p "$DIR"

# All known working Zillow CSV endpoints
FILES=(
  # ZHVI - Home Values
  "zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
  "zhvi/Metro_zhvi_uc_sfr_tier_0.33_0.67_sm_sa_month.csv"
  "zhvi/Metro_zhvi_uc_condo_tier_0.33_0.67_sm_sa_month.csv"
  "zhvi/Metro_zhvi_bdrmcnt_1_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
  "zhvi/Metro_zhvi_bdrmcnt_2_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
  "zhvi/Metro_zhvi_bdrmcnt_3_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
  "zhvi/Metro_zhvi_bdrmcnt_4_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
  "zhvi/Metro_zhvi_bdrmcnt_5_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
  "zhvi/Metro_zhvi_uc_sfrcondo_tier_0.0_0.33_sm_sa_month.csv"
  "zhvi/Metro_zhvi_uc_sfrcondo_tier_0.67_1.0_sm_sa_month.csv"
  # ZORI - Rentals
  "zori/Metro_zori_uc_sfrcondomfr_sm_month.csv"
  "zori/Metro_zori_uc_sfr_sm_month.csv"
  "zori/Metro_zori_uc_mfr_sm_month.csv"
  # Market Metrics
  "invt_fs/Metro_invt_fs_uc_sfrcondo_month.csv"
  "new_listings/Metro_new_listings_uc_sfrcondo_month.csv"
  "pct_sold_above_list/Metro_pct_sold_above_list_uc_sfrcondo_month.csv"
  "pct_sold_below_list/Metro_pct_sold_below_list_uc_sfrcondo_month.csv"
  "market_temp_index/Metro_market_temp_index_uc_sfrcondo_month.csv"
)

# Metric name mapping
declare -A METRICS
METRICS["Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"]="zhvi_typical"
METRICS["Metro_zhvi_uc_sfr_tier_0.33_0.67_sm_sa_month.csv"]="zhvi_sfr"
METRICS["Metro_zhvi_uc_condo_tier_0.33_0.67_sm_sa_month.csv"]="zhvi_condo"
METRICS["Metro_zhvi_bdrmcnt_1_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"]="zhvi_1bed"
METRICS["Metro_zhvi_bdrmcnt_2_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"]="zhvi_2bed"
METRICS["Metro_zhvi_bdrmcnt_3_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"]="zhvi_3bed"
METRICS["Metro_zhvi_bdrmcnt_4_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"]="zhvi_4bed"
METRICS["Metro_zhvi_bdrmcnt_5_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"]="zhvi_5bed"
METRICS["Metro_zhvi_uc_sfrcondo_tier_0.0_0.33_sm_sa_month.csv"]="zhvi_bottom_tier"
METRICS["Metro_zhvi_uc_sfrcondo_tier_0.67_1.0_sm_sa_month.csv"]="zhvi_top_tier"
METRICS["Metro_zori_uc_sfrcondomfr_sm_month.csv"]="zori_all"
METRICS["Metro_zori_uc_sfr_sm_month.csv"]="zori_sfr"
METRICS["Metro_zori_uc_mfr_sm_month.csv"]="zori_mfr"
METRICS["Metro_invt_fs_uc_sfrcondo_month.csv"]="inventory"
METRICS["Metro_new_listings_uc_sfrcondo_month.csv"]="new_listings"
METRICS["Metro_pct_sold_above_list_uc_sfrcondo_month.csv"]="pct_sold_above"
METRICS["Metro_pct_sold_below_list_uc_sfrcondo_month.csv"]="pct_sold_below"
METRICS["Metro_market_temp_index_uc_sfrcondo_month.csv"]="market_temp"

echo "Downloading ${#FILES[@]} datasets..."
for file in "${FILES[@]}"; do
  fname=$(basename "$file")
  curl -sL "$BASE/$file" -o "$DIR/$fname"
  echo "  ✓ $fname"
done

echo ""
echo "Parsing Portland data and loading into PostgreSQL..."

# Use Python to parse all CSVs and generate SQL
python3 << 'PYTHON_EOF'
import csv, json, os

ZILLOW_DIR = "data/zillow"
PORTLAND = "Portland, OR"

datasets = {
    "Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv": "zhvi_typical",
    "Metro_zhvi_uc_sfr_tier_0.33_0.67_sm_sa_month.csv": "zhvi_sfr",
    "Metro_zhvi_uc_condo_tier_0.33_0.67_sm_sa_month.csv": "zhvi_condo",
    "Metro_zhvi_bdrmcnt_1_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv": "zhvi_1bed",
    "Metro_zhvi_bdrmcnt_2_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv": "zhvi_2bed",
    "Metro_zhvi_bdrmcnt_3_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv": "zhvi_3bed",
    "Metro_zhvi_bdrmcnt_4_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv": "zhvi_4bed",
    "Metro_zhvi_bdrmcnt_5_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv": "zhvi_5bed",
    "Metro_zhvi_uc_sfrcondo_tier_0.0_0.33_sm_sa_month.csv": "zhvi_bottom_tier",
    "Metro_zhvi_uc_sfrcondo_tier_0.67_1.0_sm_sa_month.csv": "zhvi_top_tier",
    "Metro_zori_uc_sfrcondomfr_sm_month.csv": "zori_all",
    "Metro_zori_uc_sfr_sm_month.csv": "zori_sfr",
    "Metro_zori_uc_mfr_sm_month.csv": "zori_mfr",
    "Metro_invt_fs_uc_sfrcondo_month.csv": "inventory",
    "Metro_new_listings_uc_sfrcondo_month.csv": "new_listings",
    "Metro_pct_sold_above_list_uc_sfrcondo_month.csv": "pct_sold_above",
    "Metro_pct_sold_below_list_uc_sfrcondo_month.csv": "pct_sold_below",
    "Metro_market_temp_index_uc_sfrcondo_month.csv": "market_temp",
}

sql = ["TRUNCATE public.zillow_metrics;"]
total = 0

for filename, metric in datasets.items():
    filepath = os.path.join(ZILLOW_DIR, filename)
    if not os.path.exists(filepath):
        continue
    with open(filepath) as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("RegionName") == PORTLAND:
                for k, v in row.items():
                    if k.startswith("20") and v:
                        try:
                            val = round(float(v), 2)
                            sql.append(f"INSERT INTO public.zillow_metrics (metric, month, value) VALUES ('{metric}', '{k[:7]}-01', {val}) ON CONFLICT (metric, month) DO UPDATE SET value = {val};")
                            total += 1
                        except ValueError:
                            pass
                break

with open("/tmp/zillow_refresh.sql", "w") as f:
    f.write("\n".join(sql))

print(f"  Generated {total} rows for PostgreSQL")
PYTHON_EOF

psql "$DB" < /tmp/zillow_refresh.sql > /dev/null 2>&1
echo "  ✓ Database updated"

echo ""
echo "$(date) — Refresh complete!"
echo "  Datasets: ${#FILES[@]}"
echo "  Run again next month: ./scripts/refresh-zillow-data.sh"
