        async function LoadModel() {
            'use strict';
            // open file picker
            [fileHandle] = await window.showOpenFilePicker();

            if (fileHandle.kind === 'file') {
                // run file code
                // get file contents
                const fileData = await fileHandle.getFile();
                const contents = await fileData.text();
                initializeBuildModel();
                // let len = 0;
                const len = contents.length;
                let counter = 0;
                let cont = '';
                let nest = 0;
                let nestOld = 0;
                let isString = false;
                let countNewLine = 0;
                let elementName = '';
                let attrName = '';
                let isGrouping = false;
                let isParentChild = false;
                let isCode = false;
                let isData = false;
                let isCall = false;
                let isAccess = false;
                let countGrouping = 0;
                let countParentChild = 0;
                let countCode = 0;
                let countData = 0;
                let countCall = 0;
                let countAccess = 0;
                let countUnknownElement = 0;
                let expectAttrName = false;
                let attrNameFound = false;
                let expectValNode = false;
                let valNode = '';
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
                do {
                    let char = contents.at(counter);
                    if (char == '(' && !isString) {
                        // cont = cont + char;
                        nest = nest + 1;
                    }
                    else if (char == ')' && !isString) {
                        // cont = cont + char;
                        nest = nest - 1;
                    }
                    else if (char == '\'') {
                        // String separator found
                    }
                    else if (char == '\\') {
                        // Masking found
                    }
                    else if (char == '\n') {
                        // New line found
                        countNewLine = countNewLine + 1;
                    }
                    else if (char == '\r') {
                        // Cariage Return found
                    }
                    else {

                        if (nest == 2) {
                            // The Elementname is always on level 2. And it is the only information that is present here
                            if (nestOld == 1) {
                                elementName = '';
                            };
                            if (char != ' ') {
                                elementName = elementName + char
                            }
                        }
                        else if (nest == 3) {
                            if (expectAttrName && char != ' ') {
                                attrName = attrName + char;
                            }
                            if (expectValNode) {
                                valNode = valNode + char;
                            }

                        }
                        else if (nest == 4) {
                            if (valNode == 'ref:') {
                                valNode = ''; // Remove prefix ref:
                            }
                            valNode = valNode + char;
                        }

                    };
                    // cont = cont + char;

                    if (nest == 3) {
                        if (nestOld == 2) {
                            // When the level switches to 3 this is a sign that the Elementname is completly read
                            isGrouping = false;
                            isParentChild = false;
                            isCode = false;
                            isData = false;
                            isCall = false;
                            isAccess = false;
                            switch (elementName) {
                                case 'SOMIX.Grouping':
                                    isGrouping = true;
                                    countGrouping += 1;
                                    break;
                                case 'SOMIX.ParentChild':
                                    isParentChild = true;
                                    countParentChild += 1;
                                    break;
                                case 'SOMIX.Code':
                                    isCode = true;
                                    countCode += 1;
                                    break;
                                case 'SOMIX.Data':
                                    isData = true;
                                    countData += 1;
                                    break;
                                case 'SOMIX.Call':
                                    isCall = true;
                                    countCall += 1;
                                    break;
                                case 'SOMIX.Access':
                                    isAccess = true;
                                    countAccess += 1;
                                    break;
                                default:
                                    countUnknownElement += 1;
                            };
                        };
                        // Now analyze serial or attributes
                        if (nestOld == 2) {
                            attrName = '';
                            expectAttrName = true;
                        };
                        if (expectAttrName && char == ' ') {
                            expectAttrName = false;
                            attrNameFound = true;
                            expectValNode = true;
                            valNode = '';
                        }



                    }
                    else if (nest == 2) {
                        if (expectValNode) {
                            // Attribute Name and value Node are now found
                            // cont = cont + elementName + ' A: ' + attrName + ' V: ' + valNode + '|';
                            expectValNode = false;

                            // This is now the place where the values are known
                            switch (attrName) {
                                case 'id:':
                                    idVal = Number(valNode);
                                    break;
                                case 'name':
                                    nameVal = valNode;
                                    break;
                                case 'uniqueName':
                                    uniqueNameVal = valNode;
                                    break;
                                case 'technicalType':
                                    technicalTypeVal = valNode;
                                    break;
                                case 'linkToEditor':
                                    linkToEditorVal = valNode;
                                    break;
                                case 'parent':
                                    parentVal = Number(valNode);
                                    break;
                                case 'child':
                                    childVal = Number(valNode);
                                    break;
                                case 'isMain':
                                    if (valNode == 'true') {
                                        isMainVal = true;
                                    }
                                    break;
                                case 'caller':
                                    callerVal = Number(valNode);
                                    break;
                                case 'called':
                                    calledVal = Number(valNode);
                                    break;
                                case 'accessor':
                                    accessorVal = Number(valNode);
                                    break;
                                case 'accessed':
                                    accessedVal = Number(valNode);
                                    break;
                                case 'isWrite':
                                    if (valNode == 'true') {
                                        isWriteVal = true;
                                    }
                                    break;
                                case 'isRead':
                                    if (valNode == 'true') {
                                        isReadVal = true;
                                    }
                                    break;
                                case 'isDependent':
                                    if (valNode == 'true') {
                                        isDependentVal = true;
                                    }
                                    break;
                            }


                        }
                    }
                    else if (nest == 1) {
                        if (elementName != '') {
                            // This is now the place where the values are stored
                            cont = cont + buildModel(elementName, idVal, nameVal, uniqueNameVal, technicalTypeVal, linkToEditorVal, parentVal, childVal, isMainVal, callerVal, calledVal, accessorVal, accessedVal, isWriteVal, isReadVal, isDependentVal);

                            // switch (elementName) {
                            //     case 'SOMIX.Grouping':
                            //         cont = cont + elementName + ' name: ' + nameVal + ' uniqueName: ' + uniqueNameVal + ' technicalType: ' + technicalTypeVal + '|';
                            //         break;
                            //     case 'SOMIX.ParentChild':
                            //         cont = cont + elementName + ' parent: ' + parentVal  + ' child: ' + childVal + ' isMain: ' + isMainVal + '|';
                            //         break;
                            //     case 'SOMIX.Code':
                            //         cont = cont + elementName + ' name: ' + nameVal + ' uniqueName: ' + uniqueNameVal + ' technicalType: ' + technicalTypeVal + '|';
                            //         break;
                            //     case 'SOMIX.Data':
                            //         cont = cont + elementName + ' name: ' + nameVal + ' uniqueName: ' + uniqueNameVal + ' technicalType: ' + technicalTypeVal + '|';
                            //         break;
                            //     case 'SOMIX.Call':
                            //         cont = cont + elementName + ' caller: ' + callerVal + ' called: ' + calledVal + '|';
                            //         break;
                            //     case 'SOMIX.Access':
                            //         cont = cont + elementName + ' accessor: ' + accessorVal + ' accessed: ' + accessedVal + ' isWrite: ' + isWriteVal + ' isRead: ' + isReadVal + ' isDependent: ' + isDependentVal + '|';
                            //         break;
                            //     default:
                            //         countUnknownElement += 1;
                            // };


                        }
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

                    counter = counter + 1;
                    nestOld = nest;
                } while (counter < len);
                paragraph.textContent = cont;

            } else if (fileHandle.kind === 'directory') {
                // run directory code
            }
            // paragraph.textContent = 'The button was pressed';
        }