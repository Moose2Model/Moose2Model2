'use strict';
async function SetExtractedFolder() {
    'use strict';
    try {
        FEDirectoryHandle = await window.showDirectoryPicker();
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
