#!/usr/bin/env node

/**
 * Setup script for the MIDIKA project
 * Ensures all dependencies are installed and the project is ready for development
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

const icons = {
  rocket: '🚀',
  check: '✅',
  package: '📦',
  wrench: '🔧',
  sparkles: '✨',
  warning: '⚠️',
  error: '❌',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader() {
  console.clear();
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                            ║', 'cyan');
  log(
    `║  ${icons.rocket}  ${colors.bright}${colors.cyan}MIDIKA PROJECT SETUP${colors.reset}${colors.cyan}  ${icons.rocket}                       ║`,
    'cyan'
  );
  log('║                                                            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');
}

async function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function checkNodeModules() {
  const nodeModulesPath = join(projectRoot, 'node_modules');
  return existsSync(nodeModulesPath);
}

async function main() {
  logHeader();

  // Step 1: Check if node_modules exists
  log(`${icons.package}  Checking dependencies...`, 'cyan');
  const hasNodeModules = await checkNodeModules();

  if (!hasNodeModules) {
    log(
      `${icons.wrench}  Installing dependencies (this may take a while)...`,
      'yellow'
    );
    try {
      await runCommand('pnpm', ['install']);
      log(`${icons.check}  Dependencies installed successfully!`, 'green');
    } catch (error) {
      log(`${icons.error}  Failed to install dependencies`, 'red');
      log(`Please run manually: pnpm install`, 'yellow');
      process.exit(1);
    }
  } else {
    log(`${icons.check}  Dependencies already installed`, 'green');
  }

  console.log('\n');
  log('─'.repeat(60), 'cyan');
  console.log('\n');

  // Success message
  log(`${icons.sparkles}  Setup complete! ${icons.sparkles}`, 'bright');
  console.log('\n');
  log('Next steps:', 'cyan');
  log('  1. Start development server: pnpm dev', 'reset');
  log('  2. Run quality checks:       pnpm check', 'reset');
  log('  3. View documentation:       docs/README.md', 'reset');
  console.log('\n');
  log('Happy coding! 🎉', 'green');
  console.log('\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
