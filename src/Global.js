'use strict';
// store a reference to the loaded metamodel, has to be adapted when more than a single model can be loaded
let fileHandle;
let workDirectoryHandle;

// This are all global variables which contain informations on a loaded model
// They should be enhanced when more than a single mse model is loaded
/** Contains an object where for each UniqueKey an object is contained with this structure
 *         const index = indexByMSEIndex[idVal];
        const element = {
            element: elementName,
            index: index,
            name: nameVal,
            technicalType: technicalTypeVal,
            uniqueName: uniqueNameVal,
            linkToEditor: linkToEditorVal,
        };
        modelElementsByUniqueKey[uniqueKey(technicalTypeVal, uniqueNameVal)] = element;
 */
let modelElementsByUniqueKey = {};
/** Contains an object where for each UniqueKey an object is contained with this structure
 *         const index = indexByMSEIndex[idVal];
        const element = {
            element: elementName,
            index: index,
            name: nameVal,
            technicalType: technicalTypeVal,
            uniqueName: uniqueNameVal,
            linkToEditor: linkToEditorVal,
        };
        modelElementsByIndex[index] = element;
 */
let modelElementsByIndex = [];
/** Contains an array where parents are placed at their index and an object is contained with this structure:
 *         const parentChild = {
            parent: parent,
            child: child,
            isMain: isMainVal
        };
 */
let parentChildByParent = [];
/** Contains an array where childs are placed at their index and an array is contained with objects with this structure:
 *         const parentChild = {
            parent: parent,
            child: child,
            isMain: isMainVal
        };
 */
let parentChildByChild = [];
/** Contains an array hwere callers are placed at their index and an object is contained with this structure:
 *         const call = {
            caller: caller,
            called: called,
        };
 */
let callByCaller = [];
/** Contains an array hwere called elements are placed at their index and an object is contained with this structure:
 *         const call = {
            caller: caller,
            called: called,
        };
 */
let callByCalled = [];
/** Contains an array where accessing elements are placed at their index and an object is contained with this structure:
*const access = {
    accessor: accessor,
    accessed: accessed,
    isWrite: isWriteVal,
    isRead: isReadVal,
    isDependent: isDependentVal
};
*/
let accessByAccessor = [];
/** Contains an array where accessed elements are placed at their index and an object is contained with this structure:
*const access = {
    accessor: accessor,
    accessed: accessed,
    isWrite: isWriteVal,
    isRead: isReadVal,
    isDependent: isDependentVal
};
*/
let accessByAccessed = [];

// These global variables are only needed when an mse model is loaded:
let indexByMSEIndex = [];
let currentIndex = 1;
// // For picture of complete Model
// /** @deprecated */
// let complModelPosition = [];
/** The main Canvas for drawings */
var canvas = document.getElementById('pane');
var ctx = canvas.getContext('2d');
let requestAnimationFrame;
/** @deprecated */
let mouseover = false;
// let forceFeedback = false;

let showModelExplorer = false;
let showM2mExplorer = false;
let showExplorer = false;

// For VS Code links
var userFilePath = null; // To store the file path
var isFilePathSet = false; // Flag to check if the user has already been prompted



// To support mouse event handling
function reOffset() {
    var BB = canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;
}
let offsetX, offsetY;
reOffset();
window.onscroll = function (e) { reOffset(); }
window.onresize = function (e) { reOffset(); }
canvas.onresize = function (e) { reOffset(); }

window.addEventListener('scroll', reOffset);
window.addEventListener('resize', reOffset);
canvas.addEventListener('resize', reOffset);


window.addEventListener('resize', resizeCanvas);

let g_width = 99; // Will soon be overwritten
let g_height = 99; // Will soon be overwritten
resizeCanvas();

// function resizeCanvas() {
//     let g_width = window.innerWidth - 40;
//     let g_height = window.innerHeight - 100;
// }

function resizeCanvas() {
    g_width = window.innerWidth - 20;
    g_height = window.innerHeight - 85;
    canvas.widh = g_width;
    canvas.height = g_height;
}

// Globale Variable, um den Zustand der Taste "G" zu speichern
let isGKeyPressed = false;

// Event-Listener, um den Zustand der Taste "G" zu aktualisieren
document.addEventListener("keydown", function (event) {
    if (event.key === "g" || event.key === "G") {
        isGKeyPressed = true;
    }
});

document.addEventListener("keyup", function (event) {
    if (event.key === "g" || event.key === "G") {
        isGKeyPressed = false;
    }
});

function findNearestElement(x, y, maxDistance) {
    let minDistanceSquared = -1;
    let minIndex = 0;
    let foundGroup = 0;
    let foundComment = 0;
    let found = {};
    let foundElement;
    found.element = foundElement;
    found.inComment = false;

    for (let i = 1; i < diagramms[diagramInfos.displayedDiagram].complModelPosition.length; i++) { // List start with index 1
        if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[i] !== 'undefined') {
            let mEBI = modelElementsByIndex[diagramms[diagramInfos.displayedDiagram].complModelPosition[i].index];
            let cmp = diagramms[diagramInfos.displayedDiagram].complModelPosition[i];
            if (cmp.visible == true) {
                if (diagramms[diagramInfos.displayedDiagram].diagramType == bulletPointDiagramType ||
                    (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType &&
                        mEBI.element != 'SOMIX.Grouping')
                ) {

                    let snapped;
                    if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType) {
                        snapped = snapToGrid(diagramms[diagramInfos.displayedDiagram].complModelPosition[i].x,
                            diagramms[diagramInfos.displayedDiagram].complModelPosition[i].y,
                            i);
                    } else {
                        snapped = {
                            x: diagramms[diagramInfos.displayedDiagram].complModelPosition[i].x,
                            y: diagramms[diagramInfos.displayedDiagram].complModelPosition[i].y
                        }
                    }

                    let distance = (x - snapped.x) * (x - snapped.x) + (y - snapped.y) * (y - snapped.y);
                    if (minDistanceSquared < 0) {
                        minDistanceSquared = distance;
                        minIndex = i;
                    } else if (distance < minDistanceSquared) {
                        minDistanceSquared = distance;
                        minIndex = i;
                    }
                }
                // Check whether is in grouping
                if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType) {
                    if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[i].boxX1 !== 'undefined') {
                        if (mEBI.element == 'SOMIX.Grouping') {
                            if (isInBox(x, y,
                                diagramms[diagramInfos.displayedDiagram].complModelPosition[i].boxX1,
                                diagramms[diagramInfos.displayedDiagram].complModelPosition[i].boxX2,
                                diagramms[diagramInfos.displayedDiagram].complModelPosition[i].boxY1,
                                diagramms[diagramInfos.displayedDiagram].complModelPosition[i].boxY2,
                                0, 0)) {
                                foundGroup = diagramms[diagramInfos.displayedDiagram].complModelPosition[i].index;
                            }
                        }
                    }
                }
                // Check whether is in comment
                if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType) {
                    if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[i] !== 'undefined') {
                        if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[i].boxX1 !== 'undefined') {
                            if (isInBox(x, y,
                                diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[i].boxX1,
                                diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[i].boxX2,
                                diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[i].boxY1,
                                diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[i].boxY2,
                                0, 0)) {
                                foundComment = diagramms[diagramInfos.displayedDiagram].complModelPosition[i].index;
                            }
                        }
                    }
                }
            }
        }
    }

    if (isGKeyPressed && foundGroup != 0) {
        found.element = modelElementsByIndex[foundGroup];
        return found;
    }

    if (foundComment != 0) {
        found.element = modelElementsByIndex[foundComment];
        found.inComment = true;
        return found;
    }

    if (minDistanceSquared < maxDistance * maxDistance && minDistanceSquared != -1) {
        // Return nearest element only when it is nearer than maxDistance
        found.element = modelElementsByIndex[minIndex];
        return found;
    }

    if (foundGroup != 0) {
        found.element = modelElementsByIndex[foundGroup];
        return found;
    }
    return found;

}


function uniqueKey(technicalType, uniqueName) {
    // Attention when this logic is changed !! :
    // Files with generation Information will not be readable anymore
    return technicalType + '..' + uniqueName; // TODO is a .. enough to have always unique keys?
};

function initializeBuildModel() {
    // Call before a new mse model is loaded
    indexByMSEIndex = [];
    currentIndex = 1;

    // Clear old mse model
    modelElementsByUniqueKey = {};
    modelElementsByIndex = [];
    parentChildByParent = [];
    parentChildByChild = [];
    callByCaller = [];
    callByCalled = [];
    accessByAccessor = [];
    accessByAccessed = [];

}

function updateMSEIndex(mseIndex) {
    if (typeof indexByMSEIndex[mseIndex] === 'undefined') {
        indexByMSEIndex[mseIndex] = currentIndex;
        currentIndex += 1;
    }
};

function buildModel(elementName, idVal, nameVal, uniqueNameVal, technicalTypeVal, linkToEditorVal, parentVal, childVal, isMainVal, callerVal, calledVal, accessorVal, accessedVal, isWriteVal, isReadVal, isDependentVal) {

    let cont = '';
    let countUnknownElement = 0;
    if (elementName == 'SOMIX.Grouping' || elementName == 'SOMIX.Code' || elementName == 'SOMIX.Data') {
        updateMSEIndex(idVal);
        const index = indexByMSEIndex[idVal];
        const element = {
            element: elementName,
            index: index,
            name: nameVal,
            technicalType: technicalTypeVal,
            uniqueName: uniqueNameVal,
            linkToEditor: linkToEditorVal,
        };
        modelElementsByUniqueKey[uniqueKey(technicalTypeVal, uniqueNameVal)] = element;
        modelElementsByIndex[index] = element;
    }
    else if (elementName == 'SOMIX.ParentChild') {
        updateMSEIndex(parentVal);
        updateMSEIndex(childVal);
        const parent = indexByMSEIndex[parentVal];
        const child = indexByMSEIndex[childVal];
        const parentChild = {
            parent: parent,
            child: child,
            isMain: isMainVal
        };
        if (typeof parentChildByParent[parent] === 'undefined') {
            parentChildByParent[parent] = [parentChild];
        } else {
            parentChildByParent[parent].push(parentChild);
        };
        if (typeof parentChildByChild[child] === 'undefined') {
            parentChildByChild[child] = [parentChild];
        } else {
            parentChildByChild[child].push(parentChild);
        };
    }
    else if (elementName == 'SOMIX.Call') {
        updateMSEIndex(callerVal);
        updateMSEIndex(calledVal);
        const caller = indexByMSEIndex[callerVal];
        const called = indexByMSEIndex[calledVal];

        const call = {
            caller: caller,
            called: called,
        };
        if (typeof callByCaller[caller] === 'undefined') {
            callByCaller[caller] = [call];
        } else {
            callByCaller[caller].push(call);
        };
        if (typeof callByCalled[called] === 'undefined') {
            callByCalled[called] = [call];
        } else {
            callByCalled[called].push(call);
        };

    }
    else if (elementName == 'SOMIX.Access') {
        updateMSEIndex(accessorVal);
        updateMSEIndex(accessedVal);
        const accessor = indexByMSEIndex[accessorVal];
        const accessed = indexByMSEIndex[accessedVal];

        const access = {
            accessor: accessor,
            accessed: accessed,
            isWrite: isWriteVal,
            isRead: isReadVal,
            isDependent: isDependentVal
        };

        if (typeof accessByAccessor[accessor] === 'undefined') {
            accessByAccessor[accessor] = [access];
        } else {
            accessByAccessor[accessor].push(access);
        };

        if (typeof accessByAccessed[accessed] === 'undefined') {
            accessByAccessed[accessed] = [access];
        } else {
            accessByAccessed[accessed].push(access)
        };
    }
    else {
        // TODO handle unknown elements
    };

    switch (elementName) {
        case 'SOMIX.Grouping':
            cont = cont + elementName + ' name: ' + nameVal + ' uniqueName: ' + uniqueNameVal + ' technicalType: ' + technicalTypeVal + '|';
            break;
        case 'SOMIX.Code':
            cont = cont + elementName + ' name: ' + nameVal + ' uniqueName: ' + uniqueNameVal + ' technicalType: ' + technicalTypeVal + '|';
            break;
        case 'SOMIX.Data':
            cont = cont + elementName + ' name: ' + nameVal + ' uniqueName: ' + uniqueNameVal + ' technicalType: ' + technicalTypeVal + '|';
            break;
        case 'SOMIX.ParentChild':
            cont = cont + elementName + ' parent: ' + parentVal + ' child: ' + childVal + ' isMain: ' + isMainVal + '|';
            break;
        case 'SOMIX.Call':
            cont = cont + elementName + ' caller: ' + callerVal + ' called: ' + calledVal + '|';
            break;
        case 'SOMIX.Access':
            cont = cont + elementName + ' accessor: ' + accessorVal + ' accessed: ' + accessedVal + ' isWrite: ' + isWriteVal + ' isRead: ' + isReadVal + ' isDependent: ' + isDependentVal + '|';
            break;
        default:
            countUnknownElement += 1;
    };
    return cont;
}
