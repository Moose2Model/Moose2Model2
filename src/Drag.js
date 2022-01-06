'use strict';

canvas.addEventListener('mousedown', handleDragMouseDown, false);
canvas.addEventListener('mousemove', handleDragMouseMove, false);
canvas.addEventListener('mouseup', handleDragMouseUp, false);
canvas.addEventListener('mouseout', handleDragMouseOut, false);
let isDragging = false;
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
    reOffset(); // Solve problem why this is needed

    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);

    draggedElement = findNearestElement(cameraToPaneX(startX), cameraToPaneY(startY), 10);
    if (typeof draggedElement !== 'undefined') {
        isDragging = true;
        backGroundDragged = false;
        e.preventDefault();
        e.stopPropagation();
    } else {
        isDragging = true;
        backGroundDragged = true;
        e.preventDefault();
        e.stopPropagation();
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
        // move the selected shape by the drag distance
        diagramms[diagramInfos.displayedDiagram].complModelPosition[draggedElement.index].x += cameraToPaneScale(dx);
        diagramms[diagramInfos.displayedDiagram].complModelPosition[draggedElement.index].y += cameraToPaneScale(dy);
        // Pin all dragged elements
        if (diagramms[diagramInfos.displayedDiagram].pinned.indexOf(draggedElement.index) == -1) {
            diagramms[diagramInfos.displayedDiagram].pinned.push(draggedElement.index);
        }
    }

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
    if (diagramms[diagramInfos.displayedDiagram].forceFeedback) {
        requestAnimationFrame = window.requestAnimationFrame(drawWhenForceDirectRequires);
    }

};

function handleDragMouseOut(e) {
    if (!isDragging) { return; }
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging = false;
    if (diagramms[diagramInfos.displayedDiagram].forceFeedback) {
        requestAnimationFrame = window.requestAnimationFrame(drawWhenForceDirectRequires);
    }

};