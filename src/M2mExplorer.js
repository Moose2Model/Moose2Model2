'use strict';

let m2mFilesInFolder = [];
let startM2mExplorerLine = 0;
let scrollM2mExplorerLine = 1;
let endM2mExplorerLine = 1;
let listPositionToEntries2 = [];

async function* getM2mFilesRecursively(entry, layer) {
  if (entry.kind === 'file') {
    const file = await entry.getFile();
    if (file !== null) {
      //file.relativePath = getRelativePath(entry);
      yield file;
    }
    // m2m files in Subfolders are not analyzed
  } else if (entry.kind === 'directory' && layer == 0) {
    for await (const handle of entry.values()) {
      yield* getM2mFilesRecursively(handle, layer + 1);
    }
  }
}


async function drawM2mExplorer() {

  ctx.clearRect(0, 0, g_width, g_height);

  m2mFilesInFolder = [];
  let i = 0;

  for await (const fileHandle of getM2mFilesRecursively(workDirectoryHandle, 0)) {
    let fileExt = fileHandle.name.split('.').pop();
    if (fileExt.toLowerCase() == 'm2m') {
      console.log(fileHandle);
      m2mFilesInFolder[i] = {};
      m2mFilesInFolder[i].name = fileHandle.name;
      m2mFilesInFolder[i].fileHandle = fileHandle;
      //console.log(fileHandle.name);
      i += 1;
    }
  }



  endM2mExplorerLine = m2mFilesInFolder.length;
  if (endM2mExplorerLine == 0) {
    endM2mExplorerLine = 1;
  }

  if (startM2mExplorerLine > endM2mExplorerLine) {
    // Make sure that always something is visible
    startM2mExplorerLine = endM2mExplorerLine - 5;
    if (startM2mExplorerLine < 0) {
      startM2mExplorerLine = 0;
    }
  }

  let yPosElements = 50;
  let xPosElements = 10;
  let fontSize = 15;
  let lineDifference = fontSize;

  ctx.font = fontSize + 'px sans-serif';
  ctx.fillStyle = fontColor;//'black'
  // ctx.fillText('Use regular expressions to filter in the list', xPosElements, yPosElements);
  // yPosElements += lineDifference;
  ctx.fillText('Use the mouse wheel to scroll', xPosElements, yPosElements);
  yPosElements += lineDifference;

  let linesForElements = Math.floor((g_height - yPosElements) / (lineDifference));
  linesForElements -= 1;
  scrollExplorerLine = Math.floor(linesForElements / 2);

  /*     for (const f of filteredModel) {
          if (typeof f !== 'undefined') {
              yPosElements += 15;
              ctx.fillText(f.name, xPosElements, yPosElements);
          }
      } */

  listPositionToEntries2 = [];

  for (let i = 0; i <= linesForElements; i++) {
    let lineDisplay = startM2mExplorerLine  + i;
    if (typeof m2mFilesInFolder[lineDisplay] !== 'undefined') {
      ctx.fillText(m2mFilesInFolder[lineDisplay].name, xPosElements, yPosElements);
    }

    let listPositionToEntry = {}
    listPositionToEntry.element = m2mFilesInFolder[lineDisplay];
    listPositionToEntry.yMin = yPosElements - fontSize;
    listPositionToEntry.yMax = yPosElements;
    listPositionToEntries2.push(listPositionToEntry);

    yPosElements += lineDifference;

  }

}