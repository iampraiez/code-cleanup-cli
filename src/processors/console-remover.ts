import parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

/**
 * All console methods
 */
export const ALL_CONSOLE_METHODS = [
  'log', 'error', 'warn', 'info', 'debug',
  'trace', 'dir', 'dirxml', 'table', 'group',
  'groupCollapsed', 'groupEnd', 'clear', 'count',
  'countReset', 'assert', 'profile', 'profileEnd',
  'time', 'timeLog', 'timeEnd', 'timeStamp'
];

/**
 * Console removal options
 */
export interface ConsoleRemovalOptions {
  remove: 'none' | 'all' | string[];
  exclude: string[];
}

/**
 * Console removal result
 */
export interface ConsoleRemovalResult {
  code: string;
  count: number;
}

/**
 * Remove console statements from code
 */
export function removeConsoleStatements(
  code: string,
  options: ConsoleRemovalOptions = { remove: 'none', exclude: [] }
): ConsoleRemovalResult {
  const {
    remove = 'none',
    exclude = []
  } = options;

  if (remove === 'none') {
    return { code, count: 0 };
  }

  let consoleStatementsRemoved = 0;

  try {
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
    });

    // Determine which methods to remove
    let methodsToRemove: string[] = [];
    if (remove === 'all') {
      methodsToRemove = ALL_CONSOLE_METHODS.filter(m => !exclude.includes(m));
    } else if (Array.isArray(remove)) {
      methodsToRemove = remove.filter(m => !exclude.includes(m));
    }

    traverse(ast, {
      // Handle console.log() as expression statement
      ExpressionStatement(path) {
        if (shouldRemoveConsole(path.node.expression, methodsToRemove)) {
          path.remove();
          consoleStatementsRemoved++;
        }
      },
      
      // Handle console.log() in variable declarations, etc.
      CallExpression(path) {
        if (shouldRemoveConsole(path.node, methodsToRemove)) {
          // Check if it's a standalone expression or part of something
          const parent = path.parent;
          
          // If it's part of an expression statement, it will be handled above
          if (t.isExpressionStatement(parent)) {
            return;
          }
          
          // If it's in a sequence expression or similar, replace with undefined
          if (t.isSequenceExpression(parent) || 
              t.isLogicalExpression(parent) ||
              t.isConditionalExpression(parent)) {
            path.replaceWith(t.identifier('undefined'));
            consoleStatementsRemoved++;
          }
        }
      }
    });

    const output = generate(ast, {
      retainLines: true,
      compact: false
    });

    return {
      code: output.code,
      count: consoleStatementsRemoved
    };
  } catch (error) {
    console.warn(`AST parsing failed for console removal: ${(error as Error).message}`);
    return { code, count: 0 };
  }
}

/**
 * Check if a node is a console call that should be removed
 */
function shouldRemoveConsole(node: t.Node, methodsToRemove: string[]): boolean {
  if (!t.isCallExpression(node)) {
    return false;
  }

  const callee = node.callee;
  
  // Check for console.method()
  if (t.isMemberExpression(callee) &&
      t.isIdentifier(callee.object, { name: 'console' }) &&
      t.isIdentifier(callee.property)) {
    const method = callee.property.name;
    return methodsToRemove.includes(method);
  }

  return false;
}

/**
 * Get list of console methods used in code
 */
export function getConsoleMethods(code: string): string[] {
  const methods = new Set<string>();

  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties',
        'dynamicImport'
      ]
    });

    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        if (t.isMemberExpression(callee) &&
            t.isIdentifier(callee.object, { name: 'console' }) &&
            t.isIdentifier(callee.property)) {
          methods.add(callee.property.name);
        }
      }
    });
  } catch (error) {
    // Ignore parsing errors
  }

  return Array.from(methods);
}
