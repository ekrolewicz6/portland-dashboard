import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateSavings } from "@/lib/calculator/savings-engine";

const calculatorInputSchema = z.object({
  sector: z.enum([
    "restaurant_bar",
    "retail",
    "creative",
    "tech",
    "maker_manufacturing",
    "healthcare",
    "professional_services",
  ]),
  squareFootage: z.number().min(0),
  buildoutCost: z.number().min(0),
  year1Revenue: z.number().min(0),
  ownerIncome: z.number().min(0),
  numOwners: z.number().int().min(1),
  numEmployees: z.number().int().min(0),
  takingNewSpace: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = calculatorInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const report = calculateSavings(parsed.data);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 }
    );
  }
}
