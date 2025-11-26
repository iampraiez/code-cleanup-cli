#!/usr/bin/env node

import('../src/cli.js').then(({ program }) => {
  // If no command specified or first arg is an option, default to 'clean'
  const commands = ['clean', 'restore', 'list', 'delete', 'help'];
  const args = process.argv.slice(2);
  
  if (args.length === 0 || (args.length > 0 && !commands.includes(args[0]))) {
    process.argv.splice(2, 0, 'clean');
  }

  program.parse(process.argv);
}).catch((error) => {
  console.error('Failed to load CLI:', error);
  process.exit(1);
});
