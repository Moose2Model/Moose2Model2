'use strict';

canvas.addEventListener('mousedown', handleDragMouseDown, false);
canvas.addEventListener('mousemove', handleDragMouseMove, false);
canvas.addEventListener('mouseup', handleDragMouseUp, false);
canvas.addEventListener('mouseout', handleDragMouseOut, false);
let isDragging = false;
let startX, startY;
let draggedElement;

function handleDragMouseDown(e) {
    // // tell the browser we're handling this event
    // e.preventDefault();
    // e.stopPropagation();

    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);

    draggedElement = findNearestElement(startX, startY, 10);
    if (typeof draggedElement !== 'undefined') {
        isDragging = true;
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
    // move the selected shape by the drag distance
    diagramms[activeDiagram].complModelPosition[draggedElement.index].x += dx;
    diagramms[activeDiagram].complModelPosition[draggedElement.index].y += dy;
// Pin all dragged elements
    if (diagramms[activeDiagram].pinned.indexOf(draggedElement.index) == -1){
        diagramms[activeDiagram].pinned.push(draggedElement.index);
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

};

function handleDragMouseOut(e) {
    if (!isDragging) { return; }
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging = false;

};