'use strict';

/** Contains a list of all elements which are not yet positioned */
let repositionRequireds = [];

function resetRepositionRequired() { repositionRequireds = []; }

function repositionRequired(index) {
    if (!repositionRequireds.includes(index)) {
        repositionRequireds.push(index);
    }
}

function removeRepositionRequired(index) {
    const indexToRemove = repositionRequireds.indexOf(index);
    if (indexToRemove !== -1) {
        // Remove the index from the array using splice
        repositionRequireds.splice(indexToRemove, 1);
    }
}

function doRepositioningOfRequired() { // Reposition all elements which are required to be repositioned 
    // Build a list with all parent groups where at least a single element has a position
    let parentGroups = [];
    for (const index of repositionRequireds) {
        if (typeof parentChildByChild[index] !== 'undefined') {
            for (const pC of parentChildByChild[index]) {
                if (pC.isMain) {
                    for (const pP of parentChildByParent[pC.parent]) {
                        if (!repositionRequireds.includes(pP.child)) {
                            if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[pP.child] !== 'undefined') {
                                if (diagramms[diagramInfos.activeDiagram].complModelPosition[pP.child].visible) {
                                    if (!parentGroups[pC.parent]) {
                                        let pG = {};
                                        pG.parent = pC.parent;
                                        pG.x = diagramms[diagramInfos.activeDiagram].complModelPosition[pP.child].x;
                                        pG.y = diagramms[diagramInfos.activeDiagram].complModelPosition[pP.child].y;
                                        pG.countAdded = 1;
                                        parentGroups[pC.parent] = pG;
                                    }
                                    else {
                                        if (typeof parentGroups[pC.parent].x !== 'undefined') {
                                            if (parentGroups[pC.parent].x < diagramms[diagramInfos.activeDiagram].complModelPosition[pP.child].x) {
                                                parentGroups[pC.parent].x = diagramms[diagramInfos.activeDiagram].complModelPosition[pP.child].x;
                                            }
                                            if (parentGroups[pC.parent].y < diagramms[diagramInfos.activeDiagram].complModelPosition[pP.child].y) {
                                                parentGroups[pC.parent].y = diagramms[diagramInfos.activeDiagram].complModelPosition[pP.child].y;
                                            }
                                        }
                                    }

                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // Now reposition all elements which are required to be repositioned
    for (const index of repositionRequireds) {
        if (typeof parentChildByChild[index] !== 'undefined') {
            for (const pC of parentChildByChild[index]) {
                if (pC.isMain) {
                    if (typeof parentGroups[pC.parent] !== 'undefined') {
                        if (typeof parentGroups[pC.parent].x !== 'undefined') { // Reposition only if a parent group exists or has position
                            diagramms[diagramInfos.activeDiagram].complModelPosition[index].x = parentGroups[pC.parent].x + 100 * parentGroups[pC.parent].countAdded;;
                            diagramms[diagramInfos.activeDiagram].complModelPosition[index].y = parentGroups[pC.parent].y + 100;;
                            parentGroups[pC.parent].countAdded += 1;
                        }
                    }
                }
            }
        }
    }

    resetRepositionRequired();
}


function positionCircle(width, height) {

    // Position all elements in a circle
    // Is only called for all model elements after a 
    // new SOMIX model has been loaded

    const offset = 20;
    // const w2 = Math.min(width, height);
    let nElements = 1;
    for (const mEBI of modelElementsByIndex) {
        nElements += 1;
    }
    let w2 = 0;
    if (diagramms[diagramInfos.displayedDiagram].diagramType != circuitDiagramForSoftwareDiagramType) {
        w2 = 5 * diagramms[diagramInfos.displayedDiagram].layoutingState.springLength * Math.sqrt(nElements);
    } else { // Stop processing and show an error message 
        alert("The diagram type 'Circuit Diagram' is not supported for the positioning method 'Position in Circle'");
        return;
    }
    const w4 = w2 / 2 - offset;

    const dAngle = 2 * Math.PI / nElements;
    let angle = 0;

    let x = 0;
    let y = 0;
    diagramms[diagramInfos.displayedDiagram].complModelPosition = [];


    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {

            x = w4 * Math.cos(angle);
            y = w4 * Math.sin(angle);

            let position = {
                visible: true,
                index: mEBI['index'],
                x: x,
                y: y,
            };

            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']] = position;
            angle += dAngle;
        }
    }
};

function redoAddWithNeighbors(element) {

    // Make this diagram active 'All model elements'
    if (diagramInfos.displayedDiagram != startDiagram) { // The start diagram has never to be the active diagram
        diagramInfos.activeDiagram = diagramInfos.displayedDiagram;
    }

    // How is this be done best?
    let where = diagramms[diagramInfos.activeDiagram].generationInfoInternal.addedWithNeighbors.indexOf(element.index);
    if (where != -1) {
        diagramms[diagramInfos.activeDiagram].generationInfoInternal.addedWithNeighbors.splice(where, 1)

        // Remember positions
        let positions = diagramms[diagramInfos.activeDiagram].complModelPosition;

        // Clear content of current diagram
        diagramms[diagramInfos.activeDiagram].complModelPosition = [];

        // Rebuild diagram
        for (const index of diagramms[diagramInfos.activeDiagram].generationInfoInternal.addedWithNeighbors) {
            let element = modelElementsByIndex[index];
            if (typeof element !== 'undefined') {
                addWithNeighbors(element);
            }
        }

        // Position as before

        for (const position of positions) {
            if (typeof position !== 'undefined') {
                if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[position.index] !== 'undefined') {
                    diagramms[diagramInfos.activeDiagram].complModelPosition[position.index] = position;
                }
            }
        }


    }
}

function addWithNeighbors(element, highlight_new = false) {

    if (diagramms[diagramInfos.activeDiagram].generationInfoInternal.addedWithNeighbors.indexOf(element.index) == -1) {
        diagramms[diagramInfos.activeDiagram].generationInfoInternal.addedWithNeighbors.push(element.index);
    }

    // Switch Force-Directing off, so that new elements remain in the box where they have been placed
    diagramms[diagramInfos.activeDiagram].layoutingActive = false;

    let newElBoxX = diagramms[diagramInfos.activeDiagram].diagramSettings.newElementBox.newElBoxX;
    let newElBoxY = diagramms[diagramInfos.activeDiagram].diagramSettings.newElementBox.newElBoxY;
    let newElBoxWidth = diagramms[diagramInfos.activeDiagram].diagramSettings.newElementBox.newElBoxWidth;
    let newElBoxHeight = diagramms[diagramInfos.activeDiagram].diagramSettings.newElementBox.newElBoxHeight;

    let position;
    if (typeof element !== 'undefined') {
        position = {
            visible: true,
            index: element['index'],
            x: newElBoxX + Math.random() * newElBoxWidth,
            y: newElBoxY + Math.random() * newElBoxHeight,
        };
        if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[element['index']] === 'undefined') {
            diagramms[diagramInfos.activeDiagram].complModelPosition[element['index']] = position;
            if (highlight_new) {
                highlightActive(element['index']);
                repositionRequired(element['index']);
            }
        }
    }

    // list of added neigbors. This list is required to add "isMain" parents also

    let addNeighbors = [element.index]; // The element itself has also be in this list. This is required for instance so that also for the added element a parent is displayed

    // Add childs
    // This should currently not be used, because it is not possible to specify that a grouping is added

    if (typeof parentChildByParent[element.index] !== 'undefined') {
        for (const el of parentChildByParent[element.index]) {
            if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.child] === 'undefined') {
                position = {
                    visible: true,
                    index: el.child,
                    x: newElBoxX + Math.random() * newElBoxWidth,
                    y: newElBoxY + Math.random() * newElBoxHeight,
                };
                if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.child] === 'undefined') {
                    diagramms[diagramInfos.activeDiagram].complModelPosition[el.child] = position;
                    if (highlight_new) {
                        highlightActive(el.child);
                        repositionRequired(el.child);
                    }
                    addNeighbors.push(el.child);
                }
            }
        }
    }

    // Add parents
    // Outcomment this. Parents are currently only added when they are specified with isMain in the SOMIX model

    /*     if (typeof parentChildByChild[element.index] !== 'undefined') {
            for (const el of parentChildByChild[element.index]) {
                if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.parent] === 'undefined') {
                    position = {
                        index: el.parent,
                        x: newElBoxX + Math.random() * newElBoxWidth,
                        y: newElBoxY + Math.random() * newElBoxHeight,
                    };
                    if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.parent] === 'undefined') {
                        diagramms[diagramInfos.activeDiagram].complModelPosition[el.parent] = position;
                        addNeighbors.push(el.parent);
                    }
                }
            }
        } */

    // Add called

    if (typeof callByCaller[element.index] !== 'undefined') {
        for (const el of callByCaller[element.index]) {
            if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.called] === 'undefined') {
                position = {
                    visible: true,
                    index: el.called,
                    x: newElBoxX + Math.random() * newElBoxWidth,
                    y: newElBoxY + Math.random() * newElBoxHeight,
                };
                if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.called] === 'undefined') {
                    diagramms[diagramInfos.activeDiagram].complModelPosition[el.called] = position;
                    if (highlight_new) {
                        highlightActive(el.called);
                        repositionRequired(el.called);
                    }
                    addNeighbors.push(el.called);
                }
            }
        }
    }

    // Add callers

    if (typeof callByCalled[element.index] !== 'undefined') {
        for (const el of callByCalled[element.index]) {
            if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.caller] === 'undefined') {
                position = {
                    visible: true,
                    index: el.caller,
                    x: newElBoxX + Math.random() * newElBoxWidth,
                    y: newElBoxY + Math.random() * newElBoxHeight,
                };
                if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.caller] === 'undefined') {
                    diagramms[diagramInfos.activeDiagram].complModelPosition[el.caller] = position;
                    if (highlight_new) {
                        highlightActive(el.caller);
                        repositionRequired(el.caller);
                    }
                    addNeighbors.push(el.caller);
                }
            }
        }
    }

    // Add accessed

    if (typeof accessByAccessor[element.index] !== 'undefined') {
        for (const el of accessByAccessor[element.index]) {
            if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.accessed] === 'undefined') {
                position = {
                    visible: true,
                    index: el.accessed,
                    x: newElBoxX + Math.random() * newElBoxWidth,
                    y: newElBoxY + Math.random() * newElBoxHeight,
                };
                if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.accessed] === 'undefined') {
                    diagramms[diagramInfos.activeDiagram].complModelPosition[el.accessed] = position;
                    if (highlight_new) {
                        highlightActive(el.accessed);
                        repositionRequired(el.accessed);
                    }
                    addNeighbors.push(el.accessed);
                }
            }
        }
    }

    // Add accessors

    if (typeof accessByAccessed[element.index] !== 'undefined') {
        for (const el of accessByAccessed[element.index]) {
            if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.accessor] === 'undefined') {
                position = {
                    visible: true,
                    index: el.accessor,
                    x: newElBoxX + Math.random() * newElBoxWidth,
                    y: newElBoxY + Math.random() * newElBoxHeight,
                };
                if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.accessor] === 'undefined') {
                    diagramms[diagramInfos.activeDiagram].complModelPosition[el.accessor] = position;
                    if (highlight_new) {
                        highlightActive(el.accessor);
                        repositionRequired(el.accessor);
                    }
                    addNeighbors.push(el.accessor);
                }
            }
        }
    }

    // Add "isMain" parents of all added elements when they exist.
    // This is required, so that a user understands for instance to which class a method belongs. Method names
    // are normally not unique nor understandable without the class name

    for (const element of addNeighbors) {
        if (typeof parentChildByChild[element] !== 'undefined') {
            for (const el of parentChildByChild[element]) {
                if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.parent] === 'undefined') {
                    if (el.isMain) {
                        position = {
                            visible: true,
                            index: el.parent,
                            x: newElBoxX + Math.random() * newElBoxWidth,
                            y: newElBoxY + Math.random() * newElBoxHeight,
                        };
                        if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.parent] === 'undefined') {
                            diagramms[diagramInfos.activeDiagram].complModelPosition[el.parent] = position;
                            highlightActive(el.parent);
                            repositionRequired(el.parent);
                        }
                    }
                }
            }
        }
    }

}

function suppressChildren(index, suppressedIndex) {
    if (typeof parentChildByParent[index] !== 'undefined') {
        for (const pC of parentChildByParent[index]) {
            if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[pC.child] !== 'undefined') {
                if (diagramms[diagramInfos.activeDiagram].complModelPosition[pC.child].visible) {
                    diagramms[diagramInfos.activeDiagram].complModelPosition[pC.child].visible = false;
                    if (typeof diagramms[diagramInfos.activeDiagram].generationInfoInternal.suppressedDueTo[suppressedIndex] === 'undefined') {
                        diagramms[diagramInfos.activeDiagram].generationInfoInternal.suppressedDueTo[suppressedIndex] = [];
                    }
                    if (diagramms[diagramInfos.activeDiagram].generationInfoInternal.suppressedDueTo[suppressedIndex].indexOf(pC.child) == -1) {
                        diagramms[diagramInfos.activeDiagram].generationInfoInternal.suppressedDueTo[suppressedIndex].push(pC.child);
                    }
                    suppressChildren(pC.child, suppressedIndex);
                }
            }
        }
    }
}

function suppress(element) {

    if (diagramms[diagramInfos.activeDiagram].generationInfoInternal.suppressed.indexOf(element.index) == -1) {
        diagramms[diagramInfos.activeDiagram].generationInfoInternal.suppressed.push(element.index);
    }

    // Remove now all suppressed elements
    if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[element.index] !== 'undefined') {
        diagramms[diagramInfos.activeDiagram].complModelPosition[element.index].visible = false;
        suppressChildren(element.index, element.index);
    }

}

function redoSuppress(element) {

    // Make this diagram active 'All model elements'
    if (diagramInfos.displayedDiagram != startDiagram) { // The start diagram has never to be the active diagram
        diagramInfos.activeDiagram = diagramInfos.displayedDiagram;
    }

    let where = diagramms[diagramInfos.activeDiagram].generationInfoInternal.suppressed.indexOf(element.index);
    if (where != -1) {
        diagramms[diagramInfos.activeDiagram].generationInfoInternal.suppressed.splice(where)
    }

    // add now all suppressed elements
    if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[element.index] !== 'undefined') {
        diagramms[diagramInfos.activeDiagram].complModelPosition[element.index].visible = true;
    }

    // Make all elements visible which were made invisible due to suppressing the element where it is redone
    if (typeof diagramms[diagramInfos.activeDiagram].generationInfoInternal.suppressedDueTo[element.index] !== 'undefined') {
        for (const sDT of diagramms[diagramInfos.activeDiagram].generationInfoInternal.suppressedDueTo[element.index]) {
            if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[sDT] !== 'undefined') {
                diagramms[diagramInfos.activeDiagram].complModelPosition[sDT].visible = true;
            }
        }
    }

}

