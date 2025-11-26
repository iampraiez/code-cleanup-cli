import parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

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
      ]
    } as any);

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
      enter(path) {
        if (path.node.leadingComments) {
          const originalCount = path.node.leadingComments.length;
          path.node.leadingComments = path.node.leadingComments.filter(comment => {
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
          path.node.trailingComments = path.node.trailingComments.filter(comment => {
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
 */
function removeCommentsRegex(code: string): CommentRemovalResult {
  let count = 0;
  
  // Remove single-line comments
  let result = code.replace(/\/\/.*$/gm, () => {
    count++;
    return '';
  });
  
  // Remove multi-line comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, () => {
    count++;
    return '';
  });
  
  return {
    code: result,
    count
  };
}
