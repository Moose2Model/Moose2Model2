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