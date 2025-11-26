import path from 'path';
import fs from 'fs-extra';
import { 
  getCheckpointPath, 
  addCheckpointMetadata, 
  getCheckpointMetadata,
  loadCheckpointMetadata,
  removeCheckpointMetadata,
  cleanOldCheckpoints,
  generateCheckpointId,
  type CheckpointMetadata
} from './storage.js';
import { ensureDir, copyFile, pathExists } from '../file-handler.js';
import { formatDate } from '../utils.js';
import type { CleanupConfig } from '../config.js';

/**
 * Restore result interface
 */
export interface RestoreResult {
  success: boolean;
  filesRestored: number;
  totalFiles: number;
}

/**
 * Create a checkpoint
 */
export async function createCheckpoint(
  projectRoot: string,
  files: string[],
  options: Partial<CleanupConfig> = {}
): Promise<string> {
  const checkpointId = generateCheckpointId();
  const checkpointPath = getCheckpointPath(projectRoot, checkpointId);

  await ensureDir(checkpointPath);

  // Copy files to checkpoint directory
  const backedUpFiles: string[] = [];
  for (const file of files) {
    const relativePath = path.relative(projectRoot, file);
    const backupPath = path.join(checkpointPath, relativePath);
    
    await ensureDir(path.dirname(backupPath));
    await copyFile(file, backupPath);
    backedUpFiles.push(relativePath);
  }

  // Create checkpoint metadata
  const metadata: CheckpointMetadata = {
    id: checkpointId,
    timestamp: Date.now(),
    date: formatDate(new Date()),
    filesCount: files.length,
    files: backedUpFiles,
    options: {
      comments: options.comments || false,
      console: options.console || { remove: 'none' },
      emojis: options.emojis || false
    }
  };

  await addCheckpointMetadata(projectRoot, metadata);

  return checkpointId;
}

/**
 * Restore from a checkpoint
 */
export async function restoreCheckpoint(
  projectRoot: string,
  checkpointId: string
): Promise<RestoreResult> {
  const metadata = await getCheckpointMetadata(projectRoot, checkpointId);
  
  if (!metadata) {
    throw new Error(`Checkpoint ${checkpointId} not found`);
  }

  const checkpointPath = getCheckpointPath(projectRoot, checkpointId);
  
  if (!await pathExists(checkpointPath)) {
    throw new Error(`Checkpoint directory not found: ${checkpointPath}`);
  }

  let filesRestored = 0;

  // Restore files
  for (const relativePath of metadata.files) {
    const backupPath = path.join(checkpointPath, relativePath);
    const targetPath = path.join(projectRoot, relativePath);

    if (await pathExists(backupPath)) {
      await ensureDir(path.dirname(targetPath));
      await copyFile(backupPath, targetPath);
      filesRestored++;
    }
  }

  return {
    success: true,
    filesRestored,
    totalFiles: metadata.files.length
  };
}

/**
 * List all checkpoints
 */
export async function listCheckpoints(projectRoot: string): Promise<CheckpointMetadata[]> {
  const metadata = await loadCheckpointMetadata(projectRoot);
  
  // Sort by timestamp (newest first)
  metadata.sort((a, b) => b.timestamp - a.timestamp);
  
  return metadata;
}

/**
 * Delete a checkpoint
 */
export async function deleteCheckpoint(
  projectRoot: string,
  checkpointId: string
): Promise<void> {
  const checkpointPath = getCheckpointPath(projectRoot, checkpointId);
  
  if (await pathExists(checkpointPath)) {
    await fs.remove(checkpointPath);
  }
  
  await removeCheckpointMetadata(projectRoot, checkpointId);
}

/**
 * Get checkpoint details
 */
export async function getCheckpointDetails(
  projectRoot: string,
  checkpointId: string
): Promise<CheckpointMetadata | null> {
  return await getCheckpointMetadata(projectRoot, checkpointId);
}

/**
 * Clean old checkpoints
 */
export async function cleanCheckpoints(
  projectRoot: string,
  retention: number
): Promise<void> {
  await cleanOldCheckpoints(projectRoot, retention);
}
