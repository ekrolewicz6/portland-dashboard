import { NextResponse } from "next/server";
import { z } from "zod";

const applicationSchema = z.object({
  // Step 1: Business Info
  businessName: z.string().min(1, "Business name is required"),
  address: z.string().min(1, "Address is required"),
  entityType: z.enum(["llc", "corp", "s_corp", "sole_prop", "partnership", "nonprofit"]),
  ownerNames: z.string().min(1, "Owner name(s) required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Valid phone required"),
  numEmployees: z.number().int().min(0),
  pctOregonResidents: z.number().min(0).max(100),
  description: z.string().min(10, "Please provide a brief description"),
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
  yearFounded: z.string().min(4, "Year or date required"),

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

// In-memory store (temporary — no DB yet)
const applications: Array<{
  id: string;
  data: ApplicationPayload;
  submittedAt: string;
}> = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = applicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const applicationId = `PCB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    applications.push({
      id: applicationId,
      data: parsed.data,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      applicationId,
      message:
        "Application received. Our team will review your submission and respond within 5 business days.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 }
    );
  }
}
