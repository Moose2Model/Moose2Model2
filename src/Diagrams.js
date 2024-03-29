'use strict';
const startDiagram = 'All model elements';
const completeDiagramType = 'A';
const circuitDiagramForSoftwareType = 'C';
const bulletPointDiagramType = 'B';
const circuitDiagramForSoftwareDiagramType = 'C';
/**  Global class which contains references to all processed documents
* @member type The type of the diagram. Either completeDiagramType or circuitDiagramForSoftwareType
* @member diagramType The type how elements are displayed. Either bulletPointDiagramType or circuitDiagramForSoftwareDiagramType. 
* @member changed True when a diagram is changed. Is set to false whenever a diagram is saved.
* @member complModelPosition An array with positions.
 Use as: diagramms[diagramInfos.displayedDiagram].complModelPosition[index].x and diagramms[diagramInfos.displayedDiagram].complModelPosition[index].y
 Contains also the index of the element in diagramms[diagramInfos.displayedDiagram].complModelPosition[index].index
 An element is displayed in a diagram when visible is true
 May have the positions of a box that describes the size of the element (Check whether .boxX1 is defined)
 .boxX1, .boxX2, .boxY1, .boxY2
* @member boundingRectComplete The bounding rect of a diagram 
 diagramms[diagramInfos.displayedDiagram].boundingRectComplete.X1 - The left side 
 diagramms[diagramInfos.displayedDiagram].boundingRectComplete.X2 - The right side
 diagramms[diagramInfos.displayedDiagram].boundingRectComplete.Y1 - The upper side
 diagramms[diagramInfos.displayedDiagram].boundingRectComplete.21 - The bottom side
* @member diagramSettings The settings of a diagram. Use:
 diagramms[diagramInfos.displayedDiagram].diagramSettings.displayNewElementBox - The box for new elements is displayed
 diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox - The borders for the box for new elements
 diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames - The name of elements is displayed
 diagramms[diagramInfos.displayedDiagram].diagramSettings.displayArrows - Edges are displayed with arrows
* @member pinned An array with the indizees of all pinned elements
* @member cameraSettings An object with tranforms the internal positions to the displayed positions in the canvas. Use as: 
diagramms[diagramInfos.displayedDiagram].cameraSettings.move.x
diagramms[diagramInfos.displayedDiagram].cameraSettings.move.y
diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor
* @member layoutingState see ForceDirection.js and AutoLayout.js for content
* @member generationInfoInternal An object with all information how a diagram is to be generated. This is the internal representation. It is not defined for the start diagram.
diagramms[diagramInfos.displayedDiagram].generationInfoInternal.addedWithNeighbors - A list with all indizees of elements that are added with neighbors. Do not add indizees twice, check whether they exist before adding.
diagramms[diagramInfos.displayedDiagram].generationInfoInternal.suppressed - A list with all elements that are suppressed with all children
diagramms[diagramInfos.displayedDiagram].generationInfoInternal.suppressedDueTo - A list with all elements that are not shown because of a suppressed element
diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID - A list with all comments
* @member highlighted An array with the indizes of all highlighted elements Do not add indizees twice, check whether they exist before adding.
*/
let diagramms = {};

/** Contains informations of the diagrams
 * @member displayedDiagram the name of the displayed diagram
*/
let diagramInfos = {};

/** Call me once when an mse file is loaded to set the start diagram active */
function useStartDiagram() {
  const move = { x: 0, y: 0 };
  diagramInfos.displayedDiagram = startDiagram;
  let name = diagramInfos.displayedDiagram; // Minimizes problems with copy paste from this method to method newDiagram
  displayedDiagramText.innerHTML = 'Displayed diagram: ' + diagramNameWithChangeMark(diagramInfos.displayedDiagram);
  diagramms[name] = {};
  diagramms[name].type = completeDiagramType;
  diagramms[name].diagramType = bulletPointDiagramType;
  diagramms[name].changed = false;
  diagramms[name].diagramSettings = {};
  diagramms[name].diagramSettings.displayNewElementBox = false;
  diagramms[name].diagramSettings.displayElementNames = false;
  diagramms[name].diagramSettings.displayArrows = false;
  diagramms[name].layoutingActive = false;
  diagramms[name].complModelPosition = [];
  diagramms[name].pinned = [];
  diagramms[name].layoutingState = initialForceDirectingState;

  diagramms[diagramInfos.displayedDiagram].cameraSettings = {
    move: move,
    zoomfactor: 1
  }
  diagramms[name].highlighted = [];
}

/** Call me once when a new diagram is required */
function newDiagram(name) {

  const move = { x: 0, y: 0 };
  diagramms[name] = {};
  diagramms[name].type = circuitDiagramForSoftwareType;
  diagramms[name].diagramType = circuitDiagramForSoftwareDiagramType;
  diagramms[name].changed = false;
  diagramms[name].diagramSettings = {};
  diagramms[name].diagramSettings.displayNewElementBox = true;
  // Initial position of box with new elements
  SOMEXPL_2 += 1;
  diagramms[name].diagramSettings.newElementBox = {
    isInitial: true,
    newElBoxX: 0,
    newElBoxY: 0,
    newElBoxWidth: 100,
    newElBoxHeight: 100
  };
  diagramms[name].diagramSettings.displayElementNames = true;
  diagramms[name].diagramSettings.displayArrows = true;
  diagramms[name].layoutingActive = false;
  diagramms[name].complModelPosition = [];
  diagramms[name].pinned = [];
  diagramms[name].layoutingState = initialAutolayoutState;

  diagramms[name].cameraSettings = {
    move: move,
    zoomfactor: 1
  }
  diagramms[name].generationInfoInternal = {};
  diagramms[name].generationInfoInternal.addedWithNeighbors = [];
  diagramms[name].generationInfoInternal.suppressed = [];
  diagramms[name].generationInfoInternal.suppressedDueTo = [];
  diagramms[name].generationInfoInternal.commentsByID = [];
  diagramms[name].highlighted = [];

  setDiagramActive(name);
  switchDiagram(name);

}

function switchDiagram(name) {
  diagramInfos.displayedDiagram = name;
  displayedDiagramText.innerHTML = 'Displayed diagram: ' + diagramNameWithChangeMark(name);
}

function activeDiagramChanged() {
  diagramms[diagramInfos.activeDiagram].changed = true;
  // Redraw the texts in the header.
  // This is required to make sure that the user sees the marking immediately after a change
  displayedDiagramText.innerHTML = 'Displayed diagram: ' + diagramNameWithChangeMark(diagramInfos.displayedDiagram);
  activeDiagramText.innerHTML = 'Active diagram: ' + diagramNameWithChangeMark(diagramInfos.activeDiagram);
}

function displayedDiagramChanged() {
  diagramms[diagramInfos.displayedDiagram].changed = true;
  // Redraw the texts in the header.
  // This is required to make sure that the user sees the marking immediately after a change
  displayedDiagramText.innerHTML = 'Displayed diagram: ' + diagramNameWithChangeMark(diagramInfos.displayedDiagram);
  activeDiagramText.innerHTML = 'Active diagram: ' + diagramNameWithChangeMark(diagramInfos.activeDiagram);
}

function diagramIsSaved(diagramName) {
  diagramms[diagramName].changed = false;
  // Redraw the texts in the header.
  // This is required to make sure that the user sees the marking immediately after a change
  displayedDiagramText.innerHTML = 'Displayed diagram: ' + diagramNameWithChangeMark(diagramInfos.displayedDiagram);
  activeDiagramText.innerHTML = 'Active diagram: ' + diagramNameWithChangeMark(diagramInfos.activeDiagram);
}

function diagramNameWithChangeMark(diagramName) {
  if (typeof diagramms[diagramName] !== 'undefined') {
    if (typeof diagramms[diagramName].diagramType !== 'undefined') {
      if (diagramms[diagramName].diagramType == circuitDiagramForSoftwareDiagramType) {
        if (diagramms[diagramName].changed) {
          return diagramName + ' ⬤';
        } else {
          return diagramName;
        };
      } else {
        return diagramName;
      }
    }
  }
}

function zoomDisplayedDiagram(sign) {
  const originalZoomfactor = diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor;
  let newZoomfactor = originalZoomfactor;

  //let test = Math.pow(2, 1 / 4) * Math.pow(2, 1 / 4) * Math.pow(2, 1 / 4) * Math.pow(2, 1 / 4);
  if (sign > 0) {
    newZoomfactor *= Math.pow(2, 1 / 4)
  }
  else {
    newZoomfactor /= Math.pow(2, 1 / 4)
  }

  // Remove restriction of zoom factor. This causes problems together with zoom to fit.
  /*             // Restrict scale
    if (newZoomfactor < .001) {
        newZoomfactor = originalZoomfactor;
    } else if (newZoomfactor > 21) {
        newZoomfactor = originalZoomfactor;
    } */
  diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor = newZoomfactor;
}

function diagramFits() {
  let fits = false;
  let canvasX1 = cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].boundingRectComplete.X1);
  let canvasX2 = cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].boundingRectComplete.X2);
  let canvasY1 = cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].boundingRectComplete.Y1);
  let canvasY2 = cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].boundingRectComplete.Y2);
  if (canvasX1 >= 0 && canvasX2 <= g_width && canvasY1 >= 0 && canvasY2 <= g_height) {
    fits = true;
  }
  return fits;
}

function ZoomToFit() {

  if (typeof diagramms[diagramInfos.displayedDiagram] === 'undefined') {
    window.alert('Nothing is displayed');
  }
  else {
    if (typeof diagramms[diagramInfos.displayedDiagram].boundingRectComplete === 'undefined') {
      window.alert('Nothing is displayed');

    }
    else {
      diagramms[diagramInfos.displayedDiagram].cameraSettings.move.x =
        - (diagramms[diagramInfos.displayedDiagram].boundingRectComplete.X1 +
          diagramms[diagramInfos.displayedDiagram].boundingRectComplete.X2) / 2;
      diagramms[diagramInfos.displayedDiagram].cameraSettings.move.y =
        - (diagramms[diagramInfos.displayedDiagram].boundingRectComplete.Y1 +
          diagramms[diagramInfos.displayedDiagram].boundingRectComplete.Y2) / 2;

      if (diagramFits()) {
        while (diagramFits()) {
          zoomDisplayedDiagram(+1);
        }
        zoomDisplayedDiagram(-1);
      } else {
        while (!diagramFits()) {
          zoomDisplayedDiagram(-1);
        }
      }


      // clear the canvas and redraw all shapes
      drawCompleteModel(ctx, g_width, g_height);
    }
  }
}

/**Returns an array with all other diagrams */
function returnOtherDiagrams() {
  let list = [];
  Object.entries(diagramms).forEach(([key, value]) => {
    if (key != diagramInfos.displayedDiagram) {
      list.push(key);
    }
  });
  return list;
}

function setDiagramActive(name) {
  diagramInfos.activeDiagram = name;
  activeDiagramText.innerHTML = 'Active diagram: ' + diagramNameWithChangeMark(name);
}

function toggleNameDisplay() {
  if (typeof diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames !== 'undefined') {
    diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames = !diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames;
  }
}

// async function* getM2mFilesRecursively(entry, layer) {
//   if (entry.kind === 'file') {
//     const file = await entry.getFile();
//     if (file !== null) {
//       //file.relativePath = getRelativePath(entry);
//       yield file;
//     }
//     // m2m files in Subfolders are not analyzed
//   } else if (entry.kind === 'directory' && layer == 0) {
//     for await (const handle of entry.values()) {
//       yield* getM2mFilesRecursively(handle, layer + 1);
//     }
//   }
// }

async function ReadDisplayedDiagramStart() {
  if (typeof workDirectoryHandle === 'undefined') {
    window.alert("You have to specify a work directory first");
    return;
  }

  readM2mRequested();
}

async function ReadDisplayedDiagram(fileHandle) {
  if (typeof workDirectoryHandle === 'undefined') {
    window.alert("You have to specify a work directory first");
    return;
  }

  ctx.clearRect(0, 0, g_width, g_height);

  // Begin new logic #77

  // for await (const fileHandle of getM2mFilesRecursively(workDirectoryHandle, 0)) {
  //   let fileExt = fileHandle.name.split('.').pop();
  //   if (fileExt.toLowerCase() == 'm2m') {
  //     console.log(fileHandle);
  //   }
  // }

  // readM2mRequested();

  // End new logic #77

  const pickerOpts = {
    types: [
      {
        description: 'Moose2Model diagram specifications',
        accept: {
          'text/plain': ['.m2m']
        }
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false
  };
  // let fileHandle;
  if (typeof fileHandle === 'undefined') {
    [fileHandle] = await window.showOpenFilePicker(pickerOpts);
  }
  const file = await fileHandle.getFile();
  const contents = await file.text();
  let readGenerationInfo = {};
  readGenerationInfo = JSON.parse(contents);

  // --- Change the displayed diagram and set it active so that it can be changed

  // Remove the extension .m2m Name of file is equal to name of diagram

  let fileName = file.name;
  let len = fileName.length;
  if (fileName.substring(len - 4, len) == '.m2m') {
    fileName = fileName.substring(0, len - 4);
  }
  newDiagram(fileName);
  setDiagramActive(fileName);
  switchDiagram(fileName);

  // --- Clear the displayed diagram when needed -> The user may be warned in some cases
  // Will be implicitly done by calling newDiagram

  // --- Set position of landing box
  SOMEXPL_5 += 1;
  if (typeof readGenerationInfo.newElementBox !== 'undefined') {
    diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox = readGenerationInfo.newElementBox;
  } else {
    diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox = {
      isInitial: true,
      newElBoxX: 0,
      newElBoxY: 0,
      newElBoxWidth: 100,
      newElBoxHeight: 100
    };
  }

  resetRepositionRequired();

  // --- Add elements with neighbor to this diagram
  for (const e of readGenerationInfo.addedWithNeighbors) {
    if (typeof modelElementsByUniqueKey[e] !== 'undefined') {
      addWithNeighbors(modelElementsByUniqueKey[e], true);
    }
  }
  // --- Position elements on this diagram
  for (const e of readGenerationInfo.positions) {
    if (typeof modelElementsByUniqueKey[e.uniqueKey] !== 'undefined') {
      let element = modelElementsByUniqueKey[e.uniqueKey];
      if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[element.index] !== 'undefined') {
        diagramms[diagramInfos.activeDiagram].complModelPosition[element.index].x = e.x;
        diagramms[diagramInfos.activeDiagram].complModelPosition[element.index].y = e.y;
        removeHighlightActive(element.index);
      }
    }
  }

  doRepositioningOfRequired();

  // --- Add comments to this diagram
  for (const e of readGenerationInfo.comments) {
    if (typeof modelElementsByUniqueKey[e.uniqueKey] !== 'undefined') {
      let element = modelElementsByUniqueKey[e.uniqueKey];
      if (typeof element !== 'undefined') {
        diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[element.index] = {};
        diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[element.index].x = e.x;
        diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[element.index].y = e.y;
        diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[element.index].text = e.text;
      }
    }
  }

  // --- Pin elements on this diagram
  for (const e of readGenerationInfo.pinned) {
    if (typeof modelElementsByUniqueKey[e] !== 'undefined') {
      diagramms[diagramInfos.activeDiagram].pinned.push(modelElementsByUniqueKey[e].index);
    }
  }

  // --- Suppress elements on this diagram
  for (const e of readGenerationInfo.suppressed) {
    if (typeof modelElementsByUniqueKey[e] !== 'undefined') {
      suppress(modelElementsByUniqueKey[e]);
    }
  }

  // --- Draw new diagram
  drawCompleteModel(ctx, g_width, g_height);
  ZoomToFit();
}

async function SaveDisplayedDiagram() {
  if (diagramInfos.displayedDiagram == startDiagram) {
    window.alert("The diagram with all model elements cannot be saved");
    return;
  }

  if (typeof workDirectoryHandle === 'undefined') {
    window.alert("You have to specify a work directory first");
    return;
  }


  let generationInfoExternal = {};

  // Store position of landing box
  SOMEXPL_4 += 1;
  if (!diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.isInitial) {
    generationInfoExternal.newElementBox = diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox;
  }

  // Store which elements are added with neighbors

  generationInfoExternal.addedWithNeighbors = [];
  for (const e of diagramms[diagramInfos.displayedDiagram].generationInfoInternal.addedWithNeighbors) {
    generationInfoExternal.addedWithNeighbors.push(uniqueKey(modelElementsByIndex[e].technicalType, modelElementsByIndex[e].uniqueName));
  }

  // Store positions with comments
  generationInfoExternal.positions = [];
  generationInfoExternal.comments = [];

  for (const e of diagramms[diagramInfos.displayedDiagram].complModelPosition) {
    if (typeof e !== 'undefined') {
      let position = {};
      position.uniqueKey = uniqueKey(modelElementsByIndex[e.index].technicalType, modelElementsByIndex[e.index].uniqueName);
      position.x = Math.round(100 * e.x) / 100;
      position.y = Math.round(100 * e.y) / 100;
      generationInfoExternal.positions.push(position);

      if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[e.index] !== 'undefined') {
        let comment = {};
        comment.uniqueKey = uniqueKey(modelElementsByIndex[e.index].technicalType, modelElementsByIndex[e.index].uniqueName);
        comment.x = Math.round(100 * diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[e.index].x) / 100;
        comment.y = Math.round(100 * diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[e.index].y) / 100;
        comment.text = diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[e.index].text;
        generationInfoExternal.comments.push(comment);
      }

    }
  }

  // Store pinning
  generationInfoExternal.pinned = [];
  for (const idx of diagramms[diagramInfos.displayedDiagram].pinned) {
    if (typeof idx !== 'undefined') {
      generationInfoExternal.pinned.push(uniqueKey(modelElementsByIndex[idx].technicalType, modelElementsByIndex[idx].uniqueName));
    }
  }

  // Store suppression
  generationInfoExternal.suppressed = [];
  for (const idx of diagramms[diagramInfos.displayedDiagram].generationInfoInternal.suppressed) {
    if (typeof idx !== 'undefined') {
      generationInfoExternal.suppressed.push(uniqueKey(modelElementsByIndex[idx].technicalType, modelElementsByIndex[idx].uniqueName));
    }
  }


  // Make and export JSON file

  let jsonExport = JSON.stringify(generationInfoExternal, null, '\t');

  const newFileHandle = await workDirectoryHandle.getFileHandle(diagramInfos.displayedDiagram + '.m2m', { create: true });
  const writable = await newFileHandle.createWritable();
  await writable.write(jsonExport);
  await writable.close();

  diagramIsSaved(diagramInfos.displayedDiagram);

}

async function ImportOldDiagram() {

  const factorOldToNew = 1.7;

  // Required to migrate Diagrams on FAMIX models to the new version of Moose2Model with SOMIX models

  if (typeof workDirectoryHandle === 'undefined') {
    window.alert("You have to specify a work directory first");
    return;
  }
  const pickerOpts = {
    types: [
      {
        description: 'Old Moose2Model diagram specifications',
        accept: {
          'application/xml': ['.xml']
        }
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false
  };
  let fileHandle;
  [fileHandle] = await window.showOpenFilePicker(pickerOpts);
  const file = await fileHandle.getFile();
  const contents = await file.text();
  const parser = new DOMParser();

  const doc = parser.parseFromString(contents, "application/xml");
  // print the name of the root element or error message
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    console.log("error while parsing");
    window.alert("Parsing failed");
    return;
  } else {
    // console.log(doc.documentElement.nodeName);
  }

  // --- Extract generation info from DOM model

  // --- Change the displayed diagram and set it active so that it can be changed

  // Remove the extension .m2m Name of file is equal to name of diagram

  let fileName = file.name;
  let len = fileName.length;
  if (fileName.substring(len - 4, len) == '.xml') {
    fileName = fileName.substring(0, len - 4);
  }
  newDiagram(fileName);
  setDiagramActive(fileName);
  switchDiagram(fileName);

  //doc.children[0].children

  let consoleWritten = false;
  
  resetRepositionRequired();

  for (var step = 1; step <= 2; step++) {

    for (const n of doc.children[0].children) {
      if (n.tagName == 'scope') {
        if (n.textContent != 'method') {
          window.alert("Scope of diagram is not supported");
          return;
        }
      }

      if (n.tagName == 'element') {

        let n_type = '';
        let n_class = '';
        let n_method = '';
        let n_attribute = '';
        let n_x = '';
        let n_y = '';
        let n_comment = '';
        let n_comment_x = 0;
        let n_comment_y = 0;
        let n_add_explicitly = false;
        let n_suppressed = false;
        for (const e of n.children) {
          if (e.tagName == 'type') {
            n_type = e.textContent;
          }
          if (e.tagName == 'class') {
            n_class = e.textContent;
          }
          if (e.tagName == 'method') {
            n_method = e.textContent;
          }
          if (e.tagName == 'attribute') {
            n_attribute = e.textContent;
          }
          if (e.tagName == 'x') {
            n_x = e.textContent;
          }
          if (e.tagName == 'y') {
            n_y = e.textContent;
          }
          if (e.tagName == 'comment') {
            n_comment = e.textContent;
            /*             // The first character is apparently an artificial " . Remove it.
                        n_comment = n_comment.substring(1);  */
            n_comment = n_comment.replace('<br>', '\n')
          }
          if (e.tagName == 'commentx') {
            n_comment_x = e.textContent;
          }
          if (e.tagName == 'commenty') {
            n_comment_y = e.textContent;
          }

          if (e.tagName == 'ACTSuppressOthers') {
            // Here it is assumed that there are no xml files where not the next neighbors are added explicitly
            n_add_explicitly = true;
          }
          if (e.tagName == 'supressWithChildren') {
            if (e.textContent == 'true') {
              n_suppressed = true;
            }
          }
        }

        if (n_type == 'FAMIXMethod' || n_type == 'FAMIXAttribute') {
          let expSOMIX = '';
          let expName = '';
          if (n_type == 'FAMIXMethod') {
            expSOMIX = 'SOMIX.Code';
            expName = n_method;
          }
          if (n_type == 'FAMIXAttribute') {
            expSOMIX = 'SOMIX.Data';
            expName = n_attribute;
          }
          let elementFound = false;
          for (const e2 of modelElementsByIndex) {
            if (typeof e2 !== 'undefined') {
              if (e2.element == expSOMIX && e2.name == expName) {

                if (typeof parentChildByChild[e2.index] !== 'undefined') {


                  for (const pc of parentChildByChild[e2.index]) {
                    let foundElement = modelElementsByIndex[pc.parent];
                    if (foundElement.name == n_class) {
                      // Duplicate 1/2
                      elementFound = true;
                      if (step == 1) {
                        // --- Add elements with neighbor to this diagram
                        if (n_add_explicitly) {
                          addWithNeighbors(e2, true);
                        }
                      }
                      if (step == 2) {
                        // --- Suppress elements on this diagram
                        if (n_suppressed) {
                          suppress(e2);
                        }
                        if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[e2.index] !== 'undefined') {
                          // --- Position elements on this diagram
                          diagramms[diagramInfos.activeDiagram].complModelPosition[e2.index].x = parseFloat(n_x) * factorOldToNew;
                          diagramms[diagramInfos.activeDiagram].complModelPosition[e2.index].y = parseFloat(n_y) * factorOldToNew;
                          removeHighlightActive(e2.index);

                          // Pin all elements directly after import
                          // This prevents that the Forced-direction accicentially spoils the layout
                          diagramms[diagramInfos.activeDiagram].pinned.push(e2.index);

                          // --- Add Comments
                          if (n_comment != '') {
                            diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[e2.index] = {};
                            diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[e2.index].x = parseFloat(n_comment_x) * factorOldToNew;
                            diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[e2.index].y = parseFloat(n_comment_y) * factorOldToNew;
                            diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[e2.index].text = n_comment;
                          }

                        }
                      }
                      // End duplicate 1/2
                    }
                  }

                }




                if (!elementFound && expName == n_class) {

                  // Duplicate 2/2
                  elementFound = true;
                  if (step == 1) {
                    // --- Add elements with neighbor to this diagram
                    if (n_add_explicitly) {
                      addWithNeighbors(e2, true);
                    }
                  }
                  if (step == 2) {
                    // --- Suppress elements on this diagram
                    if (n_suppressed) {
                      suppress(e2);
                    }

                    if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[e2.index] !== 'undefined') {
                      // --- Position elements on this diagram
                      diagramms[diagramInfos.activeDiagram].complModelPosition[e2.index].x = parseFloat(n_x) * factorOldToNew;
                      diagramms[diagramInfos.activeDiagram].complModelPosition[e2.index].y = parseFloat(n_y) * factorOldToNew;
                      removeHighlightActive(e2.index);
                      removeRepositionRequired(e2.index);
                      // Pin all elements directly after import
                      // This prevents that the Forced-direction accicentially spoils the layout
                      diagramms[diagramInfos.activeDiagram].pinned.push(e2.index);
                      // --- Add Comments
                      if (n_comment != '') {
                        diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[e2.index] = {};
                        diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[e2.index].x = parseFloat(n_comment_x) * factorOldToNew;
                        diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[e2.index].y = parseFloat(n_comment_y) * factorOldToNew;
                        diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[e2.index].text = n_comment;
                      }

                    }
                  }
                  // End duplicate 2/2

                }

              }
            }
          }

          if (step == 1 && n_add_explicitly && !elementFound) {
            consoleWritten = true;
            console.log(n_type + ' ' + expName + ' ' + ' of ' + n_class + ' was added explicitly but is not found in model. Please correcty manually.');
          }

        }

        if (n_type == 'FAMIXClass') {
          if (step == 2) {
            for (const e2 of modelElementsByIndex) {
              if (typeof e2 !== 'undefined') {
                if (e2.element == 'SOMIX.Grouping' && e2.name == n_class) {
                  // --- Suppress elements on this diagram
                  if (n_suppressed) {
                    suppress(e2);
                  }

                  // --- Add Comments
                  if (n_comment != '') {
                    diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[e2.index] = {};
                    diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[e2.index].x = parseFloat(n_comment_x) * factorOldToNew;
                    diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[e2.index].y = parseFloat(n_comment_y) * factorOldToNew;
                    diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[e2.index].text = n_comment;
                  }


                }
              }
            }
          }


        }

      } // if (n.tagName == 'element') {
    }
  }

  doRepositioningOfRequired();

  if (consoleWritten) {
    window.alert("Messages are written to the console, please check.");
  }


  // --- Draw new diagram
  drawCompleteModel(ctx, g_width, g_height);
  ZoomToFit();
}