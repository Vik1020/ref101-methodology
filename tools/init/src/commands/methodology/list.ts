/**
 * List command
 * List available components from methodology source
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { readManifest } from '../../lib/manifest.js';
import { dirExists } from '../../lib/copier.js';

interface ListOptions {
  namespace?: string;
}

export async function listCommand(options: ListOptions): Promise<void> {
  const projectRoot = process.cwd();
  const manifest = await readManifest(projectRoot);
  const namespace = options.namespace || 'sccu';

  if (!manifest) {
    console.log(chalk.red('No .installed.yaml found. Run ref101-init first.'));
    process.exit(1);
  }

  if (!manifest.methodology_path) {
    console.log(chalk.red('No methodology_path in manifest.'));
    console.log(chalk.yellow('Run: ref101-init --methodology-path <path>'));
    process.exit(1);
  }

  const methodologyPath = manifest.methodology_path;
  const nsPath = path.join(methodologyPath, 'namespaces', namespace);

  if (!await dirExists(nsPath)) {
    console.log(chalk.red(`Namespace not found: ${namespace}`));
    console.log(chalk.yellow(`Path: ${nsPath}`));
    process.exit(1);
  }

  console.log(chalk.bold(`\nMethodology: ${namespace}`));
  console.log(chalk.dim(`Source: ${methodologyPath}`));
  console.log(chalk.dim(`Version: ${manifest.methodology_version || 'unknown'}`));

  // List skills
  const skillsPath = path.join(nsPath, 'skills');
  console.log(chalk.bold('\nSkills:'));

  try {
    const skills = await fs.readdir(skillsPath, { withFileTypes: true });
    const skillDirs = skills.filter(s => s.isDirectory());

    if (skillDirs.length === 0) {
      console.log(chalk.dim('  (none)'));
    } else {
      for (const skill of skillDirs) {
        const installed = manifest.skills?.[skill.name];
        const marker = installed ? chalk.green('✓') : chalk.gray('○');
        const version = installed ? chalk.dim(` (${installed.version})`) : '';
        const modified = installed?.modified ? chalk.yellow(' [modified]') : '';
        console.log(`  ${marker} ${skill.name}${version}${modified}`);
      }
    }
  } catch {
    console.log(chalk.dim('  (no skills directory)'));
  }

  // List processes
  const processesPath = path.join(nsPath, 'processes');
  console.log(chalk.bold('\nProcesses:'));

  try {
    const processes = await fs.readdir(processesPath);
    const jsonFiles = processes.filter(p => p.endsWith('.json'));

    if (jsonFiles.length === 0) {
      console.log(chalk.dim('  (none)'));
    } else {
      for (const proc of jsonFiles) {
        const procId = proc.replace('.json', '');
        const installed = manifest.processes?.[procId];
        const marker = installed ? chalk.green('✓') : chalk.gray('○');
        const version = installed ? chalk.dim(` (${installed.version})`) : '';
        console.log(`  ${marker} ${procId}${version}`);
      }
    }
  } catch {
    console.log(chalk.dim('  (no processes directory)'));
  }

  // Summary
  const installedSkills = Object.keys(manifest.skills || {}).length;
  const installedProcesses = Object.keys(manifest.processes || {}).length;
  console.log(chalk.dim(`\nInstalled: ${installedSkills} skills, ${installedProcesses} processes`));
}
