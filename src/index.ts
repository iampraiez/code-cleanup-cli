import { getFiles, readFile, writeFile } from './file-handler.js';
import { removeComments } from './processors/comment-remover.js';
import { removeConsoleStatements } from './processors/console-remover.js';
import { removeEmojis } from './processors/emoji-remover.js';
import { createCheckpoint, cleanCheckpoints } from './checkpoint/manager.js';
import type { CleanupConfig } from './config.js';
import type { CleanupStats } from './utils.js';
import * as prettier from 'prettier';

/**
 * File processing result
 */
export interface FileProcessingResult {
  filePath: string;
  modified: boolean;
  originalSize: number;
  newSize: number;
  sizeReduced: number;
  content: string;
  stats: {
    commentsRemoved: number;
    consoleStatementsRemoved: number;
    emojisRemoved: number;
    prettierFormatted: boolean; // Added prettierFormatted to stats
  };
  error?: string;
}

/**
 * Cleanup result
 */
export interface CleanupResult extends CleanupStats {
  checkpointId: string | null;
  files: FileProcessingResult[];
}

/**
 * Progress callback
 */
export interface ProgressInfo {
  current: number;
  total: number;
  file: string;
}

/**
 * Process a single file
 */
export async function processFile(
  filePath: string,
  config: CleanupConfig
): Promise<FileProcessingResult> {
  const originalContent = await readFile(filePath);
  const originalSize = Buffer.byteLength(originalContent, 'utf-8');
  
  let content = originalContent;
  let modified = false; // Track if content was modified by any processor
  const stats = {
    commentsRemoved: 0,
    consoleStatementsRemoved: 0,
    emojisRemoved: 0,
    prettierFormatted: false // Initialize prettierFormatted stat
  };

  // Remove comments
  if (config.comments) {
    const result = removeComments(content, {
      preserveJSDoc: config.preserveJSDoc || false,
      preserveLicense: config.preserveLicense !== false
    });
    if (result.count > 0) {
      content = result.code;
      stats.commentsRemoved = result.count;
      modified = true;
    }
  }

  // Remove console statements
  if (config.console && config.console.remove !== 'none') {
    const result = removeConsoleStatements(content, {
      remove: config.console.remove,
      exclude: config.console.exclude || []
    });
    if (result.count > 0) {
      content = result.code;
      stats.consoleStatementsRemoved = result.count;
      modified = true;
    }
  }

  // Remove emojis
  if (config.emojis) {
    const result = removeEmojis(content);
    if (result.count > 0) {
      content = result.code;
      stats.emojisRemoved = result.count;
      modified = true;
    }
  }

  // Apply Prettier formatting if enabled and content was modified
  // or if Prettier is explicitly enabled and the file type is supported.
  if (config.prettier && modified) { // Only format if content was modified by other processors
    try {
      // Resolve prettier config for the file
      const prettierConfig = await prettier.resolveConfig(filePath) || {};
      
      const formattedContent = await prettier.format(content, {
        ...prettierConfig,
        filepath: filePath, // Important for Prettier to infer parser
      });

      if (formattedContent !== content) {
        content = formattedContent;
        stats.prettierFormatted = true;
      }
    } catch (err) {
      // Log a warning but continue with the unformatted code
      console.warn(`Warning: Prettier formatting failed for ${filePath}: ${(err as Error).message}`);
    }
  }

  const newSize = Buffer.byteLength(content, 'utf-8');
  const finalModified = content !== originalContent; // Check against original content after all changes

  return {
    filePath,
    modified: finalModified,
    originalSize,
    newSize,
    sizeReduced: originalSize - newSize,
    content,
    stats
  };
}

/**
 * Process multiple files
 */
export async function processFiles(
  directory: string,
  config: CleanupConfig,
  onProgress: ((progress: ProgressInfo) => void) | null = null
): Promise<CleanupResult> {
  const files = await getFiles(directory, config.fileTypes, config.ignore);
  
  const results: CleanupResult = {
    filesProcessed: 0,
    filesModified: 0,
    commentsRemoved: 0,
    consoleStatementsRemoved: 0,
    emojisRemoved: 0,
    sizeReduced: 0,
    prettierFormatted: 0,
    checkpointId: null,
    files: []
  };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: files.length,
        file
      });
    }

    try {
      const result = await processFile(file, config);
      
      results.filesProcessed++;
      
      if (result.modified) {
        results.filesModified++;
        results.commentsRemoved += result.stats.commentsRemoved;
        results.consoleStatementsRemoved += result.stats.consoleStatementsRemoved;
        results.emojisRemoved += result.stats.emojisRemoved;
        results.sizeReduced += result.sizeReduced;
        if (result.stats.prettierFormatted) {
          results.prettierFormatted = (results.prettierFormatted || 0) + 1;
        }
        
        if (!config.dryRun) {
          await writeFile(file, result.content);
        }
      }
      
      results.files.push(result);
    } catch (error) {
      console.error(`Error processing ${file}:`, (error as Error).message);
      results.files.push({
        filePath: file,
        modified: false,
        originalSize: 0,
        newSize: 0,
        sizeReduced: 0,
        content: '',
        stats: {
          commentsRemoved: 0,
          consoleStatementsRemoved: 0,
          emojisRemoved: 0,
          prettierFormatted: false
        },
        error: (error as Error).message
      });
    }
  }

  return results;
}

/**
 * Main cleanup function
 */
export async function cleanup(
  directory: string,
  config: CleanupConfig,
  onProgress: ((progress: ProgressInfo) => void) | null = null
): Promise<CleanupResult> {
  let checkpointId: string | null = null;

  // Create checkpoint if enabled
  if (config.checkpoint && config.checkpoint.enabled && !config.dryRun) {
    const files = await getFiles(directory, config.fileTypes, config.ignore);
    checkpointId = await createCheckpoint(directory, files, config);
    
    // Clean old checkpoints
    if (config.checkpoint.retention) {
      await cleanCheckpoints(directory, config.checkpoint.retention);
    }
  }

  // Process files
  const results = await processFiles(directory, config, onProgress);
  
  results.checkpointId = checkpointId;

  return results;
}
