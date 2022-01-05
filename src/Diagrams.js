'use strict';
const startDiagram = 'StartDiagramKey';
/**  Global class which contains references to all processed documents
* @member complModelPosition An array with positions.
 Use as: diagramms[activeDiagram.name].complModelPosition.x and diagramms[activeDiagram.name].complModelPosition.y
* @member pinned An array with the indizees of all pinned elements
* @member camerSettings An object with tranforms the internal positions to the displayed positions in the canvas. Use as: 
diagramms[activeDiagram.name].camerSettings.move.x
diagramms[activeDiagramm.name].camerSettings.move.y
diagramms[activeDiagramm.name].camerSettings.zoomfactor*/

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
  diagramms[activeDiagram.name].complModelPosition = [];
  diagramms[activeDiagram.name].pinned = [];
  
  diagramms[activeDiagram.name].camerSettings = {
    move: move,
    zoomfactor: 1
  }
}

function newDiagram(name) {

}