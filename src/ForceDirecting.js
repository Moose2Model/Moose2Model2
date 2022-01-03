'use strict';

/** Remember the loop in the Force-Directing logic */
let previousLoop = -1;
/** Remember the index of the last processed loop in the Force-Directing logic */
let previousLoopIndex = -1;
// /** Remember the index when the loop for repulsion was left to improve performance */
// let previousRepulsionIndex = -1;

const maxTimeForceDirectMs = 200;

let complModelPositionNew = [];
let complModelPositionNew2 = [];

function forceDirecting(width, height) {

    let redraw = false;

    const w2 = Math.min(width, height);
    let nElements = 1;
    for (const mEBI of modelElementsByIndex) {
        nElements += 1;
    }

    if (nElements == 1) {
        redraw = true;
        return redraw;
    }
    if (previousLoop == -1 && previousLoopIndex == -1) {
        complModelPositionNew = [];
        complModelPositionNew2 = [];

        for (const mEBI of modelElementsByIndex) {
            if (typeof mEBI !== 'undefined') {

                let position = {
                    // x: complModelPosition[mEBI['index']].x,
                    // y: complModelPosition[mEBI['index']].y,
                    x: 0,
                    y: 0,
                };
                complModelPositionNew[mEBI['index']] = position;
                complModelPositionNew2[mEBI['index']] = position;
            }
        }
    }

    const avgLen = w2 / Math.sqrt(nElements);
    // const step = 0.00002; // für 300kb Model
    // const step = 0.000001; // für 4 MB Model
    const step = 0.00002;

    function spring(x1, y1, x2, y2) {
        let vect = {
            x: x2 - x1,
            y: y2 - y1
        };
        let dist = Math.sqrt(vect.x * vect.x + vect.y * vect.y);
        let force = {
            x: vect.x * (dist - avgLen),
            y: vect.y * (dist - avgLen)
        };
        return force;
    };

    function repulsion(x1, y1, x2, y2) {
        let vect = {
            x: x2 - x1,
            y: y2 - y1
        };
        let dist = Math.sqrt(vect.x * vect.x + vect.y * vect.y);
        let fact = 1;
        if (dist > 20) {
            fact = 0;
        } else if (dist < 0.1) {
            fact = 100;
        } else { fact = 1 / (dist * dist) };
        fact = -fact * 2000;
        let force = {
            x: vect.x * fact,
            y: vect.y * fact
        };
        return force;
    };

    let startTime = Date.now();

    if (previousLoop == -1) {
        previousLoop = 1;
        previousLoopIndex = 1;
    } else if (previousLoop > 4) {
        previousLoop = 1;
        previousLoopIndex = 1;
    }
    /** @deprecated */
    let loopCount = 0;

    for (let i = previousLoop; i <= 4; i++) {

        if (i == 1) {
            for (let j = previousLoopIndex; j < parentChildByParent.length; j++) {
                let pCBP = parentChildByParent[j];
                if (typeof pCBP !== 'undefined') {
                    for (const pC of pCBP) {
                        let pCForce = spring(
                            diagramms[activeDiagram].complModelPosition[pC['parent']].x,
                            diagramms[activeDiagram].complModelPosition[pC['parent']].y,
                            diagramms[activeDiagram].complModelPosition[pC['child']].x,
                            diagramms[activeDiagram].complModelPosition[pC['child']].y);
                        complModelPositionNew[pC['parent']].x += 0.2 * step * pCForce.x; // Make parent more heavy, therefore a factor 0.2
                        complModelPositionNew[pC['parent']].y += 0.2 * step * pCForce.y; // Make parent more heavy, therefore a factor 0.2
                        complModelPositionNew[pC['child']].x -= step * pCForce.x;
                        complModelPositionNew[pC['child']].y -= step * pCForce.y;
                    }
                }
                if ((Date.now() - startTime) > maxTimeForceDirectMs) {
                    previousLoopIndex = j + 1;
                    previousLoop = 1;
                    redraw = false;
                    return redraw;
                }
            }
            previousLoop = 2;
            previousLoopIndex = 1;
        }

        if (i == 2) {
            for (let j = previousLoopIndex; j < callByCaller.length; j++) {
                let cBC = callByCaller[j];
                if (typeof cBC !== 'undefined') {
                    for (const cC of cBC) {
                        let cCForce = spring(
                            diagramms[activeDiagram].complModelPosition[cC['caller']].x,
                            diagramms[activeDiagram].complModelPosition[cC['caller']].y,
                            diagramms[activeDiagram].complModelPosition[cC['called']].x,
                            diagramms[activeDiagram].complModelPosition[cC['called']].y);
                        complModelPositionNew[cC['caller']].x += step * cCForce.x;
                        complModelPositionNew[cC['caller']].y += step * cCForce.y;
                        complModelPositionNew[cC['called']].x -= step * cCForce.x;
                        complModelPositionNew[cC['called']].y -= step * cCForce.y;
                    }
                }
                if ((Date.now() - startTime) > maxTimeForceDirectMs) {
                    previousLoopIndex = j + 1;
                    previousLoop = 2;
                    redraw = false;
                    return redraw;
                }
            }
            previousLoop = 3;
            previousLoopIndex = 1;
        }

        if (i == 3) {
            for (let j = previousLoopIndex; j < accessByAccessor.length; j++) {
                let aBA = accessByAccessor[j];
                if (typeof aBA !== 'undefined') {
                    for (const aA of aBA) {
                        let aAForce = spring(
                            diagramms[activeDiagram].complModelPosition[aA['accessor']].x,
                            diagramms[activeDiagram].complModelPosition[aA['accessor']].y,
                            diagramms[activeDiagram].complModelPosition[aA['accessed']].x,
                            diagramms[activeDiagram].complModelPosition[aA['accessed']].y);
                        complModelPositionNew[aA['accessor']].x += step * aAForce.x;
                        complModelPositionNew[aA['accessor']].y += step * aAForce.y;
                        complModelPositionNew[aA['accessed']].x -= step * aAForce.x;
                        complModelPositionNew[aA['accessed']].y -= step * aAForce.y;
                    }
                }
                if ((Date.now() - startTime) > maxTimeForceDirectMs) {
                    previousLoopIndex = j + 1;
                    previousLoop = 3;
                    redraw = false;
                    return redraw;
                }
            }
            previousLoop = 4;
            previousLoopIndex = 1;
        }

        if (i == 4) {
            for (let j = previousLoopIndex; j < modelElementsByIndex.length; j++) {
                let mEBI = modelElementsByIndex[j];
                if (typeof mEBI !== 'undefined') {
                    for (const mEBI2 of modelElementsByIndex) {
                        if (typeof mEBI2 !== 'undefined') {
                            if (mEBI != mEBI2) {
                                let eForce = repulsion(
                                    diagramms[activeDiagram].complModelPosition[mEBI['index']].x,
                                    diagramms[activeDiagram].complModelPosition[mEBI['index']].y,
                                    diagramms[activeDiagram].complModelPosition[mEBI2['index']].x,
                                    diagramms[activeDiagram].complModelPosition[mEBI2['index']].y);
                                complModelPositionNew2[mEBI['index']].x += step * eForce.x;
                                complModelPositionNew2[mEBI['index']].y += step * eForce.y;
                                complModelPositionNew2[mEBI2['index']].x -= step * eForce.x;
                                complModelPositionNew2[mEBI2['index']].y -= step * eForce.y;
                            }
                        }
                    }
                }
                if ((Date.now() - startTime) > maxTimeForceDirectMs) {
                    if (j + 1 < modelElementsByIndex.length) {
                        previousLoopIndex = j + 1;
                        previousLoop = 4;
                        redraw = false;
                        return redraw;
                    }
                    else {
                        // In rare cases the time limit was approached when the last loop pass occured
                        previousLoop = -1;
                        previousLoopIndex = -1;
                    }
                }
            }
        };
        previousLoop = -1;
        previousLoopIndex = -1;
    }

    // Determine correction factor

    let maxDiff = 0.
    let corrFact = 1;

    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {

            let handledIndex = mEBI['index'];
            if (isDragging && draggedIndex == handledIndex) {
                // Do not alter the position of currently dragged elements
                complModelPositionNew[mEBI['index']].x = 0; 
                complModelPositionNew2[mEBI['index']].x = 0;
                complModelPositionNew[mEBI['index']].y = 0; 
                complModelPositionNew2[mEBI['index']].y = 0;
                continue;
            }

            if (diagramms[activeDiagram].pinned.indexOf(handledIndex) > -1) {
                // Do not alter position of pinned elements
                complModelPositionNew[mEBI['index']].x = 0; 
                complModelPositionNew2[mEBI['index']].x = 0;
                complModelPositionNew[mEBI['index']].y = 0; 
                complModelPositionNew2[mEBI['index']].y = 0;
                continue;
            }

            if (Math.abs(complModelPositionNew[mEBI['index']].x) > maxDiff) {
                maxDiff = Math.abs(complModelPositionNew[mEBI['index']].x + complModelPositionNew2[mEBI['index']].x);
            };
            if (Math.abs(complModelPositionNew[mEBI['index']].y) > maxDiff) {
                maxDiff = Math.abs(complModelPositionNew[mEBI['index']].y + complModelPositionNew2[mEBI['index']].y);
            };
        }
    }

    if (maxDiff > 100) {
        corrFact = 100 / maxDiff;
    }

    // Calculate new positions
    let draggedIndex = 0;
    if (isDragging) {
        draggedIndex = draggedElement.index;
    }

    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {

            let handledIndex = mEBI['index'];

            // let handledIndex = mEBI['index'];
            // if (isDragging && draggedIndex == handledIndex) {
            //     // Do not alter the position of currently dragged elements
            //     continue;
            // }

            // if (diagramms[activeDiagram].pinned.indexOf(handledIndex) > -1) {
            //     // Do not alter position of pinned elements
            //     continue;
            // }

            let position = {
                x: corrFact * complModelPositionNew[handledIndex].x + corrFact * complModelPositionNew2[handledIndex].x + diagramms[activeDiagram].complModelPosition[handledIndex].x,
                y: corrFact * complModelPositionNew[handledIndex].y + corrFact * complModelPositionNew2[handledIndex].y + diagramms[activeDiagram].complModelPosition[handledIndex].y,
            };
            diagramms[activeDiagram].complModelPosition[handledIndex] = position;
        }
    }

    
    redraw = true;
    return redraw;

};