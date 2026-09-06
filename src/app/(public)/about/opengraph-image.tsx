import { ImageResponse } from "next/og";
import { ogFrame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "About Portland Civic Lab: the people building it and how to join them";

export default function Image() {
  return new ImageResponse(ogFrame({
      eyebrow: "About the Lab",
      headline: "A new kind of civic institution, built in Oregon, in public.",
      description: "Free, source-linked tools funded by paid decision work at published prices. The people building it, the rules they work under, and four ways to join."
    }), { ...OG_SIZE });
}
