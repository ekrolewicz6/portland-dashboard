import { ImageResponse } from "next/og";
import { ogFrame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "Where the next dollar goes — the Portland Public Schools budget, examined, and the ten decisions that would change it.";

export default function Image() {
  return new ImageResponse(
    ogFrame({
      eyebrow: "Schools & public money",
      headline: "Where the next dollar goes.",
      accent: "#3d7a5a",
      description:
        "PPS cut 322 positions the year its budget hit $2.77 billion. Eleven years of budget books, every audit, and the ten decisions that would change it.",
    }),
    { ...OG_SIZE },
  );
}
