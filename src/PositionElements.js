'use strict';

const newElBoxX = 0;
const newElBoxY = 0;
const newElBoxWidth = 100 * scale;
const newElBoxHeight = 100 * scale;


function positionCircle(width, height) {
    const offset = 20;
    // const w2 = Math.min(width, height);
    let nElements = 1;
    for (const mEBI of modelElementsByIndex) {
        nElements += 1;
    }

    const w2 = 5 * diagramms[diagramInfos.displayedDiagram].forceDirectingState.springLength * Math.sqrt(nElements);
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
        diagramms[diagramInfos.activeDiagram].generationInfoInternal.addedWithNeighbors.splice(where)

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

function addWithNeighbors(element) {

    if (diagramms[diagramInfos.activeDiagram].generationInfoInternal.addedWithNeighbors.indexOf(element.index) == -1) {
        diagramms[diagramInfos.activeDiagram].generationInfoInternal.addedWithNeighbors.push(element.index);
    }

    // Switch Force-Directing off, so that new elements remain in the box where they have been placed
    diagramms[diagramInfos.activeDiagram].forceFeedback = false;

    let position;
    if (typeof element !== 'undefined') {
        position = {
            index: element['index'],
            x: newElBoxX + Math.random() * newElBoxWidth,
            y: newElBoxY + Math.random() * newElBoxHeight,
        };
        if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[element['index']] === 'undefined') {
            diagramms[diagramInfos.activeDiagram].complModelPosition[element['index']] = position;
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
                    index: el.child,
                    x: newElBoxX + Math.random() * newElBoxWidth,
                    y: newElBoxY + Math.random() * newElBoxHeight,
                };
                if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.child] === 'undefined') {
                    diagramms[diagramInfos.activeDiagram].complModelPosition[el.child] = position;
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
                    index: el.called,
                    x: newElBoxX + Math.random() * newElBoxWidth,
                    y: newElBoxY + Math.random() * newElBoxHeight,
                };
                if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.called] === 'undefined') {
                    diagramms[diagramInfos.activeDiagram].complModelPosition[el.called] = position;
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
                    index: el.caller,
                    x: newElBoxX + Math.random() * newElBoxWidth,
                    y: newElBoxY + Math.random() * newElBoxHeight,
                };
                if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.caller] === 'undefined') {
                    diagramms[diagramInfos.activeDiagram].complModelPosition[el.caller] = position;
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
                    index: el.accessed,
                    x: newElBoxX + Math.random() * newElBoxWidth,
                    y: newElBoxY + Math.random() * newElBoxHeight,
                };
                if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.accessed] === 'undefined') {
                    diagramms[diagramInfos.activeDiagram].complModelPosition[el.accessed] = position;
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
                    index: el.accessor,
                    x: newElBoxX + Math.random() * newElBoxWidth,
                    y: newElBoxY + Math.random() * newElBoxHeight,
                };
                if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.accessor] === 'undefined') {
                    diagramms[diagramInfos.activeDiagram].complModelPosition[el.accessor] = position;
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
                            index: el.parent,
                            x: newElBoxX + Math.random() * newElBoxWidth,
                            y: newElBoxY + Math.random() * newElBoxHeight,
                        };
                        if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[el.parent] === 'undefined') {
                            diagramms[diagramInfos.activeDiagram].complModelPosition[el.parent] = position;
                        }
                    }
                }
            }
        }
    }

}

