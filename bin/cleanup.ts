#!/usr/bin/env node

import('../src/cli.js').then(({ program }) => {
  // If no command specified, default to 'clean'
  if (process.argv.length === 2) {
    process.argv.push('clean');
  }

  program.parse(process.argv);
}).catch((error) => {
  console.error('Failed to load CLI:', error);
  process.exit(1);
});
