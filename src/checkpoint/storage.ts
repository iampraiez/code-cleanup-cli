import path from 'path';
import { ensureDir, pathExists, readFile, writeFile } from '../file-handler.js';
import { formatDate } from '../utils.js';

const CHECKPOINT_DIR = '.cleanup-checkpoints';
const METADATA_FILE = 'metadata.json';

/**
 * Checkpoint metadata interface
 */
export interface CheckpointMetadata {
  id: string;
  timestamp: number;
  date: string;
  filesCount: number;
  files: string[];
  options: {
    comments: boolean;
    console: {
      remove: 'none' | 'all' | string[];
    };
    emojis: boolean;
  };
}

/**
 * Get checkpoint directory path
 */
export function getCheckpointDir(projectRoot: string): string {
  return path.join(projectRoot, CHECKPOINT_DIR);
}

/**
 * Get checkpoint path
 */
export function getCheckpointPath(projectRoot: string, checkpointId: string): string {
  return path.join(getCheckpointDir(projectRoot), checkpointId);
}

/**
 * Load all checkpoint metadata
 */
export async function loadCheckpointMetadata(projectRoot: string): Promise<CheckpointMetadata[]> {
  const checkpointDir = getCheckpointDir(projectRoot);
  const metadataPath = path.join(checkpointDir, METADATA_FILE);

  if (!await pathExists(metadataPath)) {
    return [];
  }

  try {
    const content = await readFile(metadataPath);
    return JSON.parse(content);
  } catch (error) {
    console.warn('Failed to load checkpoint metadata:', (error as Error).message);
    return [];
  }
}

/**
 * Save checkpoint metadata
 */
export async function saveCheckpointMetadata(
  projectRoot: string,
  metadata: CheckpointMetadata[]
): Promise<void> {
  const checkpointDir = getCheckpointDir(projectRoot);
  await ensureDir(checkpointDir);
  
  const metadataPath = path.join(checkpointDir, METADATA_FILE);
  await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
}

/**
 * Add checkpoint metadata
 */
export async function addCheckpointMetadata(
  projectRoot: string,
  checkpoint: CheckpointMetadata
): Promise<void> {
  const metadata = await loadCheckpointMetadata(projectRoot);
  metadata.push(checkpoint);
  await saveCheckpointMetadata(projectRoot, metadata);
}

/**
 * Remove checkpoint metadata
 */
export async function removeCheckpointMetadata(
  projectRoot: string,
  checkpointId: string
): Promise<void> {
  const metadata = await loadCheckpointMetadata(projectRoot);
  const filtered = metadata.filter(cp => cp.id !== checkpointId);
  await saveCheckpointMetadata(projectRoot, filtered);
}

/**
 * Get checkpoint metadata by ID
 */
export async function getCheckpointMetadata(
  projectRoot: string,
  checkpointId: string
): Promise<CheckpointMetadata | null> {
  const metadata = await loadCheckpointMetadata(projectRoot);
  return metadata.find(cp => cp.id === checkpointId) || null;
}

/**
 * Clean old checkpoints based on retention policy
 */
export async function cleanOldCheckpoints(
  projectRoot: string,
  retention: number
): Promise<void> {
  const fs = await import('fs-extra');
  const metadata = await loadCheckpointMetadata(projectRoot);

  if (metadata.length <= retention) {
    return;
  }

  // Sort by timestamp (newest first)
  metadata.sort((a, b) => b.timestamp - a.timestamp);

  // Get checkpoints to remove
  const toRemove = metadata.slice(retention);

  // Remove checkpoint directories
  for (const checkpoint of toRemove) {
    const checkpointPath = getCheckpointPath(projectRoot, checkpoint.id);
    try {
      await fs.remove(checkpointPath);
    } catch (error) {
      console.warn(`Failed to remove checkpoint ${checkpoint.id}:`, (error as Error).message);
    }
  }

  // Update metadata
  const toKeep = metadata.slice(0, retention);
  await saveCheckpointMetadata(projectRoot, toKeep);
}

/**
 * Generate checkpoint ID
 */
export function generateCheckpointId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `checkpoint-${timestamp}-${random}`;
}
