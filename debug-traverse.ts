
import traverse from '@babel/traverse';
import parser from '@babel/parser';

console.log('traverse type:', typeof traverse);
console.log('traverse:', traverse);

const code = 'const x = 1;';
const ast = parser.parse(code, { sourceType: 'module' });

try {
  traverse(ast, {
    Enter(path) {
      console.log('Entered node');
    }
  });
  console.log('Traversal successful');
} catch (e) {
  console.error('Traversal failed:', e.message);
  
  // Try default
  try {
    // @ts-ignore
    traverse.default(ast, {
      Enter(path) {
        console.log('Entered node via default');
      }
    });
    console.log('Traversal successful via default');
  } catch (e2) {
    console.error('Traversal failed via default:', e2.message);
  }
}
