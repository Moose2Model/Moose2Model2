'use strict';

function getRelativePath(array) {
    let path = '';
    for (const a of array) {
        path = path + '\\' + a;
    }
    return path;
}

// Example
async function* getFilesRecursively(entry, directoryArray) {
    if (entry.kind === 'file') {
        const file = await entry.getFile();
        if (file !== null) {
            //file.relativePath = await directoryHandle.resolve(entry);
            file.relativePath = getRelativePath(directoryArray);
            //file.webkitRelativePath = getRelativePath(entry);

            yield file;
        }
    } else if (entry.kind === 'directory') {
        directoryArray.push(entry.name);
        for await (const handle of entry.values()) {
            yield* getFilesRecursively(handle, directoryArray);
        }
        directoryArray.pop();
    }
}

async function SetExtractedFolder() {
    'use strict';
    try {
        window.alert("This function is currently implemented. It will not either not work, or not work properly");

        FEDirectoryHandle = await window.showDirectoryPicker();

        // Example
        // See https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/resolve
        for await (const fileHandle of getFilesRecursively(FEDirectoryHandle, [])) {
            console.log(fileHandle);
            /*             const relativePaths = await FEDirectoryHandle.resolve(fileHandle);
            
                        if (relativePaths === null) {
                            // Not inside directory handle
                          } else {
                            // relativePath is an array of names, giving the relative path
                        
                            for (const name of relativePaths) {
                              // log each entry
                              console.log(name);
                            }
                          } */

            /*             for (const name of relativePaths) {
                            // log each entry
                            console.log(name);
                        } */
        }


        // for await (const entry of workDirectoryHandle.values()) {
        //     console.log(entry.kind, entry.name);
        // }
        // await workDirectoryHandle.removeEntry('d2.txt');
        // console.log('After removing');
        // for await (const entry of workDirectoryHandle.values()) {
        //     console.log(entry.kind, entry.name);
        // }
    } catch (err) {
        window.alert("Accessing a directory failed");
        return;
    }
}
