function autoLayout(width, height) {

    let redraw = false;
    /** @deprecated */
    const w2 = Math.min(width, height);
    let nElements = 1;
    // for (const mEBI of modelElementsByIndex) {
    for (const mEBI of diagramms[diagramInfos.displayedDiagram].complModelPosition) {
        if (typeof mEBI !== 'undefined') {
            if (mEBI.visible == true) {
                nElements += 1;
            }
        }
    }

    if (nElements == 1) {
        redraw = true;
        return redraw;
    }
    if (diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoop == -1 &&
        diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex == -1) {
        diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew = [];
        diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2 = [];
        diagramms[diagramInfos.displayedDiagram].forceDirectingState.elementsGrouped = [];

        // for (const mEBI of modelElementsByIndex) {
        for (const mEBI of diagramms[diagramInfos.displayedDiagram].complModelPosition) {
            if (typeof mEBI !== 'undefined') {

                let position = {
                    // x: complModelPosition[mEBI['index']].x,
                    // y: complModelPosition[mEBI['index']].y,
                    visible: mEBI.visible,
                    index: mEBI['index'],
                    x: 0,
                    y: 0,
                };
                diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[mEBI['index']] = position;
                diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2[mEBI['index']] = position;

                // The following is required to optimize the calculation of repulsions. Adjacent elements are grouped together
                // The following appears to be the best way to implement the DIV operation in Javascript
                // (https://stackoverflow.com/questions/4228356/how-to-perform-an-integer-division-and-separately-get-the-remainder-in-javascr)
                let groupX = Math.floor(mEBI.x / (diagramms[diagramInfos.displayedDiagram].forceDirectingState.maxRepulsionLength + oversizeGroups));
                let groupY = Math.floor(mEBI.y / (diagramms[diagramInfos.displayedDiagram].forceDirectingState.maxRepulsionLength + oversizeGroups));
                if (typeof diagramms[diagramInfos.displayedDiagram].forceDirectingState.elementsGrouped[groupX] === 'undefined') {
                    diagramms[diagramInfos.displayedDiagram].forceDirectingState.elementsGrouped[groupX] = [];
                }
                if (typeof diagramms[diagramInfos.displayedDiagram].forceDirectingState.elementsGrouped[groupX][groupY] === 'undefined') {
                    diagramms[diagramInfos.displayedDiagram].forceDirectingState.elementsGrouped[groupX][groupY] = [];
                }
                diagramms[diagramInfos.displayedDiagram].forceDirectingState.elementsGrouped[groupX][groupY].push(mEBI);
            }
        }
    }

    const oldSpringLength = w2 / Math.sqrt(nElements);
    // const step = 0.00002; // für 300kb Model
    // const step = 0.000001; // für 4 MB Model
    const step = 0.00002;

    let startTime = Date.now();

    if (diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoop == -1) {
        diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoop = 1;
        diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex = 1;
    } else if (diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoop > maxForceIndex) {
        diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoop = 1;
        diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex = 1;
    }
    /** @deprecated */
    let loopCount = 0;

    for (let i = diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoop; i <= maxForceIndex; i++) {
        // i = 1: Forces due to spring foreces between parent and child elements
        if (diagramms[diagramInfos.displayedDiagram].diagramType != circuitDiagramForSoftwareDiagramType) {
            // Forces for parent child relations are not effective for Circuit diagrams
            if (i == 1) {
                for (let j = diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex; j < parentChildByParent.length; j++) {
                    let pCBP = parentChildByParent[j];
                    if (typeof pCBP !== 'undefined') {
                        for (const pC of pCBP) {
                            if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['parent']] !== 'undefined' &&
                                typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['child']] !== 'undefined') {

                                if (diagramms[diagramInfos.displayedDiagram].complModelPosition[pC.parent].visible &&
                                    diagramms[diagramInfos.displayedDiagram].complModelPosition[pC.child].visible) {

                                    let pCForce = spring(
                                        diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['parent']].x,
                                        diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['parent']].y,
                                        diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['child']].x,
                                        diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['child']].y);
                                    diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[pC['parent']].x += step * pCForce.x;
                                    diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[pC['parent']].y += step * pCForce.y;
                                    diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[pC['child']].x -= step * pCForce.x;
                                    diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[pC['child']].y -= step * pCForce.y;

                                }
                            }
                        }
                    }
                    if ((Date.now() - startTime) > maxTimeForceDirectMs) {
                        diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex = j + 1;
                        diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoop = 1;
                        redraw = false;
                        return redraw;
                    }
                }
                diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoop = 2;
                diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex = 1;
            }
        }

        if (i == 2) {
            // i=2: Forces due to spring forces between caller and called elements
            for (let j = diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex; j < callByCaller.length; j++) {
                let cBC = callByCaller[j];
                if (typeof cBC !== 'undefined') {
                    for (const cC of cBC) {
                        if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']] !== 'undefined' &&
                            typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']] !== 'undefined') {

                            if (diagramms[diagramInfos.displayedDiagram].complModelPosition[cC.caller].visible &&
                                diagramms[diagramInfos.displayedDiagram].complModelPosition[cC.called].visible) {

                                let cCForce = spring(
                                    diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].x,
                                    diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].y,
                                    diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].x,
                                    diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].y);
                                diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[cC['caller']].x += step * cCForce.x;
                                diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[cC['caller']].y += step * cCForce.y;
                                diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[cC['called']].x -= step * cCForce.x;
                                diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[cC['called']].y -= step * cCForce.y;
                            }



                        }
                    }
                }
                if ((Date.now() - startTime) > maxTimeForceDirectMs) {
                    diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex = j + 1;
                    diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoop = 2;
                    redraw = false;
                    return redraw;
                }
            }
            diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoop = 3;
            diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex = 1;
        }

        if (i == 3) {
            // i=3: Forces due to spring forces between accessors and accessed elements
            for (let j = diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex; j < accessByAccessor.length; j++) {
                let aBA = accessByAccessor[j];
                if (typeof aBA !== 'undefined') {
                    for (const aA of aBA) {
                        if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessor']] !== 'undefined' &&
                            typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']] !== 'undefined') {
                            if (diagramms[diagramInfos.displayedDiagram].complModelPosition[aA.accessor].visible &&
                                diagramms[diagramInfos.displayedDiagram].complModelPosition[aA.accessed].visible) {

                                let aAForce = spring(
                                    diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessor']].x,
                                    diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessor']].y,
                                    diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']].x,
                                    diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']].y);
                                diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[aA['accessor']].x += step * aAForce.x;
                                diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[aA['accessor']].y += step * aAForce.y;
                                diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[aA['accessed']].x -= step * aAForce.x;
                                diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[aA['accessed']].y -= step * aAForce.y;
                            }



                        }
                    }
                }
                if ((Date.now() - startTime) > maxTimeForceDirectMs) {
                    diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex = j + 1;
                    diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoop = 3;
                    redraw = false;
                    return redraw;
                }
            }
            diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoop = 4;
            diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex = 1;
        }

        if (i == 4) {
            // i=4: Forces due to repulsion between elements

            // for (let j = diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex; j < modelElementsByIndex.length; j++) {
            //     let mEBI = modelElementsByIndex[j];
            for (let j = diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex; j < diagramms[diagramInfos.displayedDiagram].complModelPosition.length; j++) {
                let mEBI = diagramms[diagramInfos.displayedDiagram].complModelPosition[j];
                if (typeof mEBI !== 'undefined') {
                    if (mEBI.visible) {

                        if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']] !== 'undefined') {

                            let groupX = Math.floor(mEBI.x / (diagramms[diagramInfos.displayedDiagram].forceDirectingState.maxRepulsionLength + oversizeGroups));
                            let groupY = Math.floor(mEBI.y / (diagramms[diagramInfos.displayedDiagram].forceDirectingState.maxRepulsionLength + oversizeGroups));

                            for (let ix = groupX - 2; ix <= groupX + 2; ix++) {
                                for (let iy = groupY - 2; iy <= groupY + 2; iy++) {
                                    if (typeof diagramms[diagramInfos.displayedDiagram].forceDirectingState.elementsGrouped[ix] !== 'undefined') {
                                        if (typeof diagramms[diagramInfos.displayedDiagram].forceDirectingState.elementsGrouped[ix][iy] !== 'undefined') {
                                            for (const mEBI2 of diagramms[diagramInfos.displayedDiagram].forceDirectingState.elementsGrouped[ix][iy]) {
                                                if (mEBI.index < mEBI2.index) {
                                                    let doIt = false;
                                                    if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType) {
                                                        // No Forces due to groupings which are not displayed in the Circuit Diagram
                                                        let mEBI_1 = modelElementsByIndex[mEBI.index];
                                                        let mEBI_2 = modelElementsByIndex[mEBI2.index];
                                                        if (mEBI_1.element != 'SOMIX.Grouping' && mEBI_2.element != 'SOMIX.Grouping') {
                                                            doIt = true;
                                                        }
                                                    } else {
                                                        doIt = true;
                                                    }
                                                    if (doIt == true) {
                                                        let eForce = repulsion(
                                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x,
                                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y,
                                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI2['index']].x,
                                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI2['index']].y);
                                                        diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2[mEBI['index']].x += step * eForce.x;
                                                        diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2[mEBI['index']].y += step * eForce.y;
                                                        diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2[mEBI2['index']].x -= step * eForce.x;
                                                        diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2[mEBI2['index']].y -= step * eForce.y;
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
                if ((Date.now() - startTime) > maxTimeForceDirectMs) {
                    // if (j + 1 < modelElementsByIndex.length) {
                    if (j + 1 < diagramms[diagramInfos.displayedDiagram].complModelPosition.length) {
                        diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex = j + 1;
                        diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoop = 4;
                        redraw = false;
                        return redraw;
                    }
                    else {
                        // In rare cases the time limit was approached when the last loop pass occured
                        diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoop = -1;
                        diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex = -1;
                    }
                }
            }
        };
        diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoop = -1;
        diagramms[diagramInfos.displayedDiagram].forceDirectingState.previousLoopIndex = -1;
    }

    // Determine correction factor

    let maxDiff = 0.
    let corrFact = 1;
    let draggedIndex = 0;

    // for (const mEBI of modelElementsByIndex) {
    for (const mEBI of diagramms[diagramInfos.displayedDiagram].complModelPosition) {
        if (typeof mEBI !== 'undefined') {
            if (mEBI.visible) {
                let handledIndex = mEBI['index'];
                if (isDragging && !backGroundDragged) {
                    if (draggedIndex == handledIndex) {
                        // Do not alter the position of currently dragged elements
                        diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[mEBI['index']].x = 0;
                        diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2[mEBI['index']].x = 0;
                        diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[mEBI['index']].y = 0;
                        diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2[mEBI['index']].y = 0;
                        continue;
                    }
                }

                if (diagramms[diagramInfos.displayedDiagram].pinned.indexOf(handledIndex) > -1) {
                    // Do not alter position of pinned elements
                    diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[mEBI['index']].x = 0;
                    diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2[mEBI['index']].x = 0;
                    diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[mEBI['index']].y = 0;
                    diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2[mEBI['index']].y = 0;
                    continue;
                }

                if (Math.abs(diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[mEBI['index']].x + diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2[mEBI['index']].x) > maxDiff) {
                    maxDiff = Math.abs(diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[mEBI['index']].x + diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2[mEBI['index']].x);
                };
                if (Math.abs(diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[mEBI['index']].y + diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2[mEBI['index']].y) > maxDiff) {
                    maxDiff = Math.abs(diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[mEBI['index']].y + diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2[mEBI['index']].y);
                };
            }
        }
    }

    if (maxDiff > 100 * scale) {
        corrFact = 100 * scale / maxDiff;
    }

    // Calculate new positions
    if (isDragging && !backGroundDragged) {
        draggedIndex = draggedElement.index;
    }

    // for (const mEBI of modelElementsByIndex) {
    for (const mEBI of diagramms[diagramInfos.displayedDiagram].complModelPosition) {
        if (typeof mEBI !== 'undefined') {
            if (mEBI.visible) {
                let handledIndex = mEBI['index'];

                // let handledIndex = mEBI['index'];
                // if (isDragging && draggedIndex == handledIndex) {
                //     // Do not alter the position of currently dragged elements
                //     continue;
                // }

                // if (diagramms[diagramInfos.displayedDiagram].pinned.indexOf(handledIndex) > -1) {
                //     // Do not alter position of pinned elements
                //     continue;
                // }
                if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[handledIndex] !== 'undefined') {
                    let position = {
                        index: handledIndex,
                        x: corrFact * diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[handledIndex].x + corrFact * diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2[handledIndex].x + diagramms[diagramInfos.displayedDiagram].complModelPosition[handledIndex].x,
                        y: corrFact * diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew[handledIndex].y + corrFact * diagramms[diagramInfos.displayedDiagram].forceDirectingState.complModelPositionNew2[handledIndex].y + diagramms[diagramInfos.displayedDiagram].complModelPosition[handledIndex].y,
                    };
                    // Do not overwrite other fields of complModelPosition
                    diagramms[diagramInfos.displayedDiagram].complModelPosition[handledIndex].x = position.x;
                    diagramms[diagramInfos.displayedDiagram].complModelPosition[handledIndex].y = position.y;
                }
            }
        }
    }


    redraw = true;
    return redraw;

};