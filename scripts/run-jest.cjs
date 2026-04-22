const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const jestBin = require.resolve("jest/bin/jest");
const incomingArgs = process.argv.slice(2);
const sanitizedArgs = [];

// Debug: Log what we received
console.log("[jest-wrapper] incoming args:", JSON.stringify(incomingArgs));
console.log("[jest-wrapper] cwd:", process.cwd());
console.log("[jest-wrapper] jest bin:", jestBin);
console.log("[jest-wrapper] CI env:", process.env.CI);
console.log("[jest-wrapper] GITHUB_ACTIONS env:", process.env.GITHUB_ACTIONS);

for (let i = 0; i < incomingArgs.length; i += 1) {
  const arg = incomingArgs[i];

  if (arg === "--coverageReporters") {
    i += 1;
    continue;
  }

  if (arg.startsWith("--coverageReporters=")) {
    continue;
  }

  sanitizedArgs.push(arg);
}

const hasCoverage = sanitizedArgs.some(
  (arg) => arg === "--coverage" || arg.startsWith("--coverage="),
);

// Always enable coverage in CI environments
const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
if (!hasCoverage) {
  if (isCI) {
    console.log("[jest-wrapper] CI environment detected, enforcing --coverage");
  } else {
    console.log("[jest-wrapper] --coverage NOT found, adding it");
  }
  sanitizedArgs.push("--coverage");
}

sanitizedArgs.push(
  "--coverageReporters=json-summary",
  "--coverageReporters=lcov",
  "--coverageReporters=text",
  "--coverageReporters=clover",
);

console.log("[jest-wrapper] final args to jest:", JSON.stringify(sanitizedArgs));

const result = spawnSync(process.execPath, [jestBin, ...sanitizedArgs], {
  stdio: "inherit",
  env: process.env,
});

function normalizeLcovFile(lcovPath) {
  if (!fs.existsSync(lcovPath)) return;

  const original = fs.readFileSync(lcovPath, "utf8");
  const normalized = original.replaceAll(/^SF:(.*)$/gm, (_, sourceFile) => `SF:${sourceFile.replaceAll("\\", "/")}`);

  if (normalized !== original) {
    fs.writeFileSync(lcovPath, normalized, "utf8");
    console.log("[jest-wrapper] normalized lcov SF paths to forward slashes");
  }
}

// Debug: Check if coverage files exist after Jest runs
console.log("[jest-wrapper] Jest exit code:", result.status);
const coverageDir = path.join(process.cwd(), "coverage");
if (fs.existsSync(coverageDir)) {
  const files = fs.readdirSync(coverageDir);
  console.log("[jest-wrapper] coverage/ contents:", JSON.stringify(files));
  if (files.includes("lcov.info")) {
    const lcovPath = path.join(coverageDir, "lcov.info");
    normalizeLcovFile(lcovPath);
    console.log("[jest-wrapper] ✓ lcov.info exists");
    const lcovStats = fs.statSync(lcovPath);
    console.log("[jest-wrapper] lcov.info size:", lcovStats.size, "bytes");
  } else {
    console.log("[jest-wrapper] ✗ lcov.info MISSING");
  }
} else {
  console.log("[jest-wrapper] ✗ coverage/ directory does not exist");
}

process.exit(result.status ?? 1);