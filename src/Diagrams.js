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
 Use as: diagramms[diagramInfos.displayedDiagram].complModelPosition.x and diagramms[diagramInfos.displayedDiagram].complModelPosition.y
 Contains also the index of the element in diagramms[diagramInfos.displayedDiagram].complModelPosition.index
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
* @member forceDirectingState see ForceDirection.js for content*/
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