"use client";

import DataNeeded from "@/components/dashboard/DataNeeded";

export default function MigrationDetail() {
  return (
    <div className="space-y-10">
      <DataNeeded
        title="Water Bureau Migration Data Needed"
        description="Water meter activations and deactivations are the best real-time proxy for household migration in Portland. This data is held by the Portland Water Bureau and requires a public records request."
        color="#4a7f9e"
        actions={[
          {
            label: "File public records request to Portland Water Bureau (PWBCustomerService@portlandoregon.gov)",
            type: "prr",
          },
        ]}
      />

      <DataNeeded
        title="Census Population Data Needed"
        description="The U.S. Census Bureau provides annual population estimates through a free API. Registration takes 5 minutes and provides an API key for programmatic access."
        color="#4a7f9e"
        actions={[
          {
            label: "Register for free Census API key",
            href: "https://api.census.gov/data/key_signup.html",
            type: "api_key",
          },
        ]}
      />

      <DataNeeded
        title="IRS Migration Flow Data Needed"
        description="The IRS Statistics of Income division publishes county-to-county migration data based on tax return filings. This is a free download that shows where people are moving to and from Portland."
        color="#4a7f9e"
        actions={[
          {
            label: "Download IRS SOI migration data (free)",
            href: "https://www.irs.gov/statistics/soi-tax-stats-migration-data",
            type: "download",
          },
        ]}
      />
    </div>
  );
}
