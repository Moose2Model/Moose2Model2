'use strict';
const startDiagram = 'StartDiagramKey';
  /**  Global class which contains references to all processed documents
 * @member complModelPosition An array with position 
 * @member pinned An array with the indizees of all pinned elements*/

let diagramms = {};
/** Contains the key of the active diagram 
*/
let activeDiagram;

/** Call me once when an mse file is loaded to set the start diagram active */
function useStartDiagram(){
    activeDiagram = startDiagram;
    diagramms[activeDiagram] = {};
    diagramms[activeDiagram].complModelPosition = [];
    diagramms[activeDiagram].pinned = [];
}