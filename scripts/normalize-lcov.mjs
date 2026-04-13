import fs from "node:fs";

const inputPath = "coverage/lcov.info";
const outputPath = "coverage/lcov-sonar.info";

if (!fs.existsSync(inputPath)) {
  console.log("LCOV source missing, skipping normalization.");
  process.exit(0);
}

const raw = fs.readFileSync(inputPath, "utf8");

function normalizeSfPath(pathValue) {
  let value = pathValue.replace(/\\/g, "/");

  const srcIndex = value.toLowerCase().lastIndexOf("/src/");
  if (srcIndex >= 0) {
    value = `src/${value.slice(srcIndex + 5)}`;
  }

  value = value.replace(/^[A-Za-z]:/, "").replace(/^\/+/, "");
  return value;
}

const normalized = raw
  .split(/\r?\n/)
  .map((line) => {
    if (!line.startsWith("SF:")) return line;
    return `SF:${normalizeSfPath(line.slice(3))}`;
  })
  .join("\n");

fs.writeFileSync(outputPath, normalized, "utf8");
console.log(`Normalized LCOV written to ${outputPath}`);
