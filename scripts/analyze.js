const acorn = require('acorn');
const fs = require('fs');

// Read the content of the JavaScript file
const code = fs.readFileSync('scripts/app.js', 'utf8');

// Parse the code into an AST
const ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'module' });

// Function to traverse the AST and find function declarations
function findFunctionDeclarations(node) {
    let functions = [];

    if (node.type === 'FunctionDeclaration' && node.id) {
        functions.push(node.id.name);
    }

    for (const key in node) {
        if (node.hasOwnProperty(key)) {
            const child = node[key];
            if (typeof child === 'object' && child !== null) {
                functions = functions.concat(findFunctionDeclarations(child));
            }
        }
    }

    return functions;
}

const functionNames = findFunctionDeclarations(ast);

console.log('Functions found in scripts/app.js:');
console.log(functionNames.join('\n'));
