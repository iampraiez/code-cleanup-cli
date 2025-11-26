const { removeEmojis, countEmojis } = require('../src/processors/emoji-remover');

describe('Emoji Remover', () => {
  test('should remove face emojis', () => {
    const code = `const message = 'Hello 😊 World 🎉';`;
    const result = removeEmojis(code);
    expect(result.code).not.toContain('😊');
    expect(result.code).not.toContain('🎉');
    expect(result.count).toBe(2);
  });

  test('should remove all types of emojis', () => {
    const code = `
// 🚀 Rocket
const x = '🔥 Fire';
const y = '👍 Thumbs up';
const z = '🌟 Star';
    `;
    
    const result = removeEmojis(code);
    expect(result.code).not.toContain('🚀');
    expect(result.code).not.toContain('🔥');
    expect(result.code).not.toContain('👍');
    expect(result.code).not.toContain('🌟');
    expect(result.count).toBe(4);
  });

  test('should count emojis correctly', () => {
    const code = `const x = '😊🎉🚀';`;
    const count = countEmojis(code);
    expect(count).toBe(3);
  });

  test('should handle code without emojis', () => {
    const code = `const x = 'Hello World';`;
    const result = removeEmojis(code);
    expect(result.count).toBe(0);
  });
});
