const { removeConsoleStatements } = require('../src/processors/console-remover');

describe('Console Remover', () => {
  test('should remove console.log statements', () => {
    const code = `
console.log('Hello');
const x = 5;
console.log('World');
    `;
    
    const result = removeConsoleStatements(code, { remove: ['log'] });
    expect(result.code).not.toContain("console.log('Hello')");
    expect(result.count).toBe(2);
  });

  test('should remove all console statements', () => {
    const code = `
console.log('Log');
console.error('Error');
console.warn('Warning');
const x = 5;
    `;
    
    const result = removeConsoleStatements(code, { remove: 'all' });
    expect(result.code).not.toContain('console.log');
    expect(result.code).not.toContain('console.error');
    expect(result.code).not.toContain('console.warn');
    expect(result.count).toBe(3);
  });

  test('should exclude specified methods', () => {
    const code = `
console.log('Log');
console.error('Error');
    `;
    
    const result = removeConsoleStatements(code, { 
      remove: 'all',
      exclude: ['error']
    });
    
    expect(result.code).not.toContain("console.log('Log')");
    expect(result.code).toContain("console.error('Error')");
  });

  test('should not remove when remove is none', () => {
    const code = `console.log('Hello');`;
    const result = removeConsoleStatements(code, { remove: 'none' });
    expect(result.count).toBe(0);
    expect(result.code).toContain('console.log');
  });
});
