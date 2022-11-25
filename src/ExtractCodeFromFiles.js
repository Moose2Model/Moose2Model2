'use strict';
/**
 * Analyzes the code in files.
 */

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
                fileContent = await myFile.text(); // See https://web.dev/file-system-access/


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