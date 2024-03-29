'use strict';

let drawingCount = 0;

let boundingRectCompleteMargin = 100; // TODO include also width of element text

// For Canvas sometimes needed

// function resizeCanvas() {
//     let g_width = window.innerWidth - 40;
//     let g_height = window.innerHeight - 100;
// }

// Colors

// See also issue #23 - Not all colors are currently used
let circuitDiagramColorGrouping = 'gray';
let circuitDiagramColorCode = '#ffeb99';
let circuitDiagramColorHighlightedCode = '#ff9900';
let circuitDiagramColorData = '#ccffff';
let circuitDiagramColorHighlightedData = '#01ebff';
let circuitDiagramColorDataPersistent = '#ccff99';
let circuitDiagramColorHighlightedDataPersistent = '#00ff00';
let circuitDiagramColorCallLines = '#97979780'; // 50% transparent
let circuitDiagramColorAccessesLines = '#3131fd80'; // 50% transparent
let circuitDiagramColorCommentLines = '#fdab3180';

// make white
let circuitDiagramColorAddedCode = '#ffffff';
let circuitDiagramColorAddedDataPersistent = '#ffffff';
let circuitDiagramColorAddedData = '#ffffff';

let circuitDiagramCallWidth = 2;
let circuitDiagramAccessWidth = 2;
let circuitDiagramCommentWidth = 2;
let circuitDiagramMarkExplicitlyAdded = true;

let arrowLength = 3;

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

    // Use g_width and g_height to get the size of the screen. canvas.width and canvas.height will lead to errors on retina displays

};

/** Contains an object where the position is the object key and the number of added elements is an integer:
 *      {
            key: count
        };
 */
let snappedElements = {};
/** The spacing of the grid to display in x direction */
const gridSizeX = 20;
/** The spacing of the grid to display in y direction */
const gridSizeY = 20;

function resetSnapToGrid() {
    snappedElements = {};
}
/** Snap elements to grid, but place elements at the same position slightly repositioned */
function snapToGrid(x, y, index) {
    let snapped = {};
    let offset = 0;

    const grid_x = Math.round(x / gridSizeX);
    const grid_y = Math.round(y / gridSizeY);
    const key = grid_x.toString() + '_' + grid_y.toString();
    if (typeof snappedElements[key] === 'undefined') {
        snappedElements[key] = [index];
    } else {
        if (snappedElements[key].indexOf(index) == -1) {
            snappedElements[key].push(index);
        };
    }
    // So that multiple elements are not placed at the same position
    // offset will be zero for index 1, so the first element at a grid position will be positioned exactly on the grid
    offset = 1 - (1 / (1 + snappedElements[key].indexOf(index)));

    snapped.x = (grid_x + offset) * gridSizeX;
    snapped.y = (grid_y - offset) * gridSizeY;

    return snapped;
}
/** Snap elements exactly to the grid in x direction */
function snapToGridX(x) {
    return gridSizeX * Math.round(x / gridSizeX);
}
/** Snap elements exactly to the grid in y direction */
function snapToGridY(y) {
    return gridSizeY * Math.round(y / gridSizeY);
}

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

function highlightUsedBy(index) {
    if (typeof callByCalled[index] !== 'undefined') {
        for (const e of callByCalled[index]) {
            highlight(e.caller);
        }
    };
    if (typeof accessByAccessed[index] !== 'undefined') {
        // This implementation is simplified, but there are currently no SOMIX models where more details are available
        for (const e of accessByAccessed[index]) {
            highlight(e.accessor);
        }
    }
}

function highlightUsing(index) {
    if (typeof callByCaller[index] !== 'undefined') {
        for (const e of callByCaller[index]) {
            highlight(e.called);
        }
    }
    if (typeof accessByAccessor[index] !== 'undefined') {
        // This implementation is simplified, but there are currently no SOMIX models where more details are available
        for (const e of accessByAccessor[index]) {
            highlight(e.accessed);
        }
    }
}

function highlight(index) {
    if (!diagramms[diagramInfos.displayedDiagram].highlighted.includes(index)) {
        diagramms[diagramInfos.displayedDiagram].highlighted.push(index);
    }
}

function removeHighlight(index) {
    const indexToRemove = diagramms[diagramInfos.displayedDiagram].highlighted.indexOf(index);
    if (indexToRemove !== -1) {
        // Remove the index from the array using splice
        diagramms[diagramInfos.displayedDiagram].highlighted.splice(indexToRemove, 1);
    }
}

function highlightActive(index) {
    if (!diagramms[diagramInfos.activeDiagram].highlighted.includes(index)) {
        diagramms[diagramInfos.activeDiagram].highlighted.push(index);
    }
}

function removeHighlightActive(index) {

    const indexToRemove = diagramms[diagramInfos.activeDiagram].highlighted.indexOf(index);
    if (indexToRemove !== -1) {
        // Remove the index from the array using splice
        diagramms[diagramInfos.activeDiagram].highlighted.splice(indexToRemove, 1);
    }
}

function RemoveAllHighlighting() {
    diagramms[diagramInfos.displayedDiagram].highlighted = [];
}

function PinAll() {     // Pin all elements 
    for (const cmp of diagramms[diagramInfos.displayedDiagram].complModelPosition) {
        if (typeof cmp !== 'undefined') {
            if (cmp.visible) {
                // add cmp.index to diagramms[diagramInfos.displayedDiagram].pinned
                if (!diagramms[diagramInfos.displayedDiagram].pinned.includes(cmp.index)) {
                    diagramms[diagramInfos.displayedDiagram].pinned.push(cmp.index);
                }
            }
        }
    }
}

function UnPinAll() {     // Unpin all elements 
    diagramms[diagramInfos.displayedDiagram].pinned = [];
}

function UnPinHighlighted() {     // Unpin all highlighted elements
    for (const cmp of diagramms[diagramInfos.displayedDiagram].complModelPosition) {

        if (typeof cmp !== 'undefined') {
            if (cmp.visible) {

                if (diagramms[diagramInfos.displayedDiagram].highlighted.includes(cmp.index)) {
                    // remove cmp.index from diagramms[diagramInfos.displayedDiagram].pinned
                    const indexToRemove = diagramms[diagramInfos.displayedDiagram].pinned.indexOf(cmp.index);
                    if (indexToRemove !== -1) {
                        // Remove the index from the array using splice
                        diagramms[diagramInfos.displayedDiagram].pinned.splice(indexToRemove, 1);
                    }
                }
            }
        }
    }
}

function HighlightUnPinned() {     // Highlight all unpinned elements
    for (const cmp of diagramms[diagramInfos.displayedDiagram].complModelPosition) {

        if (typeof cmp !== 'undefined') {
            if (cmp.visible) {

                if (!diagramms[diagramInfos.displayedDiagram].pinned.includes(cmp.index)) {
                    // add cmp.index to diagramms[diagramInfos.displayedDiagram].highlighted
                    if (!diagramms[diagramInfos.displayedDiagram].highlighted.includes(cmp.index)) {
                        diagramms[diagramInfos.displayedDiagram].highlighted.push(cmp.index);
                    }
                }
            }
        }
    }
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
const commentBoxBorder = 4;

function drawCompleteModel(ctx, width, height) {

    resetSnapToGrid();

    drawingCount += 1;

    let fontColor = '';
    let parentChildColor = 'rgba(0, 0, 0, 0.2)';
    if (colorTheme == 'DarkTheme') {
        fontColor = "LightGray"; //  "white";
        parentChildColor = ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';

        circuitDiagramColorGrouping = 'gray';
        //circuitDiagramColorCode = '#ffeb99';
        //circuitDiagramColorHighlightedCode = '#ff9900';
        circuitDiagramColorCode = '#7d4b01';//'#ff9900';
        circuitDiagramColorHighlightedCode = '#ff9900';//'#ffeb99';
        //circuitDiagramColorData = '#ccffff';
        //circuitDiagramColorHighlightedData = '#01ebff';
        circuitDiagramColorData = '#016a94'; // '#01ebff';
        circuitDiagramColorHighlightedData = '#01ebff'; // '#ccffff';
        //circuitDiagramColorDataPersistent = '#ccff99';
        //circuitDiagramColorHighlightedDataPersistent = '#00ff00';
        circuitDiagramColorDataPersistent = '#016e01'; // '#00ff00';
        circuitDiagramColorHighlightedDataPersistent = '#00ff00'; //'#ccff99';
        circuitDiagramColorCallLines = '#97979780'; // 50% transparent
        circuitDiagramColorAccessesLines = '#3131fd80'; // 50% transparent
        circuitDiagramColorCommentLines = '#fdab3180';

        circuitDiagramColorAddedCode = '#ffffff';
        circuitDiagramColorAddedDataPersistent = '#ffffff';
        circuitDiagramColorAddedData = '#ffffff';

    } else {
        // White Theme
        fontColor = "black";
        parentChildColor = ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';

        circuitDiagramColorGrouping = 'gray';
        circuitDiagramColorCode = '#ffeb99';
        circuitDiagramColorHighlightedCode = '#ff9900';
        circuitDiagramColorData = '#ccffff';
        circuitDiagramColorHighlightedData = '#01ebff';
        circuitDiagramColorDataPersistent = '#ccff99';
        circuitDiagramColorHighlightedDataPersistent = '#00ff00';
        circuitDiagramColorCallLines = '#97979780'; // 50% transparent
        circuitDiagramColorAccessesLines = '#3131fd80'; // 50% transparent
        circuitDiagramColorCommentLines = '#fdab3180';

        circuitDiagramColorAddedCode = '#000000';
        circuitDiagramColorAddedDataPersistent = '#000000';
        circuitDiagramColorAddedData = '#000000';

    }





    if (typeof diagramms[diagramInfos.displayedDiagram] === 'undefined') {
        // Do not draw when no diagram exists
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (colorTheme == 'DarkTheme') {
        //ctx.fillStyle = "#1c1c1c"; // "black";
        ctx.fillStyle = "#252525"; // This is the background color from VS Code "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Prepare constants to write texts correctly
    const fontsize = fontSizeGeneral * scale;
    let scaledFontSize = cameraToCanvasScale(fontsize);
    const lineSpace = fontsize * 1.5;
    let scaledLineSpace = cameraToCanvasScale(lineSpace);
    //let scaledLineSpace = scaledFontSize * 1.5;

    if (diagramms[diagramInfos.displayedDiagram].complModelPosition.length == 0) {
        ctx.font = '15px sans-serif';
        ctx.fillStyle = fontColor
        ctx.fillText('This diagram is currently empty: ' + diagramInfos.displayedDiagram, 10, 50);
        return;
    }

    // Draw background
    if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayNewElementBox == true) {
        // Draw landing box
        SOMEXPL_2 += 1;
        if (!diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.isInitial) {
            let newElBoxX = diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxX;
            let newElBoxY = diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxY;
            let newElBoxWidth = diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxWidth;
            let newElBoxHeight = diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxHeight;

            ctx.lineWidth = cameraToCanvasScale(1);
            ctx.setLineDash([cameraToCanvasScale(8), cameraToCanvasScale(2)]);
            ctx.strokeStyle = 'gray'
            ctx.strokeRect(cameraToCanvasX(newElBoxX), cameraToCanvasY(newElBoxY), cameraToCanvasScale(newElBoxWidth), cameraToCanvasScale(newElBoxHeight));
            ctx.setLineDash([]);



            // Write explanation text for landing box
            ctx.fillStyle = 'gray';
            let scaledFontSizeLandingBox = cameraToCanvasScale(generalFontSize);
            ctx.textAlign = 'right';
            ctx.font = scaledFontSizeLandingBox + 'px  sans-serif';
            ctx.fillText('New elements are placed here', cameraToCanvasX(newElBoxX + newElBoxWidth), cameraToCanvasY(newElBoxY + newElBoxHeight + generalFontSize));
            ctx.textAlign = 'start';
        }
    }

    // Prepare drawing of elements
    // Determine bounding rects before main drawing
    for (const cmp of diagramms[diagramInfos.displayedDiagram].complModelPosition) {
        if (typeof cmp !== 'undefined') {
            if (cmp.visible) {
                let mEBI = modelElementsByIndex[cmp.index];
                // Determine Bounding box of elements and comments
                // This is done before drawing the edges, because the edges have to "react" on the actual size of the elements

                if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType) {
                    let SizeOnPane = 1;
                    let size = 3;
                    // ctx.beginPath();
                    switch (mEBI.element) {
                        case 'SOMIX.Grouping':

                            SizeOnPane = groupSize * scale;

                            break;
                        case 'SOMIX.Code':

                            SizeOnPane = codeSize * scale;

                            break;
                        case 'SOMIX.Data':

                            SizeOnPane = dataSize * scale;

                            break;
                    }

                    if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames == true) {
                        if (mEBI.element == 'SOMIX.Grouping') {
                            // Was already done
                        }
                        else if (mEBI.element == 'SOMIX.Code' || mEBI.element == 'SOMIX.Data') {
                            const fontsize = fontSizeGeneral * scale;
                            ctx.fillStyle = fontColor;
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

                            // Prevent problems when the position is not a number

                            if (Number.isNaN(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].x)) {
                                diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].x = 0;
                            }

                            if (Number.isNaN(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].y)) {
                                diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].y = 0;
                            }

                            // To handle Snap to Grid 

                            let snapped = snapToGrid(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].x,
                                diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].y,
                                mEBI.index)

                            // Set values for bounding box

                            let temp1 = snapped.x - SizeOnPane / 2;
                            let temp2 = snapped.x - textWidthOnPane / 2;
                            let temp;
                            if (temp1 < temp2) {
                                temp = temp1;
                            } else {
                                temp = temp2;
                            }
                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX1 = temp;

                            temp1 = snapped.x + SizeOnPane / 2;
                            temp2 = snapped.x + textWidthOnPane / 2;
                            if (temp1 < temp2) {
                                temp = temp2;
                            } else {
                                temp = temp1;
                            }
                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX2 = temp;

                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY1 =
                                snapped.y - SizeOnPane / 2;

                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY2 =
                                snapped.y + SizeOnPane / 2;
                        }
                    }

                    // Determine box for comments

                    if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index] !== 'undefined') {
                        if (diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].text != '') {
                            // Handle line breaks
                            let textLines = diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].text.split('\n');
                            let commentWidth = 0;
                            let commentHeight = 0;
                            for (const textLine of textLines) {
                                // Set to unscaled fontsize so that the text width is calculated unscaled
                                ctx.font = fontsize + 'px  sans-serif';
                                let textInfo = ctx.measureText(textLine);
                                let cW = textInfo.width;
                                if (cW > commentWidth) {
                                    commentWidth = cW;
                                }
                                commentHeight += lineSpace;
                            }

                            let snapped = snapToGrid(diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].x,
                                diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].y, mEBI.index);

                            diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxX1 =
                                snapped.x - commentBoxBorder + 0.1 * fontsize;
                            diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxX2 =
                                snapped.x + commentWidth + commentBoxBorder - 0.1 * fontsize;
                            diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxY1 =
                                snapped.y - fontsize - commentBoxBorder + 0.3 * fontsize;
                            diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxY2 =
                                snapped.y + commentHeight - lineSpace + commentBoxBorder;
                        }
                    }
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
                if (cmp.visible) {
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

                                            if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxX1 !== 'undefined' &&
                                                typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxX2 !== 'undefined' &&
                                                typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxY1 !== 'undefined' &&
                                                typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].boxY2 !== 'undefined') {

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
                                }
                                diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX1 = bX1 - margin;
                                diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX2 = bX2 + margin;
                                diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY1 = bY1 - margin;
                                diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY2 = bY2 + margin;
                            }
                        }


                        let SizeOnPane = 1;
                        let size = 3;
                        let GroupPadding = 2; // Todo finalize implementation
                        ctx.beginPath();
                        let snapped;
                        switch (mEBI.element) {
                            case 'SOMIX.Grouping':
                                const drawGroupsAsBoxes = true;
                                if (drawGroupsAsBoxes) {
                                    ctx.lineWidth = cameraToCanvasScale(1);
                                    ctx.setLineDash([cameraToCanvasScale(8), cameraToCanvasScale(2)]);
                                    ctx.strokeStyle = circuitDiagramColorGrouping;
                                    const width = diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX2 -
                                        diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX1;
                                    const height = diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY2 -
                                        diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY1;
                                    ctx.strokeRect(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX1 + 0 * width / 2 - GroupPadding),
                                        cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY1 + 0 * height / 2 - GroupPadding),
                                        cameraToCanvasScale(width + 2 * GroupPadding),
                                        cameraToCanvasScale(height + 2 * GroupPadding));
                                    ctx.setLineDash([]);

                                    ctx.fillStyle = fontColor;

                                    let scaledFontSize = cameraToCanvasScale(generalFontSize);
                                    ctx.textAlign = 'center';
                                    ctx.font = scaledFontSize + 'px  sans-serif';
                                    ctx.fillText(mEBI.name,
                                        cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX1 + width / 2),
                                        cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY1 - generalFontSize / 2 - GroupPadding));
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
                                if (diagramms[diagramInfos.displayedDiagram].highlighted.includes(mEBI.index)) {
                                    ctx.fillStyle = circuitDiagramColorHighlightedCode;
                                } else {
                                    ctx.fillStyle = circuitDiagramColorCode;
                                }
                                SizeOnPane = codeSize * scale;
                                size = cameraToCanvasScale(SizeOnPane);

                                let snapped2 = snapToGrid(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].x,
                                    diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].y,
                                    mEBI.index);

                                ctx.fillRect(cameraToCanvasX(snapped2.x) - size / 2,
                                    cameraToCanvasY(snapped2.y) - size / 2, size, size);

                                if (circuitDiagramMarkExplicitlyAdded) {
                                    if (diagramms[diagramInfos.displayedDiagram].generationInfoInternal.addedWithNeighbors.includes(mEBI.index)) {
                                        if (diagramms[diagramInfos.displayedDiagram].highlighted.includes(mEBI.index)) {
                                            ctx.strokeStyle = circuitDiagramColorAddedCode; // Make whither, so that is is also visible when highlighted
                                        } else {
                                            ctx.strokeStyle = circuitDiagramColorHighlightedCode;
                                        }
                                        SizeOnPane = codeSize * scale;
                                        size = cameraToCanvasScale(SizeOnPane);
                                        ctx.beginPath();
                                        ctx.strokeRect(cameraToCanvasX(snapped2.x) - size / 2,
                                            cameraToCanvasY(snapped2.y) - size / 2, size, size);
                                    }

                                }

                                break;
                            case 'SOMIX.Data':
                                if (mEBI.technicalType == 'DBTable') {
                                    if (diagramms[diagramInfos.displayedDiagram].highlighted.includes(mEBI.index)) {
                                        ctx.fillStyle = circuitDiagramColorHighlightedDataPersistent;
                                    } else {
                                        ctx.fillStyle = circuitDiagramColorDataPersistent;
                                    }
                                } else {
                                    if (diagramms[diagramInfos.displayedDiagram].highlighted.includes(mEBI.index)) {
                                        ctx.fillStyle = circuitDiagramColorHighlightedData;
                                    } else {
                                        ctx.fillStyle = circuitDiagramColorData;
                                    }
                                }


                                let snapped3 = snapToGrid(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].x,
                                    diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].y,
                                    mEBI.index);

                                SizeOnPane = dataSize * scale;
                                size = cameraToCanvasScale(SizeOnPane);
                                ctx.arc(cameraToCanvasX(snapped3.x),
                                    cameraToCanvasY(snapped3.y), size / 2, 0, 2 * Math.PI);
                                ctx.fill();


                                if (circuitDiagramMarkExplicitlyAdded) {
                                    if (diagramms[diagramInfos.displayedDiagram].generationInfoInternal.addedWithNeighbors.includes(mEBI.index)) {

                                        if (mEBI.technicalType == 'DBTable') {
                                            if (diagramms[diagramInfos.displayedDiagram].highlighted.includes(mEBI.index)) {
                                                ctx.strokeStyle = circuitDiagramColorAddedDataPersistent;
                                            } else {
                                                ctx.strokeStyle = circuitDiagramColorHighlightedDataPersistent;
                                            }
                                        } else {
                                            if (diagramms[diagramInfos.displayedDiagram].highlighted.includes(mEBI.index)) {
                                                ctx.strokeStyle = circuitDiagramColorAddedData;
                                            } else {
                                                ctx.strokeStyle = circuitDiagramColorHighlightedData;
                                            }
                                        }
                                        SizeOnPane = dataSize * scale;
                                        size = cameraToCanvasScale(SizeOnPane);

                                        ctx.beginPath();
                                        ctx.arc(cameraToCanvasX(snapped3.x),
                                            cameraToCanvasY(snapped3.y), size / 2, 0, 2 * Math.PI);
                                        ctx.stroke();
                                    }
                                }

                                break;
                        }


                        ctx.fillStyle = fontColor;
                        if (mEBI.element == 'SOMIX.Code' || mEBI.element == 'SOMIX.Data' || mEBI.element == 'SOMIX.Grouping') {

                            if (mEBI.element == 'SOMIX.Code' || mEBI.element == 'SOMIX.Data') {
                                ctx.textAlign = 'center';
                                ctx.font = scaledFontSize + 'px  sans-serif';

                                snapped = snapToGrid(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].x,
                                    diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].y,
                                    mEBI.index);

                                ctx.fillText(mEBI.name, cameraToCanvasX(snapped.x),
                                    cameraToCanvasY(snapped.y + fontsize * .3));
                                ctx.textAlign = 'start';
                            }

                            // Draw comment texts
                            ctx.textAlign = 'left';
                            if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index] !== 'undefined') {
                                if (diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].text != '') {

                                    snapped = snapToGrid(diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].x,
                                        diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].y,
                                        mEBI.index)

                                    ctx.font = scaledFontSize + 'px  sans-serif';
                                    // Handle line breaks
                                    let textLines = diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].text.split('\n');
                                    let TextPositionY = snapped.y;
                                    for (const textLine of textLines) {
                                        ctx.fillText(textLine,
                                            cameraToCanvasX(snapped.x),
                                            cameraToCanvasY(TextPositionY));
                                        TextPositionY += lineSpace;
                                    }
                                    // Draw box around comments
                                    ctx.lineWidth = cameraToCanvasScale(1);
                                    ctx.setLineDash([cameraToCanvasScale(2), cameraToCanvasScale(2)]);
                                    ctx.strokeStyle = 'gray';
                                    let commentBoxWidth = diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxX2 -
                                        diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxX1;
                                    let commentBoxHeight = diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxY2 -
                                        diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxY1;
                                    ctx.strokeRect(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxX1),
                                        cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxY1),
                                        cameraToCanvasScale(commentBoxWidth),
                                        cameraToCanvasScale(commentBoxHeight));
                                    ctx.setLineDash([]);
                                }
                            }
                            ctx.textAlign = 'start';
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
                                        if (diagramms[diagramInfos.displayedDiagram].complModelPosition[pC.child].visible) {
                                            ctx.lineWidth = cameraToCanvasScale(1 * scale);
                                            ctx.beginPath();
                                            ctx.strokeStyle = parentChildColor;
                                            ctx.moveTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['parent']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['parent']].y));
                                            ctx.lineTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['child']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['child']].y));
                                            ctx.stroke();
                                        }
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
                                        if (diagramms[diagramInfos.displayedDiagram].complModelPosition[cC.called].visible) {
                                            let startX = diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].x;
                                            let startY = diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].y;
                                            let endX = diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].x;
                                            let endY = diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].y;

                                            if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType) {
                                                let snapped = snapToGrid(startX, startY, cC['caller']);
                                                startX = snapped.x;
                                                startY = snapped.y;

                                                snapped = snapToGrid(endX, endY, cC['called']);
                                                endX = snapped.x;
                                                endY = snapped.y;
                                            }

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
                                                ctx.lineWidth = cameraToCanvasScale(circuitDiagramCallWidth);
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
                                                    let startArrow1X = endX - arrowLength * unitA1X * scale;
                                                    let startArrow1Y = endY - arrowLength * unitA1Y * scale;
                                                    let startArrow2X = endX - arrowLength * unitA2X * scale;
                                                    let startArrow2Y = endY - arrowLength * unitA2Y * scale;
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
                        }

                        // Draw accesses

                        tempArray = accessByAccessor[cmp.index];
                        if (typeof tempArray !== 'undefined') {
                            for (const aA of tempArray) {
                                if (typeof aA !== 'undefined') {
                                    if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']] !== 'undefined') {
                                        if (diagramms[diagramInfos.displayedDiagram].complModelPosition[aA.accessed].visible) {
                                            let startX = diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessor']].x;
                                            let startY = diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessor']].y;
                                            let endX = diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']].x;
                                            let endY = diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']].y;



                                            if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType) {
                                                let snapped = snapToGrid(startX, startY, aA['accessor']);
                                                startX = snapped.x;
                                                startY = snapped.y;

                                                snapped = snapToGrid(endX, endY, aA['accessed']);
                                                endX = snapped.x;
                                                endY = snapped.y;
                                            }

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
                                                ctx.strokeStyle = circuitDiagramColorAccessesLines; //'rgba(0, 0, 255, 0.2)';
                                            }
                                            else {
                                                ctx.lineWidth = cameraToCanvasScale(circuitDiagramAccessWidth);
                                                ctx.strokeStyle = circuitDiagramColorAccessesLines;
                                            }
                                            ctx.moveTo(cameraToCanvasX(startX), cameraToCanvasY(startY));
                                            ctx.lineTo(cameraToCanvasX(endX), cameraToCanvasY(endY));
                                            ctx.stroke();
                                        }
                                    }
                                }
                            }
                        }

                        // Draw elements and texts for elements of Bullet Point Diagram

                        if (typeof mEBI !== 'undefined') {
                            if (diagramms[diagramInfos.displayedDiagram].diagramType == bulletPointDiagramType) {
                                let size = 3;
                                ctx.beginPath();
                                switch (mEBI['element']) {
                                    case 'SOMIX.Grouping':
                                        if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames) {
                                            ctx.fillStyle = 'gray'; // Texts cannot be read when the ball is black
                                        } else {
                                            ctx.fillStyle = fontColor;
                                        }
                                        size = cameraToCanvasScale(4 * scale);
                                        break;
                                    case 'SOMIX.Code':
                                        if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames) {
                                            if (colorTheme == 'DarkTheme') {
                                                ctx.fillStyle = 'red'; // Better readable in dark theme
                                            } // Makes reading easier
                                            else {
                                                ctx.fillStyle = 'orange';
                                            }
                                        } else {
                                            ctx.fillStyle = 'red';
                                        }
                                        size = cameraToCanvasScale(2 * scale);
                                        break;
                                    case 'SOMIX.Data':
                                        if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames) {
                                            if (colorTheme == 'DarkTheme') {
                                                ctx.fillStyle = 'blue'; // Better readable in dark theme
                                            } // Makes reading easier
                                            else {
                                                ctx.fillStyle = 'lightBlue'; // Makes reading easier}
                                            }
                                        } else {
                                            ctx.fillStyle = 'blue';
                                        }
                                        size = cameraToCanvasScale(2 * scale);
                                        break;
                                }
                                ctx.arc(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].x),
                                    cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].y), size, 0, 2 * Math.PI);
                                ctx.fill();
                                if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames == true) {
                                    const fontsize = 3;
                                    ctx.fillStyle = fontColor;
                                    let scaledFontSize = cameraToCanvasScale(fontsize * scale);
                                    ctx.textAlign = 'center';
                                    ctx.font = scaledFontSize + 'px  sans-serif';
                                    ctx.fillText(mEBI.name, cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].x),
                                        cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].y + fontsize * 1.4));
                                    ctx.textAlign = 'start';
                                }
                            }
                            else if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType) {

                            }
                            else { window.alert('Internal error. Unknown type in drawing.') }
                        }

                        // End draw lines
                    } // if (diagramms[diagramInfos.displayedDiagram].diagramType != circuitDiagramForSoftwareDiagramType || stepDraw == 2)

                    if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType && stepDraw == 2) {

                        // Draw lines between elements and comments

                        if (cmp.visible) {
                            if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index] !== 'undefined') {
                                if (diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].text != '') {
                                    let startX;
                                    let startY;
                                    // Begin Insert to be adapted for comments
                                    if (mEBI.element == "SOMIX.Grouping") {
                                        // The lines from a grouping to a comment shall point to the center of the box around all contained elements
                                        startX = (diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX1 +
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX2) / 2;
                                        startY = (diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY1 +
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY2) / 2;
                                    } else {
                                        startX = diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].x;
                                        startY = diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].y;
                                        let snapped = snapToGrid(startX, startY, mEBI.index);
                                        startX = snapped.x;
                                        startY = snapped.y;
                                    }
                                    let endX = (diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxX1 +
                                        diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxX2) / 2;
                                    let endY = (diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxY1 +
                                        diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxY2) / 2;


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
                                            diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxX1,
                                            diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxX2,
                                            diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxY1,
                                            diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[mEBI.index].boxY2,
                                            marginEndX, marginEndY)) {
                                            vectorLength -= stepL;
                                            endX -= unitVector.x * stepL;
                                            endY -= unitVector.y * stepL;
                                        }
                                        // retract the start last

                                        while (vectorLength > minLength && isInBox(startX, startY,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX1,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxX2,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY1,
                                            diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI.index].boxY2,
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
                                        ctx.lineWidth = cameraToCanvasScale(circuitDiagramCommentWidth);
                                        ctx.strokeStyle = circuitDiagramColorCommentLines;
                                    }
                                    ctx.moveTo(cameraToCanvasX(startX), cameraToCanvasY(startY));
                                    ctx.lineTo(cameraToCanvasX(endX), cameraToCanvasY(endY));
                                    ctx.stroke();

                                    // End Insert to be adapted for comments
                                }
                            }
                        }
                    }

                }
            }
        } // for (const cmp of diagramms[diagramInfos.displayedDiagram].complModelPosition)
    }
    // Determine bounding rect of bullet point diagram
    if (diagramms[diagramInfos.displayedDiagram].diagramType == bulletPointDiagramType) {
        let boundingRectComplete = {};

        for (const e of diagramms[diagramInfos.displayedDiagram].complModelPosition) {
            if (typeof e !== 'undefined') {
                if (typeof boundingRectComplete.X1 === 'undefined' &&
                    typeof boundingRectComplete.X2 === 'undefined' &&
                    typeof boundingRectComplete.Y1 === 'undefined' &&
                    typeof boundingRectComplete.Y2 === 'undefined') {
                    boundingRectComplete.X1 = e.x;
                    boundingRectComplete.X2 = e.x;
                    boundingRectComplete.Y1 = e.y;
                    boundingRectComplete.Y2 = e.y
                }
                else {
                    if (e.x < boundingRectComplete.X1) { boundingRectComplete.X1 = e.x }
                    if (e.x > boundingRectComplete.X2) { boundingRectComplete.X2 = e.x }
                    if (e.y < boundingRectComplete.Y1) { boundingRectComplete.Y1 = e.y }
                    if (e.y > boundingRectComplete.Y2) { boundingRectComplete.Y2 = e.y }
                }
            }
        }
        // Set bounding rect in diagram
        if (typeof boundingRectComplete !== 'undefined') {
            if (typeof boundingRectComplete.X1 !== 'undefined') {
                diagramms[diagramInfos.displayedDiagram].boundingRectComplete = {
                    X1: boundingRectComplete.X1,
                    X2: boundingRectComplete.X2,
                    Y1: boundingRectComplete.Y1,
                    Y2: boundingRectComplete.Y2
                };
            }
        }

    }

    // Determine bounding rect of complete diagram
    if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType) {
        let boundingRectComplete = {}

        for (const e of diagramms[diagramInfos.displayedDiagram].complModelPosition) {
            if (typeof e !== 'undefined') {
                if (typeof e.boxX1 !== 'undefined' &&
                    e.boxX2 !== 'undefined' &&
                    typeof e.boxY1 !== 'undefined' &&
                    typeof e.boxY2 !== 'undefined') {

                    SOMEXPL_3 += 1;
                    let isInNewElementBox = false;
                    if (typeof diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox !== 'undefined') {
                        if (!diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.isInitial) {
                            if (typeof diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxX !== 'undefined' &&
                                typeof diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxY !== 'undefined' &&
                                typeof diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxWidth !== 'undefined' &&
                                typeof diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxHeight !== 'undefined') {
                                if (modelElementsByIndex[e.index].element != 'SOMIX.Grouping') {
                                    // In case of groupings there is currently no positions.
                                    // This may change when later groupings can be added as a simple entity
                                    if (e.x > diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxX &&
                                        e.x < diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxX +
                                        diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxWidth &&
                                        e.y > diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxY &&
                                        e.y < diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxY +
                                        diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxHeight) {
                                        isInNewElementBox = true;
                                    }
                                }
                            }
                        }
                    }
                    if (!isInNewElementBox) {
                        // SOMEXPL_3 is difficult to fullcill when Groupings are used to determine outer border.
                        // Exclude them therefore from this logic.
                        if (modelElementsByIndex[e.index].element != 'SOMIX.Grouping') {
                            if (typeof boundingRectComplete.X1 === 'undefined' &&
                                typeof boundingRectComplete.X2 === 'undefined' &&
                                typeof boundingRectComplete.Y1 === 'undefined' &&
                                typeof boundingRectComplete.Y2 === 'undefined') {
                                boundingRectComplete.X1 = e.boxX1;
                                boundingRectComplete.X2 = e.boxX2;
                                boundingRectComplete.Y1 = e.boxY1;
                                boundingRectComplete.Y2 = e.boxY2
                            }
                            else {
                                if (e.boxX1 < boundingRectComplete.X1) { boundingRectComplete.X1 = e.boxX1 }
                                if (e.boxX2 > boundingRectComplete.X2) { boundingRectComplete.X2 = e.boxX2 }
                                if (e.boxY1 < boundingRectComplete.Y1) { boundingRectComplete.Y1 = e.boxY1 }
                                if (e.boxY2 > boundingRectComplete.Y2) { boundingRectComplete.Y2 = e.boxY2 }
                            }
                        }

                    }
                    else {

                    }
                }
            }
        }

        for (const e of diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID) {
            if (typeof e !== 'undefined') {
                if (typeof e.boxX1 !== 'undefined' &&
                    e.boxX2 !== 'undefined' &&
                    typeof e.boxY1 !== 'undefined' &&
                    typeof e.boxY2 !== 'undefined') {
                    if (typeof boundingRectComplete.X1 === 'undefined' &&
                        typeof boundingRectComplete.X2 === 'undefined' &&
                        typeof boundingRectComplete.Y1 === 'undefined' &&
                        typeof boundingRectComplete.Y2 === 'undefined') {
                        boundingRectComplete.X1 = e.boxX1;
                        boundingRectComplete.X2 = e.boxX2;
                        boundingRectComplete.Y1 = e.boxY1;
                        boundingRectComplete.Y2 = e.boxY2
                    }
                    else {
                        if (e.boxX1 < boundingRectComplete.X1) { boundingRectComplete.X1 = e.boxX1 }
                        if (e.boxX2 > boundingRectComplete.X2) { boundingRectComplete.X2 = e.boxX2 }
                        if (e.boxY1 < boundingRectComplete.Y1) { boundingRectComplete.Y1 = e.boxY1 }
                        if (e.boxY2 > boundingRectComplete.Y2) { boundingRectComplete.Y2 = e.boxY2 }
                    }

                    /*                     console.log('c', e.x, boundingRectComplete.X1, boundingRectComplete.X2,
                                            diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxX); */
                }
            }
        }
        if (typeof boundingRectComplete.X1 !== 'undefined') {

            // Draw box around model

            SOMEXPL_1 += 1;

            ctx.lineWidth = cameraToCanvasScale(1);
            //ctx.setLineDash([cameraToCanvasScale(8), cameraToCanvasScale(2)]);
            ctx.strokeStyle = 'gray'
            let bRCWidth = boundingRectComplete.X2 - boundingRectComplete.X1;
            let bRCHeight = boundingRectComplete.Y2 - boundingRectComplete.Y1;
            ctx.strokeRect(cameraToCanvasX(boundingRectComplete.X1 - boundingRectCompleteMargin),
                cameraToCanvasY(boundingRectComplete.Y1 - boundingRectCompleteMargin),
                cameraToCanvasScale(bRCWidth + 2 * boundingRectCompleteMargin),
                cameraToCanvasScale(bRCHeight + 2 * boundingRectCompleteMargin));
            ctx.setLineDash([]);

            // Set box with new elements

            let tempNewElBoxX1 = boundingRectComplete.X1 - boundingRectCompleteMargin + bRCWidth + 2 * boundingRectCompleteMargin + 10;
            let tempNewElBoxX2 = tempNewElBoxX1 + 100 * scale;

            if (diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.isInitial ||
                // Enlarge landing not always to keep it longer at the same place
                tempNewElBoxX1 > diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxX +
                diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxWidth) {

                SOMEXPL_2 += 1;
                diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxX = tempNewElBoxX1;
                diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxWidth = tempNewElBoxX2 - tempNewElBoxX1;
            }
            else if (tempNewElBoxX1 < diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxX) {
                diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxX = tempNewElBoxX1;
                diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxWidth +=
                    diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxX - tempNewElBoxX1;
            }

            diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.isInitial = false;
            diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxY = boundingRectComplete.Y1 - boundingRectCompleteMargin;
            diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxHeight = bRCHeight + 2 * boundingRectCompleteMargin;
            // Set bounding rect in diagram
            diagramms[diagramInfos.displayedDiagram].boundingRectComplete = {
                X1: boundingRectComplete.X1 - boundingRectCompleteMargin,
                X2: diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxX + diagramms[diagramInfos.displayedDiagram].diagramSettings.newElementBox.newElBoxWidth,
                Y1: boundingRectComplete.Y1 - boundingRectCompleteMargin,
                Y2: boundingRectComplete.Y1 - boundingRectCompleteMargin + bRCHeight + 2 * boundingRectCompleteMargin

            };

        }

        // if (typeof boundingRectComplete.X1 !== 'undefined') {
        //     // Set bounding rect in diagram
        //     diagramms[diagramInfos.displayedDiagram].boundingRectComplete = boundingRectComplete;
        // }
    }

    //}

    //     // Draw further informations
    // ctx.moveTo(g_width - 20, g_height - 10);
    ctx.fillStyle = fontColor;
    ctx.textAlign = 'left';
    ctx.font = generalFontSize + 'px  sans-serif';
    let zoomfactorDisplay = 100 * diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor;
    ctx.fillText(zoomfactorDisplay.toFixed(1) + '%', g_width - 60, g_height - 10);
    //ctx.fillText(Math.round(100 * diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor) + '%', g_width - 40, g_height - 10);
    ctx.fillText(drawingCount, g_width - 60, g_height - 30);
    ctx.textAlign = 'start';
};



function drawAlways() {
    draw(true)
}

function drawWhenLayoutingRequires() {
    draw(false)
}

function draw(always = true) {

    let width = window.innerWidth - 40;
    let height = window.innerHeight - 40;
    g_width = width;
    g_height = height;

    supportRetina();

    if (!showExplorer) {

        let redraw = true;

        // Because the following is outcommented the flag redraw is always true.
        // This is currently accepted.

        // if (typeof diagramms[diagramInfos.displayedDiagram] !== 'undefined') {
        //     if (diagramms[diagramInfos.displayedDiagram].layoutingActive) {
        //         redraw = forceDirecting(width, height);
        //         let loadModelText = document.getElementById("InfoID");
        //         loadModelText.innerHTML = "Force-Directing is active";
        //     } else {
        //         let loadModelText = document.getElementById("InfoID");
        //         loadModelText.innerHTML = "";
        //     }
        // }

        if (redraw || always) {
            drawCompleteModel(ctx, width, height);
        }
        if (typeof diagramms[diagramInfos.displayedDiagram] !== 'undefined') {
            if (diagramms[diagramInfos.displayedDiagram].layoutingActive) {
                requestAnimationFrame = window.requestAnimationFrame(drawWhenLayoutingRequires);
            }
        }

        // #89 Do the time consuming force-directing after drawing the diagram
        // This prevents that the screen becomes black most of the time when very many
        // elements are drawn.
        // It is not yet understood why this is the case.

        if (typeof diagramms[diagramInfos.displayedDiagram] !== 'undefined') {
            if (diagramms[diagramInfos.displayedDiagram].layoutingActive) {
                if (diagramms[diagramInfos.displayedDiagram].diagramType != circuitDiagramForSoftwareDiagramType) {
                    redraw = forceDirecting(width, height);
                    // Inform user
                    let loadModelText = document.getElementById("InfoID");
                    loadModelText.innerHTML = "Force-Directing is active";
                } else {
                    redraw = autoLayout(width, height);
                    // Inform user
                    let loadModelText = document.getElementById("InfoID");
                    loadModelText.innerHTML = "Auto-Layout is active";
                }
            } else {
                let loadModelText = document.getElementById("InfoID");
                loadModelText.innerHTML = "";
            }
        }

    } else {

        if (showModelExplorer) {
            drawModelExplorer();
        } else if (showM2mExplorer) {
            drawM2mExplorer();
        }
    }
    // }
}
canvas.addEventListener('mouseover', function (e) {
    // if (!showModelExplorer) {
    requestAnimationFrame = window.requestAnimationFrame(drawWhenLayoutingRequires);
    // }
});

