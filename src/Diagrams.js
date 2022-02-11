'use strict';
const startDiagram = 'All model elements';
const completeDiagramType = 'A';
const circuitDiagramForSoftwareType = 'C';
const bulletPointDiagramType = 'B';
const circuitDiagramForSoftwareDiagramType = 'C';
/**  Global class which contains references to all processed documents
* @member type The type of the diagram. Either completeDiagramType or circuitDiagramForSoftwareType
* @member diagramType The type how elements are displayed. Either bulletPointDiagramType or circuitDiagramForSoftwareDiagramType. 
* @member complModelPosition An array with positions.
 Use as: diagramms[diagramInfos.displayedDiagram].complModelPosition[index].x and diagramms[diagramInfos.displayedDiagram].complModelPosition[index].y
 Contains also the index of the element in diagramms[diagramInfos.displayedDiagram].complModelPosition[index].index
 May have the positions of a box that describes the size of the element (Check whether .boxX1 is defined)
 .boxX1, .boxX2, .boxY1, .boxY2
* @member diagramSettings The settings of a diagram. Use:
 diagramms[diagramInfos.displayedDiagram].diagramSettings.displayNewElementBox - The box for new elements is displayed
 diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames - The name of elements is displayed
 diagramms[diagramInfos.displayedDiagram].diagramSettings.displayArrows - Edges are displayed with arrows
* @member pinned An array with the indizees of all pinned elements
* @member cameraSettings An object with tranforms the internal positions to the displayed positions in the canvas. Use as: 
diagramms[diagramInfos.displayedDiagram].cameraSettings.move.x
diagramms[diagramInfos.displayedDiagram].cameraSettings.move.y
diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor
* @member forceDirectingState see ForceDirection.js for content
* @member generationInfoInternal An object with all information how a diagram is to be generated. This is the internal representation. It is not defined for the start diagram.
diagramms[diagramInfos.displayedDiagram].generationInfoInternal.addedWithNeighbors - A list with all indizees of elements that are added with neighbors. Do not add indizees twice, check whether they exist before adding.
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
  displayedDiagramText.innerHTML = 'Displayed diagram: ' + diagramInfos.displayedDiagram;
  diagramms[name] = {};
  diagramms[name].type = completeDiagramType;
  diagramms[name].diagramType = bulletPointDiagramType;
  diagramms[name].diagramSettings = {};
  diagramms[name].diagramSettings.displayNewElementBox = false;
  diagramms[name].diagramSettings.displayElementNames = false;
  diagramms[name].diagramSettings.displayArrows = false;
  diagramms[name].forceFeedback = false;
  diagramms[name].complModelPosition = [];
  diagramms[name].pinned = [];
  diagramms[name].forceDirectingState = initialForceDirectingState;

  diagramms[diagramInfos.displayedDiagram].cameraSettings = {
    move: move,
    zoomfactor: 1
  }
}

/** Call me once when a new diagram is required */
function newDiagram(name) {

  const move = { x: 0, y: 0 };
  diagramms[name] = {};
  diagramms[name].type = circuitDiagramForSoftwareType;
  diagramms[name].diagramType = circuitDiagramForSoftwareDiagramType;
  diagramms[name].diagramSettings = {};
  diagramms[name].diagramSettings.displayNewElementBox = true;
  diagramms[name].diagramSettings.displayElementNames = true;
  diagramms[name].diagramSettings.displayArrows = true;
  diagramms[name].forceFeedback = false;
  diagramms[name].complModelPosition = [];
  diagramms[name].pinned = [];
  diagramms[name].forceDirectingState = initialForceDirectingState;

  diagramms[name].cameraSettings = {
    move: move,
    zoomfactor: 1
  }
  diagramms[name].generationInfoInternal = {};
  diagramms[name].generationInfoInternal.addedWithNeighbors = [];
}

function switchDiagram(name) {
  diagramInfos.displayedDiagram = name;
  displayedDiagramText.innerHTML = 'Displayed diagram: ' + name;
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
  activeDiagramText.innerHTML = 'Active diagram: ' + name;
}

function toggleNameDisplay() {
  if (typeof diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames !== 'undefined') {
    diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames = !diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames;
  }
}

async function SaveDisplayedDiagram() {
  if (diagramInfos.displayedDiagram == startDiagram) {
    window.alert("The diagram with all model elements cannot be saved");
    return;
  }
  console.log('Save Displayed Diagram is called');

  let generationInfoExternal = {};

  // Store which elements are added with neighbors

  generationInfoExternal.addedWithNeighbors = [];
  for (const e of diagramms[diagramInfos.displayedDiagram].generationInfoInternal.addedWithNeighbors) {
    generationInfoExternal.addedWithNeighbors.push(uniqueKey(modelElementsByIndex[e].technicalType, modelElementsByIndex[e].uniqueName));
    console.log(modelElementsByIndex[e].uniqueName);
  }

  // Store positions
  generationInfoExternal.positions = [];


  for (const e of diagramms[diagramInfos.displayedDiagram].complModelPosition) {
    if (typeof e !== 'undefined') {
      let position = {};
      position.uniqueKey = uniqueKey(modelElementsByIndex[e.index].technicalType, modelElementsByIndex[e.index].uniqueName);
      position.x = Math.round(100 * e.x) / 100;
      position.y = Math.round(100 * e.y) / 100;
      generationInfoExternal.positions.push(position);
    }
  }

  let jsonExport = JSON.stringify(generationInfoExternal, null, '\t');

  const newFileHandle = await workDirectoryHandle.getFileHandle(diagramInfos.displayedDiagram + '.m2m', { create: true });
  const writable = await newFileHandle.createWritable();
  await writable.write(jsonExport);
  await writable.close();

}