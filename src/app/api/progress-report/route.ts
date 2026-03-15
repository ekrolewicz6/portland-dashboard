import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export interface ProgressReportSummary {
  id: number;
  title: string;
  issueDate: string;
  slug: string;
  summary: string | null;
  coverImageUrl: string | null;
  published: boolean;
  sectionCount: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeUnpublished = searchParams.get("drafts") === "true";

  try {
    const rows = await sql<
      {
        id: number;
        title: string;
        issue_date: string;
        slug: string;
        summary: string | null;
        cover_image_url: string | null;
        published: boolean;
        section_count: number;
      }[]
    >`
      SELECT
        r.id,
        r.title,
        r.issue_date::text as issue_date,
        r.slug,
        r.summary,
        r.cover_image_url,
        r.published,
        count(s.id)::int as section_count
      FROM content.progress_reports r
      LEFT JOIN content.report_sections s ON s.report_id = r.id
      WHERE ${includeUnpublished ? sql`true` : sql`r.published = true`}
      GROUP BY r.id
      ORDER BY r.issue_date DESC
    `;

    const reports: ProgressReportSummary[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      issueDate: r.issue_date,
      slug: r.slug,
      summary: r.summary,
      coverImageUrl: r.cover_image_url,
      published: r.published,
      sectionCount: r.section_count,
    }));

    return NextResponse.json({ reports });
  } catch (err) {
    console.error("Progress report list error:", err);
    // Return static fallback data if DB is unavailable
    return NextResponse.json({
      reports: [
        {
          id: 1,
          title: "Portland Progress Report — Q1 2026",
          issueDate: "2026-03-15",
          slug: "q1-2026",
          summary:
            "The inaugural Portland Progress Report combines dashboard data with narrative analysis to tell the story behind Portland's numbers.",
          coverImageUrl: null,
          published: true,
          sectionCount: 4,
        },
      ] satisfies ProgressReportSummary[],
    });
  }
}
