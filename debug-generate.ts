
import generate from '@babel/generator';
import parser from '@babel/parser';

console.log('generate type:', typeof generate);
console.log('generate:', generate);

const code = 'const x = 1;';
const ast = parser.parse(code, { sourceType: 'module' });

try {
  const output = generate(ast);
  console.log('Generate successful:', output.code);
} catch (e) {
  console.error('Generate failed:', e.message);
  
  try {
    // @ts-ignore
    const output = generate.default(ast);
    console.log('Generate successful via default:', output.code);
  } catch (e2) {
    console.error('Generate failed via default:', e2.message);
  }
}
