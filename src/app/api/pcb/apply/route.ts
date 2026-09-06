import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db-query";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Portland Civic Bank application intake.
 *
 * Submissions are persisted to pcb_applications (drizzle/0012). They used to
 * be pushed onto a module-level array, which on Vercel means one copy per
 * Lambda instance, discarded when the instance recycles — while the response
 * promised a reply within five business days.
 *
 * Every string field is length-bounded. The payload is stored whole as JSONB
 * so adding a question to the form does not need a migration, but the fields
 * an operator triages on are also stored as columns.
 */

/** Upper bounds sized to the longest plausible real answer, not to the UI. */
const SHORT = 200;
const MEDIUM = 500;
const LONG = 4000;

const applicationSchema = z.object({
  // Step 1: Business Info
  businessName: z.string().min(1, "Business name is required").max(SHORT),
  address: z.string().min(1, "Address is required").max(MEDIUM),
  entityType: z.enum(["llc", "corp", "s_corp", "sole_prop", "partnership", "nonprofit"]),
  ownerNames: z.string().min(1, "Owner name(s) required").max(MEDIUM),
  email: z.string().email("Valid email required").max(SHORT),
  phone: z.string().min(7, "Valid phone required").max(50),
  numEmployees: z.number().int().min(0).max(1_000_000),
  pctOregonResidents: z.number().min(0).max(100),
  description: z.string().min(10, "Please provide a brief description").max(LONG),
  sector: z.enum([
    "restaurant_bar",
    "retail",
    "creative",
    "tech",
    "maker_manufacturing",
    "healthcare",
    "professional_services",
    "other",
  ]),
  yearFounded: z.string().min(4, "Year or date required").max(50),

  // Step 2: Eligibility
  eligibility: z.object({
    headquarteredInPortland: z.literal(true, "Must be headquartered in Portland"),
    fewerThan500Employees: z.literal(true, "Must have fewer than 500 employees"),
    oregonResidentEmployees: z.literal(true, "Must have at least 60% Oregon-resident employees"),
    majorityOwnedByNaturalPersons: z.literal(true, "Must be majority owned by natural person(s)"),
    newOrGrowing: z.literal(true, "Must be under 5 years old or adding 3+ Portland jobs"),
    threeYearCommitment: z.literal(true, "Must commit to 3-year Portland presence"),
  }),
});

export type ApplicationPayload = z.infer<typeof applicationSchema>;

/** Applications per IP per day. Generous for a form nobody fills in twice. */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Human-facing reference, distinct from the primary key. */
function makeApplicationReference(): string {
  return `PCB-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`pcb-apply:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many applications from this connection. Please try again tomorrow.",
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, errors: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }

  const applicationId = makeApplicationReference();
  const data = parsed.data;

  try {
    await sql`
      INSERT INTO pcb_applications (
        id, business_name, email, phone, entity_type, sector,
        num_employees, client_ip, user_agent, payload
      ) VALUES (
        ${applicationId},
        ${data.businessName},
        ${data.email},
        ${data.phone},
        ${data.entityType},
        ${data.sector},
        ${data.numEmployees},
        ${ip},
        ${request.headers.get("user-agent")?.slice(0, 500) ?? null},
        ${sql.json(data)}
      )
    `;
  } catch (error) {
    // Never acknowledge an application we failed to store. Telling an
    // applicant to expect a reply to something that was dropped is worse than
    // asking them to try again.
    console.error("[pcb/apply] failed to persist application:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "We could not record your application just now. Please try again, or use the contact form so we can take it manually.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    success: true,
    applicationId,
    message:
      "Application received. Our team will review your submission and respond within 5 business days.",
  });
}
