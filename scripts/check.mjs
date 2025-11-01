#!/usr/bin/env node

/**
 * Code quality check script
 * Auto-fixes linting and formatting, then checks types
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const gray = '\x1b[90m';
const green = '\x1b[32m';
const red = '\x1b[31m';
const blue = '\x1b[34m';
const reset = '\x1b[0m';

async function run(command, args = [], silent = false) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: silent ? 'pipe' : 'inherit',
      shell: true,
    });

    child.on('exit', (code) => {
      resolve(code === 0);
    });

    child.on('error', () => {
      resolve(false);
    });
  });
}

async function main() {
  console.log('\nRunning quality checks...\n');

  // Auto-fix lint issues
  process.stdout.write(`${gray}Fixing lint issues...${reset} `);
  await run('pnpm', ['eslint', '.', '--fix'], true);
  console.log(`${blue}fixed${reset}`);

  // Auto-format code
  process.stdout.write(`${gray}Formatting code...${reset} `);
  await run('pnpm', ['prettier', '--write', '.'], true);
  console.log(`${blue}formatted${reset}`);

  console.log();

  // Check types (can't auto-fix)
  process.stdout.write(`${gray}Type checking...${reset} `);
  const typeCheckPassed = await run('pnpm', ['tsc', '--noEmit']);
  console.log(typeCheckPassed ? `${green}✓${reset}` : `${red}✗${reset}`);

  console.log();

  if (typeCheckPassed) {
    console.log(`${green}All checks passed${reset}\n`);
    process.exit(0);
  } else {
    console.log(`${red}Type errors found - please fix manually${reset}\n`);
    process.exit(1);
  }
}

main().catch(() => process.exit(1));
