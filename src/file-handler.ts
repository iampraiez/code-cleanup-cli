import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

/**
 * Get all files matching the pattern
 */
export async function getFiles(
  directory: string,
  extensions: string[] = ['js', 'jsx', 'ts', 'tsx', 'vue'],
  ignorePatterns: string[] = []
): Promise<string[]> {
  const patterns = extensions.map(ext => `**/*.${ext}`);
  const defaultIgnore = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/.cleanup-checkpoints/**',
    '**/coverage/**',
    '**/.next/**',
    '**/out/**'
  ];

  const allIgnore = [...defaultIgnore, ...ignorePatterns];

  const files = await glob(patterns, {
    cwd: directory,
    absolute: true,
    ignore: allIgnore,
    nodir: true
  });

  return files;
}

/**
 * Read file content
 */
export async function readFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf-8');
}

/**
 * Write file content
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Copy file
 */
export async function copyFile(source: string, destination: string): Promise<void> {
  await fs.copy(source, destination);
}

/**
 * Ensure directory exists
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * Remove directory
 */
export async function removeDir(dirPath: string): Promise<void> {
  await fs.remove(dirPath);
}

/**
 * Check if path exists
 */
export async function pathExists(filePath: string): Promise<boolean> {
  return await fs.pathExists(filePath);
}

/**
 * Get file stats
 */
export async function getStats(filePath: string): Promise<fs.Stats> {
  return await fs.stat(filePath);
}
