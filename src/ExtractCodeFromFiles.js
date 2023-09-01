'use strict';
/**
 * Analyzes the code in files.
 */

const nameOfFileLogic = 'code';


function javaScriptFindGlobal6(indexHTML, indexModel, codeParts) {

  // This is currently a draft
  // Shadowing by local variables and functions is not handled
  // Ambiguity due to variables and functions with the same name is not needed to be handled. This appears to forbidden in strict mode. And otherwise fucntions overwrite the variable.

  const variables = {};
  const functions = {};

  let analyseUsage = false;

  // First loop: Find all functions and variables
  // Second loop: Find all function calls and variable uses 
  for (let loop = 0; loop < 2; loop++) {

    if (loop == 1) { analyseUsage = true; };

    let currentFunction = '';
    let currentFunctionIndex = indexHTML;
    let currentFunctionContainer = {};


    let skipCount = 0;
    let level = 0;
    let braketLevel = 0;
    for (const codePart of codeParts) { // for (const codePart of codeParts)
      if (codePart.code) {

        const codeContainerName = codePart.codeContainer.name;
        const codeContainerIndex = codePart.codeContainer.index;

        currentFunctionContainer.currentFunction = codeContainerName;
        currentFunctionContainer.currentFunctionIndex = codeContainerIndex;

        // Known errors:
        // Thic code finds tokens in multiline comments

        let tokens = codePart.code.match(/\/\/.*?$|:|[^\S\r\n]+|\r?\n|\/\*[\s\S]*?\*\/|(['"`])(.*?)\1|([a-zA-Z_$][a-zA-Z0-9_$]*)|[\{\}]|[\(\)]|\b(let|const|function)\b/gm);


        //   /\/\/.*?$       // Match single-line comments
        //   |               // OR
        //   :               // Match colon symbol
        //   |               // OR
        //   [^\S\r\n]+      // Match whitespace characters except newlines
        //   |               // OR
        //   \r?\n          // Match newline characters
        //   |               // OR
        //   \/\*[\s\S]*?\*\/  // Match multiline comments
        //   |               // OR
        //      (['"`])(.*?)\1  // Matches strings enclosed in single quotes, double quotes, or b
        //   |               // OR
        //   ([a-zA-Z_$][a-zA-Z0-9_$]*)  // Match variables or identifiers
        //   |               // OR
        //   [\{\}]          // Match curly brackets
        //   |               // OR
        //   [\(\)]          // Match parentheses
        //   |               // OR
        //   \b(let|const|function)\b  // Match keywords (let, const, function)
        // /gm);


        if (tokens) {
          tokens.forEach((token, index) => { // tokens.forEach

            if (token === '(') {
              braketLevel += 1;
            }
            if (token === ')') {
              braketLevel -= 1; // TODO check for negative values 
              if (braketLevel < 0) {
                braketLevel = 0;
              }
            }

            if (token === '{') {
              braketLevel = 0;
            }
            if (token === '}') {
              braketLevel = 0;
            }

            if (skipCount > 0) {
              skipCount -= 1;
              return;
            }

            else if (token === 'function') {
              let nextToken = tokens[index + 1];
              skipCount = 1;
              if (/^\s*$/.test(nextToken)) {
                nextToken = tokens[index + 2];
                skipCount = 2;
              }
              if (/^[a-zA-Z_$]/.test(nextToken)) {
                if (level == 0) {
                  currentFunction = nextToken;
                  currentFunctionIndex = indexModel;
                  currentFunctionContainer.currentFunction = currentFunction;
                  currentFunctionContainer.currentFunctionIndex = currentFunctionIndex;
                  functions[currentFunction] = {
                    index: indexModel,
                    container: codePart.container,
                    used: []
                  };
                  indexModel += 1;
                }
              }
            } else if (/^[a-zA-Z_$]/.test(token)) {
              let nextToken = tokens[index + 1];
              let nextToken2 = tokens[index + 2];
              if (nextToken === '(') {
                // Create a copy of the original object
                if (analyseUsage) {
                  var copiedObject = Object.assign({}, currentFunctionContainer);
                  functions[token] && functions[token].used && functions[token].used.push(copiedObject);
                }
              } else if (nextToken === ':' || (/^\s*$/.test(nextToken) && nextToken2 === ':')) // Check for '{ x:' or '{ x :' these are no references to variables
              {
                // ignore this is a specification for a class member
              }
              else {
                const reservedWords = [
                  'abstract', 'await', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
                  'continue', 'debugger', 'default', 'delete', 'do', 'double', 'else', 'enum', 'export', 'extends',
                  'false', 'final', 'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import',
                  'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new', 'null', 'package', 'private',
                  'protected', 'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw',
                  'throws', 'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield'
                  // exclude also constructor
                  , 'constructor'
                ];

                // if (token === 'let' || token === 'const' || token === 'constructor') {
                if (reservedWords.includes(token)) {
                  // ignore
                } else {
                  if (level == 0) {
                    let isExistingVariable = false;
                    if (variables[token]) {
                      isExistingVariable = true;
                    }
                    const variable = variables[token] || {
                      index: indexModel,
                      used: []
                    };
                    if (!isExistingVariable) {
                      indexModel += 1;
                      variable.container = codePart.container;
                    }
                    if (isExistingVariable) {
                      if (analyseUsage) {
                        var copiedObject = Object.assign({}, currentFunctionContainer);
                        variable.used.push(copiedObject);
                      }
                    }
                    if ((!isExistingVariable && braketLevel == 0) || isExistingVariable) {
                      variables[token] = variable;
                    }
                  }
                  else {
                    if (typeof variables[token] !== 'undefined') {
                      const variable = variables[token]
                      // 17.06.2023 This was apparently wrong and caused the container to be overwritten
                      //variable.container = codePart.container;
                      if (analyseUsage) {
                        var copiedObject = Object.assign({}, currentFunctionContainer);
                        variable.used && variable.used.push(copiedObject);
                        variables[token] = variable;
                      }
                    }
                  }
                }
              }
            } else if (token === '{') {
              level += 1;
            } else if (token === '}') {

              if (level == 1) {
                if (currentFunction !== '') {
                  currentFunction = '';
                  currentFunctionIndex = indexHTML;
                  currentFunctionContainer = {};

                  currentFunctionContainer.currentFunction = codeContainerName;
                  currentFunctionContainer.currentFunctionIndex = codeContainerIndex;
                }
              }
              level -= 1;
            }
          } // END tokens.forEach

          );
        }
      }
    } // END for (const codePart of codeParts)
  } // END for const loop of loops
  let result = {};
  for (let v in variables) {

    // Sort the array by currentFunctionIndex
    (variables[v].used) && variables[v].used.sort(function (a, b) {
      return a.currentFunctionIndex - b.currentFunctionIndex;
    });

    // Remove duplicate elements
    (variables[v].used) && (variables[v].used = variables[v].used.filter(function (obj, index, self) {
      return (
        index ===
        self.findIndex(function (o) {
          return (
            o.currentFunction === obj.currentFunction &&
            o.currentFunctionIndex === obj.currentFunctionIndex
          );
        })
      );
    }));


  }
  for (let f in functions) {
    // (functions[f].used) && functions[f].used.sort();
    // (functions[f].used) && (functions[f].used = [...new Set(functions[f].used)]); // Remove duplicates

    // Sort the array by currentFunctionIndex
    (functions[f].used) && functions[f].used.sort(function (a, b) {
      return a.currentFunctionIndex - b.currentFunctionIndex;
    });

    // Remove duplicate elements
    (functions[f].used) && (functions[f].used = functions[f].used.filter(function (obj, index, self) {
      return (
        index ===
        self.findIndex(function (o) {
          return (
            o.currentFunction === obj.currentFunction &&
            o.currentFunctionIndex === obj.currentFunctionIndex
          );
        })
      );
    }));








  }
  result.variables = variables;
  result.functions = functions;
  result.index = indexModel;
  return result;
}



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

  // Add an index for the logic of a file. This is needed to simplify finding the index for the code of a file.

  fileInfoByIndex.forEach((fileInfo, index) => {
    if (fileInfo.kind === 'file') {
      fileInfo.indexOfCode = gIndex;
      gIndex++;
    }
  });

  // Loop 1 where files and folders are analyzed

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

        // Add element for logic of file

        elementName = 'SOMIX.Code';
        idVal = fileInfo.indexOfCode;
        nameVal = nameOfFileLogic;
        uniqueNameVal = uniqueNameVal + '/' + nameVal;
        technicalTypeVal = 'Code';
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

        // Add parent child relationship for logic of file

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
        parentVal = fileInfo.index;
        childVal = fileInfo.indexOfCode;
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


      } else if (fileInfo.handle.kind === 'directory') {
        elementName = 'SOMIX.Grouping';


        idVal = fileInfo.index;
        nameVal = fileInfo.name;
        uniqueNameVal = '';
        for (const e of fileInfo.directoryArray) {
          uniqueNameVal = uniqueNameVal + '/' + e;
        }

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

  // Loop 2 where JavaScript files are analyzed
  for (const fileInfo of fileInfoByIndex) {
    if (fileInfo) {
      if (fileInfo.handle.kind === 'file') {
        // Todo: Analyze content of files only when they are needed
        if (fileInfo.extension == 'html' || fileInfo.extension == 'htm') {
          let htmlFileName = fileInfo.name;
          let htmlFileIndex = fileInfo.index;
          let htmlcodeIndex = fileInfo.indexOfCode;
          let htmlFilePath = '';
          for (const e of fileInfo.directoryArray) {
            htmlFilePath = htmlFilePath + '/' + e;
          }
          let jsCodes = ["","","","",""];
          fileContent = await fileInfo.file.text(); // See https://web.dev/file-system-access/
          let htmlDoc = parseHTML(fileContent);
          let scriptElements = htmlDoc.querySelectorAll('script');
          scriptElements = Array.from(scriptElements);

          // BEGIN Not needed as long as the parser returns the script elements in the correct order

          // let scriptElementsInCorrectOrder = fileContent.match(/<script[\s\S]*?<\/script>/gi);

          // // Normalize line endings to LF ('\n') for all array entries
          // scriptElementsInCorrectOrder = scriptElementsInCorrectOrder.map(entry => entry.replace(/\r\n/g, '\n'));

          // // Sort the scriptElementsArray based on their position in scriptTags
          // scriptElements.sort((a, b) => {
          //   const indexA = scriptElementsInCorrectOrder.indexOf(a.outerHTML);
          //   const indexB = scriptElementsInCorrectOrder.indexOf(b.outerHTML);
          //   return indexA - indexB;
          // });

          // END Not needed as long as the parser returns the script elements in the correct order

          // The content of referenced JavaScript files is read and added to the array jsCodes.
          // This is not trivial, because due to the asynchronous nature of the file system access, 
          // the order of the array jsCodes does not match the order of the script elements in the HTML file
          // when no special actions are taken. Therefore, the script elements are mapped to a new array and an index is added.
          // This index is used to sort the array jsCodes in the correct order.

          const scriptElementIs = scriptElements.map((scriptElement, index) => {

            const modifiedScriptElement = { scriptElement, index };

            return modifiedScriptElement;
          });

          const numberOfEntries = scriptElementIs.length;

          jsCodes = new Array(numberOfEntries).fill("");

          if (Array.isArray(scriptElementIs)) {
            await Promise.all(scriptElementIs.map(async (scriptElementI) => {

              const filePath = scriptElementI.scriptElement.src;

              // Remove the 'file://' protocol from the filePath
              const pathWithoutProtocol = filePath.replace(/^file:\/\//, '');

              // Remove the query parameter from the path
              const pathWithoutQuery = pathWithoutProtocol.split('?')[0];

              // Extract the file name from the path
              const fileName = pathWithoutQuery.split('/').pop();

              // Extract the list of folders
              const folders = pathWithoutQuery.split('/').slice(0, -1);

              let foundFile = {};
              foundFile = fileInfoByIndex.find(obj => ((obj) && (obj.name) && (obj.name === fileName)));
              if (foundFile) {
                let jsContent;
                try {
                  jsContent = await foundFile.file.text();
                } catch (error) { };
                if (jsContent) {
                  let foundFilePath = '';
                  for (const e of foundFile.directoryArray) {
                    foundFilePath = foundFilePath + '/' + e;
                  }
                  jsCodes[scriptElementI.index] = {
                    container: { name: foundFile.name, path: foundFilePath, index: foundFile.index },
                    codeContainer: { name: nameOfFileLogic, path: foundFilePath + '/' + foundFile.name, index: foundFile.indexOfCode },
                    code: jsContent
                  };
                }
              } else {
                jsCodes[scriptElementI.index] = {
                  container: { name: htmlFileName, path: htmlFilePath, index: htmlFileIndex },
                  codeContainer: { name: nameOfFileLogic, path: htmlFilePath + '/' + htmlFileName, index: htmlcodeIndex },
                  code: scriptElementI.scriptElement.textContent
                }
              };


            }));
          }

          // #78 Analyze code here
          let analyzedJSCode = javaScriptFindGlobal6(fileInfo.index, gIndex, jsCodes);
          if (analyzedJSCode.index) {
            gIndex = analyzedJSCode.index;
          }

          // Loop over all functions

          for (let functionName in analyzedJSCode.functions) {
            if (analyzedJSCode.functions.hasOwnProperty(functionName)) {
              const functionData = analyzedJSCode.functions[functionName];
              const memberName = functionName;
              const memberIndex = functionData.index;



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

              elementName = 'SOMIX.Code';
              idVal = memberIndex;
              nameVal = memberName;
              uniqueNameVal = functionData.container.path + '/' + functionData.container.name + '/' + memberName;
              technicalTypeVal = 'JSFunction';

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

              elementName = 'SOMIX.ParentChild';
              parentVal = functionData.container.index;
              childVal = memberIndex;
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

              // console.log(`Member Name: ${memberName}`);
              // console.log(`Member Index: ${memberIndex}`);
              // console.log('--------------------------');
            }
          }


          // Loop over all variables

          for (let variableName in analyzedJSCode.variables) {
            if (analyzedJSCode.variables.hasOwnProperty(variableName)) {
              const variableData = analyzedJSCode.variables[variableName];
              const memberName = variableName;
              const memberIndex = variableData.index;



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

              elementName = 'SOMIX.Data';
              idVal = memberIndex;
              nameVal = memberName;
              uniqueNameVal = variableData.container.path + '/' + variableData.container.name + '/' + memberName;
              technicalTypeVal = 'JSVariable';

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

              elementName = 'SOMIX.ParentChild';
              parentVal = variableData.container.index;
              childVal = memberIndex;
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

            }
          }

          // Loop over all functions to analyze usages

          for (let functionName in analyzedJSCode.functions) {
            if (analyzedJSCode.functions.hasOwnProperty(functionName)) {
              const functionData = analyzedJSCode.functions[functionName];
              const memberName = functionName;
              const memberIndex = functionData.index;

              functionData.used.forEach((element, index) => {
                // Access the properties of each element
                const currentFunction = element.currentFunction;
                const currentFunctionIndex = element.currentFunctionIndex;

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

                elementName = 'SOMIX.Call';
                callerVal = element.currentFunctionIndex;
                calledVal = memberIndex;

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

              });
            }
          }




          // Loop over all variables to analyze accesses

          for (let variableName in analyzedJSCode.variables) {
            if (analyzedJSCode.variables.hasOwnProperty(variableName)) {
              const variableData = analyzedJSCode.variables[variableName];
              const memberName = variableName;
              const memberIndex = variableData.index;
              if (variableData.used) {
                variableData.used.forEach((element, index) => {
                  // Access the properties of each element
                  const currentFunction = element.currentFunction;
                  const currentFunctionIndex = element.currentFunctionIndex;

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

                  elementName = 'SOMIX.Access';
                  accessorVal = element.currentFunctionIndex;
                  accessedVal = memberIndex;

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

                });
              }
            }
          }







        }
      }
    }
  }


}

function testFindGlobal6() {
  const jsCode = `
    let x = 42;
    const y = x; // Has to be found as usage in code of js file
    const cl = {xp: 2};
    analyze('test',foo3);
    // const yc = 3.14;
    /* 
    const yd = 3.14; 
    */
    function foo(para1) {
      let z = 100;
      z1 = 43; // Has to be found as usage due to hoisting
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
      y = 1; 
      const cl = {x: 2};
      const cl = {x : 2};
      foo();
    }
  `;
  const jsCode2 = `foo();
  let z1 = 42;
  x = 1; // Has to be found as usage in code of js file
  function foo3(){}
 `;

  //const jsCodes = [{ container: 'First', codeContainer: 'FirstCode', codeContainerIndex: 100, code: jsCode }, { container: 'Second', codeContainer: 'SecondCode', codeContainerIndex: 101, code: jsCode2 }]
  const jsCodes = [{ container: 'First', codeContainer: { name: 'FirstCode', index: 100 }, code: jsCode }, { container: 'Second', codeContainer: { name: 'SecondCode', index: 101 }, code: jsCode2 }]

  const result = javaScriptFindGlobal6(1, 2, jsCodes);

  console.log('testFindGlobal6');

  console.log('Variables:', result.variables);
  console.log('Functions:', result.functions);
  console.log('Index after analysis:', result.index);

  const variablesExp = {
    x: {
      index: 2, used: [
        { currentFunction: 'foo', currentFunctionIndex: 12 },
        { currentFunction: 'FirstCode', currentFunctionIndex: 100 },
        { currentFunction: 'SecondCode', currentFunctionIndex: 101 },
      ], container: 'First'
    },
    y: {
      index: 3, used: [{ currentFunction: 'foo', currentFunctionIndex: 12 },
      { currentFunction: 'foo2', currentFunctionIndex: 14 },
      { currentFunction: 'FirstCode', currentFunctionIndex: 100 }], container: 'First'
    },
    cl: {
      index: 4, used: [
        { currentFunction: 'foo2', currentFunctionIndex: 14 },
        { currentFunction: 'FirstCode', currentFunctionIndex: 100 }], container: 'First'
    },
    z1: {
      index: 9, used: [
        { currentFunction: 'foo', currentFunctionIndex: 12 },
        { currentFunction: 'SecondCode', currentFunctionIndex: 101 }], container: 'Second'
    }
  };
  const functionsExp = {
    foo: {
      index: 12, container: 'First', used: [
        { currentFunction: 'foo2', currentFunctionIndex: 14 },
        { currentFunction: 'FirstCode', currentFunctionIndex: 100 },
        { currentFunction: 'SecondCode', currentFunctionIndex: 101 }]
    },
    foo2: { index: 14, container: 'First', used: [] },
    foo3: { index: 15, container: 'Second', used: [] }
  };
  const indexExp = 16;

  console.log('VariablesExp:', variablesExp);
  console.log('FunctionsExp:', functionsExp);
  console.log('IndexExp:', indexExp);

  // Check whether analysis is done as expected

  const v1 = JSON.stringify(result.variables);
  const v2 = JSON.stringify(variablesExp);

  const f1 = JSON.stringify(result.functions);
  const f2 = JSON.stringify(functionsExp);

  if (v1 === v2 &&
    f1 === f2 &&
    result.index === indexExp) {
    console.log("OK");
  } else {
    console.log("Error");
    window.alert('Self test testFindGlobal6 failed with an error. The application may not run correct.');
  }



}






