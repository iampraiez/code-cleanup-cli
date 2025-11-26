import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import { cleanup } from './index.js';
import { loadConfig, validateConfig, type CleanupConfig } from './config.js';
import { 
  listCheckpoints, 
  restoreCheckpoint, 
  deleteCheckpoint,
  getCheckpointDetails 
} from './checkpoint/manager.js';
import { 
  logSuccess, 
  logError, 
  logWarning, 
  logInfo,
  createSummary
} from './utils.js';

export const program = new Command();

program
  .name('cleanup')
  .description('Remove comments, console statements, and emojis from your codebase')
  .version('1.0.0');

/**
 * CLI options interface
 */
interface CleanOptions {
  path: string;
  comments?: boolean;
  console?: string;
  consoleExclude?: string;
  emojis?: boolean;
  all?: boolean;
  dryRun?: boolean;
  checkpoint?: boolean;
  yes?: boolean;
}

interface ListOptions {
  path: string;
}

interface DeleteOptions {
  path: string;
}

/**
 * Main cleanup command
 */
program
  .command('clean')
  .description('Clean your codebase')
  .option('-p, --path <path>', 'Path to directory', process.cwd())
  .option('-c, --comments', 'Remove comments')
  .option('--console <type>', 'Remove console statements (all, none, or comma-separated methods)')
  .option('--console-exclude <methods>', 'Console methods to exclude (comma-separated)')
  .option('-e, --emojis', 'Remove emojis')
  .option('-a, --all', 'Remove everything (comments, console, emojis)')
  .option('--dry-run', 'Preview changes without modifying files')
  .option('--no-checkpoint', 'Skip creating checkpoint')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(async (options: CleanOptions) => {
    try {
      await runCleanup(options);
    } catch (error) {
      logError(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

/**
 * Restore command
 */
program
  .command('restore [checkpointId]')
  .description('Restore from a checkpoint')
  .action(async (checkpointId?: string) => {
    try {
      await runRestore(checkpointId);
    } catch (error) {
      logError(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

/**
 * List checkpoints command
 */
program
  .command('list')
  .description('List all checkpoints')
  .option('-p, --path <path>', 'Path to directory', process.cwd())
  .action(async (options: ListOptions) => {
    try {
      await runList(options.path);
    } catch (error) {
      logError(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

/**
 * Delete checkpoint command
 */
program
  .command('delete <checkpointId>')
  .description('Delete a checkpoint')
  .option('-p, --path <path>', 'Path to directory', process.cwd())
  .action(async (checkpointId: string, options: DeleteOptions) => {
    try {
      await runDelete(checkpointId, options.path);
    } catch (error) {
      logError(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

/**
 * Run cleanup
 */
async function runCleanup(options: CleanOptions): Promise<void> {
  const targetPath = path.resolve(options.path);

  // Build config from options
  const cliConfig: Partial<CleanupConfig> = {};

  if (options.all) {
    cliConfig.comments = true;
    cliConfig.console = { remove: 'all', exclude: [] };
    cliConfig.emojis = true;
  } else {
    if (options.comments) {
      cliConfig.comments = true;
    }

    if (options.console) {
      const consoleType = options.console;
      if (consoleType === 'all' || consoleType === 'none') {
        cliConfig.console = { remove: consoleType as 'all' | 'none', exclude: [] };
      } else {
        cliConfig.console = { remove: consoleType.split(',').map(m => m.trim()), exclude: [] };
      }

      if (options.consoleExclude) {
        cliConfig.console!.exclude = options.consoleExclude.split(',').map(m => m.trim());
      }
    }

    if (options.emojis) {
      cliConfig.emojis = true;
    }
  }

  if (options.dryRun) {
    cliConfig.dryRun = true;
  }

  if (options.checkpoint === false) {
    cliConfig.checkpoint = { enabled: false, retention: 10 };
  }

  // Load config
  const config = await loadConfig(targetPath, cliConfig);

  // Validate config
  const validation = validateConfig(config);
  if (!validation.valid) {
    logError('Configuration errors:');
    validation.errors.forEach(err => console.log(`  - ${err}`));
    process.exit(1);
  }

  // Interactive mode if no options specified
  if (!options.yes && !options.comments && !options.console && !options.emojis && !options.all) {
    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'features',
        message: 'What would you like to remove?',
        choices: [
          { name: 'Comments', value: 'comments' },
          { name: 'Console statements', value: 'console' },
          { name: 'Emojis', value: 'emojis' }
        ]
      },
      {
        type: 'list',
        name: 'consoleType',
        message: 'Which console statements?',
        choices: ['all', 'log only', 'log and debug', 'none'],
        when: (answers: any) => answers.features.includes('console')
      },
      {
        type: 'confirm',
        name: 'createCheckpoint',
        message: 'Create checkpoint before proceeding?',
        default: true
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Proceed with cleanup?',
        default: false
      }
    ]);

    if (!answers.confirm) {
      logWarning('Cleanup cancelled');
      return;
    }

    // Update config from answers
    config.comments = answers.features.includes('comments');
    config.emojis = answers.features.includes('emojis');
    
    if (answers.features.includes('console')) {
      if (answers.consoleType === 'all') {
        config.console.remove = 'all';
      } else if (answers.consoleType === 'log only') {
        config.console.remove = ['log'];
      } else if (answers.consoleType === 'log and debug') {
        config.console.remove = ['log', 'debug'];
      } else {
        config.console.remove = 'none';
      }
    }

    config.checkpoint.enabled = answers.createCheckpoint;
  }

  // Show what will be done
  console.log(chalk.bold('\n🧹 Cleanup Configuration:'));
  console.log(`  Directory: ${chalk.cyan(targetPath)}`);
  console.log(`  Remove comments: ${config.comments ? chalk.green('Yes') : chalk.red('No')}`);
  console.log(`  Remove console: ${config.console.remove !== 'none' ? chalk.green(JSON.stringify(config.console.remove)) : chalk.red('No')}`);
  console.log(`  Remove emojis: ${config.emojis ? chalk.green('Yes') : chalk.red('No')}`);
  console.log(`  Dry run: ${config.dryRun ? chalk.yellow('Yes') : 'No'}`);
  console.log(`  Checkpoint: ${config.checkpoint.enabled ? chalk.green('Yes') : chalk.red('No')}`);

  // Confirm if not --yes
  if (!options.yes && !config.dryRun) {
    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Proceed with these settings?',
        default: false
      }
    ]);

    if (!proceed) {
      logWarning('Cleanup cancelled');
      return;
    }
  }

  // Run cleanup
  const spinner = ora('Processing files...').start();

  const results = await cleanup(targetPath, config, (progress) => {
    spinner.text = `Processing ${progress.current}/${progress.total}: ${path.basename(progress.file)}`;
  });

  spinner.stop();

  // Show results
  if (config.dryRun) {
    logInfo('Dry run completed - no files were modified');
  } else {
    logSuccess('Cleanup completed!');
  }

  console.log(createSummary(results));

  if (results.checkpointId) {
    logInfo(`Checkpoint created: ${chalk.cyan(results.checkpointId)}`);
    logInfo(`Restore with: ${chalk.cyan(`cleanup restore ${results.checkpointId}`)}`);
  }
}

/**
 * Run restore
 */
async function runRestore(checkpointId?: string): Promise<void> {
  const targetPath = process.cwd();

  if (!checkpointId) {
    // Show list and let user choose
    const checkpoints = await listCheckpoints(targetPath);

    if (checkpoints.length === 0) {
      logWarning('No checkpoints found');
      return;
    }

    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: 'Select checkpoint to restore:',
        choices: checkpoints.map(cp => ({
          name: `${cp.id} - ${cp.date} (${cp.filesCount} files)`,
          value: cp.id
        }))
      }
    ]);

    checkpointId = selected;
  }

  // Confirm restore
  const details = await getCheckpointDetails(targetPath, checkpointId!);
  
  if (!details) {
    logError(`Checkpoint ${checkpointId} not found`);
    return;
  }

  console.log(chalk.bold('\n📦 Checkpoint Details:'));
  console.log(`  ID: ${chalk.cyan(details.id)}`);
  console.log(`  Date: ${chalk.cyan(details.date)}`);
  console.log(`  Files: ${chalk.cyan(details.filesCount)}`);

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: chalk.yellow('This will overwrite current files. Continue?'),
      default: false
    }
  ]);

  if (!confirm) {
    logWarning('Restore cancelled');
    return;
  }

  const spinner = ora('Restoring files...').start();
  const result = await restoreCheckpoint(targetPath, checkpointId!);
  spinner.stop();

  logSuccess(`Restored ${result.filesRestored} files from checkpoint`);
}

/**
 * Run list checkpoints
 */
async function runList(targetPath: string): Promise<void> {
  const checkpoints = await listCheckpoints(targetPath);

  if (checkpoints.length === 0) {
    logWarning('No checkpoints found');
    return;
  }

  console.log(chalk.bold('\n📦 Available Checkpoints:\n'));

  checkpoints.forEach((cp, index) => {
    console.log(`${chalk.cyan(`${index + 1}.`)} ${chalk.bold(cp.id)}`);
    console.log(`   Date: ${cp.date}`);
    console.log(`   Files: ${cp.filesCount}`);
    console.log(`   Options: Comments=${cp.options.comments}, Console=${JSON.stringify(cp.options.console.remove)}, Emojis=${cp.options.emojis}`);
    console.log();
  });
}

/**
 * Run delete checkpoint
 */
async function runDelete(checkpointId: string, targetPath: string): Promise<void> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Delete checkpoint ${checkpointId}?`,
      default: false
    }
  ]);

  if (!confirm) {
    logWarning('Delete cancelled');
    return;
  }

  await deleteCheckpoint(targetPath, checkpointId);
  logSuccess(`Checkpoint ${checkpointId} deleted`);
}
