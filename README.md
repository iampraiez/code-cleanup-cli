# code-cleanup-cli

A production-ready CLI tool to remove comments, console statements, and emojis from your JavaScript/TypeScript codebase with checkpoint/restore functionality.

[![npm version](https://img.shields.io/npm/v/code-cleanup-cli.svg)](https://www.npmjs.com/package/code-cleanup-cli)
[![npm downloads](https://img.shields.io/npm/dm/code-cleanup-cli.svg)](https://www.npmjs.com/package/code-cleanup-cli)
[![license](https://img.shields.io/npm/l/code-cleanup-cli.svg)](https://github.com/iampraiez/code-cleanup-cli/blob/main/LICENSE)

## Features

✨ **Remove Comments** - Strip single-line, multi-line, and JSDoc comments  
🔇 **Remove Console Statements** - Selectively remove console.log, console.error, etc.  
😊 **Remove Emojis** - Remove ALL Unicode emojis (not just faces)  
💾 **Checkpoint System** - Create backups before modifications  
⏮️ **Restore Functionality** - Rollback to any previous checkpoint  
🎯 **Selective Processing** - Choose what to remove  
👀 **Dry Run Mode** - Preview changes without modifying files  
⚙️ **Configuration Files** - Use `.cleanuprc` for project settings  
🚀 **Production Ready** - AST-based processing for safe transformations

## Installation

### Global Installation (Recommended)

```bash
npm install -g code-cleanup-cli
```

### Local Installation

```bash
npm install --save-dev code-cleanup-cli
```

## Quick Start

### Interactive Mode

Simply run the command and follow the prompts:

```bash
cleanup
```

### Remove Everything

```bash
cleanup --all
```

### Remove Only Comments

```bash
cleanup --comments
```

### Remove Specific Console Methods

```bash
cleanup --console log,debug
```

### Remove All Emojis

```bash
cleanup --emojis
```

### Dry Run (Preview Changes)

```bash
cleanup --all --dry-run
```

## Usage

### Commands

#### `cleanup clean` (default)

Clean your codebase by removing comments, console statements, and/or emojis.

**Options:**

- `-p, --path <path>` - Path to directory (default: current directory)
- `-c, --comments` - Remove comments
- `--console <type>` - Remove console statements
  - `all` - Remove all console methods
  - `none` - Don't remove any
  - `log,debug,warn` - Comma-separated list of methods
- `--console-exclude <methods>` - Exclude specific console methods
- `-e, --emojis` - Remove emojis
- `-a, --all` - Remove everything
- `--dry-run` - Preview changes without modifying files
- `--no-checkpoint` - Skip creating checkpoint
- `-y, --yes` - Skip confirmation prompts

**Examples:**

```bash
# Interactive mode
cleanup

# Remove comments and console.log only
cleanup --comments --console log

# Remove all console except error and warn
cleanup --console all --console-exclude error,warn

# Remove everything with dry run
cleanup --all --dry-run

# Process specific directory
cleanup --path ./src --all

# Skip checkpoint creation
cleanup --all --no-checkpoint

# Auto-confirm (useful for CI/CD)
cleanup --all -y
```

#### `cleanup restore [checkpointId]`

Restore files from a checkpoint.

```bash
# Interactive selection
cleanup restore

# Restore specific checkpoint
cleanup restore checkpoint-1234567890-abc123
```

#### `cleanup list`

List all available checkpoints.

```bash
cleanup list
```

#### `cleanup delete <checkpointId>`

Delete a specific checkpoint.

```bash
cleanup delete checkpoint-1234567890-abc123
```

## Configuration File

Create a `.cleanuprc`, `.cleanuprc.json`, or `cleanup.config.js` file in your project root:

### JSON Configuration

```json
{
  "comments": true,
  "console": {
    "remove": "all",
    "exclude": ["error", "warn"]
  },
  "emojis": true,
  "fileTypes": ["js", "jsx", "ts", "tsx", "vue"],
  "ignore": [
    "node_modules/**",
    "dist/**",
    "build/**"
  ],
  "checkpoint": {
    "enabled": true,
    "retention": 10
  }
}
```

### JavaScript Configuration

```javascript
// cleanup.config.js
module.exports = {
  comments: true,
  console: {
    remove: ['log', 'debug'],
    exclude: []
  },
  emojis: true,
  fileTypes: ['js', 'jsx', 'ts', 'tsx'],
  ignore: ['**/vendor/**'],
  checkpoint: {
    enabled: true,
    retention: 5
  }
};
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `comments` | boolean | `false` | Remove comments |
| `console.remove` | string/array | `'none'` | Console methods to remove (`'all'`, `'none'`, or array like `['log', 'debug']`) |
| `console.exclude` | array | `[]` | Console methods to exclude from removal |
| `emojis` | boolean | `false` | Remove emojis |
| `fileTypes` | array | `['js', 'jsx', 'ts', 'tsx', 'vue', 'mjs', 'cjs']` | File extensions to process |
| `ignore` | array | `[]` | Glob patterns to ignore |
| `checkpoint.enabled` | boolean | `true` | Enable checkpoint creation |
| `checkpoint.retention` | number | `10` | Number of checkpoints to keep |

## Checkpoint System

The checkpoint system creates backups of your files before making changes, allowing you to restore them if needed.

### How It Works

1. Before processing files, a checkpoint is created in `.cleanup-checkpoints/`
2. Each checkpoint has a unique ID and timestamp
3. You can restore from any checkpoint
4. Old checkpoints are automatically cleaned based on retention policy

### Checkpoint Directory

Checkpoints are stored in `.cleanup-checkpoints/` in your project root. **Add this to your `.gitignore`:**

```gitignore
.cleanup-checkpoints/
```

### Managing Checkpoints

```bash
# List all checkpoints
cleanup list

# Restore from checkpoint
cleanup restore checkpoint-1234567890-abc123

# Delete checkpoint
cleanup delete checkpoint-1234567890-abc123
```

## Programmatic Usage

You can also use this package programmatically in your Node.js scripts:

```javascript
const { cleanup } = require('code-cleanup-cli');

async function cleanMyCode() {
  const results = await cleanup('./src', {
    comments: true,
    console: { remove: 'all' },
    emojis: true,
    checkpoint: { enabled: true }
  });

  console.log(`Processed ${results.filesProcessed} files`);
  console.log(`Modified ${results.filesModified} files`);
  console.log(`Checkpoint: ${results.checkpointId}`);
}

cleanMyCode();
```

## Examples

### Remove Comments from Entire Project

```bash
cleanup --comments --path ./
```

### Remove console.log and console.debug

```bash
cleanup --console log,debug
```

### Remove All Console Except Errors

```bash
cleanup --console all --console-exclude error,warn
```

### Remove Emojis from Source Files

```bash
cleanup --emojis --path ./src
```

### Complete Cleanup with Preview

```bash
cleanup --all --dry-run
```

### CI/CD Integration

```bash
# In your build script
cleanup --comments --console all -y --no-checkpoint
```

## Supported File Types

By default, the following file types are processed:

- `.js` - JavaScript
- `.jsx` - React JSX
- `.ts` - TypeScript
- `.tsx` - TypeScript JSX
- `.vue` - Vue.js
- `.mjs` - ES Modules
- `.cjs` - CommonJS

You can customize this in your configuration file.

## Ignored Directories

The following directories are automatically ignored:

- `node_modules/`
- `dist/`
- `build/`
- `.git/`
- `.cleanup-checkpoints/`
- `coverage/`
- `.next/`
- `out/`

Add custom ignore patterns in your configuration file.

## How It Works

### AST-Based Processing

The tool uses Babel's parser to create an Abstract Syntax Tree (AST) of your code, ensuring safe and accurate transformations without breaking your code structure.

### Comment Removal

- Removes single-line comments (`//`)
- Removes multi-line comments (`/* */`)
- Optionally preserves JSDoc comments
- Preserves license comments by default

### Console Removal

- Detects all console method calls
- Safely removes console statements
- Handles edge cases (console in expressions)
- Preserves code functionality

### Emoji Removal

- Uses `emoji-regex` for comprehensive Unicode emoji detection
- Removes ALL emoji types (faces, objects, symbols, flags, etc.)
- Handles emoji modifiers and variations

## Testing

### Test the Package Locally

1. **Link the package globally:**

```bash
npm link
```

2. **Test commands:**

```bash
cleanup --help
cleanup --version
cleanup list
```

3. **Create a test directory:**

```bash
mkdir test-project
cd test-project
echo "console.log('Hello 👋'); // This is a comment" > test.js
```

4. **Run cleanup:**

```bash
cleanup --all
```

5. **Verify changes:**

```bash
cat test.js
```

6. **Test restore:**

```bash
cleanup list
cleanup restore
```

### Run Unit Tests

```bash
npm test
```

### Run with Coverage

```bash
npm run test:coverage
```

## Publishing to npm

1. **Update package.json:**
   - Set your author name
   - Update repository URL
   - Verify version number

2. **Login to npm:**

```bash
npm login
```

3. **Publish:**

```bash
npm publish
```

## Troubleshooting

### "Command not found: cleanup"

Make sure you've installed the package globally:

```bash
npm install -g code-cleanup-cli
```

### "No checkpoints found"

Checkpoints are only created when processing files. Run a cleanup first:

```bash
cleanup --all
```

### Files not being processed

Check your `ignore` patterns in the configuration file. Also ensure the file extensions are included in `fileTypes`.

### Parsing errors

Some files may fail to parse (e.g., invalid syntax). The tool will skip these files and continue processing others.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Your Name]

## Support

- 🐛 [Report a bug](https://github.com/yourusername/code-cleanup-cli/issues)
- 💡 [Request a feature](https://github.com/yourusername/code-cleanup-cli/issues)
- 📖 [Documentation](https://github.com/yourusername/code-cleanup-cli#readme)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

**Made with ❤️ by developers, for developers**
