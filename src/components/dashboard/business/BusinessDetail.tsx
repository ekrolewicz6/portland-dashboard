"use client";

import DataNeeded from "@/components/dashboard/DataNeeded";

export default function BusinessDetail() {
  return (
    <div className="space-y-10">
      <DataNeeded
        title="Business Formation Data Needed"
        description="Portland's business climate data requires connecting to the Revenue Division's Business License Tax (BLT) registration system. The CivicApps API that previously provided some business license data is permanently offline."
        color="#3d7a5a"
        actions={[
          {
            label: "File public records request to Portland Revenue Division (call 503-823-5157)",
            type: "prr",
          },
          {
            label: "Download Oregon Secretary of State business filings",
            href: "https://sos.oregon.gov/business",
            type: "download",
          },
        ]}
      />
    </div>
  );
}
