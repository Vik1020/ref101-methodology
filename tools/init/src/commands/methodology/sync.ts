/**
 * Sync command
 * Check synchronization between methodology.yaml and processes/*.json
 */

import path from 'path';
import chalk from 'chalk';
import { readManifest } from '../../lib/manifest.js';
import { loadMethodology, validateMethodology, validateProcessSync } from '../../lib/methodology-validator.js';

export async function syncCommand(directory?: string): Promise<void> {
  const projectRoot = directory ? path.resolve(directory) : process.cwd();
  const manifest = await readManifest(projectRoot);

  if (!manifest) {
    console.log(chalk.red('No .installed.yaml found.'));
    console.log(chalk.yellow('Run ref101-init to initialize methodology.'));
    process.exit(1);
  }

  if (!manifest.methodology_path) {
    console.log(chalk.red('No methodology_path in manifest.'));
    process.exit(1);
  }

  console.log(chalk.bold('\nMethodology Sync Check'));
  console.log(chalk.dim('─'.repeat(40)));

  const methodology = await loadMethodology(manifest.methodology_path, manifest.methodology);

  if (!methodology) {
    console.log(chalk.yellow('No methodology.yaml found.'));
    console.log(chalk.dim('Create one with: node tools/meta/dist/index.js extract ' + manifest.methodology));
    process.exit(0);
  }

  // Validate methodology itself
  console.log(chalk.cyan('\n1. Methodology validation:'));
  const validation = validateMethodology(methodology);

  if (validation.errors.length > 0) {
    console.log(`  ${chalk.red('✗')} Errors found:`);
    for (const err of validation.errors) {
      console.log(`    ${chalk.red('•')} ${err}`);
    }
  }

  if (validation.warnings.length > 0) {
    console.log(`  ${chalk.yellow('⚠')} Warnings:`);
    for (const warn of validation.warnings) {
      console.log(`    ${chalk.yellow('•')} ${warn}`);
    }
  }

  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    console.log(`  ${chalk.green('✓')} methodology.yaml is valid`);
  }

  // Check process sync
  console.log(chalk.cyan('\n2. Process synchronization:'));
  const syncResult = await validateProcessSync(
    manifest.methodology_path,
    manifest.methodology,
    methodology
  );

  if (syncResult.issues.length > 0) {
    console.log(`  ${chalk.yellow('⚠')} Sync issues found:`);
    for (const issue of syncResult.issues) {
      console.log(`    ${chalk.yellow('•')} ${issue}`);
    }
  } else {
    console.log(`  ${chalk.green('✓')} Processes are in sync`);
  }

  // Summary
  console.log(chalk.bold('\n─'.repeat(40)));
  const hasErrors = validation.errors.length > 0;
  const hasWarnings = validation.warnings.length > 0 || syncResult.issues.length > 0;

  if (hasErrors) {
    console.log(chalk.red('Status: ERRORS found - fix before proceeding'));
    process.exit(1);
  } else if (hasWarnings) {
    console.log(chalk.yellow('Status: WARNINGS found - review recommended'));
  } else {
    console.log(chalk.green('Status: All checks passed'));
  }

  console.log('');
}
