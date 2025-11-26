const { removeComments } = require('../src/processors/comment-remover');

describe('Comment Remover', () => {
  test('should remove single-line comments', () => {
    const code = `
const x = 5; // This is a comment
const y = 10;
    `;
    
    const result = removeComments(code);
    expect(result.code).not.toContain('// This is a comment');
    expect(result.count).toBeGreaterThan(0);
  });

  test('should remove multi-line comments', () => {
    const code = `
/* This is a
   multi-line comment */
const x = 5;
    `;
    
    const result = removeComments(code);
    expect(result.code).not.toContain('multi-line comment');
    expect(result.count).toBeGreaterThan(0);
  });

  test('should preserve code functionality', () => {
    const code = `
function add(a, b) {
  // Add two numbers
  return a + b;
}
    `;
    
    const result = removeComments(code);
    expect(result.code).toContain('function add');
    expect(result.code).toContain('return a + b');
  });

  test('should handle code without comments', () => {
    const code = `const x = 5;`;
    const result = removeComments(code);
    expect(result.count).toBe(0);
  });
});
