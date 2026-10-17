// Usage: node scripts/bump-version.mjs [buildNumber]
// Sets package.json "version" to YY.MM.DD-<build>. Without an argument the build
// number increments if the date part is already today, otherwise it resets to 0.
import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(readFileSync(file, "utf8"));

const d = new Date();
const pad = (n) => String(n).padStart(2, "0");
const today = `${pad(d.getFullYear() % 100)}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;

const explicitBuild = process.argv[2];
const [date, build] = pkg.version.split("-");

let next;
if (explicitBuild !== undefined) {
  if (!/^\d+$/.test(explicitBuild)) {
    console.error(`invalid build number '${explicitBuild}'`);
    process.exit(1);
  }
  next = Number(explicitBuild);
} else {
  next = date === today ? Number(build) + 1 : 0;
}

pkg.version = `${today}-${next}`;
writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
console.log(`version ${pkg.version}`);
