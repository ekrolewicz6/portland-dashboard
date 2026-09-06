import { notFound } from "next/navigation";
import { isValidQuestion, questionMeta } from "@/lib/questions";
import type { DashboardResponse } from "@/lib/types";
import Sparkline from "@/components/charts/Sparkline";
import { getBaseUrl } from "@/lib/dashboard-data";
import { getTrendPillClass } from "@/lib/utils";

interface PageProps {
  params: Promise<{ question: string }>;
}

// Render per-request: the data fetch resolves the base URL from request
// headers, and embeds must always show current numbers.
export const dynamic = "force-dynamic";

async function fetchQuestionData(
  question: string
): Promise<DashboardResponse> {
  const baseUrl = await getBaseUrl();

  const res = await fetch(`${baseUrl}/api/dashboard/${question}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch data for ${question}`);
  }

  return res.json();
}

export default async function EmbedPage({ params }: PageProps) {
  const { question } = await params;

  if (!isValidQuestion(question)) {
    notFound();
  }

  const meta = questionMeta[question];

  let data: DashboardResponse;
  try {
    data = await fetchQuestionData(question);
  } catch {
    // Never substitute mock data for real numbers (see KNOWN_ISSUES.md).
    // An embed with no data says so honestly.
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <p style={{ fontSize: 13, color: "#78716c", textAlign: "center" }}>
          {meta.title} — data temporarily unavailable.
        </p>
        <a
          href={`https://www.portlandciviclab.org/dashboard/${question}`}
          style={{ fontSize: 11, color: "#c8956c", fontWeight: 600 }}
        >
          View on Portland Civic Lab
        </a>
      </div>
    );
  }

  const sparklineData = data.chartData.map((d) => ({ value: d.value }));

  // Same polarity rule as the full dashboard page: an embed that colours a
  // rise in crime green would be worse than one with no colour at all.
  const trendClass = getTrendPillClass(data.trend.direction, question);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          padding: "20px 24px 12px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            width: 32,
            height: 3,
            backgroundColor: meta.color,
            marginBottom: 12,
            borderRadius: 1,
          }}
        />

        {/* Question */}
        <h2
          className="font-editorial"
          style={{
            fontSize: 16,
            color: "#1c1917",
            lineHeight: 1.3,
            margin: "0 0 12px 0",
          }}
        >
          {meta.title}
        </h2>

        {/* Headline value */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#1c1917",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {typeof data.headlineValue === "number"
              ? data.headlineValue.toLocaleString()
              : data.headlineValue}
          </span>
          <span
            className={`trend-pill ${trendClass}`}
            style={{ fontSize: 10 }}
          >
            {data.trend.direction === "up" ? "+" : ""}
            {data.trend.percentage}%
          </span>
        </div>

        {/* Headline label */}
        <p
          style={{
            fontSize: 12,
            color: "#78716c",
            marginTop: 4,
            lineHeight: 1.4,
          }}
        >
          {data.headline}
        </p>

        {/* Sparkline */}
        <div style={{ flex: 1, marginTop: 16, minHeight: 60 }}>
          <Sparkline data={sparklineData} color={meta.color} height={60} />
        </div>
      </div>

      {/* Attribution footer */}
      <div
        style={{
          padding: "8px 24px",
          borderTop: "1px solid #ebe5da",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 10, color: "#78716c", fontFamily: "monospace" }}>
          {data.source}
        </span>
        <a
          href="https://www.portlandciviclab.org"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 10,
            color: "#c8956c",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Portland Civic Lab
        </a>
      </div>
    </div>
  );
}
