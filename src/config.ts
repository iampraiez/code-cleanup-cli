import fs from 'fs-extra';
import path from 'path';
import { pathToFileURL } from 'url';

const CONFIG_FILES = ['.cleanuprc', '.cleanuprc.json', 'cleanup.config.js'];

/**
 * Console configuration
 */
export interface ConsoleConfig {
  remove: 'none' | 'all' | string[];
  exclude: string[];
}

/**
 * Checkpoint configuration
 */
export interface CheckpointConfig {
  enabled: boolean;
  retention: number;
}

/**
 * Main configuration interface
 */
export interface CleanupConfig {
  comments: boolean;
  console: ConsoleConfig;
  emojis: boolean;
  fileTypes: string[];
  ignore: string[];
  checkpoint: CheckpointConfig;
  dryRun: boolean;
  preserveJSDoc?: boolean;
  preserveLicense?: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: CleanupConfig = {
  comments: false,
  console: {
    remove: 'none',
    exclude: []
  },
  emojis: false,
  fileTypes: ['js', 'jsx', 'ts', 'tsx', 'vue', 'mjs', 'cjs'],
  ignore: [],
  checkpoint: {
    enabled: true,
    retention: 10
  },
  dryRun: false
};

/**
 * Find configuration file in directory
 */
async function findConfigFile(directory: string): Promise<string | null> {
  for (const configFile of CONFIG_FILES) {
    const configPath = path.join(directory, configFile);
    if (await fs.pathExists(configPath)) {
      return configPath;
    }
  }
  return null;
}

/**
 * Load configuration from file
 */
async function loadConfigFile(configPath: string): Promise<Partial<CleanupConfig>> {
  const ext = path.extname(configPath);
  
  if (ext === '.js') {
    // For .js config files, use dynamic import
    const fileUrl = pathToFileURL(configPath).href;
    const module = await import(fileUrl);
    return module.default || module;
  } else {
    // For JSON files
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content);
  }
}

/**
 * Load configuration with defaults
 */
export async function loadConfig(
  directory: string,
  cliOptions: Partial<CleanupConfig> = {}
): Promise<CleanupConfig> {
  let fileConfig: Partial<CleanupConfig> = {};
  
  const configPath = await findConfigFile(directory);
  if (configPath) {
    try {
      fileConfig = await loadConfigFile(configPath);
    } catch (error) {
      console.warn(`Warning: Could not load config file: ${(error as Error).message}`);
    }
  }

  // Merge: defaults < file config < CLI options
  const config: CleanupConfig = {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    ...cliOptions
  } as CleanupConfig;

  // Handle console config merging specially
  if (fileConfig.console || cliOptions.console) {
    config.console = {
      ...DEFAULT_CONFIG.console,
      ...(fileConfig.console || {}),
      ...(cliOptions.console || {})
    };
  }

  // Handle checkpoint config merging
  if (fileConfig.checkpoint || cliOptions.checkpoint) {
    config.checkpoint = {
      ...DEFAULT_CONFIG.checkpoint,
      ...(fileConfig.checkpoint || {}),
      ...(cliOptions.checkpoint || {})
    };
  }

  return config;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate configuration
 */
export function validateConfig(config: CleanupConfig): ValidationResult {
  const errors: string[] = [];

  // Validate console.remove
  if (config.console && config.console.remove) {
    const validRemoveValues = ['none', 'all'];
    if (!validRemoveValues.includes(config.console.remove as string) && !Array.isArray(config.console.remove)) {
      errors.push('console.remove must be "none", "all", or an array of console methods');
    }
  }

  // Validate fileTypes
  if (!Array.isArray(config.fileTypes) || config.fileTypes.length === 0) {
    errors.push('fileTypes must be a non-empty array');
  }

  // Validate checkpoint.retention
  if (config.checkpoint && typeof config.checkpoint.retention !== 'number') {
    errors.push('checkpoint.retention must be a number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
