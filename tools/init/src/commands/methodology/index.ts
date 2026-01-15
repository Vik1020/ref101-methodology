/**
 * Methodology command group
 * Manage methodology components (skills, processes)
 *
 * @version 1.0.0
 */

import { Command } from 'commander';
import { installCommand } from './install.js';
import { removeCommand } from './remove.js';
import { updateCommand } from './update.js';
import { statusCommand } from './status.js';
import { listCommand } from './list.js';

export function createMethodologyCommand(): Command {
  const cmd = new Command('methodology')
    .description('Manage methodology components (skills, processes)');

  cmd
    .command('install <path>')
    .description('Install skill or process from source (e.g., sccu/skills/hotfix)')
    .option('--all', 'Install all from namespace path')
    .action(installCommand);

  cmd
    .command('remove [id]')
    .description('Remove installed skill or process')
    .option('--all', 'Remove all installed components')
    .action(removeCommand);

  cmd
    .command('update [id]')
    .description('Update installed components from source')
    .option('--force', 'Force update even if locally modified')
    .action(updateCommand);

  cmd
    .command('status')
    .description('Show installed methodology status')
    .action(statusCommand);

  cmd
    .command('list')
    .description('List available components from source')
    .option('-n, --namespace <name>', 'Namespace to list', 'sccu')
    .action(listCommand);

  return cmd;
}
