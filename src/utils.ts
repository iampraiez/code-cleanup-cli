import chalk from 'chalk';

/**
 * Format file size in human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format timestamp
 */
export function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Generate checkpoint ID
 */
export function generateCheckpointId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `checkpoint-${timestamp}-${random}`;
}

/**
 * Log success message
 */
export function logSuccess(message: string): void {
  console.log(chalk.green('✓'), message);
}

/**
 * Log error message
 */
export function logError(message: string): void {
  console.log(chalk.red('✗'), message);
}

/**
 * Log warning message
 */
export function logWarning(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

/**
 * Log info message
 */
export function logInfo(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

/**
 * Statistics object
 */
export interface CleanupStats {
  filesProcessed: number;
  filesModified: number;
  commentsRemoved: number;
  consoleStatementsRemoved: number;
  emojisRemoved: number;
  sizeReduced: number;
  prettierFormatted?: number; // Count of files formatted
}

/**
 * Create a summary of changes
 */
export function createSummary(stats: CleanupStats): string {
  const lines: string[] = [];
  lines.push(chalk.bold('\n📊 Summary:'));
  lines.push(`  Files processed: ${chalk.cyan(stats.filesProcessed)}`);
  lines.push(`  Files modified: ${chalk.cyan(stats.filesModified)}`);
  
  if (stats.commentsRemoved > 0) {
    lines.push(`  Comments removed: ${chalk.yellow(stats.commentsRemoved)}`);
  }
  
  if (stats.consoleStatementsRemoved > 0) {
    lines.push(`  Console statements removed: ${chalk.yellow(stats.consoleStatementsRemoved)}`);
  }
  
  if (stats.emojisRemoved > 0) {
    lines.push(`  Emojis removed: ${chalk.yellow(stats.emojisRemoved)}`);
  }
  
  if (stats.sizeReduced > 0) {
    lines.push(`  Size reduced: ${chalk.green(formatBytes(stats.sizeReduced))}`);
  }

  if (stats.prettierFormatted) {
    lines.push(`  Files formatted (Prettier): ${chalk.magenta(stats.prettierFormatted)}`);
  }
  
  return lines.join('\n');
}

/**
 * Pluralize word based on count
 */
export function pluralize(count: number, singular: string, plural: string | null = null): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}
