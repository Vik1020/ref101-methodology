/**
 * migrate command
 * Migrate from symlinks to copy-on-init approach
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { copyDir, copyFile, dirExists, fileExists } from '../lib/copier.js';
import {
  readManifest,
  writeManifest,
  createEmptyManifest,
  calculateDirChecksum,
  calculateChecksum,
  type Manifest,
} from '../lib/manifest.js';

interface MigrateOptions {
  dryRun?: boolean;
}

interface SymlinkInfo {
  path: string;
  target: string;
  type: 'skill' | 'process';
  name: string;
}

export async function migrateCommand(options: MigrateOptions): Promise<void> {
  const projectRoot = process.cwd();
  console.log(chalk.blue('ref101 Migration Tool\n'));

  const dryRun = options.dryRun === true;

  if (dryRun) {
    console.log(chalk.yellow('DRY RUN - no changes will be made\n'));
  }

  // Detect symlinks
  const skillsDir = path.join(projectRoot, '.claude', 'skills');
  const processesDir = path.join(projectRoot, 'processes');

  const symlinks: SymlinkInfo[] = [];

  // Scan skills directory
  if (await dirExists(skillsDir)) {
    const skillSymlinks = await detectSymlinks(skillsDir, 'skill');
    symlinks.push(...skillSymlinks);
  }

  // Scan processes directory
  if (await dirExists(processesDir)) {
    const processSymlinks = await detectSymlinks(processesDir, 'process');
    symlinks.push(...processSymlinks);
  }

  if (symlinks.length === 0) {
    console.log(chalk.green('No symlinks found. Project is already using copy-on-init.'));
    return;
  }

  // Display found symlinks
  console.log(`Found ${chalk.cyan(symlinks.length)} symlink(s):\n`);

  const skills = symlinks.filter(s => s.type === 'skill');
  const processes = symlinks.filter(s => s.type === 'process');

  if (skills.length > 0) {
    console.log(chalk.cyan('Skills:'));
    for (const s of skills) {
      console.log(`  ${s.name} → ${s.target}`);
    }
  }

  if (processes.length > 0) {
    console.log(chalk.cyan('\nProcesses:'));
    for (const s of processes) {
      console.log(`  ${s.name} → ${s.target}`);
    }
  }

  if (dryRun) {
    console.log(chalk.yellow('\nPreview complete. Run without --preview to migrate.'));
    return;
  }

  // Perform migration
  console.log(chalk.blue('\nMigrating...\n'));

  // Read or create manifest
  let manifest = await readManifest(projectRoot);
  if (!manifest) {
    manifest = createEmptyManifest('sccu', 'standard', '1.0.0');
    // Try to detect methodology path from symlink targets
    const firstSkill = skills[0];
    if (firstSkill) {
      const methodologyPath = detectMethodologyPath(firstSkill.target);
      if (methodologyPath) {
        manifest.methodology_path = methodologyPath;
      }
    }
  }

  let migrated = 0;
  let failed = 0;

  for (const symlink of symlinks) {
    try {
      await migrateSymlink(symlink, manifest);
      console.log(`  ${chalk.green('✓')} ${symlink.name}`);
      migrated++;
    } catch (error) {
      console.log(`  ${chalk.red('✗')} ${symlink.name}: ${error}`);
      failed++;
    }
  }

  // Save manifest
  await writeManifest(projectRoot, manifest);

  console.log(`\n${chalk.green(migrated)} migrated, ${chalk.red(failed)} failed`);
  console.log(chalk.green('\nMigration complete! manifest.yaml updated.'));
}

async function detectSymlinks(dir: string, type: 'skill' | 'process'): Promise<SymlinkInfo[]> {
  const results: SymlinkInfo[] = [];

  try {
    const entries = await fs.readdir(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = await fs.lstat(fullPath);

      if (stat.isSymbolicLink()) {
        const target = await fs.readlink(fullPath);
        const resolvedTarget = path.resolve(dir, target);

        results.push({
          path: fullPath,
          target: resolvedTarget,
          type,
          name: type === 'process' ? entry.replace('.json', '') : entry,
        });
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return results;
}

async function migrateSymlink(symlink: SymlinkInfo, manifest: Manifest): Promise<void> {
  // Verify target exists
  const targetExists = symlink.type === 'skill'
    ? await dirExists(symlink.target)
    : await fileExists(symlink.target);

  if (!targetExists) {
    throw new Error(`Target not found: ${symlink.target}`);
  }

  // Remove symlink
  await fs.unlink(symlink.path);

  // Copy content
  if (symlink.type === 'skill') {
    await copyDir(symlink.target, symlink.path);
    const checksum = await calculateDirChecksum(symlink.path);

    manifest.skills[symlink.name] = {
      version: '1.0.0',
      checksum,
      modified: false,
      source_path: symlink.target,
    };
  } else {
    await copyFile(symlink.target, symlink.path);
    const checksum = await calculateChecksum(symlink.path);

    manifest.processes[symlink.name] = {
      version: '1.0.0',
      checksum,
    };
  }
}

function detectMethodologyPath(symlinkTarget: string): string | undefined {
  // Try to find ref101-methodology or ref101-specs in path
  const parts = symlinkTarget.split(path.sep);

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === 'ref101-methodology' || parts[i] === 'ref101-specs') {
      return parts.slice(0, i + 1).join(path.sep);
    }
  }

  return undefined;
}
