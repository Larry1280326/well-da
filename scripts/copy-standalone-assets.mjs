// Copies public/ and .next/static/ into .next/standalone/ after a standalone build.
// Next.js standalone output intentionally excludes these so you can serve static
// assets from a CDN. For Plesk we copy them into the standalone directory so the
// single Node.js process serves everything.

import { cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const standalone = resolve(root, ".next", "standalone");

if (!existsSync(standalone)) {
  console.error(
    'ERROR: .next/standalone/ not found. Did you run "next build" with output: "standalone"?',
  );
  process.exit(1);
}

async function main() {
  const publicSrc = resolve(root, "public");
  const publicDest = resolve(standalone, "public");
  console.log(`Copying ${publicSrc} -> ${publicDest}`);
  await cp(publicSrc, publicDest, { recursive: true });

  const staticSrc = resolve(root, ".next", "static");
  const staticDest = resolve(standalone, ".next", "static");
  console.log(`Copying ${staticSrc} -> ${staticDest}`);
  await cp(staticSrc, staticDest, { recursive: true });

  console.log("Standalone assets copied successfully.");
}

main().catch((err) => {
  console.error("Failed to copy standalone assets:", err);
  process.exit(1);
});
