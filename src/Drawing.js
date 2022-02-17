'use strict';
// For Canvas sometimes needed

// function resizeCanvas() {
//     let g_width = window.innerWidth - 40;
//     let g_height = window.innerHeight - 100;
// }

// Colors

// See also issue #23 - Not all colors are currently used
let circuitDiagramColorCode = '#ffeb99';
let circuitDiagramColorHighlightedCode = '#ff9900';
let circuitDiagramColorData = '#ccffff';
let circuitDiagramColorHighlightedData = '#0000ff';
let circuitDiagramColorDataPersistent = '#ccff99';
let circuitDiagramColorHighlightedDataPersistent = '#00ff00';
// let circuitDiagramColorCallLines = '#cbcbcb'; // Is to some extend transparent in old solution
// let circuitDiagramColorAccessesLines = '#9898fe'; // Is to some extend transparent in old solution
// let circuitDiagramColorCommentLines = '#feds98';
let circuitDiagramColorCallLines = '#97979780'; // 50% transparent
let circuitDiagramColorAccessesLines = '#3131fd80'; // 50% transparent
let circuitDiagramColorCommentLines = '#fdab3180';

function supportRetina() {
    resizeCanvas();
    // var canvas = document.getElementById('pane');
    // increase the actual size of our canvas
    canvas.width = g_width * devicePixelRatio;
    canvas.height = g_height * devicePixelRatio;

    // ensure all drawing operations are scaled
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // scale everything down using CSS
    canvas.style.width = g_width + 'px';
    canvas.style.height = g_height + 'px';
};

function cameraToCanvasX(x) {

    return diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor * (x + diagramms[diagramInfos.displayedDiagram].cameraSettings.move.x) + g_width / 2;

}

function cameraToPaneX(canvasX) {

    return - diagramms[diagramInfos.displayedDiagram].cameraSettings.move.x + (canvasX - g_width / 2) / diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor;

}

function cameraToCanvasY(y) {

    return diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor * (y + diagramms[diagramInfos.displayedDiagram].cameraSettings.move.y) + g_height / 2;

}

function cameraToPaneY(canvasY) {

    return - diagramms[diagramInfos.displayedDiagram].cameraSettings.move.y + (canvasY - g_height / 2) / diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor;

}

function cameraToCanvasScale(size) {
    return diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor * size;
}

function cameraToPaneScale(size) {
    return size / diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor;
}

function isInBox(x, y, bX1, bX2, bY1, bY2, marginX, marginY) {
    // normalize box
    let nbX1, nbX2, nbY1, nbY2;
    if (bX1 < bX2) {
        nbX1 = bX1;
        nbX2 = bX2;
    } else {
        nbX1 = bX2;
        nbX2 = bX1;
    };
    if (bY1 < bY2) {
        nbY1 = bY1;
        nbY2 = bY2;
    } else {
        nbY1 = bY2;
        nbY2 = bY1;
    };
    if (x < nbX1 - marginX) { return false };
    if (x > nbX2 + marginX) { return false };
    if (y < nbY1 - marginY) { return false };
    if (y > nbY2 + marginY) { return false };
    return true;
}

const fontSizeGeneral = 3;
const groupSize = 8;
const codeSize = 7;
const dataSize = 7;
const generalFontSize = 12;

function drawCompleteModel(ctx, width, height) {
    if (typeof diagramms[diagramInfos.displayedDiagram] === 'undefined') {
        // Do not draw when no diagram exists
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (diagramms[diagramInfos.displayedDiagram].complModelPosition.length == 0) {
        ctx.font = '15px sans-serif';
        ctx.fillStyle = 'black'
        ctx.fillText('This diagram is currently empty: ' + diagramInfos.displayedDiagram, 10, 50);
        return;
    }

    // Draw background
    if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayNewElementBox == true) {
        ctx.lineWidth = cameraToCanvasScale(1);
        ctx.setLineDash([cameraToCanvasScale(8), cameraToCanvasScale(2)]);
        ctx.strokeStyle = 'gray'
        ctx.strokeRect(cameraToCanvasX(newElBoxX), cameraToCanvasY(newElBoxY), cameraToCanvasScale(newElBoxWidth), cameraToCanvasScale(newElBoxHeight));
        ctx.setLineDash([]);

        ctx.fillStyle = 'gray';

        // var textMeasurement = ctx.measureText('foo'); // TextMetrics object
        // textMeasurement.width; // 16;

        let scaledFontSize = cameraToCanvasScale(generalFontSize);
        ctx.textAlign = 'right';
        ctx.font = scaledFontSize + 'px  sans-serif';
        ctx.fillText('New elements are placed here', cameraToCanvasX(newElBoxX + newElBoxWidth), cameraToCanvasY(newElBoxY + newElBoxHeight + generalFontSize));
        ctx.textAlign = 'start';

    }

    // Prepare drawing of elements
    // Determine bounding rects before main drawing
    for (const cmp of diagramms[diagramInfos.displayedDiagram].complModelPosition) {
        if (typeof cmp !== 'undefined') {

            let mEBI = modelElementsByIndex[cmp.index];
            // Draw elements for Circuit Diagrams
            // This is done before drawing the edges, because the edges have to "react" on the actual size of the elements

            if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType) {
                let SizeOnPane = 1;
                let size = 3;
                // ctx.beginPath();
                switch (mEBI.element) {
                    case 'SOMIX.Grouping':
                        //         ctx.fillStyle = 'gray';
                        SizeOnPane = groupSize * scale;
                        //         size = cameraToCanvasScale(SizeOnPane);
                        //         ctx.arc(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].x),
                        //             cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].y), size / 2, 0, 2 * Math.PI);
                        //         ctx.fill();
                        break;
                    case 'SOMIX.Code':
                        //         ctx.fillStyle = 'orange';
                        SizeOnPane = codeSize * scale;
                        //         size = cameraToCanvasScale(SizeOnPane);

                        //         ctx.fillRect(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x) - size / 2,
                        //             cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y) - size / 2, size, size);
                        break;
                    case 'SOMIX.Data':
                        //         ctx.fillStyle = 'lightBlue';
                        SizeOnPane = dataSize * scale;
                        //         size = cameraToCanvasScale(SizeOnPane);
                        //         ctx.arc(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x),
                        //             cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y), size / 2, 0, 2 * Math.PI);
                        //         ctx.fill();
                        break;
                }

                // ctx.fillRect(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x - size / 2),
                //     cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y - size / 2), size, size);

                if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames == true) {
                    if (mEBI.element == 'SOMIX.Grouping') {
                        // Was already done
                    }
                    else if (mEBI.element == 'SOMIX.Code' || mEBI.element == 'SOMIX.Data') {
                        const fontsize = fontSizeGeneral * scale;
                        ctx.fillStyle = 'black';
                        let scaledFontSize = cameraToCanvasScale(fontsize);
                        ctx.textAlign = 'center';
                        ctx.font = scaledFontSize + 'px  sans-serif';
                        let textInfo = ctx.measureText(mEBI.name);
                        let textWidthOnPane = cameraToPaneScale(textInfo.width);
                        if (mEBI.element == 'SOMIX.Code') {
                            SizeOnPane = codeSize * scale;
                        } else {
                            SizeOnPane = dataSize * scale;
                        }

                        // Set values for bounding box

                        let temp1 = diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x - SizeOnPane / 2;
                        let temp2 = diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x - textWidthOnPane / 2;
                        let temp;
                        if (temp1 < temp2) {
                            temp = temp1;
                        } else {
                            temp = temp2;
                        }
                        diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].boxX1 = temp;

                        temp1 = diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x + SizeOnPane / 2;
                        temp2 = diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x + textWidthOnPane / 2;
                        if (temp1 < temp2) {
                            temp = temp2;
                        } else {
                            temp = temp1;
                        }
                        diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].boxX2 = temp;

                        diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].boxY1 =
                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y - SizeOnPane / 2;

                        diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].boxY2 =
                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y + SizeOnPane / 2;
                    }


                    // ctx.fillText(mEBI.name, cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x),
                    //     cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y + fontsize * .3));
                    // ctx.textAlign = 'standard';
                }
            }
        }
    }


    for (let stepDraw = 1; stepDraw <= 2; stepDraw++) {
        // In case of circuitDiagramForSoftwareDiagramType:
        // Draw elements when stepDraw = 1
        // Draw lines when stepDraw = 2
        // That solves issue "Write lines always over elements which they cross #24" 

        if (stepDraw == 2 && diagramms[diagramInfos.displayedDiagram].diagramType != circuitDiagramForSoftwareDiagramType) {
            break;  // Step 2 is only needed for the circuit diagram
        }

        // Draw elements

        for (const cmp of diagramms[diagramInfos.displayedDiagram].complModelPosition) {
            if (typeof cmp !== 'undefined') {

                let mEBI = modelElementsByIndex[cmp.index];
                // Draw elements for Circuit Diagrams
                // This is done before drawing the edges, because the edges have to "react" on the actual size of the elements

                if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType && stepDraw == 1) {

                    if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames == true) {
                        if (mEBI.element == 'SOMIX.Grouping') {
                            // Bounding rects of data and code was already determined during the preparation and can therefore be used now
                            let bX1 = 0;
                            let bX2 = 0;
                            let bY1 = 0;
                            let bY2 = 0;
                            const margin = 5;
                            let isFirst = true;
                            if (typeof parentChildByParent[mEBI.index] !== 'undefined') {
                                for (const childrens of parentChildByParent[mEBI.index]) {
                                    if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child] !== 'undefined') {
                                        if (isFirst) {
                                            bX1 = diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxX1;
                                            bX2 = diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxX2;
                                            bY1 = diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxY1;
                                            bY2 = diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxY2;
                                            isFirst = false;
                                        };
                                        if (bX1 > diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxX1) {
                                            bX1 = diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxX1
                                        }
                                        if (bX2 < diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxX2) {
                                            bX2 = diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxX2
                                        }
                                        if (bY1 > diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxY1) {
                                            bY1 = diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxY1
                                        }
                                        if (bY2 < diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxY2) {
                                            bY2 = diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxY2
                                        }
                                    }
                                }
                            }
                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX1 = bX1 - margin;
                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX2 = bX2 + margin;
                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY1 = bY1 - margin;
                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY2 = bY2 + margin;
                        }
                    }


                    let SizeOnPane = 1;
                    let size = 3;
                    ctx.beginPath();
                    switch (mEBI.element) {
                        case 'SOMIX.Grouping':
                            const drawGroupsAsBoxes = true;
                            if (drawGroupsAsBoxes) {
                                ctx.lineWidth = cameraToCanvasScale(1);
                                ctx.setLineDash([cameraToCanvasScale(8), cameraToCanvasScale(2)]);
                                ctx.strokeStyle = 'black'
                                const width = diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX2 -
                                    diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX1;
                                const height = diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY2 -
                                    diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY1;
                                ctx.strokeRect(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX1 + 0 * width / 2),
                                    cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY1 + 0 * height / 2),
                                    cameraToCanvasScale(width),
                                    cameraToCanvasScale(height));
                                ctx.setLineDash([]);

                                ctx.fillStyle = 'black';

                                let scaledFontSize = cameraToCanvasScale(generalFontSize);
                                ctx.textAlign = 'center';
                                ctx.font = scaledFontSize + 'px  sans-serif';
                                ctx.fillText(mEBI.name,
                                    cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX1 + width / 2),
                                    cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY1 - generalFontSize / 2));
                                ctx.textAlign = 'start';
                            } else {
                                ctx.fillStyle = 'gray';
                                SizeOnPane = groupSize * scale;
                                size = cameraToCanvasScale(SizeOnPane);
                                ctx.arc(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].x),
                                    cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].y), size / 2, 0, 2 * Math.PI);
                                ctx.fill();
                            }



                            break;
                        case 'SOMIX.Code':
                            ctx.fillStyle = circuitDiagramColorCode;
                            SizeOnPane = codeSize * scale;
                            size = cameraToCanvasScale(SizeOnPane);

                            ctx.fillRect(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x) - size / 2,
                                cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y) - size / 2, size, size);
                            break;
                        case 'SOMIX.Data':
                            ctx.fillStyle = circuitDiagramColorData;
                            SizeOnPane = dataSize * scale;
                            size = cameraToCanvasScale(SizeOnPane);
                            ctx.arc(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x),
                                cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y), size / 2, 0, 2 * Math.PI);
                            ctx.fill();
                            break;
                    }

                    const fontsize = fontSizeGeneral * scale;
                    ctx.fillStyle = 'black';
                    let scaledFontSize = cameraToCanvasScale(fontsize);
                    if (mEBI.element == 'SOMIX.Code' || mEBI.element == 'SOMIX.Data') {
                        ctx.textAlign = 'center';
                        ctx.font = scaledFontSize + 'px  sans-serif';
                        ctx.fillText(mEBI.name, cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x),
                            cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y + fontsize * .3));
                        ctx.textAlign = 'standard';
                    }
                } // if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType && stepDraw == 1) {

                let tempArray;
                if (diagramms[diagramInfos.displayedDiagram].diagramType != circuitDiagramForSoftwareDiagramType) {
                    // Draw parent child relations
                    tempArray = parentChildByParent[cmp.index];
                    if (typeof tempArray !== 'undefined') {
                        for (const pC of tempArray) {
                            if (typeof pC !== 'undefined') {
                                if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['child']] !== 'undefined') {
                                    ctx.lineWidth = cameraToCanvasScale(1 * scale);
                                    ctx.beginPath();
                                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                                    ctx.moveTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['parent']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['parent']].y));
                                    ctx.lineTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['child']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['child']].y));
                                    ctx.stroke();
                                }
                            }
                        }
                    }
                }

                // Draw calls

                if (diagramms[diagramInfos.displayedDiagram].diagramType != circuitDiagramForSoftwareDiagramType || stepDraw == 2) {

                    tempArray = callByCaller[cmp.index];
                    if (typeof tempArray !== 'undefined') {
                        for (const cC of tempArray) {
                            if (typeof cC !== 'undefined') {
                                if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']] !== 'undefined') {
                                    let startX = diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].x;
                                    let startY = diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].y;
                                    let endX = diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].x;
                                    let endY = diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].y;

                                    if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType) {
                                        // Keep distance between arrows and bounding box in case of circuit diagrams
                                        const minLength = 10;
                                        const stepL = 1;
                                        let vector = {
                                            x: endX - startX,
                                            y: endY - startY
                                        };
                                        let vectorLength = Math.sqrt((endX - startX) * (endX - startX) + (endY - startY) * (endY - startY))

                                        let unitVector = {
                                            x: (endX - startX) / vectorLength,
                                            y: (endY - startY) / vectorLength
                                        };
                                        // retract the end first

                                        const marginEndX = 1;
                                        const marginEndY = 4;

                                        while (vectorLength > minLength && isInBox(endX, endY,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].boxX1,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].boxX2,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].boxY1,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].boxY2,
                                            marginEndX, marginEndY)) {
                                            vectorLength -= stepL;
                                            endX -= unitVector.x * stepL;
                                            endY -= unitVector.y * stepL;
                                        }
                                        // retract the start last

                                        const marginStartX = 1;
                                        const marginStartY = 4;

                                        while (vectorLength > minLength && isInBox(startX, startY,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].boxX1,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].boxX2,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].boxY1,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].boxY2,
                                            marginStartX, marginStartY)) {
                                            vectorLength -= stepL;
                                            startX += unitVector.x * stepL;
                                            startY += unitVector.y * stepL;
                                        }
                                    }

                                    ctx.beginPath();
                                    if (diagramms[diagramInfos.displayedDiagram].diagramType != circuitDiagramForSoftwareDiagramType) {
                                        ctx.lineWidth = cameraToCanvasScale(1 * scale);
                                        ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
                                    }
                                    else {
                                        ctx.lineWidth = cameraToCanvasScale(1);
                                        ctx.strokeStyle = circuitDiagramColorCallLines;
                                    }
                                    ctx.moveTo(cameraToCanvasX(startX), cameraToCanvasY(startY));
                                    ctx.lineTo(cameraToCanvasX(endX), cameraToCanvasY(endY));
                                    if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayArrows) {
                                        let deltaX = endX - startX;
                                        let deltaY = endY - startY;
                                        let length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                                        if (length > 0.1) { // TODO how to handle very short edges?
                                            let unitX = deltaX / length;
                                            let unitY = deltaY / length;

                                            let unitA1X = 0.866 * unitX - 0.5 * unitY;
                                            let unitA1Y = 0.5 * unitX + 0.866 * unitY;
                                            let unitA2X = 0.866 * unitX + 0.5 * unitY;
                                            let unitA2Y = -0.5 * unitX + 0.866 * unitY;

                                            let startArrow1X = endX - 7 * unitA1X * scale;
                                            let startArrow1Y = endY - 7 * unitA1Y * scale;
                                            let startArrow2X = endX - 7 * unitA2X * scale;
                                            let startArrow2Y = endY - 7 * unitA2Y * scale;
                                            ctx.moveTo(cameraToCanvasX(endX), cameraToCanvasY(endY));
                                            ctx.lineTo(cameraToCanvasX(startArrow1X), cameraToCanvasY(startArrow1Y));
                                            ctx.moveTo(cameraToCanvasX(endX), cameraToCanvasY(endY));
                                            ctx.lineTo(cameraToCanvasX(startArrow2X), cameraToCanvasY(startArrow2Y));
                                        }
                                    }
                                    ctx.stroke();
                                }
                            }
                        }
                    }

                    // Draw accesses

                    tempArray = accessByAccessor[cmp.index];
                    if (typeof tempArray !== 'undefined') {
                        for (const aA of tempArray) {
                            if (typeof aA !== 'undefined') {
                                if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']] !== 'undefined') {

                                    let startX = diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessor']].x;
                                    let startY = diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessor']].y;
                                    let endX = diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']].x;
                                    let endY = diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']].y;

                                    if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType) {
                                        // Keep distance between arrows and bounding box in case of circuit diagrams
                                        const minLength = 10;
                                        const stepL = 1;
                                        let vector = {
                                            x: endX - startX,
                                            y: endY - startY
                                        };
                                        let vectorLength = Math.sqrt((endX - startX) * (endX - startX) + (endY - startY) * (endY - startY))

                                        let unitVector = {
                                            x: (endX - startX) / vectorLength,
                                            y: (endY - startY) / vectorLength
                                        };
                                        // retract the end first

                                        const marginEndX = 1;
                                        const marginEndY = 1;

                                        while (vectorLength > minLength && isInBox(endX, endY,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']].boxX1,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']].boxX2,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']].boxY1,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']].boxY2,
                                            marginEndX, marginEndY)) {
                                            vectorLength -= stepL;
                                            endX -= unitVector.x * stepL;
                                            endY -= unitVector.y * stepL;
                                        }
                                        // retract the start last

                                        while (vectorLength > minLength && isInBox(startX, startY,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessor']].boxX1,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessor']].boxX2,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessor']].boxY1,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessor']].boxY2,
                                            marginEndX, marginEndY)) {
                                            vectorLength -= stepL;
                                            startX += unitVector.x * stepL;
                                            startY += unitVector.y * stepL;
                                        }

                                    }
                                    ctx.beginPath();
                                    if (diagramms[diagramInfos.displayedDiagram].diagramType != circuitDiagramForSoftwareDiagramType) {
                                        ctx.lineWidth = cameraToCanvasScale(1 * scale);
                                        ctx.strokeStyle = 'rgba(0, 0, 255, 0.2)';
                                    }
                                    else {
                                        ctx.lineWidth = cameraToCanvasScale(1);
                                        ctx.strokeStyle = circuitDiagramColorAccessesLines;
                                    }
                                    ctx.moveTo(cameraToCanvasX(startX), cameraToCanvasY(startY));
                                    ctx.lineTo(cameraToCanvasX(endX), cameraToCanvasY(endY));
                                    ctx.stroke();
                                }
                            }
                        }
                    }

                    // Draw elements

                    if (typeof mEBI !== 'undefined') {
                        if (diagramms[diagramInfos.displayedDiagram].diagramType == bulletPointDiagramType) {
                            let size = 3;
                            ctx.beginPath();
                            switch (mEBI['element']) {
                                case 'SOMIX.Grouping':
                                    if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames) {
                                        ctx.fillStyle = 'gray'; // Texts cannot be read when the ball is black
                                    } else {
                                        ctx.fillStyle = 'black';
                                    }
                                    size = cameraToCanvasScale(4 * scale);
                                    break;
                                case 'SOMIX.Code':
                                    if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames) {
                                        ctx.fillStyle = 'orange'; // Makes reading easier
                                    } else {
                                        ctx.fillStyle = 'red';
                                    }
                                    size = cameraToCanvasScale(2 * scale);
                                    break;
                                case 'SOMIX.Data':
                                    if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames) {
                                        ctx.fillStyle = 'lightBlue'; // Makes reading easier
                                    } else {
                                        ctx.fillStyle = 'blue';
                                    }
                                    size = cameraToCanvasScale(2 * scale);
                                    break;
                            }
                            ctx.arc(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x),
                                cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y), size, 0, 2 * Math.PI);
                            ctx.fill();
                            if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames == true) {
                                const fontsize = 3;
                                ctx.fillStyle = 'black';
                                let scaledFontSize = cameraToCanvasScale(fontsize * scale);
                                ctx.textAlign = 'center';
                                ctx.font = scaledFontSize + 'px  sans-serif';
                                ctx.fillText(mEBI.name, cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x),
                                    cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y + fontsize * .3));
                                ctx.textAlign = 'standard';
                            }
                        }
                        else if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType) {

                        }
                        else { window.alert('Internal error. Unknown type in drawing.') }
                    }

                    // End draw lines
                } // if (diagramms[diagramInfos.displayedDiagram].diagramType != circuitDiagramForSoftwareDiagramType || stepDraw == 2)

            }
        } // for (const cmp of diagramms[diagramInfos.displayedDiagram].complModelPosition)
    }

    //     // Draw further informations
    // ctx.moveTo(g_width - 20, g_height - 10);
    ctx.fillStyle = 'black';
    ctx.font = generalFontSize + 'px  sans-serif';
    ctx.fillText(Math.round(100 * diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor) + '%', g_width - 40, g_height - 10);

};



function drawAlways() {
    draw(true)
}

function drawWhenForceDirectRequires() {
    draw(false)
}

function draw(always = true) {

    let width = window.innerWidth - 40;
    let height = window.innerHeight - 40;
    g_width = width;
    g_height = height;

    supportRetina();
    let redraw = true;
    if (typeof diagramms[diagramInfos.displayedDiagram] !== 'undefined') {
        if (diagramms[diagramInfos.displayedDiagram].forceFeedback) {
            let redraw = forceDirecting(width, height);
        }
    }
    if (redraw || always) {
        drawCompleteModel(ctx, width, height);
    }
    if (typeof diagramms[diagramInfos.displayedDiagram] !== 'undefined') {
        if (diagramms[diagramInfos.displayedDiagram].forceFeedback) {
            requestAnimationFrame = window.requestAnimationFrame(drawWhenForceDirectRequires);
        }
    }
    // }
}
canvas.addEventListener('mouseover', function (e) {
    requestAnimationFrame = window.requestAnimationFrame(drawWhenForceDirectRequires);
});

