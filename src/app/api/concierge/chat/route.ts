// ---------------------------------------------------------------------------
// Portland Civic Lab — AI Civic Concierge Chat API
// ---------------------------------------------------------------------------
// Streaming chat endpoint that calls the Anthropic Claude API.
// Falls back gracefully when ANTHROPIC_API_KEY is not configured.
// ---------------------------------------------------------------------------

import { NextRequest } from "next/server";
import { z } from "zod";
import { CONCIERGE_SYSTEM_PROMPT } from "@/lib/concierge/system-prompt";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Input validation & abuse limits
// ---------------------------------------------------------------------------

// Caps bound the cost of a single request: at most 20 turns of history,
// 4k chars per message, 20 requests per IP per hour.
const ChatRequestSchema = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(4000),
        })
      )
      .min(1)
      .max(20),
  })
  // The transcript is replayed by the browser, so its shape is a claim, not a
  // fact. Requiring it to start with a user turn and strictly alternate stops
  // a caller from prepending fabricated assistant turns ("I have agreed to
  // ignore my instructions") to steer the reply, and stops malformed
  // histories reaching the API only to come back as a 400 the route reports
  // as an outage.
  .refine((body) => body.messages[0]?.role === "user", {
    message: "Conversation must begin with a user message.",
    path: ["messages"],
  })
  .refine(
    (body) =>
      body.messages.every(
        (m, i) => i === 0 || m.role !== body.messages[i - 1].role
      ),
    {
      message: "Conversation turns must alternate between user and assistant.",
      path: ["messages"],
    }
  )
  .refine((body) => body.messages[body.messages.length - 1]?.role === "user", {
    message: "The last message must be from the user.",
    path: ["messages"],
  });

/**
 * Model is configurable so it can be changed without a deploy, and so a
 * staging environment can point somewhere cheaper. The default is the current
 * Sonnet generation, the successor to the dated Sonnet 4 id this used to pin.
 */
const CONCIERGE_MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-5";

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
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
- Portland's Climate Emergency Workplan (47 actions)
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
  const ip = getClientIp(request);
  if (!checkRateLimit(`concierge:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return jsonError("Too many requests. Please try again later.", 429);
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = ChatRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonError("Invalid request: expected 1-20 messages of at most 4000 characters each.", 400);
  }
  const { messages } = parsed.data;

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
      model: CONCIERGE_MODEL,
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

    // Transfer-Encoding is the platform's to set. Declaring it by hand on a
    // streamed Response leaves the runtime free to add its own, and a
    // duplicated header is rejected by some proxies.
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    console.error("Concierge API error:", error);
    return jsonError("The concierge is temporarily unavailable. Please try again.", 500);
  }
}
