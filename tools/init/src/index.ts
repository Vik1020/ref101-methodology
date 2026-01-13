#!/usr/bin/env node
/**
 * ref101-init CLI
 * Initialize projects with ref101 methodology
 *
 * @version 1.0.0
 */

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { statusCommand } from './commands/status.js';

const program = new Command();

program
  .name('ref101-init')
  .description('Initialize project with ref101 methodology')
  .version('1.0.0');

// Default command (init)
program
  .argument('[directory]', 'Target directory', '.')
  .option('-m, --methodology <name>', 'Methodology namespace', 'sccu')
  .option('-b, --bundle <name>', 'Bundle to use', 'standard')
  .option('--pcc-path <path>', 'Path to ref101-pcc (relative or absolute)')
  .option('--methodology-path <path>', 'Path to ref101-methodology')
  .option('--dry-run', 'Show what would be created without writing')
  .action(initCommand);

// Status subcommand
program
  .command('status')
  .description('Show current methodology status')
  .action(statusCommand);

program.parse();
