'use strict';
const startDiagram = 'All model elements';
const completeDiagramType = 'A';
const circuitDiagramForSoftwareType = 'C';
/**  Global class which contains references to all processed documents
* @member type The type of the diagram. Either completeDiagramType or circuitDiagramForSoftwareType
* @member complModelPosition An array with positions.
 Use as: diagramms[diagramInfos.displayedDiagram].complModelPosition.x and diagramms[diagramInfos.displayedDiagram].complModelPosition.y
 Contains also the index of the element in diagramms[diagramInfos.displayedDiagram].complModelPosition.index
* @member pinned An array with the indizees of all pinned elements
* @member cameraSettings An object with tranforms the internal positions to the displayed positions in the canvas. Use as: 
diagramms[diagramInfos.displayedDiagram].cameraSettings.move.x
diagramms[activeDiagramm.name].cameraSettings.move.y
diagramms[activeDiagramm.name].cameraSettings.zoomfactor
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
  displayedDiagramText.innerHTML = 'Displayed diagram: ' + diagramInfos.displayedDiagram;
  diagramms[diagramInfos.displayedDiagram] = {};
  diagramms[diagramInfos.displayedDiagram].type = completeDiagramType;
  diagramms[diagramInfos.displayedDiagram].forceFeedback = false;
  diagramms[diagramInfos.displayedDiagram].complModelPosition = [];
  diagramms[diagramInfos.displayedDiagram].pinned = [];
  diagramms[diagramInfos.displayedDiagram].forceDirectingState = initialForceDirectingState;

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