import parser from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';

// Handle ESM default exports for Babel packages
const traverse = (_traverse as any).default || _traverse;
const generate = (_generate as any).default || _generate;

/**
 * Comment removal options
 */
export interface CommentRemovalOptions {
  preserveJSDoc?: boolean;
  preserveLicense?: boolean;
}

/**
 * Comment removal result
 */
export interface CommentRemovalResult {
  code: string;
  count: number;
}

/**
 * Remove comments from code
 */
export function removeComments(code: string, options: CommentRemovalOptions = {}): CommentRemovalResult {
  const {
    preserveJSDoc = false,
    preserveLicense = false
  } = options;

  let commentsRemoved = 0;

  try {
    // Parse the code with comments attached
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties',
        'dynamicImport',
        'optionalChaining',
        'nullishCoalescingOperator'
      ],
      // @ts-ignore - attachComments is valid but missing from types in some versions
      attachComments: true,
      tokens: true
    });

    // Filter comments
    if (ast.comments) {
      const originalCount = ast.comments.length;
      
      ast.comments = ast.comments.filter(comment => {
        const value = comment.value.trim();
        
        // Preserve license comments
        if (preserveLicense && (
          value.includes('@license') ||
          value.includes('Copyright') ||
          value.includes('(c)') ||
          value.toLowerCase().includes('license')
        )) {
          return true;
        }
        
        // Preserve JSDoc comments
        if (preserveJSDoc && comment.type === 'CommentBlock' && value.startsWith('*')) {
          return true;
        }
        
        return false;
      });
      
      commentsRemoved = originalCount - ast.comments.length;
    }

    // Also remove comments from leadingComments and trailingComments
    traverse(ast, {
      enter(path: any) {
        if (path.node.leadingComments) {
          const originalCount = path.node.leadingComments.length;
          path.node.leadingComments = path.node.leadingComments.filter((comment: any) => {
            const value = comment.value.trim();
            
            if (preserveLicense && (
              value.includes('@license') ||
              value.includes('Copyright') ||
              value.includes('(c)') ||
              value.toLowerCase().includes('license')
            )) {
              return true;
            }
            
            if (preserveJSDoc && comment.type === 'CommentBlock' && value.startsWith('*')) {
              return true;
            }
            
            return false;
          });
          commentsRemoved += originalCount - path.node.leadingComments.length;
        }
        
        if (path.node.trailingComments) {
          const originalCount = path.node.trailingComments.length;
          path.node.trailingComments = path.node.trailingComments.filter((comment: any) => {
            const value = comment.value.trim();
            
            if (preserveLicense && (
              value.includes('@license') ||
              value.includes('Copyright') ||
              value.includes('(c)') ||
              value.toLowerCase().includes('license')
            )) {
              return true;
            }
            
            if (preserveJSDoc && comment.type === 'CommentBlock' && value.startsWith('*')) {
              return true;
            }
            
            return false;
          });
          commentsRemoved += originalCount - path.node.trailingComments.length;
        }
      }
    });

    // Generate code without comments
    const output = generate(ast, {
      comments: preserveJSDoc || preserveLicense,
      retainLines: true,
      compact: false
    });

    return {
      code: output.code,
      count: commentsRemoved
    };
  } catch (error) {
    // If parsing fails, try a simple regex-based approach
    console.warn(`AST parsing failed, using regex fallback: ${(error as Error).message}`);
    return removeCommentsRegex(code);
  }
}

/**
 * Fallback regex-based comment removal
 * Improved to handle strings better
 */
function removeCommentsRegex(code: string): CommentRemovalResult {
  let count = 0;
  
  // This is a basic fallback. For perfect accuracy, AST is required.
  // We try to avoid matching // inside strings by using a more complex regex
  // or by replacing strings with placeholders first, but that's complex.
  
  // Simple approach: Match strings OR comments, and only replace comments
  // Regex for strings: "..." | '...' | `...`
  // Regex for comments: //... | /* ... */
  
  const stringRegex = /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'|`(\\.|[^`\\])*`/g;
  const commentRegex = /\/\/.*$|\/\*[\s\S]*?\*\//gm;
  
  // We'll use a combined regex to tokenize the input
  const combinedRegex = /("(\\.|[^"\\])*"|'(\\.|[^'\\])*'|`(\\.|[^`\\])*`)|(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
  
  const result = code.replace(combinedRegex, (match, string, comment) => {
    if (string) {
      return string; // Keep strings as is
    }
    if (match.trim().startsWith('//') || match.trim().startsWith('/*')) {
      count++;
      return ''; // Remove comments
    }
    return match;
  });
  
  return {
    code: result,
    count
  };
}
