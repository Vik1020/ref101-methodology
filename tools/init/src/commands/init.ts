/**
 * init command
 * Initialize project with ref101 methodology
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import chalk from 'chalk';
import { copyDir, copyFile, ensureDir, fileExists, dirExists } from '../lib/copier.js';
import { createEmptyManifest, writeManifest, calculateDirChecksum, calculateChecksum, type Manifest } from '../lib/manifest.js';
import { loadMethodology, validateMethodology, validateProcessSync, type MethodologyInfo } from '../lib/methodology-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BundleDefinition {
  bundle_id: string;
  methodology: string;
  version: string;
  description: string;
  includes: {
    skills: string[];
    processes: string[];
    templates?: {
      phases?: string[];
      domains?: string[];
    };
  };
}

interface InitOptions {
  methodology: string;
  bundle: string;
  pccPath?: string;
  methodologyPath?: string;
  dryRun?: boolean;
}

export async function initCommand(directory: string, options: InitOptions): Promise<void> {
  const projectRoot = path.resolve(directory);

  console.log(chalk.blue('ref101-init') + ' Initializing project...\n');
  console.log(`  Directory: ${projectRoot}`);
  console.log(`  Methodology: ${options.methodology}`);
  console.log(`  Bundle: ${options.bundle}`);

  // Find methodology path
  const methodologyPath = await findMethodologyPath(options.methodologyPath);
  if (!methodologyPath) {
    console.error(chalk.red('Error: Could not find ref101-methodology'));
    console.error('Please specify --methodology-path or ensure ref101-methodology is in a standard location');
    process.exit(1);
  }
  console.log(`  Methodology path: ${methodologyPath}`);

  // Read bundle definition
  const bundlePath = path.join(
    methodologyPath,
    'namespaces',
    options.methodology,
    'bundles',
    `${options.bundle}.yaml`
  );

  if (!await fileExists(bundlePath)) {
    console.error(chalk.red(`Error: Bundle not found: ${bundlePath}`));
    process.exit(1);
  }

  const bundleContent = await fs.readFile(bundlePath, 'utf-8');
  const bundle: BundleDefinition = YAML.parse(bundleContent);

  console.log(`  Bundle: ${bundle.bundle_id} (${bundle.description})\n`);

  if (options.dryRun) {
    console.log(chalk.yellow('Dry run mode - no files will be created\n'));
  }

  // Validate methodology.yaml if exists
  console.log(chalk.cyan('Methodology validation:'));
  const methodology = await loadMethodology(methodologyPath, options.methodology);

  if (methodology) {
    const validation = validateMethodology(methodology);

    if (validation.errors.length > 0) {
      console.log(`  ${chalk.red('✗')} methodology.yaml has errors:`);
      for (const err of validation.errors) {
        console.log(`    ${chalk.red('•')} ${err}`);
      }
      console.log(chalk.red('\nFix methodology.yaml errors before initializing.'));
      process.exit(1);
    }

    if (validation.warnings.length > 0) {
      console.log(`  ${chalk.yellow('⚠')} methodology.yaml has warnings:`);
      for (const warn of validation.warnings) {
        console.log(`    ${chalk.yellow('•')} ${warn}`);
      }
    }

    // Check process sync
    const syncResult = await validateProcessSync(methodologyPath, options.methodology, methodology);
    if (!syncResult.synced) {
      console.log(`  ${chalk.yellow('⚠')} Process sync issues:`);
      for (const issue of syncResult.issues) {
        console.log(`    ${chalk.yellow('•')} ${issue}`);
      }
    }

    if (validation.errors.length === 0 && validation.warnings.length === 0 && syncResult.synced) {
      console.log(`  ${chalk.green('✓')} methodology.yaml is valid`);
    }
  } else {
    console.log(`  ${chalk.dim('○')} No methodology.yaml found (optional)`);
  }

  // Create manifest
  const manifest = createEmptyManifest(options.methodology, options.bundle, bundle.version);
  manifest.methodology_path = methodologyPath;
  if (options.pccPath) {
    manifest.pcc_path = options.pccPath;
  }

  // Copy skills
  console.log(chalk.cyan('Skills:'));
  const skillsSource = path.join(methodologyPath, 'namespaces', options.methodology, 'skills');
  const skillsDest = path.join(projectRoot, '.claude', 'skills');

  for (const skill of bundle.includes.skills) {
    const srcDir = path.join(skillsSource, skill);
    const destDir = path.join(skillsDest, skill);

    if (!await dirExists(srcDir)) {
      console.log(`  ${chalk.yellow('⚠')} ${skill} - source not found`);
      continue;
    }

    if (!options.dryRun) {
      await copyDir(srcDir, destDir);
      const checksum = await calculateDirChecksum(destDir);
      manifest.skills[skill] = {
        version: bundle.version,
        checksum,
        modified: false,
        source_path: `namespaces/${options.methodology}/skills/${skill}`,
      };
    }
    console.log(`  ${chalk.green('✓')} ${skill}`);
  }

  // Copy processes
  console.log(chalk.cyan('\nProcesses:'));
  const processesSource = path.join(methodologyPath, 'namespaces', options.methodology, 'processes');
  const processesDest = path.join(projectRoot, 'processes');

  for (const proc of bundle.includes.processes) {
    const srcFile = path.join(processesSource, `${proc}.json`);
    const destFile = path.join(processesDest, `${proc}.json`);

    if (!await fileExists(srcFile)) {
      console.log(`  ${chalk.yellow('⚠')} ${proc} - source not found`);
      continue;
    }

    if (!options.dryRun) {
      await ensureDir(processesDest);
      await copyFile(srcFile, destFile);
      const checksum = await calculateChecksum(destFile);
      manifest.processes[proc] = {
        version: bundle.version,
        checksum,
      };
    }
    console.log(`  ${chalk.green('✓')} ${proc}`);
  }

  // Create .mcp.json
  console.log(chalk.cyan('\nConfiguration:'));
  const pccPath = options.pccPath || '../ref101-orchestrator';
  const mcpConfig = {
    mcpServers: {
      pcc: {
        command: 'node',
        args: [`${pccPath}/packages/mcp/dist/server.js`],
        env: {
          PROJECT_ROOT: projectRoot,
        },
      },
    },
  };

  if (!options.dryRun) {
    await fs.writeFile(
      path.join(projectRoot, '.mcp.json'),
      JSON.stringify(mcpConfig, null, 2),
      'utf-8'
    );
  }
  console.log(`  ${chalk.green('✓')} .mcp.json`);

  // Update CLAUDE.md with methodology section
  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');
  const methodologySection = generateMethodologySection(options.methodology, options.bundle, bundle, methodology);

  if (!options.dryRun) {
    if (await fileExists(claudeMdPath)) {
      // File exists - update or append section
      let content = await fs.readFile(claudeMdPath, 'utf-8');
      const beginMarker = '<!-- ref101:begin -->';
      const endMarker = '<!-- ref101:end -->';

      if (content.includes(beginMarker) && content.includes(endMarker)) {
        // Replace existing section
        const regex = /<!-- ref101:begin -->[\s\S]*?<!-- ref101:end -->/;
        content = content.replace(regex, methodologySection);
      } else {
        // Append section at the end
        content = content.trimEnd() + '\n\n' + methodologySection + '\n';
      }
      await fs.writeFile(claudeMdPath, content, 'utf-8');
      console.log(`  ${chalk.green('✓')} CLAUDE.md (updated methodology section)`);
    } else {
      // Create new file with full content
      const claudeMd = `# Project Instructions

> **First:** Read \`methodology/ref101-methodology/core/SYSTEM_PROMPT.md\`

${methodologySection}
`;
      await fs.writeFile(claudeMdPath, claudeMd, 'utf-8');
      console.log(`  ${chalk.green('✓')} CLAUDE.md (created)`);
    }
  } else {
    console.log(`  ${chalk.green('✓')} CLAUDE.md`);
  }

  // Create directories
  if (!options.dryRun) {
    await ensureDir(path.join(projectRoot, '.pcc', 'releases'));
    await ensureDir(path.join(projectRoot, 'docs', 'releases'));
    await ensureDir(path.join(projectRoot, 'docs', 'domains'));
  }
  console.log(`  ${chalk.green('✓')} .pcc/releases/`);
  console.log(`  ${chalk.green('✓')} docs/releases/`);
  console.log(`  ${chalk.green('✓')} docs/domains/`);

  // Write manifest
  if (!options.dryRun) {
    await writeManifest(projectRoot, manifest);
  }
  console.log(`  ${chalk.green('✓')} .installed.yaml`);

  console.log(chalk.green('\n✅ Project initialized successfully!\n'));
  console.log('Next steps:');
  console.log(`  1. Add methodology as submodule: git submodule add <url> methodology/ref101-methodology`);
  console.log(`  2. Update .mcp.json paths if needed`);
  console.log(`  3. Run: npx ref101-init status`);
}

async function findMethodologyPath(explicitPath?: string): Promise<string | null> {
  if (explicitPath) {
    if (await dirExists(explicitPath)) {
      return path.resolve(explicitPath);
    }
    return null;
  }

  // Try common locations
  const candidates = [
    path.resolve(__dirname, '..', '..', '..', '..'), // Inside tools/init
    path.resolve('methodology/ref101-methodology'),
    path.resolve('../ref101-methodology'),
    path.resolve('../../ref101-methodology'),
  ];

  for (const candidate of candidates) {
    const manifestPath = path.join(candidate, 'manifest.yaml');
    if (await fileExists(manifestPath)) {
      return candidate;
    }
  }

  return null;
}

function generateMethodologySection(
  namespace: string,
  bundleName: string,
  bundle: BundleDefinition,
  methodology: MethodologyInfo | null
): string {
  const lines: string[] = [
    '<!-- ref101:begin -->',
    `## Installed Methodology: ${namespace.toUpperCase()}`,
    `Bundle: ${bundleName}`,
    '',
  ];

  // If methodology.yaml exists, add rich info
  if (methodology) {
    lines.push(`**${methodology.name}** v${methodology.version}`);
    if (methodology.meta_version) {
      lines.push(`Meta-methodology: v${methodology.meta_version}`);
    }
    lines.push('');

    // Workflow states
    if (methodology.states && methodology.states.length > 0) {
      const statesByType: Record<string, string[]> = {};
      for (const state of methodology.states) {
        if (!statesByType[state.type]) statesByType[state.type] = [];
        statesByType[state.type].push(state.id);
      }

      lines.push('### Workflow States');
      lines.push('');
      for (const [type, ids] of Object.entries(statesByType)) {
        lines.push(`- **${type}**: ${ids.join(', ')}`);
      }
      lines.push('');
    }

    // Processes with descriptions
    if (methodology.processes && methodology.processes.length > 0) {
      lines.push('### Processes');
      lines.push('');
      for (const proc of methodology.processes) {
        lines.push(`- **${proc.id}** (${proc.states_sequence.length} phases)`);
        if (proc.description) {
          // Truncate long descriptions
          const desc = proc.description.length > 100
            ? proc.description.slice(0, 100) + '...'
            : proc.description;
          lines.push(`  - ${desc}`);
        }
      }
      lines.push('');
    }
  }

  // Skills (always from bundle)
  lines.push('### Available Skills');
  lines.push('');
  for (const skill of bundle.includes.skills) {
    lines.push(`- /${skill}`);
  }

  // If no methodology, add basic processes list
  if (!methodology) {
    lines.push('');
    lines.push('### Processes');
    lines.push('');
    for (const proc of bundle.includes.processes) {
      lines.push(`- ${proc}`);
    }
  }

  lines.push('<!-- ref101:end -->');

  return lines.join('\n');
}
