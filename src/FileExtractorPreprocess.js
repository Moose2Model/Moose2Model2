'use strict';

// Example
async function* getFilesRecursively(entry) {
    if (entry.kind === 'file') {
        const file = await entry.getFile();
        if (file !== null) {
            //file.relativePath = await directoryHandle.resolve(entry);
            // file.relativePath = getRelativePath(entry);
            //file.webkitRelativePath = getRelativePath(entry);

            yield file;
        }
    } else if (entry.kind === 'directory') {
        for await (const handle of entry.values()) {
            yield* getFilesRecursively(handle);
        }
    }
}

async function SetExtractedFolder() {
    'use strict';
    try {
        FEDirectoryHandle = await window.showDirectoryPicker();

        // Example
        for await (const fileHandle of getFilesRecursively(FEDirectoryHandle)) {
            console.log(fileHandle);
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
