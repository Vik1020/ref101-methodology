/**
 * Status command
 * Show installed methodology status
 */

import path from 'path';
import fs from 'fs/promises';
import chalk from 'chalk';
import YAML from 'yaml';
import { readManifest, calculateDirChecksum, calculateChecksum } from '../../lib/manifest.js';
import { dirExists, fileExists } from '../../lib/copier.js';

interface MethodologyInfo {
  methodology_id: string;
  version: string;
  name: string;
  meta_version?: string;
  states?: Array<{ id: string; type: string; name: string }>;
  actors?: Array<{ id: string; type: string; name: string }>;
  processes?: Array<{ id: string; description?: string; states_sequence: string[] }>;
}

export async function statusCommand(directory?: string): Promise<void> {
  const projectRoot = directory ? path.resolve(directory) : process.cwd();
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

  // Try to load methodology.yaml for meta-methodology info
  const methodologyInfo = await loadMethodologyInfo(projectRoot, manifest.methodology, manifest.methodology_path);
  if (methodologyInfo) {
    displayMethodologyInfo(methodologyInfo);
  }

  console.log('');
}

async function loadMethodologyInfo(
  projectRoot: string,
  namespace: string,
  methodologyPath?: string
): Promise<MethodologyInfo | null> {
  // Try different locations for methodology.yaml
  const possiblePaths = [
    // Local project methodology
    path.join(projectRoot, 'methodology.yaml'),
    // In source methodology path
    methodologyPath ? path.join(methodologyPath, 'namespaces', namespace, 'methodology.yaml') : null,
    methodologyPath ? path.join(methodologyPath, 'meta', 'generated', `${namespace}.methodology.yaml`) : null,
  ].filter((p): p is string => p !== null);

  for (const methodologyFile of possiblePaths) {
    try {
      const content = await fs.readFile(methodologyFile, 'utf-8');
      return YAML.parse(content) as MethodologyInfo;
    } catch {
      // Try next path
    }
  }

  return null;
}

function displayMethodologyInfo(info: MethodologyInfo): void {
  console.log(chalk.bold('\nMeta-methodology Info:'));
  console.log(chalk.dim('─'.repeat(40)));

  console.log(`Name:        ${chalk.cyan(info.name)}`);
  console.log(`Version:     ${chalk.cyan(info.version)}`);
  if (info.meta_version) {
    console.log(`Meta-version: ${chalk.dim(info.meta_version)}`);
  }

  // States summary
  if (info.states && info.states.length > 0) {
    const byType: Record<string, string[]> = {};
    for (const state of info.states) {
      if (!byType[state.type]) byType[state.type] = [];
      byType[state.type].push(state.id);
    }

    console.log(chalk.bold(`\nStates (${info.states.length}):`));
    for (const [type, ids] of Object.entries(byType)) {
      const color = type === 'Initial' ? chalk.green :
                    type === 'Terminal' ? chalk.blue :
                    type === 'Error' ? chalk.red :
                    type === 'Waiting' ? chalk.yellow :
                    chalk.white;
      console.log(`  ${color(type)}: ${ids.join(', ')}`);
    }
  }

  // Actors summary
  if (info.actors && info.actors.length > 0) {
    console.log(chalk.bold(`\nActors (${info.actors.length}):`));
    for (const actor of info.actors) {
      const color = actor.type === 'Human' ? chalk.yellow :
                    actor.type === 'AI' ? chalk.cyan :
                    chalk.white;
      console.log(`  ${color(actor.type)}: ${actor.name}`);
    }
  }

  // Processes summary
  if (info.processes && info.processes.length > 0) {
    console.log(chalk.bold(`\nWorkflow Processes (${info.processes.length}):`));
    for (const proc of info.processes) {
      const statesCount = proc.states_sequence?.length || 0;
      console.log(`  ${chalk.cyan(proc.id)}: ${statesCount} states`);
      if (proc.description) {
        console.log(`    ${chalk.dim(proc.description)}`);
      }
    }
  }
}
