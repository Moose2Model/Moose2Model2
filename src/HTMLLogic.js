'use strict';


let loadModelText = document.getElementById("LoadedModel");
loadModelText.innerHTML = "No Model loaded";

// // const button = document.querySelector('input');
const button = document.getElementById('LoadButton');
// // const paragraph = document.querySelector('p');

button.addEventListener('click', LoadModel);

if (window.isSecureContext) {
    // window.alert('The browser context is secure. This application will work');
}
else {
    window.alert('The browser context is not secure. This application will not work');
}

async function LoadModel() {
    'use strict';
    // open file picker
    [fileHandle] = await window.showOpenFilePicker();

    if (fileHandle.kind === 'file') {
        // run file code
        // get file contents
        const fileData = await fileHandle.getFile();
        const contents = await fileData.text();
        document.title = fileData.name;
        loadModelText.innerHTML = 'Loaded SOMIX model: '+ fileData.name;
        useStartDiagram();
        analyzeMseFile(contents);
        positionCircle(g_width, g_height);
        mouseover = true;
        draw();

    } else if (fileHandle.kind === 'directory') {
        // run directory code
    }

}