'use strict';
const startDiagram = 'StartDiagramKey';
/**  Global class which contains references to all processed documents
* @member complModelPosition An array with position 
* @member pinned An array with the indizees of all pinned elements
* @member camerSettings An object with tranforms the internal positions to the displayed positions in the canvas
 use as: diagramms[activeDiagram].camerSettings.move.x
diagramms[activeDiagram].camerSettings.move.y
diagramms[activeDiagram].camerSettings.zoomfactor*/

let diagramms = {};
/** Contains the key of the active diagram 
*/
let activeDiagram;

/** Call me once when an mse file is loaded to set the start diagram active */
function useStartDiagram() {
  activeDiagram = startDiagram;
  const move = { x: 100, y: 200 };
  diagramms[activeDiagram] = {};
  diagramms[activeDiagram].complModelPosition = [];
  diagramms[activeDiagram].pinned = [];
  diagramms[activeDiagram].camerSettings = {
    move: move,
    zoomfactor: 2
  }
}