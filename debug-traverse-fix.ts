
import parser from '@babel/parser';
import _traverse from '@babel/traverse';

// Handle ESM default exports for Babel packages
const traverse = (_traverse as any).default || _traverse;

console.log('traverse type:', typeof traverse);

const code = 'const x = 1;';
const ast = parser.parse(code, { sourceType: 'module' });

try {
  traverse(ast, {
    enter(path: any) {
      console.log('Entered node');
    }
  });
  console.log('Traversal successful');
} catch (e: any) {
  console.error('Traversal failed:', e.message);
}
