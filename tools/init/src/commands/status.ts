/**
 * status command
 * Show current methodology status
 */

import path from 'path';
import chalk from 'chalk';
import { readManifest, calculateDirChecksum, calculateChecksum } from '../lib/manifest.js';
import { dirExists, fileExists } from '../lib/copier.js';

export async function statusCommand(): Promise<void> {
  const projectRoot = process.cwd();
  const manifest = await readManifest(projectRoot);

  if (!manifest) {
    console.log(chalk.yellow('No .installed.yaml found.'));
    console.log('Run `ref101-init` to initialize the project.');
    return;
  }

  console.log(chalk.blue('ref101 Project Status\n'));

  console.log(`Methodology: ${chalk.cyan(manifest.methodology)}`);
  console.log(`Bundle: ${chalk.cyan(manifest.bundle)}`);
  console.log(`Version: ${chalk.cyan(manifest.methodology_version)}`);
  console.log(`Initialized: ${manifest.initialized_at}\n`);

  // Check skills
  const skillNames = Object.keys(manifest.skills);
  console.log(chalk.cyan(`Skills (${skillNames.length}):`));

  for (const [name, entry] of Object.entries(manifest.skills)) {
    const skillPath = path.join(projectRoot, '.claude', 'skills', name);

    if (!await dirExists(skillPath)) {
      console.log(`  ${chalk.red('✗')} ${name.padEnd(20)} - MISSING`);
      continue;
    }

    const currentChecksum = await calculateDirChecksum(skillPath);
    const modified = currentChecksum !== entry.checksum;

    if (modified) {
      console.log(`  ${chalk.yellow('⚠')} ${name.padEnd(20)} v${entry.version}  ${chalk.yellow('(LOCAL CHANGES)')}`);
    } else {
      console.log(`  ${chalk.green('✓')} ${name.padEnd(20)} v${entry.version}  (unmodified)`);
    }
  }

  // Check processes
  const processNames = Object.keys(manifest.processes);
  console.log(chalk.cyan(`\nProcesses (${processNames.length}):`));

  for (const [name, entry] of Object.entries(manifest.processes)) {
    const processPath = path.join(projectRoot, 'processes', `${name}.json`);

    if (!await fileExists(processPath)) {
      console.log(`  ${chalk.red('✗')} ${name.padEnd(20)} - MISSING`);
      continue;
    }

    const currentChecksum = await calculateChecksum(processPath);
    const modified = currentChecksum !== entry.checksum;

    if (modified) {
      console.log(`  ${chalk.yellow('⚠')} ${name.padEnd(20)} v${entry.version}  ${chalk.yellow('(LOCAL CHANGES)')}`);
    } else {
      console.log(`  ${chalk.green('✓')} ${name.padEnd(20)} v${entry.version}`);
    }
  }

  // Check config files
  console.log(chalk.cyan('\nConfiguration:'));

  const mcpExists = await fileExists(path.join(projectRoot, '.mcp.json'));
  console.log(`  ${mcpExists ? chalk.green('✓') : chalk.red('✗')} .mcp.json`);

  const claudeExists = await fileExists(path.join(projectRoot, 'CLAUDE.md'));
  console.log(`  ${claudeExists ? chalk.green('✓') : chalk.red('✗')} CLAUDE.md`);

  const pccExists = await dirExists(path.join(projectRoot, '.pcc'));
  console.log(`  ${pccExists ? chalk.green('✓') : chalk.red('✗')} .pcc/`);

  console.log('');
}
