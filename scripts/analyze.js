import * as acorn from 'acorn';
import * as fs from 'fs';

// Read the content of the JavaScript file
const code = fs.readFileSync('scripts/app.js', 'utf8');

// Parse the code into an AST
const ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'module' });

// Function to traverse the AST and find method names within a specific class
function findMethodNamesInClass(node, className) {
    let methods = [];

    if (node.type === 'ClassDeclaration' && node.id.name === className) {
        const classBody = node.body;
        if (classBody.type === 'ClassBody') {
            for (const element of classBody.body) {
                if (element.type === 'MethodDefinition' && element.key.type === 'Identifier') {
                    methods.push(element.key.name);
                }
            }
        }
    }

    for (const key in node) {
        if (node.hasOwnProperty(key)) {
            const child = node[key];
            if (typeof child === 'object' && child !== null) {
                methods = methods.concat(findMethodNamesInClass(child, className));
            }
        }
    }

    return methods;
}

const methodNames = findMethodNamesInClass(ast, 'DaKrakenApp');

console.log('Methods found in class DaKrakenApp in scripts/app.js:');
console.log(methodNames.join('\n'));