/**
 * Install command
 * Install skills or processes from methodology source
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { readManifest, writeManifest, calculateDirChecksum, calculateChecksum } from '../../lib/manifest.js';
import { copyDir, dirExists, ensureDir } from '../../lib/copier.js';

interface InstallOptions {
  all?: boolean;
}

export async function installCommand(
  componentPath: string,
  options: InstallOptions
): Promise<void> {
  const projectRoot = process.cwd();
  const manifest = await readManifest(projectRoot);

  if (!manifest) {
    console.log(chalk.red('No manifest.yaml found. Run ref101-init first.'));
    process.exit(1);
  }

  if (!manifest.methodology_path) {
    console.log(chalk.red('No methodology_path in manifest.'));
    console.log(chalk.yellow('Run: ref101-init --methodology-path <path>'));
    process.exit(1);
  }

  const methodologyPath = manifest.methodology_path;

  if (options.all) {
    // Install all from namespace/type path (e.g., sccu/skills)
    await installAll(projectRoot, manifest, methodologyPath, componentPath);
  } else {
    // Install specific: sccu/skills/hotfix
    await installSingle(projectRoot, manifest, methodologyPath, componentPath);
  }
}

async function installSingle(
  projectRoot: string,
  manifest: any,
  methodologyPath: string,
  componentPath: string
): Promise<void> {
  // Parse path: sccu/skills/hotfix or sccu/processes/node_creation
  const parts = componentPath.split('/');
  if (parts.length !== 3) {
    console.log(chalk.red(`Invalid path: ${componentPath}`));
    console.log(chalk.yellow('Expected format: namespace/type/id (e.g., sccu/skills/hotfix)'));
    process.exit(1);
  }

  const [namespace, type, id] = parts;

  if (type !== 'skills' && type !== 'processes') {
    console.log(chalk.red(`Invalid type: ${type}. Must be 'skills' or 'processes'`));
    process.exit(1);
  }

  const sourcePath = path.join(methodologyPath, 'namespaces', namespace, type, id);

  if (!await dirExists(sourcePath)) {
    // Try as file for processes (JSON)
    const sourceFile = sourcePath + '.json';
    try {
      await fs.access(sourceFile);
      await installProcess(projectRoot, manifest, sourceFile, id);
      return;
    } catch {
      console.log(chalk.red(`Not found: ${sourcePath}`));
      process.exit(1);
    }
  }

  if (type === 'skills') {
    await installSkill(projectRoot, manifest, sourcePath, id, namespace);
  } else {
    await installProcess(projectRoot, manifest, sourcePath, id);
  }
}

async function installSkill(
  projectRoot: string,
  manifest: any,
  sourcePath: string,
  skillId: string,
  namespace: string
): Promise<void> {
  const destPath = path.join(projectRoot, '.claude', 'skills', skillId);

  // Check if already installed
  if (manifest.skills[skillId]) {
    console.log(chalk.yellow(`Already installed: ${skillId}. Use 'methodology update' to update.`));
    return;
  }

  // Ensure destination directory exists
  await ensureDir(path.join(projectRoot, '.claude', 'skills'));

  // Copy skill directory
  await copyDir(sourcePath, destPath);

  // Calculate checksum
  const checksum = await calculateDirChecksum(destPath);

  // Update manifest
  manifest.skills[skillId] = {
    version: manifest.methodology_version || 'unknown',
    checksum,
    modified: false,
    source_path: `namespaces/${namespace}/skills/${skillId}`,
  };

  await writeManifest(projectRoot, manifest);

  console.log(chalk.green(`✓ Installed ${skillId} (${manifest.methodology_version || 'unknown'})`));
}

async function installProcess(
  projectRoot: string,
  manifest: any,
  sourcePath: string,
  processId: string
): Promise<void> {
  const destPath = path.join(projectRoot, 'processes', processId + '.json');

  // Check if already installed
  if (manifest.processes[processId]) {
    console.log(chalk.yellow(`Already installed: ${processId}. Use 'methodology update' to update.`));
    return;
  }

  // Ensure destination directory exists
  await ensureDir(path.join(projectRoot, 'processes'));

  // Copy process file
  const isDir = (await fs.stat(sourcePath)).isDirectory();
  if (isDir) {
    // Process is a directory, copy index.json or first .json
    const files = await fs.readdir(sourcePath);
    const jsonFile = files.find(f => f.endsWith('.json'));
    if (jsonFile) {
      await fs.copyFile(path.join(sourcePath, jsonFile), destPath);
    }
  } else {
    // Process is a file
    await fs.copyFile(sourcePath, destPath);
  }

  // Calculate checksum
  const checksum = await calculateChecksum(destPath);

  // Update manifest
  manifest.processes[processId] = {
    version: manifest.methodology_version || 'unknown',
    checksum,
  };

  await writeManifest(projectRoot, manifest);

  console.log(chalk.green(`✓ Installed ${processId} (${manifest.methodology_version || 'unknown'})`));
}

async function installAll(
  projectRoot: string,
  manifest: any,
  methodologyPath: string,
  nsTypePath: string
): Promise<void> {
  // Parse: sccu/skills or sccu/processes
  const parts = nsTypePath.split('/');
  if (parts.length !== 2) {
    console.log(chalk.red(`Invalid path: ${nsTypePath}`));
    console.log(chalk.yellow('Expected format: namespace/type (e.g., sccu/skills)'));
    process.exit(1);
  }

  const [namespace, type] = parts;
  const sourcePath = path.join(methodologyPath, 'namespaces', namespace, type);

  if (!await dirExists(sourcePath)) {
    console.log(chalk.red(`Not found: ${sourcePath}`));
    process.exit(1);
  }

  const entries = await fs.readdir(sourcePath, { withFileTypes: true });
  let installed = 0;
  let skipped = 0;

  for (const entry of entries) {
    const id = entry.name.replace('.json', '');
    const fullPath = nsTypePath + '/' + id;

    try {
      await installSingle(projectRoot, manifest, methodologyPath, fullPath);
      installed++;
    } catch (e) {
      skipped++;
    }

    // Reload manifest after each install
    const updatedManifest = await readManifest(projectRoot);
    if (updatedManifest) {
      Object.assign(manifest, updatedManifest);
    }
  }

  console.log(chalk.blue(`\nInstalled: ${installed}, Skipped: ${skipped}`));
}
