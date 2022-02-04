'use strict';


let loadModelText = document.getElementById("LoadedModel");
loadModelText.innerHTML = "No Model loaded";
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

async function LoadModel() {
    'use strict';
    let contents;
    // open file picker
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

    } else if (fileHandle.kind === 'directory') {
        // Inform user that directories are not supported here
    }

}

async function SetWorkFolder() {
    'use strict';
    try {
        workDirectoryHandle = await window.showDirectoryPicker();
        for await (const entry of workDirectoryHandle.values()) {
            console.log(entry.kind, entry.name);
        }
        await workDirectoryHandle.removeEntry('d2.txt');
        console.log('After removing');
        for await (const entry of workDirectoryHandle.values()) {
            console.log(entry.kind, entry.name);
        }
    } catch (err) {
        window.alert("Accessing a directory failed");
        return;
    }
}

