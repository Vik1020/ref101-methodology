#!/usr/bin/env node

import { Command } from 'commander';
import { extractCommand } from './commands/extract.js';
import { validateCommand } from './commands/validate.js';
import { visualizeCommand } from './commands/visualize.js';

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

program.parse();
