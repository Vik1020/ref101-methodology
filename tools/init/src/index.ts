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
import { updateCommand } from './commands/update.js';
import { migrateCommand } from './commands/migrate.js';
import { createMethodologyCommand } from './commands/methodology/index.js';

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

// Update subcommand
program
  .command('update')
  .description('Update skills and processes from methodology source')
  .option('--check', 'Check for available updates (default)')
  .option('--skill <name>', 'Update specific skill')
  .option('--process <name>', 'Update specific process')
  .option('--all', 'Update all components')
  .option('--skip-modified', 'Skip components with local changes')
  .option('--force', 'Force update even with local changes')
  .action(updateCommand);

// Migrate subcommand
program
  .command('migrate')
  .description('Migrate from symlinks to copy-on-init approach')
  .option('--preview', 'Show what would be migrated without making changes')
  .action((options) => migrateCommand({ dryRun: options.preview }));

// Methodology subcommand group
program.addCommand(createMethodologyCommand());

program.parse();
