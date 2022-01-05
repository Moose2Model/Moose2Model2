'use strict';
const startDiagram = 'StartDiagramKey';
const completeDiagramType = 'A';
const circuitDiagramForSoftwareType = 'C';
/**  Global class which contains references to all processed documents
 * @member type The type of the diagram. Either completeDiagramType or circuitDiagramForSoftwareType
* @member complModelPosition An array with positions.
 Use as: diagramms[activeDiagram.name].complModelPosition.x and diagramms[activeDiagram.name].complModelPosition.y
* @member pinned An array with the indizees of all pinned elements
* @member cameraSettings An object with tranforms the internal positions to the displayed positions in the canvas. Use as: 
diagramms[activeDiagram.name].cameraSettings.move.x
diagramms[activeDiagramm.name].cameraSettings.move.y
diagramms[activeDiagramm.name].cameraSettings.zoomfactor*/

let diagramms = {};
/** Contains the key of the active diagram 
 * @member name the name of the active diagram
*/
let activeDiagram = {};

/** Call me once when an mse file is loaded to set the start diagram active */
function useStartDiagram() {
  const move = { x: 0, y: 0 };
  activeDiagram.name = startDiagram;
  diagramms[activeDiagram.name] = {};
  diagramms[activeDiagram.name].type = completeDiagramType;
  diagramms[activeDiagram.name].forceFeedback = false;
  diagramms[activeDiagram.name].complModelPosition = [];
  diagramms[activeDiagram.name].pinned = [];

  diagramms[activeDiagram.name].cameraSettings = {
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

  diagramms[name].cameraSettings = {
    move: move,
    zoomfactor: 1
  }
}
/**Returns an array with all other diagrams */
function returnOtherDiagrams() {
  let list = [];
  Object.entries(diagramms).forEach(([key, value]) => {
    if (key != activeDiagram.name) {
      list.push(key);
    }
  });
  return list;
}