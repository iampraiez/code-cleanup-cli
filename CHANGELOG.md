# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-26

### Added
- **Prettier Integration**: Automatically formats code after cleanup for better structure.
- **CLI Option**: Added `--no-prettier` flag to disable automatic formatting.

### Fixed
- **AST Traversal**: Fixed an issue with Babel traverse imports in ESM environments.
- **Comment Removal**: Improved fallback regex to better handle URLs in strings.
- **CLI**: Improved default command handling when arguments are provided.

## [1.0.2] - 2025-11-26

### Fixed
- **Critical Bug**: Fixed AST traversal issue that caused URLs to be treated as comments.
- **Security**: Removed debug files from package.

## [1.0.1] - 2025-11-265

### Added
- Initial release
- Comment removal functionality (single-line, multi-line, JSDoc)
- Console statement removal with selective methods
- Emoji removal (all Unicode emojis)
- Checkpoint/restore system
- Interactive CLI mode
- Configuration file support (.cleanuprc, .cleanuprc.json, cleanup.config.js)
- Dry-run mode for previewing changes
- Progress indicators with ora
- Colored output with chalk
- AST-based processing with Babel
- Support for JavaScript, TypeScript, JSX, TSX, Vue files
- Automatic checkpoint retention management
- List, restore, and delete checkpoint commands
- Programmatic API for Node.js integration
- Comprehensive documentation
- Unit test structure

### Features
- `cleanup clean` - Main cleanup command
- `cleanup restore` - Restore from checkpoint
- `cleanup list` - List all checkpoints
- `cleanup delete` - Delete specific checkpoint
- `--comments` - Remove comments flag
- `--console` - Remove console statements flag
- `--emojis` - Remove emojis flag
- `--all` - Remove everything flag
- `--dry-run` - Preview mode flag
- `--no-checkpoint` - Skip checkpoint creation
- `-y, --yes` - Auto-confirm flag

[1.0.0]: https://github.com/yourusername/code-cleanup-cli/releases/tag/v1.0.0
