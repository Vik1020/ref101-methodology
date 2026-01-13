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
        source_path: path.relative(projectRoot, srcDir),
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
  const pccPath = options.pccPath || '../ref101-pcc';
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

  // Create CLAUDE.md
  const claudeMd = `# Project Instructions

> **First:** Read \`methodology/ref101-methodology/core/SYSTEM_PROMPT.md\`

## Methodology: ${options.methodology}
## Bundle: ${options.bundle}

### Available Skills

${bundle.includes.skills.map(s => `- /${s}`).join('\n')}

### Processes

${bundle.includes.processes.map(p => `- ${p}`).join('\n')}
`;

  if (!options.dryRun) {
    await fs.writeFile(path.join(projectRoot, 'CLAUDE.md'), claudeMd, 'utf-8');
  }
  console.log(`  ${chalk.green('✓')} CLAUDE.md`);

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
  console.log(`  ${chalk.green('✓')} manifest.yaml`);

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
