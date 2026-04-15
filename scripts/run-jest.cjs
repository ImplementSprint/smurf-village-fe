const { spawnSync } = require("node:child_process");

const jestBin = require.resolve("jest/bin/jest");
const incomingArgs = process.argv.slice(2);
const sanitizedArgs = [];

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

if (!hasCoverage) {
  sanitizedArgs.push("--coverage");
}

sanitizedArgs.push(
  "--coverageReporters=json-summary",
  "--coverageReporters=lcov",
  "--coverageReporters=text",
);

const result = spawnSync(process.execPath, [jestBin, ...sanitizedArgs], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);