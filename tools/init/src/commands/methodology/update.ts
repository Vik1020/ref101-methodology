/**
 * Update command
 * Update installed components from methodology source
 */

import path from 'path';
import chalk from 'chalk';
import { readManifest, writeManifest, calculateDirChecksum, calculateChecksum } from '../../lib/manifest.js';
import { copyDir, dirExists, fileExists } from '../../lib/copier.js';
import fs from 'fs/promises';

interface UpdateOptions {
  force?: boolean;
}

export async function updateCommand(
  id: string | undefined,
  directory: string | undefined,
  options: UpdateOptions
): Promise<void> {
  const projectRoot = directory ? path.resolve(directory) : process.cwd();
  const manifest = await readManifest(projectRoot);

  if (!manifest) {
    console.log(chalk.red('No .installed.yaml found. Run ref101-init first.'));
    process.exit(1);
  }

  if (!manifest.methodology_path) {
    console.log(chalk.red('No methodology_path in manifest.'));
    console.log(chalk.yellow('Cannot check for updates without source path.'));
    process.exit(1);
  }

  const methodologyPath = manifest.methodology_path;
  let updated = 0;
  let skipped = 0;
  let upToDate = 0;

  // Update skills
  const skillsToUpdate = id
    ? (manifest.skills[id] ? [id] : [])
    : Object.keys(manifest.skills || {});

  for (const skillId of skillsToUpdate) {
    const entry = manifest.skills[skillId];
    if (!entry) continue;

    const sourcePath = path.join(methodologyPath, entry.source_path);
    const destPath = path.join(projectRoot, '.claude', 'skills', skillId);

    if (!await dirExists(sourcePath)) {
      console.log(chalk.yellow(`⚠ ${skillId}: source not found, skipping`));
      skipped++;
      continue;
    }

    // Calculate checksums
    const sourceChecksum = await calculateDirChecksum(sourcePath);
    const currentChecksum = await calculateDirChecksum(destPath);

    // No update available
    if (sourceChecksum === entry.checksum) {
      upToDate++;
      continue;
    }

    // Local modifications
    if (currentChecksum !== entry.checksum && !options.force) {
      console.log(chalk.yellow(`⚠ ${skillId}: locally modified, skipping (use --force)`));
      skipped++;
      continue;
    }

    // Perform update
    await copyDir(sourcePath, destPath);

    // Update manifest
    manifest.skills[skillId].checksum = sourceChecksum;
    manifest.skills[skillId].modified = false;

    console.log(chalk.green(`✓ Updated ${skillId}`));
    updated++;
  }

  // Update processes if specific id requested and it's a process
  if (id && !manifest.skills[id] && manifest.processes[id]) {
    const entry = manifest.processes[id];
    const sourcePath = path.join(methodologyPath, 'namespaces', manifest.methodology, 'processes', id + '.json');
    const destPath = path.join(projectRoot, 'processes', id + '.json');

    if (!await fileExists(sourcePath)) {
      console.log(chalk.yellow(`⚠ ${id}: source not found`));
      skipped++;
    } else {
      const sourceChecksum = await calculateChecksum(sourcePath);
      const currentChecksum = await calculateChecksum(destPath);

      if (sourceChecksum === entry.checksum) {
        upToDate++;
      } else if (currentChecksum !== entry.checksum && !options.force) {
        console.log(chalk.yellow(`⚠ ${id}: locally modified, skipping (use --force)`));
        skipped++;
      } else {
        await fs.copyFile(sourcePath, destPath);
        manifest.processes[id].checksum = sourceChecksum;
        console.log(chalk.green(`✓ Updated ${id}`));
        updated++;
      }
    }
  }

  // Save manifest
  await writeManifest(projectRoot, manifest);

  // Summary
  console.log(chalk.blue(`\nUpdated: ${updated}, Skipped: ${skipped}, Up-to-date: ${upToDate}`));
}
