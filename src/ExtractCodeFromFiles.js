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

function javaScriptFindGlobal2(jsCode) {

  // This is currently a draft
  // Shadowing by local variables and functions is not handled
  // Ambiguity due to variables and functions with the same name is not handled
  // Positions are returned as index. But no logic exists to find which function uses a variable
  // Because positions are referenced as index, stable unit tests are difficult to implement
  // Required is the logic to say whether something is used global (In that case in which file) or in a global function

  const tokens = jsCode.match(/\/\/.*?$|[^\S\r\n]+|\r?\n|\/\*[\s\S]*?\*\/|([a-zA-Z_$][a-zA-Z0-9_$]*)|[\{\}]|[\(\)]|\b(let|const|function)\b/gm);

  const variables = {};
  const functions = {};

  let inComment = false;
  let currentFunction = '';

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
          //functions[token] && functions[token].uses.push(index);
          functions[token] && functions[token].uses.push(currentFunction);
        } else {
          if (token === 'let' || token === 'const') {
            // ignore
          } else {
            if (level == 0) {
              const variable = variables[token] || {
                definition: index,
                uses: []
              };
              //variable.uses.push(index);
              variable.uses.push(currentFunction);
              variables[token] = variable;
            } else {
              if (typeof variables[token] !== 'undefined') {
                const variable = variables[token]
                //variable.uses.push(index);
                variable.uses.push(currentFunction);
                variables[token] = variable;
              }
            }
          }
        }
        if (currentFunction !== '') {
          //functions[currentFunction].uses.push(index);
        }
      } else if (token === '{') {
        if (level == 0) {
          if (currentFunction !== '') {
            functions[currentFunction] && (functions[currentFunction].bodyStart = index);
          }
        }
        level += 1;
      } else if (token === '}') {

        if (level == 1) {
          if (currentFunction !== '') {
            functions[currentFunction] && (functions[currentFunction].bodyEnd = index);
            currentFunction = '';
          }
        }
        level -= 1;
      }
    }
  });
  let result = {};
  for (let v in variables) {
    (variables[v].uses) && variables[v].uses.sort();
    (variables[v].uses) && (variables[v].uses = [...new Set(variables[v].uses)]);
  }
  for (let f in functions) {
    (functions[f].uses) && functions[f].uses.sort();
    (functions[f].uses) && (functions[f].uses = [...new Set(functions[f].uses)]);
  }
  result.variables = variables;
  result.functions = functions;
  return result;
}

function testFindGlobal2() {
  const jsCode = `
    let x = 42;
    const y = 3.14;
    // const yc = 3.14;
    /* 
    const yd = 3.14; 
    */
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
    function foo2(){
      foo();
    }
  `;

  const result = javaScriptFindGlobal2(jsCode);

  console.log('Variables:', result.variables);
  console.log('Functions:', result.functions);

}