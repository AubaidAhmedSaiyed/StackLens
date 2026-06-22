const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

function extractDependencies(code, filePath) {
  if (!code) {
    return { file: filePath, imports: [] };
  }

  try {
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: [
        "jsx",
        "typescript",
        "decorators-legacy"
      ]
    });

    const imports = [];

    traverse(ast, {
      ImportDeclaration({ node }) {
        if (node.source && node.source.value) {
          imports.push(node.source.value);
        }
      },
      CallExpression({ node }) {
        // Handle dynamic imports or requires
        if (node.callee.name === "require" || node.callee.type === "Import") {
          if (node.arguments.length > 0 && node.arguments[0].value) {
            imports.push(node.arguments[0].value);
          }
        }
      }
    });

    return {
      file: filePath,
      imports
    };
  } catch (err) {
    console.error(`Error parsing ${filePath}:`, err.message);
    return { file: filePath, imports: [] };
  }
}

module.exports = extractDependencies;