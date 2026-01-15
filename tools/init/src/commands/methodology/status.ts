/**
 * Status command
 * Show installed methodology status
 */

import path from 'path';
import chalk from 'chalk';
import { readManifest, calculateDirChecksum, calculateChecksum } from '../../lib/manifest.js';
import { dirExists, fileExists } from '../../lib/copier.js';

export async function statusCommand(): Promise<void> {
  const projectRoot = process.cwd();
  const manifest = await readManifest(projectRoot);

  if (!manifest) {
    console.log(chalk.red('No .installed.yaml found.'));
    console.log(chalk.yellow('Run ref101-init to initialize methodology.'));
    process.exit(1);
  }

  console.log(chalk.bold('\nMethodology Status'));
  console.log(chalk.dim('─'.repeat(40)));

  // Basic info
  console.log(`Namespace:  ${chalk.cyan(manifest.methodology)}`);
  console.log(`Bundle:     ${chalk.cyan(manifest.bundle)}`);
  console.log(`Version:    ${chalk.cyan(manifest.methodology_version || 'unknown')}`);
  console.log(`Initialized: ${chalk.dim(manifest.initialized_at || 'unknown')}`);

  if (manifest.methodology_path) {
    console.log(`Source:     ${chalk.dim(manifest.methodology_path)}`);
  }

  // Skills
  const skills = Object.entries(manifest.skills || {});
  console.log(chalk.bold(`\nSkills (${skills.length}):`));

  if (skills.length === 0) {
    console.log(chalk.dim('  (none installed)'));
  } else {
    for (const [name, entry] of skills) {
      const skillEntry = entry as any;
      const skillPath = path.join(projectRoot, '.claude', 'skills', name);

      // Check if still exists
      const exists = await dirExists(skillPath);
      if (!exists) {
        console.log(`  ${chalk.red('✗')} ${name} ${chalk.red('(missing)')}`);
        continue;
      }

      // Check for modifications
      let modified = skillEntry.modified;
      if (!modified) {
        try {
          const currentChecksum = await calculateDirChecksum(skillPath);
          modified = currentChecksum !== skillEntry.checksum;
        } catch {
          modified = true;
        }
      }

      const marker = modified ? chalk.yellow('~') : chalk.green('✓');
      const modifiedText = modified ? chalk.yellow(' [modified]') : '';
      const version = chalk.dim(`(${skillEntry.version})`);

      console.log(`  ${marker} ${name} ${version}${modifiedText}`);
    }
  }

  // Processes
  const processes = Object.entries(manifest.processes || {});
  console.log(chalk.bold(`\nProcesses (${processes.length}):`));

  if (processes.length === 0) {
    console.log(chalk.dim('  (none installed)'));
  } else {
    for (const [name, entry] of processes) {
      const procEntry = entry as any;
      const procPath = path.join(projectRoot, 'processes', name + '.json');

      // Check if still exists
      const exists = await fileExists(procPath);
      if (!exists) {
        console.log(`  ${chalk.red('✗')} ${name} ${chalk.red('(missing)')}`);
        continue;
      }

      // Check for modifications
      let modified = false;
      try {
        const currentChecksum = await calculateChecksum(procPath);
        modified = currentChecksum !== procEntry.checksum;
      } catch {
        modified = true;
      }

      const marker = modified ? chalk.yellow('~') : chalk.green('✓');
      const modifiedText = modified ? chalk.yellow(' [modified]') : '';
      const version = chalk.dim(`(${procEntry.version})`);

      console.log(`  ${marker} ${name} ${version}${modifiedText}`);
    }
  }

  console.log('');
}
