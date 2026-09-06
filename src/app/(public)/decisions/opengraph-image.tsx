import { ImageResponse } from "next/og";
import { ogFrame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Decisions on the record: every open decision in Portland's development portfolio";

export default function Image() {
  return new ImageResponse(ogFrame({
      eyebrow: "Decisions on the record",
      headline: "Every open decision in the City's development portfolio.",
      description: "What the public record says is still undecided: what it is, who owns it, when it is due, and where it says so. Dates and stages only, no ratings."
    }), { ...OG_SIZE });
}
