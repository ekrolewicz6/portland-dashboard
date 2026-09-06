import { ImageResponse } from "next/og";
import { ogFrame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Property screening for owners and developers, at published prices";

export default function Image() {
  return new ImageResponse(ogFrame({
      eyebrow: "For property owners and developers",
      headline: "Which building deserves the next dollar of diligence?",
      description: "A property or a portfolio, screened against the public record: what is known, what is missing, and the next three moves. Published prices, one side per matter."
    }), { ...OG_SIZE });
}
