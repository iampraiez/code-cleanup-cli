import emojiRegex from 'emoji-regex';

/**
 * Emoji removal result
 */
export interface EmojiRemovalResult {
  code: string;
  count: number;
}

/**
 * Remove all emojis from code
 */
export function removeEmojis(code: string): EmojiRemovalResult {
  const regex = emojiRegex();
  let count = 0;
  
  const result = code.replace(regex, () => {
    count++;
    return '';
  });

  return {
    code: result,
    count
  };
}

/**
 * Find all emojis in code
 */
export function findEmojis(code: string): string[] {
  const regex = emojiRegex();
  const emojis: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(code)) !== null) {
    emojis.push(match[0]);
  }

  return emojis;
}

/**
 * Count emojis in code
 */
export function countEmojis(code: string): number {
  const regex = emojiRegex();
  const matches = code.match(regex);
  return matches ? matches.length : 0;
}
