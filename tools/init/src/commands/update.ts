/**
 * update command
 * Update skills and processes from methodology source
 */

import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';
import chalk from 'chalk';
import { copyDir, copyFile, dirExists, fileExists } from '../lib/copier.js';
import {
  readManifest,
  calculateDirChecksum,
  calculateChecksum,
  updateSkillInManifest,
  updateProcessInManifest,
} from '../lib/manifest.js';

interface UpdateOptions {
  check?: boolean;
  skill?: string;
  process?: string;
  all?: boolean;
  skipModified?: boolean;
  force?: boolean;
}

interface UpdateInfo {
  name: string;
  type: 'skill' | 'process';
  installedChecksum: string;
  currentChecksum: string;
  sourceChecksum: string;
  hasLocalChanges: boolean;
  hasUpdate: boolean;
  sourcePath: string;
  destPath: string;
}

export async function updateCommand(directory: string | undefined, options: UpdateOptions): Promise<void> {
  const projectRoot = directory ? path.resolve(directory) : process.cwd();
  const manifest = await readManifest(projectRoot);

  if (!manifest) {
    console.log(chalk.yellow('No .installed.yaml found.'));
    console.log('Run `ref101-init` to initialize the project first.');
    return;
  }

  const methodologyPath = manifest.methodology_path;
  if (!methodologyPath || !await dirExists(methodologyPath)) {
    console.error(chalk.red('Error: Methodology path not found.'));
    console.error(`Path in manifest: ${methodologyPath}`);
    console.error('Please update .installed.yaml with correct methodology_path');
    return;
  }

  // Collect update info for all components
  const updates: UpdateInfo[] = [];

  // Check skills
  const skillsSource = path.join(methodologyPath, 'namespaces', manifest.methodology, 'skills');
  const skillsDest = path.join(projectRoot, '.claude', 'skills');

  for (const [name, entry] of Object.entries(manifest.skills)) {
    const srcDir = path.join(skillsSource, name);
    const destDir = path.join(skillsDest, name);

    if (!await dirExists(srcDir)) continue;
    if (!await dirExists(destDir)) continue;

    const currentChecksum = await calculateDirChecksum(destDir);
    const sourceChecksum = await calculateDirChecksum(srcDir);

    updates.push({
      name,
      type: 'skill',
      installedChecksum: entry.checksum,
      currentChecksum,
      sourceChecksum,
      hasLocalChanges: currentChecksum !== entry.checksum,
      hasUpdate: sourceChecksum !== entry.checksum,
      sourcePath: srcDir,
      destPath: destDir,
    });
  }

  // Check processes
  const processesSource = path.join(methodologyPath, 'namespaces', manifest.methodology, 'processes');
  const processesDest = path.join(projectRoot, 'processes');

  for (const [name, entry] of Object.entries(manifest.processes)) {
    const srcFile = path.join(processesSource, `${name}.json`);
    const destFile = path.join(processesDest, `${name}.json`);

    if (!await fileExists(srcFile)) continue;
    if (!await fileExists(destFile)) continue;

    const currentChecksum = await calculateChecksum(destFile);
    const sourceChecksum = await calculateChecksum(srcFile);

    updates.push({
      name,
      type: 'process',
      installedChecksum: entry.checksum,
      currentChecksum,
      sourceChecksum,
      hasLocalChanges: currentChecksum !== entry.checksum,
      hasUpdate: sourceChecksum !== entry.checksum,
      sourcePath: srcFile,
      destPath: destFile,
    });
  }

  // Handle different modes
  if (options.check || (!options.skill && !options.process && !options.all)) {
    displayUpdateStatus(updates, manifest, methodologyPath);
    return;
  }

  if (options.skill) {
    await updateSingleSkill(options.skill, updates, projectRoot, options.force);
    return;
  }

  if (options.process) {
    await updateSingleProcess(options.process, updates, projectRoot, options.force);
    return;
  }

  if (options.all) {
    await updateAll(updates, projectRoot, options.skipModified, options.force);
    return;
  }
}

function displayUpdateStatus(updates: UpdateInfo[], manifest: any, methodologyPath: string): void {
  console.log(chalk.blue('ref101 Update Check\n'));
  console.log(`Methodology: ${chalk.cyan(manifest.methodology)}`);
  console.log(`Bundle: ${chalk.cyan(manifest.bundle)}`);
  console.log(`Methodology path: ${methodologyPath}\n`);

  const skills = updates.filter(u => u.type === 'skill');
  const processes = updates.filter(u => u.type === 'process');

  console.log(chalk.cyan(`Skills (${skills.length}):`));
  for (const u of skills) {
    displayComponent(u);
  }

  console.log(chalk.cyan(`\nProcesses (${processes.length}):`));
  for (const u of processes) {
    displayComponent(u);
  }

  const updatesAvailable = updates.filter(u => u.hasUpdate && !u.hasLocalChanges).length;
  const withLocalChanges = updates.filter(u => u.hasLocalChanges).length;

  console.log('');
  if (updatesAvailable > 0) {
    console.log(`${chalk.green(updatesAvailable)} update(s) available`);
    console.log(`Run: ${chalk.cyan('ref101-init update --all')} to update`);
  }
  if (withLocalChanges > 0) {
    console.log(`${chalk.yellow(withLocalChanges)} component(s) with local changes`);
  }
  if (updatesAvailable === 0 && withLocalChanges === 0) {
    console.log(chalk.green('Everything is up to date!'));
  }
}

function displayComponent(u: UpdateInfo): void {
  const name = u.name.padEnd(20);

  if (u.hasUpdate && u.hasLocalChanges) {
    console.log(`  ${chalk.yellow('⚠')} ${name} ${chalk.yellow('(LOCAL CHANGES, update available)')}`);
  } else if (u.hasUpdate) {
    console.log(`  ${chalk.blue('↑')} ${name} ${chalk.blue('(update available)')}`);
  } else if (u.hasLocalChanges) {
    console.log(`  ${chalk.yellow('⚠')} ${name} ${chalk.yellow('(LOCAL CHANGES)')}`);
  } else {
    console.log(`  ${chalk.green('✓')} ${name} (up to date)`);
  }
}

async function updateSingleSkill(
  name: string,
  updates: UpdateInfo[],
  projectRoot: string,
  force?: boolean
): Promise<void> {
  const update = updates.find(u => u.type === 'skill' && u.name === name);

  if (!update) {
    console.error(chalk.red(`Skill '${name}' not found in manifest`));
    return;
  }

  if (update.hasLocalChanges && !force) {
    console.error(chalk.yellow(`Skill '${name}' has local changes.`));
    console.error('Use --force to overwrite local changes.');
    return;
  }

  if (!update.hasUpdate && !force) {
    console.log(chalk.green(`Skill '${name}' is already up to date.`));
    return;
  }

  console.log(`Updating ${chalk.cyan(name)}...`);

  // Remove and re-copy
  await fs.rm(update.destPath, { recursive: true, force: true });
  await copyDir(update.sourcePath, update.destPath);

  const newChecksum = await calculateDirChecksum(update.destPath);
  await updateSkillInManifest(projectRoot, name, newChecksum, '1.1.0');

  console.log(chalk.green(`✓ ${name} updated`));
}

async function updateSingleProcess(
  name: string,
  updates: UpdateInfo[],
  projectRoot: string,
  force?: boolean
): Promise<void> {
  const update = updates.find(u => u.type === 'process' && u.name === name);

  if (!update) {
    console.error(chalk.red(`Process '${name}' not found in manifest`));
    return;
  }

  if (update.hasLocalChanges && !force) {
    console.error(chalk.yellow(`Process '${name}' has local changes.`));
    console.error('Use --force to overwrite local changes.');
    return;
  }

  if (!update.hasUpdate && !force) {
    console.log(chalk.green(`Process '${name}' is already up to date.`));
    return;
  }

  console.log(`Updating ${chalk.cyan(name)}...`);

  await copyFile(update.sourcePath, update.destPath);

  const newChecksum = await calculateChecksum(update.destPath);
  await updateProcessInManifest(projectRoot, name, newChecksum, '1.1.0');

  console.log(chalk.green(`✓ ${name} updated`));
}

async function updateAll(
  updates: UpdateInfo[],
  projectRoot: string,
  skipModified?: boolean,
  force?: boolean
): Promise<void> {
  console.log(chalk.blue('Updating all components...\n'));

  let updated = 0;
  let skipped = 0;

  for (const update of updates) {
    if (update.hasLocalChanges && skipModified && !force) {
      console.log(`  ${chalk.yellow('⚠')} ${update.name} (skipped - local changes)`);
      skipped++;
      continue;
    }

    if (update.hasLocalChanges && !force) {
      console.log(`  ${chalk.yellow('⚠')} ${update.name} (skipped - local changes)`);
      skipped++;
      continue;
    }

    if (!update.hasUpdate && !force) {
      continue;
    }

    if (update.type === 'skill') {
      await fs.rm(update.destPath, { recursive: true, force: true });
      await copyDir(update.sourcePath, update.destPath);
      const newChecksum = await calculateDirChecksum(update.destPath);
      await updateSkillInManifest(projectRoot, update.name, newChecksum, '1.1.0');
    } else {
      await copyFile(update.sourcePath, update.destPath);
      const newChecksum = await calculateChecksum(update.destPath);
      await updateProcessInManifest(projectRoot, update.name, newChecksum, '1.1.0');
    }

    console.log(`  ${chalk.green('✓')} ${update.name} updated`);
    updated++;
  }

  console.log(`\nUpdated ${chalk.green(updated)} component(s)`);
  if (skipped > 0) {
    console.log(`Skipped ${chalk.yellow(skipped)} component(s) with local changes`);
  }
}
