'use strict';

canvas.addEventListener('mousedown', handleDragMouseDown, false);
canvas.addEventListener('mousemove', handleDragMouseMove, false);
canvas.addEventListener('mouseup', handleDragMouseUp, false);
canvas.addEventListener('mouseout', handleDragMouseOut, false);
let isDragging = false;
/** Flag that dragging just started. Required for actions that are done only once when the dragging started. */
let isDraggingJustStarted = false;
let isCommentDragging = false;
let backGroundDragged = false;
let startX, startY;
let draggedElement;

function handleDragMouseDown(e) {
    // // tell the browser we're handling this event
    // e.preventDefault();
    // e.stopPropagation();
    if (typeof diagramms[diagramInfos.displayedDiagram] === 'undefined') {
        return;
    }
    let which = ''
    if (typeof e === 'object') {
        switch (e.button) {
            case 0:
                which = 'left';
                break;
            case 1:
                which = 'middle';
                break;
            case 2:
                which = 'right';
                break;
            default:
                which = 'unknown';
        }
    }

    reOffset(); // Solve problem why this is needed

    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);

    if (which == 'right') {
        if (!showExplorer ) {
            isDragging = true;
            isDraggingJustStarted = true;
            backGroundDragged = true;
            e.preventDefault();
            e.stopPropagation();
            return;
        }
    }
    if (which == 'left') {
        let found = {};
        found = findNearestElement(cameraToPaneX(startX), cameraToPaneY(startY), cameraToPaneScale(20));
        //if (typeof found.element !== 'undefined') {
        draggedElement = found.element;
        if (found.inComment) {
            isCommentDragging = true;
        }
        //}

        if (typeof draggedElement !== 'undefined') {
            isDragging = true;
            isDraggingJustStarted = true;
            backGroundDragged = false;
            e.preventDefault();
            e.stopPropagation();
            return;
        }
    }

}


function handleDragMouseMove(e) {

    if (!isDragging) { return; }
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // calculate the current mouse position         
    const mouseX = parseInt(e.clientX - offsetX);
    const mouseY = parseInt(e.clientY - offsetY);
    // how far has the mouse dragged from its previous mousemove position?
    const dx = mouseX - startX;
    const dy = mouseY - startY;
    if (backGroundDragged) {
        diagramms[diagramInfos.displayedDiagram].cameraSettings.move.x += cameraToPaneScale(dx);
        diagramms[diagramInfos.displayedDiagram].cameraSettings.move.y += cameraToPaneScale(dy);
    } else {

        displayedDiagramChanged();

        let mEBI = modelElementsByIndex[diagramms[diagramInfos.displayedDiagram].complModelPosition[draggedElement.index].index];

        if (isCommentDragging) {
            // move the selected comment by the drag distance
            diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index].x += cameraToPaneScale(dx);
            diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index].y += cameraToPaneScale(dy);
        } else if (mEBI.element == 'SOMIX.Code' || mEBI.element == 'SOMIX.Data') {
            // move the selected shape by the drag distance
            diagramms[diagramInfos.displayedDiagram].complModelPosition[draggedElement.index].x += cameraToPaneScale(dx);
            diagramms[diagramInfos.displayedDiagram].complModelPosition[draggedElement.index].y += cameraToPaneScale(dy);
            // Pin all dragged elements
            if (diagramms[diagramInfos.displayedDiagram].pinned.indexOf(draggedElement.index) == -1) {
                diagramms[diagramInfos.displayedDiagram].pinned.push(draggedElement.index);
            }
            // Move comments
            if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal !== 'undefined') {
                if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index] !== 'undefined') {
                    if (diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index].text != '') {
                        diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index].x += cameraToPaneScale(dx);
                        diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index].y += cameraToPaneScale(dy);
                    }
                }
            }
        } else if (mEBI.element == 'SOMIX.Grouping') {

            if (isDraggingJustStarted && diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType) {
                // Snap dragged elements that are part of a grouping to the grid.
                // This ensures that all ements of a grouping move smoothly.
                // Groups are not snapped
                // Snap comments
                if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal !== 'undefined') {
                    if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index] !== 'undefined') {
                        if (diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index].text != '') {
                            diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index].x =
                                snapToGridX(diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index].x);
                            diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index].y =
                                snapToGridY(diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index].y);
                        }
                    }
                }

                // Snap Child elements

                if (typeof parentChildByParent[mEBI.index] !== 'undefined') {
                    for (const childrens of parentChildByParent[mEBI.index]) {
                        if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child] !== 'undefined') {
                            diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].x = 
                            snapToGridX(diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].x);
                            diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].y = 
                            snapToGridY(diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].y);
                            // Snap comments
                            if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal !== 'undefined') {
                                if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[childrens.child] !== 'undefined') {
                                    if (diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[childrens.child].text != '') {
                                        diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[childrens.child].x = 
                                        snapToGridX(diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[childrens.child].x);
                                        diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[childrens.child].y = 
                                        snapToGridY(diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[childrens.child].y);
                                    }
                                }
                            }
                        }
                    }
                }

            }

            // move the selected shape by the drag distance
            diagramms[diagramInfos.displayedDiagram].complModelPosition[draggedElement.index].x += cameraToPaneScale(dx);
            diagramms[diagramInfos.displayedDiagram].complModelPosition[draggedElement.index].y += cameraToPaneScale(dy);
            // Move comments
            if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal !== 'undefined') {
                if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index] !== 'undefined') {
                    if (diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index].text != '') {
                        diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index].x += cameraToPaneScale(dx);
                        diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[draggedElement.index].y += cameraToPaneScale(dy);
                    }
                }
            }
            if (typeof parentChildByParent[mEBI.index] !== 'undefined') {
                for (const childrens of parentChildByParent[mEBI.index]) {
                    if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child] !== 'undefined') {
                        diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].x += cameraToPaneScale(dx);
                        diagramms[diagramInfos.displayedDiagram].complModelPosition[childrens.child].y += cameraToPaneScale(dy);
                        // Move comments
                        if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal !== 'undefined') {
                            if (typeof diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[childrens.child] !== 'undefined') {
                                if (diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[childrens.child].text != '') {
                                    diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[childrens.child].x += cameraToPaneScale(dx);
                                    diagramms[diagramInfos.displayedDiagram].generationInfoInternal.commentsByID[childrens.child].y += cameraToPaneScale(dy);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    isDraggingJustStarted = false;

    // clear the canvas and redraw all shapes
    drawCompleteModel(ctx, g_width, g_height);

    // update the starting drag position (== the current mouse position)
    startX = mouseX;
    startY = mouseY;
};

function handleDragMouseUp(e) {
    if (!isDragging) { return; }
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging = false;
    isDraggingJustStarted = false;
    isCommentDragging = false;
    if (diagramms[diagramInfos.displayedDiagram].layoutingActive) {
        requestAnimationFrame = window.requestAnimationFrame(drawWhenLayoutingRequires);
    }

};

function handleDragMouseOut(e) {
    if (!isDragging) { return; }
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging = false;
    isDraggingJustStarted = false;
    isCommentDragging = false;
    if (diagramms[diagramInfos.displayedDiagram].layoutingActive) {
        requestAnimationFrame = window.requestAnimationFrame(drawWhenLayoutingRequires);
    }

};