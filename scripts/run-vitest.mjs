import { spawn } from 'node:child_process';

const rawArgs = process.argv.slice(2);
const normalizedArgs = [];
let hasCoverage = false;
let hasCoverageReporter = false;

for (let index = 0; index < rawArgs.length; index += 1) {
  const arg = rawArgs[index];

  if (arg === '--coverage') {
    if (!hasCoverage) {
      normalizedArgs.push(arg);
      hasCoverage = true;
    }
    continue;
  }

  if (arg === '--coverageReporters') {
    const reporter = rawArgs[index + 1];
    if (reporter) {
      normalizedArgs.push(`--coverage.reporter=${reporter}`);
      hasCoverageReporter = true;
      index += 1;
    }
    continue;
  }

  if (arg.startsWith('--coverageReporters=')) {
    const reporter = arg.slice('--coverageReporters='.length);
    if (reporter) {
      normalizedArgs.push(`--coverage.reporter=${reporter}`);
      hasCoverageReporter = true;
    }
    continue;
  }

  normalizedArgs.push(arg);
}

const envCoverage = process.env.npm_config_coverage;
if (!hasCoverage && envCoverage && envCoverage !== 'false') {
  normalizedArgs.push('--coverage');
  hasCoverage = true;
}

const envCoverageReporter = process.env.npm_config_coveragereporters;
if (!hasCoverageReporter && envCoverageReporter) {
  normalizedArgs.push(`--coverage.reporter=${envCoverageReporter}`);
}

const child = spawn('npx', ['vitest', 'run', ...normalizedArgs], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
