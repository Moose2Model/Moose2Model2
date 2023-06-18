'use strict';
/**
 * Analyzes the code in files.
 */




function javaScriptFindGlobal4(indexHTML, indexModel, codeParts) {

  // This is currently a draft
  // Shadowing by local variables and functions is not handled
  // Ambiguity due to variables and functions with the same name is not needed to be handled. This appears to forbidden in strict mode. And otherwise fucntions overwrite the variable.

  const variables = {};
  const functions = {};

  let currentFunction = '';
  let currentFunctionIndex = indexHTML;
  let currentFunctionContainer = {};
  currentFunctionContainer.currentFunction = currentFunction;
  currentFunctionContainer.currentFunctionIndex = currentFunctionIndex;

  let skipCount = 0;
  let level = 0;
  let braketLevel = 0;
  for (const codePart of codeParts) { // for (const codePart of codeParts)
    if (codePart.code) {

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
              var copiedObject = Object.assign({}, currentFunctionContainer);
              functions[token] && functions[token].used && functions[token].used.push(copiedObject);
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
                    var copiedObject = Object.assign({}, currentFunctionContainer);
                    variable.used.push(copiedObject);
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
                    var copiedObject = Object.assign({}, currentFunctionContainer);
                    variable.used && variable.used.push(copiedObject);
                    variables[token] = variable;
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
                currentFunctionContainer.currentFunction = currentFunction;
                currentFunctionContainer.currentFunctionIndex = currentFunctionIndex;
              }
            }
            level -= 1;
          }
        } // END tokens.forEach

        );
      }
    }
  } // END for (const codePart of codeParts)
  let result = {};
  for (let v in variables) {
    // (variables[v].used) && variables[v].used.sort();
    // (variables[v].used) && (variables[v].used = [...new Set(variables[v].used)]); // Remove duplicates


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

function javaScriptFindGlobal5(indexHTML, indexModel, codeParts) {

  // This is currently a draft
  // Shadowing by local variables and functions is not handled
  // Ambiguity due to variables and functions with the same name is not needed to be handled. This appears to forbidden in strict mode. And otherwise fucntions overwrite the variable.

  const variables = {};
  const functions = {};

  let currentFunction = '';
  let currentFunctionIndex = indexHTML;
  let currentFunctionContainer = {};
  currentFunctionContainer.currentFunction = currentFunction;
  currentFunctionContainer.currentFunctionIndex = currentFunctionIndex;

  let skipCount = 0;
  let level = 0;
  let braketLevel = 0;
  for (const codePart of codeParts) { // for (const codePart of codeParts)
    if (codePart.code) {

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
              var copiedObject = Object.assign({}, currentFunctionContainer);
              functions[token] && functions[token].used && functions[token].used.push(copiedObject);
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
                    var copiedObject = Object.assign({}, currentFunctionContainer);
                    variable.used.push(copiedObject);
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
                    var copiedObject = Object.assign({}, currentFunctionContainer);
                    variable.used && variable.used.push(copiedObject);
                    variables[token] = variable;
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
                currentFunctionContainer.currentFunction = currentFunction;
                currentFunctionContainer.currentFunctionIndex = currentFunctionIndex;
              }
            }
            level -= 1;
          }
        } // END tokens.forEach

        );
      }
    }
  } // END for (const codePart of codeParts)
  let result = {};
  for (let v in variables) {
    // (variables[v].used) && variables[v].used.sort();
    // (variables[v].used) && (variables[v].used = [...new Set(variables[v].used)]); // Remove duplicates


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

  // Loop 2 where JavaScript files are analyzed
  for (const fileInfo of fileInfoByIndex) {
    if (fileInfo) {
      if (fileInfo.handle.kind === 'file') {
        // Todo: Analyze content of files only when they are needed
        if (fileInfo.extension == 'html' || fileInfo.extension == 'htm') {
          let htmlFileName = fileInfo.name;
          let htmlFileIndex = fileInfo.index;
          let jsCodes = [];
          fileContent = await fileInfo.file.text(); // See https://web.dev/file-system-access/
          let htmlDoc = parseHTML(fileContent);
          let scriptElements = htmlDoc.querySelectorAll('script');
          //console.log(fileInfo.name);
          //console.log(scriptElements);
          scriptElements = Array.from(scriptElements);
          if (Array.isArray(scriptElements)) {
            await Promise.all(scriptElements.map(async (scriptElement) => {
              //console.log(scriptElement.src);
              //console.log(scriptElement.textContent);

              // A
              const filePath = scriptElement.src;

              // Remove the 'file://' protocol from the filePath
              const pathWithoutProtocol = filePath.replace(/^file:\/\//, '');

              // Remove the query parameter from the path
              const pathWithoutQuery = pathWithoutProtocol.split('?')[0];

              // Extract the file name from the path
              const fileName = pathWithoutQuery.split('/').pop();

              // Extract the list of folders
              const folders = pathWithoutQuery.split('/').slice(0, -1);

              //console.log('File name:', fileName);
              //console.log('Folders:', folders);
              // End A
              let foundFile = {};
              foundFile = fileInfoByIndex.find(obj => ((obj) && (obj.name) && (obj.name === fileName)));
              if (foundFile) {
                let jsContent;
                try {
                  jsContent = await foundFile.file.text();
                } catch (error) { };
                if (jsContent) {
                  jsCodes.push({ container: { name: foundFile.name, index: foundFile.index }, code: jsContent });
                }
              }
              jsCodes.push({ container: { name: htmlFileName, index: htmlFileIndex }, code: scriptElement.textContent });
              // console.log("Tokens:");
              // const tokens = scriptElement.textContent.match(/\b\w+\b|[^\s]/g);
              // if (tokens !== null) {
              //   tokens.forEach(token => {
              //     console.log(token);
              //   });
              // }

            }));
          }


          // #78 Analyze code here
          let analyzedJSCode = javaScriptFindGlobal4(fileInfo.index, gIndex, jsCodes);
          //console.log(analyzedJSCode);
          //console.log(analyzedJSCode.variables.modelElementsByUniqueKey);
          //console.log(analyzedJSCode.variables.modelElementsByIndex);

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
              uniqueNameVal = 'JSFunction ' + memberName;

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
              uniqueNameVal = 'JSVariable ' + memberName;

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

              // console.log(`Member Name: ${memberName}`);
              // console.log(`Member Index: ${memberIndex}`);
              // console.log('--------------------------');
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
                // console.log(`Element ${index + 1}:`);
                // console.log(`Current Function: ${currentFunction}`);
                // console.log(`Current Function Index: ${currentFunctionIndex}`);
                // console.log('--------------------------');

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
                  // console.log(`Element ${index + 1}:`);
                  // console.log(`Current Function: ${currentFunction}`);
                  // console.log(`Current Function Index: ${currentFunctionIndex}`);
                  // console.log('--------------------------');

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

function testFindGlobal4() {
  const jsCode = `
    let x = 42;
    const y = x;
    const cl = {xp: 2};
    // const yc = 3.14;
    /* 
    const yd = 3.14; 
    */
    function foo(para1) {
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
      y = 1; 
      const cl = {x: 2};
      const cl = {x : 2};
      foo();
    }
  `;
  const jsCode2 = `foo();
  let z1 = 42;
 `;

  const jsCodes = [{ container: 'First', code: jsCode }, { container: 'Second', code: jsCode2 }]

  const result = javaScriptFindGlobal4(1, 2, jsCodes);

  console.log('Variables:', result.variables);
  console.log('Functions:', result.functions);
  console.log('Index after analysis:', result.index);

  const variablesExp = {
    x: {
      index: 2, used: [
        { currentFunction: '', currentFunctionIndex: 1 },
        { currentFunction: 'foo', currentFunctionIndex: 5 }], container: 'First'
    },
    y: {
      index: 3, used: [{ currentFunction: 'foo', currentFunctionIndex: 5 },
      { currentFunction: 'foo2', currentFunctionIndex: 7 }], container: 'First'
    },
    cl: {
      index: 4, used: [
        { currentFunction: 'foo2', currentFunctionIndex: 7 }], container: 'First'
    },
    z1: { index: 8, used: [], container: 'Second' }
  };
  const functionsExp = {
    foo: { index: 5, container: 'First', used: [{ currentFunction: '', currentFunctionIndex: 1 }, { currentFunction: 'foo2', currentFunctionIndex: 7 }] },
    foo2: { index: 7, container: 'First', used: [] }
  };
  const indexExp = 9;

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
    window.alert('Self test testFindGlobal3 failed with an error. The application may not run correct.');
  }



}

function testFindGlobal5() {
  const jsCode = `
    let x = 42;
    const y = x; // Has to be found as usage in code of js file
    const cl = {xp: 2};
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
 `;

  const jsCodes = [{ container: 'First', code: jsCode }, { container: 'Second', code: jsCode2 }]

  const result = javaScriptFindGlobal5(1, 2, jsCodes);

  console.log('Variables:', result.variables);
  console.log('Functions:', result.functions);
  console.log('Index after analysis:', result.index);

  const variablesExp = {
    x: {
      index: 2, used: [
        { currentFunction: '', currentFunctionIndex: 1 },
        { currentFunction: 'foo', currentFunctionIndex: 5 }], container: 'First'
    },
    y: {
      index: 3, used: [{ currentFunction: 'foo', currentFunctionIndex: 5 },
      { currentFunction: 'foo2', currentFunctionIndex: 7 }], container: 'First'
    },
    cl: {
      index: 4, used: [
        { currentFunction: 'foo2', currentFunctionIndex: 7 }], container: 'First'
    },
    z1: { index: 8, used: [], container: 'Second' }
  };
  const functionsExp = {
    foo: { index: 5, container: 'First', used: [{ currentFunction: '', currentFunctionIndex: 1 }, { currentFunction: 'foo2', currentFunctionIndex: 7 }] },
    foo2: { index: 7, container: 'First', used: [] }
  };
  const indexExp = 9;

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
    window.alert('Self test testFindGlobal3 failed with an error. The application may not run correct.');
  }



}

