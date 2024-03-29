
'use strict';

function getRelativePath(array) {
    let path = '';
    for (const a of array) {
        path = path + '\\' + a;
    }
    return path;
}
// Add comment to the next variable
/**  Points to the next unused index in a model */
let gIndex;

async function* getFilesRecursively(fileInfo) {
    let parentIndex = fileInfo.parentIndex;
    if (fileInfo.handle.kind === 'file') {
        try {
            // fileInfo.file = await fileInfo.handle.getFile();
        } catch (err2) {
            window.alert("Getting files failed");
            return;
        }
        //if (fileInfo.file !== null) {
        //fileInfo.file.relativePath = getRelativePath(fileInfo.directoryArray);
        fileInfo.parentIndex = parentIndex;
        fileInfo.index = gIndex;
        gIndex += 1;
        yield fileInfo;
        //}
    } else if (fileInfo.handle.kind === 'directory') {
        if (ignoreDotGitFolder && fileInfo.name != '.git') {
            fileInfo.directoryArray.push(fileInfo.handle.name);
            fileInfo.parentIndex = parentIndex;
            fileInfo.index = gIndex;
            gIndex += 1;
            yield fileInfo;
            for await (const handle of fileInfo.handle.values()) {
                let fileInfoNewDirectory = {};
                fileInfoNewDirectory.handle = handle;
                fileInfoNewDirectory.index = gIndex;
                //gIndex += 1;
                fileInfoNewDirectory.parentIndex = fileInfo.index;
                fileInfoNewDirectory.kind = handle.kind;
                fileInfoNewDirectory.name = handle.name;
                fileInfoNewDirectory.directoryArray = fileInfo.directoryArray;
                fileInfoNewDirectory.file = {};
                //yield fileInfoNewDirectory;
                yield* getFilesRecursively(fileInfoNewDirectory);
            }
        }
        fileInfo.directoryArray.pop();
    }

}

// Todo: 
// Do not list only files, but files and directories.
// fileInfo with therefore contains file system elements. 
// Which are either: Directories - Mapped to SOMIX Groupings
//                   Files - Mapped to SOMIX Groupings
// The code (and data) of files is then a children of the SOMIX Groupings of the file
// A directory which contains further directory is modelled as SOMIX Groupings where one is the parent of the other one
// This has to be specified in a separate document where the handling of files in SOMIX is specified.

async function SetExtractedFolder() {
    'use strict';
    // window.alert("This function is currently implemented. It will not either not work, or not work properly");
    if (typeof window.showDirectoryPicker === 'function') {
        try {
            // Attempt to execute the code
            FEDirectoryHandle = await window.showDirectoryPicker();
        } catch (error) {
            // An error occurred, likely due to browser compatibility
            displayBrowserError();
        }
    } else {
        // showDirectoryPicker is not supported
        displayBrowserError();
    }

    // From async function LoadModel() part 1


    document.title = FEDirectoryHandle.name;
    loadModelText.innerHTML = 'Loaded SOMIX model (File System): ' + document.title;
    useStartDiagram();


    try {

        initializeBuildModel();
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
        gIndex = 1;
        fileInfoStart.parentIndex = 0.
        fileInfoStart.kind = FEDirectoryHandle.kind;
        fileInfoStart.name = FEDirectoryHandle.name;
        fileInfoStart.directoryArray = [];
        fileInfoStart.file = {};
        for await (const fileInfo of getFilesRecursively(fileInfoStart)) {
            // console.log(fileInfo.kind);
            // console.log(fileInfo.index);
            // console.log(fileInfo.parentIndex);
            // console.log(fileInfo.name);
            // console.log(fileInfo.directoryArray);
            //console.log(fileInfo.file);
            if (fileInfo.handle.kind === 'file') {
                elementName = 'SOMIX.Data';
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
    } catch (err) {
        window.alert("This application is not supported in your browser. Please use a different browser.");
        return;
    }

    // From async function LoadModel() part 2

    positionCircle(g_width, g_height);
    mouseover = true;
    draw();
    ZoomToFit();
}

// Function to display the browser error message
function displayBrowserError() {
    window.alert("This feature is not supported in your browser. Please use a different browser.");
}

async function ExtractCodeFromFolder() {
    'use strict';
    window.alert("Extracted is currently only JavaScript code. The parsing logic is currently developed. Assume it to be a prove of concept. Feel free to propose improvements.");

    if (typeof window.showDirectoryPicker === 'function') {
        try {
            // Attempt to execute the code
            FEDirectoryHandle = await window.showDirectoryPicker();
        } catch (error) {
            // An error occurred, likely due to browser compatibility
            displayBrowserError();
        }
    } else {
        // showDirectoryPicker is not supported
        displayBrowserError();
    }

    // From async function LoadModel() part 1


    document.title = FEDirectoryHandle.name;
    loadModelText.innerHTML = 'Loaded SOMIX model (File System): ' + document.title;
    useStartDiagram();




    /*     initializeBuildModel();
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
        let isDependentVal = false; */

    let fileInfoStart = {};
    fileInfoStart.handle = FEDirectoryHandle;
    fileInfoStart.index = 0;
    gIndex = 1;
    fileInfoStart.parentIndex = 0.
    fileInfoStart.kind = FEDirectoryHandle.kind;
    fileInfoStart.name = FEDirectoryHandle.name;
    fileInfoStart.directoryArray = [];
    fileInfoStart.file = {};
    for await (const fileInfo of getFilesRecursively(fileInfoStart)) {

        fileInfoByIndex[fileInfo.index] = {};
        fileInfoByIndex[fileInfo.index].handle = fileInfo.handle;
        fileInfoByIndex[fileInfo.index].index = fileInfo.index;
        fileInfoByIndex[fileInfo.index].parentIndex = fileInfo.parentIndex;
        fileInfoByIndex[fileInfo.index].kind = fileInfo.kind;
        fileInfoByIndex[fileInfo.index].name = fileInfo.name;
        fileInfoByIndex[fileInfo.index].extension = fileInfo.name.split('.').pop().toLowerCase();
        fileInfoByIndex[fileInfo.index].file = {};
        fileInfoByIndex[fileInfo.index].directoryArray = [];

        if (fileInfo.handle.kind === 'file') {
            fileInfoByIndex[fileInfo.index].file = await fileInfo.handle.getFile();
        }

        for (const d of fileInfo.directoryArray) {
            fileInfoByIndex[fileInfo.index].directoryArray.push(d);
        }

    }

    await AnalyzeFileAndFolder();

    // From async function LoadModel() part 2

    positionCircle(g_width, g_height);
    mouseover = true;
    draw();
    ZoomToFit();

}
