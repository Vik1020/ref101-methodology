/**
 * Remove command
 * Remove installed skills or processes
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { readManifest, writeManifest, getManifestPath } from '../../lib/manifest.js';
import { dirExists, fileExists } from '../../lib/copier.js';

interface RemoveOptions {
  all?: boolean;
}

export async function removeCommand(
  id: string | undefined,
  options: RemoveOptions
): Promise<void> {
  const projectRoot = process.cwd();
  const manifest = await readManifest(projectRoot);

  if (!manifest) {
    console.log(chalk.red('No .installed.yaml found.'));
    process.exit(1);
  }

  if (options.all) {
    await removeAll(projectRoot, manifest);
    return;
  }

  if (!id) {
    console.log(chalk.red('Error: Please specify component id or use --all'));
    process.exit(1);
  }

  // Check if it's a skill
  if (manifest.skills[id]) {
    await removeSkill(projectRoot, manifest, id);
    return;
  }

  // Check if it's a process
  if (manifest.processes[id]) {
    await removeProcess(projectRoot, manifest, id);
    return;
  }

  console.log(chalk.red(`Not found: ${id}`));
  console.log(chalk.yellow('Use "methodology status" to see installed components.'));
  process.exit(1);
}

async function removeSkill(
  projectRoot: string,
  manifest: any,
  skillId: string
): Promise<void> {
  const skillPath = path.join(projectRoot, '.claude', 'skills', skillId);

  // Remove directory
  if (await dirExists(skillPath)) {
    await fs.rm(skillPath, { recursive: true, force: true });
  }

  // Update manifest
  delete manifest.skills[skillId];
  await writeManifest(projectRoot, manifest);

  console.log(chalk.green(`✓ Removed ${skillId}`));
}

async function removeProcess(
  projectRoot: string,
  manifest: any,
  processId: string
): Promise<void> {
  const processPath = path.join(projectRoot, 'processes', processId + '.json');

  // Remove file
  if (await fileExists(processPath)) {
    await fs.rm(processPath);
  }

  // Update manifest
  delete manifest.processes[processId];
  await writeManifest(projectRoot, manifest);

  console.log(chalk.green(`✓ Removed ${processId}`));
}

async function removeAll(
  projectRoot: string,
  manifest: any
): Promise<void> {
  let removed = 0;

  // Remove all skills
  for (const skillId of Object.keys(manifest.skills || {})) {
    const skillPath = path.join(projectRoot, '.claude', 'skills', skillId);
    if (await dirExists(skillPath)) {
      await fs.rm(skillPath, { recursive: true, force: true });
    }
    delete manifest.skills[skillId];
    removed++;
    console.log(chalk.green(`✓ Removed skill: ${skillId}`));
  }

  // Remove all processes
  for (const processId of Object.keys(manifest.processes || {})) {
    const processPath = path.join(projectRoot, 'processes', processId + '.json');
    if (await fileExists(processPath)) {
      await fs.rm(processPath);
    }
    delete manifest.processes[processId];
    removed++;
    console.log(chalk.green(`✓ Removed process: ${processId}`));
  }

  await writeManifest(projectRoot, manifest);

  console.log(chalk.blue(`\nRemoved ${removed} components`));

  // Cleanup when all components removed
  if (Object.keys(manifest.skills || {}).length === 0 &&
      Object.keys(manifest.processes || {}).length === 0) {

    // Remove .mcp.json
    const mcpPath = path.join(projectRoot, '.mcp.json');
    if (await fileExists(mcpPath)) {
      await fs.rm(mcpPath);
      console.log(chalk.green('✓ Removed .mcp.json'));
    }

    // Update CLAUDE.md - remove methodology section between markers
    const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');
    if (await fileExists(claudeMdPath)) {
      let content = await fs.readFile(claudeMdPath, 'utf-8');
      const beginMarker = '<!-- ref101:begin -->';
      const endMarker = '<!-- ref101:end -->';

      if (content.includes(beginMarker) && content.includes(endMarker)) {
        // Remove the section including markers and surrounding whitespace
        const regex = /\n*<!-- ref101:begin -->[\s\S]*?<!-- ref101:end -->\n*/;
        content = content.replace(regex, '\n');
        content = content.trimEnd() + '\n';
        await fs.writeFile(claudeMdPath, content, 'utf-8');
        console.log(chalk.green('✓ Removed methodology section from CLAUDE.md'));
      }
    }

    // Remove .installed.yaml for complete de-initialization
    const manifestPath = getManifestPath(projectRoot);
    if (await fileExists(manifestPath)) {
      await fs.rm(manifestPath);
      console.log(chalk.green('✓ Removed .installed.yaml'));
    }
  }
}
