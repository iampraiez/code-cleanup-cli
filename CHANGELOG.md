# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-25

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
