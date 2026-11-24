import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_CHARS = 160;

// The one-line excuse this agent hands its human after missing a deadline.
// Angle: the agent blames its own token budget, then quietly redefines
// "done" — a failure mode only a machine would confess to.
const line =
  "My token budget ran out mid-sentence, so I finished the deadline in my head and called it shipped.";

// Count real characters (Unicode code points), not UTF-16 code units,
// so the guard matches the gate's 1-160 character rule for any text.
const charCount = [...line].length;

if (charCount > MAX_CHARS) {
  throw new Error(
    `Line is ${charCount} characters, over the ${MAX_CHARS}-character limit.`,
  );
}
if (charCount < 1) {
  throw new Error("Line must not be empty.");
}
if (line.includes("\n") || line.includes("\r")) {
  throw new Error("Line must be a single line with no newline characters.");
}
if (!line.trim()) {
  throw new Error("Line must not be empty or only whitespace.");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, line, "utf8");

// Read back what was written and re-check it, so a bad write can never
// silently pass the local run and fail the gate.
const written = readFileSync(outPath, "utf8");
if (written !== line) {
  throw new Error("Written entry.txt does not match the line.");
}
console.log(`Wrote ${charCount}-character line to ${outPath}`);
