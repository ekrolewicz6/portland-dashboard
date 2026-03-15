import { execSync } from "child_process";

console.log("Pushing schema to database...");
execSync("npx drizzle-kit push", { stdio: "inherit" });
console.log("Done.");
