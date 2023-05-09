'use strict';
/**
 * Analyzes the code in files.
 */

function parseHTML(html) {
  // Code provided by Chat GPT
  // create an empty document object
  const doc = document.implementation.createHTMLDocument('');

  // set the body innerHTML to the HTML string
  doc.body.innerHTML = html;

  // return the parsed document
  return doc;
}

async function AnalyzeFileAndFolder() {

  // The global variable gIndex is set to the next free value
  // Use gIndex for the index of all file contents which are now to be analyzed

  initializeBuildModel();

  let fileContent;

  let elementName = '';
  let idVal = 0;
  let nameVal = '';
  let uniqueNameVal = '';
  let technicalTypeVal = '';
  let linkToEditorVal = '';
  let parentVal = 0;
  let childVal = 0;
  let isMainVal = false;
  let callerVal = 0;
  let calledVal = 0;
  let accessorVal = 0;
  let accessedVal = 0;
  let isWriteVal = false;
  let isReadVal = false;
  let isDependentVal = false;

  let fileInfoStart = {};
  fileInfoStart.handle = FEDirectoryHandle;
  fileInfoStart.index = 0;
  fileInfoStart.parentIndex = 0.
  fileInfoStart.kind = FEDirectoryHandle.kind;
  fileInfoStart.name = FEDirectoryHandle.name;
  fileInfoStart.directoryArray = [];
  fileInfoStart.file = {};

  for (const fileInfo of fileInfoByIndex) {
    if (typeof fileInfo !== 'undefined') {


      if (fileInfo.handle.kind === 'file') {
        elementName = 'SOMIX.Grouping';
        idVal = fileInfo.index;
        nameVal = fileInfo.name;
        uniqueNameVal = '';
        for (const e of fileInfo.directoryArray) {
          uniqueNameVal = uniqueNameVal + '/' + e;
        }
        uniqueNameVal = uniqueNameVal + '/' + fileInfo.name;
        technicalTypeVal = 'File';
        buildModel(
          elementName,
          idVal,
          nameVal,
          uniqueNameVal,
          technicalTypeVal,
          linkToEditorVal,
          parentVal,
          childVal,
          isMainVal,
          callerVal,
          calledVal,
          accessorVal,
          accessedVal,
          isWriteVal,
          isReadVal,
          isDependentVal);

        // TODO Analyze content of file

        let myFile = await fileInfo.handle.getFile();
        // Todo: Analyze content of files only when they are needed
        if (fileInfo.extension == 'html' || fileInfo.extension == 'htm') {
          fileContent = await myFile.text(); // See https://web.dev/file-system-access/
          let htmlDoc = parseHTML(fileContent);
          const scriptElements = htmlDoc.querySelectorAll('script');
          console.log(fileInfo.name);
          console.log(scriptElements);
          scriptElements.forEach(scriptElement => {
            console.log(scriptElement.src);
            console.log(scriptElement.textContent);
            console.log("Tokens:");
            const tokens = scriptElement.textContent.match(/\b\w+\b|[^\s]/g);
            if (tokens !== null) {
              tokens.forEach(token => {
                console.log(token);
              });
            }

          });
          // #77 Analyze code here
          let a = 1;
        }

      } else if (fileInfo.handle.kind === 'directory') {
        elementName = 'SOMIX.Grouping';
        idVal = fileInfo.index;
        nameVal = fileInfo.name;
        uniqueNameVal = '';
        for (const e of fileInfo.directoryArray) {
          uniqueNameVal = uniqueNameVal + '/' + e;
        }
        // uniqueNameVal = uniqueNameVal + '/' + fileInfo.name;
        technicalTypeVal = 'Folder';
        buildModel(
          elementName,
          idVal,
          nameVal,
          uniqueNameVal,
          technicalTypeVal,
          linkToEditorVal,
          parentVal,
          childVal,
          isMainVal,
          callerVal,
          calledVal,
          accessorVal,
          accessedVal,
          isWriteVal,
          isReadVal,
          isDependentVal);

      };

      // Clear data before it is read again
      elementName = '';
      idVal = 0;
      nameVal = '';
      uniqueNameVal = '';
      technicalTypeVal = '';
      linkToEditorVal = '';
      parentVal = '';
      childVal = '';
      isMainVal = false;
      callerVal = 0;
      calledVal = 0;
      accessorVal = 0;
      accessedVal = 0;
      isWriteVal = false;
      isReadVal = false;
      isDependentVal = false;

      elementName = 'SOMIX.ParentChild';
      parentVal = fileInfo.parentIndex;
      childVal = fileInfo.index;
      isMainVal = true;
      buildModel(
        elementName,
        idVal,
        nameVal,
        uniqueNameVal,
        technicalTypeVal,
        linkToEditorVal,
        parentVal,
        childVal,
        isMainVal,
        callerVal,
        calledVal,
        accessorVal,
        accessedVal,
        isWriteVal,
        isReadVal,
        isDependentVal);

      // Clear data before it is read again
      elementName = '';
      idVal = 0;
      nameVal = '';
      uniqueNameVal = '';
      technicalTypeVal = '';
      linkToEditorVal = '';
      parentVal = '';
      childVal = '';
      isMainVal = false;
      callerVal = 0;
      calledVal = 0;
      accessorVal = 0;
      accessedVal = 0;
      isWriteVal = false;
      isReadVal = false;
      isDependentVal = false;
    }

  }

}

function javaScriptFindGlobal(code) {
  const tokens = code.match(/\/\/.*?$|\/\*[\s\S]*?\*\/|([a-zA-Z_$][a-zA-Z0-9_$]*)|[\{\}]|\b(let|const)\b/gm);
  //const tokens = jsCode.match(/\/\/.*?$|[^\S\r\n]+|\r?\n|\/\*[\s\S]*?\*\/|([a-zA-Z_$][a-zA-Z0-9_$]*)|\b(let|const)\b/gm);

  const globalVars = new Set();
  const globalFuncs = new Set();

  let inComment = false;
  let level = 1;
  const scopes = [];
  scopes.push(new Set());

  tokens.forEach((token, index) => {
    if (token === '/*') {
      // inComment = true;
    } else if (token === '*/') {
      // inComment = false;
    } else if (token.startsWith('//')) {
      // Ignore line comments
    } else if (!inComment) {
      if (token === 'let' || token === 'const') {
        const nextToken = tokens[index + 1];
        if (/^[a-zA-Z_$]/.test(nextToken)) {
          const currentScope = scopes[scopes.length - 1];
          // if (!currentScope || !currentScope.has(nextToken)) {
          if (level == 1) {
            globalVars.add(nextToken);
          }
          currentScope && currentScope.add(nextToken);
        }
      }
      else if (token === 'function') {
        const nextToken = tokens[index + 1];
        if (/^[a-zA-Z_$]/.test(nextToken)) {
          const currentScope = scopes[scopes.length - 1];
          // if (!currentScope || !currentScope.has(nextToken)) {
          if (level == 1) {
            globalFuncs.add(nextToken);
          }
          currentScope && currentScope.add(nextToken);
        }
      } else if (/^[a-zA-Z_$]/.test(token)) {
        let found = false;
        for (let i = scopes.length - 1; i >= 0; i--) {
          if (scopes[i].has(token)) {
            found = true;
            break;
          }
        }
        if (!found) {
          //globalVars.add(token);
        }
      } else if (token === '{') {
        level += 1;
        scopes.push(new Set());
      } else if (token === '}') {
        level -= 1;
        scopes.pop();
      }
    }

  });
  let result = {};
  result.var = globalVars;
  result.func = globalFuncs;
  return result;
}

function testFindGlobal() {
  const jsCode = `
    let x = 42;
    const y = 3.14;
    /* let x1 = 100; */
    // let z = 100;
    function foo() {
      let z = 100;
      function local(){
        console.log('local');
      }
      console.log('Hello, world!');
      local();
    }
  `;

  // const tokens = jsCode.match(/\/\/.*?$|\/\*[\s\S]*?\*\/|([a-zA-Z_$][a-zA-Z0-9_$]*)|\b(let|const)\b/gm);
  // //const tokens = jsCode.match(/\/\/.*?$|[^\S\r\n]+|\r?\n|\/\*[\s\S]*?\*\/|([a-zA-Z_$][a-zA-Z0-9_$]*)|\b(let|const)\b/gm);

  // const globalVars = new Set();

  // let inComment = false;
  // const scopes = [];

  // tokens.forEach((token, index) => {
  //     if (token === '/*') {
  //         // inComment = true;
  //     } else if (token === '*/') {
  //         // inComment = false;
  //     } else if (token.startsWith('//')) {
  //         // Ignore line comments
  //     } else if (!inComment) {
  //         if (token === 'let' || token === 'const') {
  //             const nextToken = tokens[index + 1];
  //             if (/^[a-zA-Z_$]/.test(nextToken)) {
  //                 const currentScope = scopes[scopes.length - 1];
  //                 if (!currentScope || !currentScope.has(nextToken)) {
  //                     globalVars.add(nextToken);
  //                 }
  //                 currentScope && currentScope.add(nextToken);
  //             }
  //         } else if (/^[a-zA-Z_$]/.test(token)) {
  //             let found = false;
  //             for (let i = scopes.length - 1; i >= 0; i--) {
  //                 if (scopes[i].has(token)) {
  //                     found = true;
  //                     break;
  //                 }
  //             }
  //             if (!found) {
  //                 //globalVars.add(token);
  //             }
  //         } else if (token === '{') {
  //             scopes.push(new Set());
  //         } else if (token === '}') {
  //             scopes.pop();
  //         }
  //     }
  // });

  const result = javaScriptFindGlobal(jsCode);

  console.log(result.var);
  console.log(result.func);

}

function testFindGlobal2() {
  const jsCode = `
    let x = 42;
    const y = 3.14;
    function foo() {
      let z = 100;
      console.log(x + y + z);
      function subfoo(){

      }
      subfoo(){
        y = 3;
      };
    }
    foo();
  `;

  const tokens = jsCode.match(/\/\/.*?$|[^\S\r\n]+|\r?\n|\/\*[\s\S]*?\*\/|([a-zA-Z_$][a-zA-Z0-9_$]*)|[\{\}]|[\(\)]|\b(let|const|function)\b/gm);

  const variables = {};
  const functions = {};

  let inComment = false;
  let currentFunction = null;

  let skipCount = 0;
  let level = 0;

  tokens.forEach((token, index) => {
    if (skipCount > 0) {
      skipCount -= 1;
      return;
    }
    if (token === '/*') {
      inComment = true;
    } else if (token === '*/') {
      inComment = false;
    } else if (token.startsWith('//')) {
      // Ignore line comments
    } else if (!inComment) {
      if (token === 'function') {
        let nextToken = tokens[index + 1];
        skipCount = 1;
        if (/^\s*$/.test(nextToken)) {
          nextToken = tokens[index + 2];
          skipCount = 2;
        }
        if (/^[a-zA-Z_$]/.test(nextToken)) {
          if (level == 0) {
            currentFunction = nextToken;
            functions[currentFunction] = {
              definition: index,
              uses: []
            };
          }
        }
      } else if (/^[a-zA-Z_$]/.test(token)) {
        let nextToken = tokens[index + 1];
        if (nextToken === '(') {
          functions[token] && functions[token].uses.push(index);
        } else {
          if (token === 'let' || token === 'const') {
            // ignore
          } else {
            if (level == 0) {
              const variable = variables[token] || {
                definition: index,
                uses: []
              };
              variable.uses.push(index);
              variables[token] = variable;
            } else {
              if (typeof variables[token] !== 'undefined') {
                const variable = variables[token]
                variable.uses.push(index);
                variables[token] = variable;
              }
            }
          }
        }
        if (currentFunction) {
          //functions[currentFunction].uses.push(index);
        }
      } else if (token === '{') {
        if (level == 0) {
          if (currentFunction) {
            functions[currentFunction] && (functions[currentFunction].bodyStart = index);
          }
        }
        level += 1;
      } else if (token === '}') {

        if (level == 1) {
          if (currentFunction) {
            functions[currentFunction] && (functions[currentFunction].bodyEnd = index);
            currentFunction = null;
          }
        }
        level -= 1;
      }
    }
  });

  console.log('Variables:', variables);
  console.log('Functions:', functions);

}