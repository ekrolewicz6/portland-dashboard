import { ImageResponse } from "next/og";
import { ogFrame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "The continuum: every step from sidewalk to lease, defined and counted";

export default function Image() {
  return new ImageResponse(
    ogFrame({
      eyebrow: "Homelessness · The continuum",
      headline: "Every step from the sidewalk to a lease",
      accent: "#c8956c",
      description:
        "Fourteen stages, twelve pathways, six questions any responder can answer at the scene, and a rule for when Housing First works.",
    }),
    { ...OG_SIZE },
  );
}
