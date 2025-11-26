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
  preserveJSDoc?: boolean;
  preserveLicense?: boolean;
  console: {
    remove: 'all' | 'none' | string[];
    exclude: string[];
  };
  emojis: boolean;
  fileTypes: string[];
  ignore: string[];
  checkpoint: {
    enabled: boolean;
    retention: number;
  };
  prettier?: boolean; // Enable/disable Prettier formatting
  dryRun: boolean;
}

/**
 * Default configuration
 */
export const defaultConfig: CleanupConfig = {
  comments: false,
  console: {
    remove: 'none',
    exclude: []
  },
  emojis: false,
  fileTypes: ['js', 'jsx', 'ts', 'tsx', 'vue', 'mjs', 'cjs'],
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/.git/**',
    '**/.cleanup-checkpoints/**'
  ],
  checkpoint: {
    enabled: true,
    retention: 10
  },
  prettier: true, // Default to true
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

  // Merge file config and CLI options first to create a 'user config' layer
  const userConfig: Partial<CleanupConfig> = {
    ...fileConfig,
    ...cliOptions
  };

  // Merge: defaults < user config
  const config: CleanupConfig = {
    ...defaultConfig,
    ...userConfig
  };

  // Ensure arrays are arrays (in case user config overrides them with undefined)
  config.fileTypes = config.fileTypes || defaultConfig.fileTypes;
  config.ignore = config.ignore || defaultConfig.ignore;
  config.console.exclude = config.console.exclude || defaultConfig.console.exclude;
  
  // Merge console config specially
  config.console = {
    ...defaultConfig.console,
    ...(userConfig.console || {})
  };

  // Merge checkpoint config specially
  config.checkpoint = {
    ...defaultConfig.checkpoint,
    ...(userConfig.checkpoint || {})
  };

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
