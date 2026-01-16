#!/usr/bin/env node

import { Command } from 'commander';
import { extractCommand } from './commands/extract.js';
import { validateCommand } from './commands/validate.js';
import { visualizeCommand } from './commands/visualize.js';
import { extractDefaultsCommand } from './commands/extract-defaults.js';
import { generateCommand } from './commands/generate.js';
import { syncCheckCommand } from './commands/sync-check.js';

const program = new Command();

program
  .name('ref101-meta')
  .description('Meta-methodology tools for ref101-methodology')
  .version('1.0.0');

program
  .command('extract <namespace>')
  .description('Extract methodology.yaml from namespace definition')
  .option('-o, --output <path>', 'Output file path')
  .option('--dry-run', 'Show extracted data without writing')
  .action(extractCommand);

program
  .command('validate <namespace>')
  .description('Validate namespace against meta-methodology schema')
  .option('--strict', 'Treat warnings as errors')
  .action(validateCommand);

program
  .command('visualize <namespace>')
  .description('Generate diagrams from methodology')
  .option('-f, --format <format>', 'Output format: mermaid, plantuml (default: mermaid)', 'mermaid')
  .option('-t, --type <type>', 'Diagram type: state, actors, artifacts (default: state)', 'state')
  .option('-o, --output <path>', 'Output file path (default: stdout)')
  .action(visualizeCommand);

// SSOT commands (P3)
program
  .command('extract-defaults <namespace>')
  .description('Extract phase_defaults from existing processes/*.json for SSOT migration')
  .option('-f, --format <format>', 'Output format: yaml, json (default: yaml)', 'yaml')
  .action(extractDefaultsCommand);

program
  .command('generate <namespace>')
  .description('Generate processes/*.json from methodology.yaml (SSOT)')
  .option('-o, --output <dir>', 'Output directory for generated files')
  .option('--dry-run', 'Show what would be generated without writing files')
  .option('--force', 'Overwrite manually modified files')
  .action(generateCommand);

program
  .command('sync-check <namespace>')
  .description('Check synchronization between methodology.yaml and processes/*.json')
  .option('-v, --verbose', 'Show detailed diff for each mismatch')
  .action(syncCheckCommand);

program.parse();
