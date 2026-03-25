"use client";

import DataNeeded from "@/components/dashboard/DataNeeded";

export default function ProgramDetail() {
  return (
    <div className="space-y-10">
      <DataNeeded
        title="Portland Civic Lab Business Program Data"
        description="The PCB certification system is not yet live. Once the program launches, this section will show certified business growth, survival rates, jobs created, and credits issued in real time."
        color="#1a3a2a"
        actions={[
          {
            label: "PCB registry system — awaiting launch",
            type: "api_key",
          },
        ]}
      />
    </div>
  );
}
