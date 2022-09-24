'use strict';
/** Contains a handle to a folder where code is extracted */
let FEDirectoryHandle;

/** Contains an array where elememts of a folder of a file system are placed at their index and an object is contained with this structure:
*const fileInfo = {
    handle: A FileSystemDirectoryHandle when kind is 'directory', FileSystemFileHandle when kind is 'file'
    index: 
    parentIndex: 
    kind: file or directory
    name: 
    directoryArray:
    file: when kind is file a File (prototype)
};
*/
let fileInfoByIndex = [];
let ignoreDotGitFolder = true;