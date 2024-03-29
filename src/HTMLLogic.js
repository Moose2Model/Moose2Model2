'use strict';


let loadModelText = document.getElementById("LoadedModel");
loadModelText.innerHTML = "No Model loaded";
let infoText = document.getElementById("InfoID");
infoText.innerHTML = "";
let displayedDiagramText = document.getElementById("DisplayedDiagramID");
displayedDiagramText.innerHTML = "Nothing is displayed";
let activeDiagramText = document.getElementById("ActiveDiagramID");
activeDiagramText.innerHTML = "Nothing is active";


if (window.isSecureContext) {
    // window.alert('The browser context is secure. This application will work');
}
else {
    window.alert('The browser context is not secure. This application will not work');
}

// // Do always at start

// startLogic();

async function LoadModel(fileHandle) {
    'use strict';
    let contents;
    // open file picker
    if (!fileHandle) {
        try {
            [fileHandle] = await window.showOpenFilePicker();


        } catch (err) {
            if (err.message == 'The user aborted a request.') { // TODO improve
                // Nothing is to be done
                return;
            } else {
                window.alert("Loading from file is not supported. This application can therefore not be used on this browser.");
                return;
            }
        }
    }

    if (fileHandle.kind === 'file') {
        // run file code
        // get file contents
        const fileData = await fileHandle.getFile();
        contents = await fileData.text();
        document.title = fileData.name;
        loadModelText.innerHTML = 'Loaded SOMIX model: ' + fileData.name;
        useStartDiagram();
        analyzeMseFile(contents);
        positionCircle(g_width, g_height);
        mouseover = true;
        draw();
        ZoomToFit();

    } else if (fileHandle.kind === 'directory') {
        // Inform user that directories are not supported here
    }

}

async function getMostRecentMseFile(workDirectoryHandle) {
    try {

        // Check if SOMIX folder exists in the working directory
        const somixHandle = await workDirectoryHandle.getDirectoryHandle("SOMIX", { create: false });

        // Get all the files in the SOMIX directory
        const mseFiles = [];
        for await (const entry of somixHandle.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.mse')) {
                mseFiles.push(entry);
            }
        }

        // Check if there's at least one .mse file
        if (mseFiles.length === 0) {
            console.log("No .mse files found in SOMIX folder.");
            return null;
        }

        // Find the most recent .mse file based on last modified date
        let mostRecentFileHandle = mseFiles[0];
        let mostRecentFileDate = await getFileLastModifiedDate(mostRecentFileHandle);

        for (const fileHandle of mseFiles) {
            const fileDate = await getFileLastModifiedDate(fileHandle);
            if (fileDate > mostRecentFileDate) {
                mostRecentFileDate = fileDate;
                mostRecentFileHandle = fileHandle;
            }
        }

        return mostRecentFileHandle;
    } catch (error) {
        // This is not an error, it just means that the SOMIX folder doesn't exist
        return null;
    }
}

async function getFileLastModifiedDate(fileHandle) {
    const file = await fileHandle.getFile();
    return file.lastModified;
}



async function SetWorkFolder() {
    'use strict';
    try {
        workDirectoryHandle = await window.showDirectoryPicker();

        if (workDirectoryHandle) {
            let mseFileHandle = await getMostRecentMseFile(workDirectoryHandle);

            if (mseFileHandle) {

                // Inform user that a SOMIX file will be loaded
                ctx.font = '15px sans-serif';
                ctx.fillStyle = fontColor
                ctx.fillText('SOMIX model is found and will be loaded : ' + mseFileHandle.name, 10, 50);

                await LoadModel(mseFileHandle);

                // await ExportModelInformation();

            }
        }

    } catch (err) {
        window.alert("This application is not supported in your browser. Please use a different browser.");
        return;
    }
}

// Function to ensure the 'model_information' directory exists
async function ensureDirectoryExists(directoryHandle) {
    try {
        return await directoryHandle.getDirectoryHandle('model_information', { create: true });
    } catch (error) {
        console.error('Error accessing the directory:', error);
        throw error;
    }
}

// Function to convert the array to CSV format and write it to the file in the specified subdirectory
async function saveArrayToCSV(array, directoryHandle, fileName) {
    try {
        const modelInfoDirHandle = await ensureDirectoryExists(directoryHandle);

        const fileHandle = await modelInfoDirHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();

        const csvData = array.reduce((acc, row, index) => {
            if (!Array.isArray(row) || row.some(cell => cell === undefined)) {
                console.log(`Skipping row at index ${index} due to it being undefined or improperly formatted.`);
                return acc; // Continue with the accumulated data, skipping this row
            }
            const quotedRow = row.map(cell => `"${cell}"`).join(',');
            return acc + quotedRow + '\r\n'; // Use \r\n for line breaks
        }, '').trim();
        

         await writable.write(csvData);
        await writable.close();

        // Display a popup message about the file location
        alert(`Model information has been saved in the CSV file: ${fileName}\nThe file is located in the "model_information" subfolder of the selected work directory.`);
    } catch (error) {
        console.error('Error writing to the file:', error);
    }
}

// Function to count the matches
function countCalls(index) {

    const matchingEntries = callByCalled[index];
    return matchingEntries ? matchingEntries.length : 0;
}
function countAccesses(index) {

    const matchingEntries = accessByAccessed[index];
    return matchingEntries ? matchingEntries.length : 0;
}

// Function to find the main group name for a given element index
// function findMainGroupName(index) {
//     const parentChild = parentChildByChild[index];
//     if (parentChild && parentChild.isMain) {
//         const mainParentIndex = parentChild.parent;
//         const mainParentElement = modelElementsByIndex[mainParentIndex];
//         return mainParentElement ? mainParentElement.name : 'No Main Group';
//     }
//     return 'No Main Group';
// }

// Function to find the main group name for a given element index
function findMainGroupName(index) {
    const parentChildRelations = parentChildByChild[index];
    if (parentChildRelations && parentChildRelations.length > 0) {
        // Find the 'main' parent relationship
        const mainRelation = parentChildRelations.find(rel => rel.isMain);
        if (mainRelation) {
            const mainParentIndex = mainRelation.parent;
            const mainParentElement = modelElementsByIndex[mainParentIndex];
            return mainParentElement ? mainParentElement.name : 'No Main Group';
        }
    }
    return 'No Main Group';
}

function ExportModelInformation() {

    // Check if the directory handle is provided
    if (!workDirectoryHandle) {
        alert('Please specify a work directory first.');
        return; // Exit the function if no directory handle is provided
    }

    // Check if modelElementsByIndex is empty
    if (modelElementsByIndex.length === 0) {
        alert('No model data loaded. Please load a model first.');
        return; // Exit the function if no model data is loaded
    }

    // CSV headers
    const headers = ['Index', 'Technical Type', 'Unique Name', 'Main Group', 'Name', 'Number of calls'];

    // CSV headers
    // const headers = ['Index', 'Technical Type', 'Unique Name', 'Name', 'Number of calls'];

    const extractedData = modelElementsByIndex
        .map(item => [
            item.index,
            item.technicalType,
            item.uniqueName,
            findMainGroupName(item.index), // Add main group name
            item.name,
            countCalls(item.index) + countAccesses(item.index)
        ])
        .slice(1); // Skip the first entry

    // const extractedData = modelElementsByIndex
    //     .map(item => [
    //         item.index,
    //         item.technicalType,
    //         item.uniqueName,
    //         item.name,
    //         countCalls(item.index) + countAccesses(item.index)

    //     ])
    //     .slice(1); // Skip the first entry because it is never filled in these tables

    // Merging the headers and extracted data
    const tableData = [headers, ...extractedData];

    // Calling the function to write the array to the CSV file
    saveArrayToCSV(tableData, workDirectoryHandle, 'Usage.txt');
}

