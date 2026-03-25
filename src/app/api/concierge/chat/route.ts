// ---------------------------------------------------------------------------
// Portland Civic Lab — AI Civic Concierge Chat API
// ---------------------------------------------------------------------------
// Streaming chat endpoint that calls the Anthropic Claude API.
// Falls back gracefully when ANTHROPIC_API_KEY is not configured.
// ---------------------------------------------------------------------------

import { NextRequest } from "next/server";
import { CONCIERGE_SYSTEM_PROMPT } from "@/lib/concierge/system-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
}

// ---------------------------------------------------------------------------
// Fallback response when no API key is configured
// ---------------------------------------------------------------------------

const FALLBACK_RESPONSE = `Welcome to the Portland Civic Lab Civic Concierge! I'm an AI assistant built to help you navigate Portland's government, public data, and civic systems.

**I'm currently running in demo mode** because the Anthropic API key hasn't been configured yet. Once connected, I can help you with:

**Government & Civic Information**
- How Portland's city government works (bureaus, council, mayor)
- How to file public records requests
- How to participate in city decisions

**Permits & Development**
- Building permit types and current processing times
- Bureau of Development Services processes
- Land use reviews and appeals

**Zoning & Land Use**
- Portland zoning code (Title 33)
- Looking up zoning for any address
- ADUs, home businesses, food carts, short-term rentals

**Climate & Environment**
- Portland's Climate Emergency Workplan (43 actions)
- Portland Clean Energy Fund (PCEF) grants
- Emissions data and 2030 goals

**Housing, Homelessness & Public Services**
- Housing production data and affordability programs
- Shelter capacity and homelessness services
- 311, parks, libraries, and neighborhood programs

**Business & Tax Information**
- Portland Business License Tax, Multnomah County BIT
- SDC fees, zoning for businesses
- How to navigate city permits

To activate the full AI concierge, add your \`ANTHROPIC_API_KEY\` to the environment variables.`;

// ---------------------------------------------------------------------------
// POST /api/concierge/chat
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ChatRequestBody;
  const { messages } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Messages array is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // ── No API key — return fallback ────────────────────────────────
  if (!apiKey) {
    // Stream the fallback so the UI behaves consistently
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send the full fallback as a single chunk
        controller.enqueue(encoder.encode(FALLBACK_RESPONSE));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  // ── Call Claude API with streaming ──────────────────────────────
  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({ apiKey });

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: CONCIERGE_SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Convert the Anthropic stream to a ReadableStream for the browser
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: unknown) {
    console.error("Concierge API error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
