'use strict';

canvas.addEventListener('click', handleMouseClick, false);

let gMCElementClickHandled;

let isAPressed = false;
let isRPressed = false;

// Add a keydown event listener to track the "A" key press
document.addEventListener('keydown', function (event) {
    if (event.key === 'a' || event.key === 'A') {
        isAPressed = true;
    }
    if (event.key === 'r' || event.key === 'R') {
        isRPressed = true;
    }
});

// Add a keyup event listener to track the "A" key release
document.addEventListener('keyup', function (event) {
    if (event.key === 'a' || event.key === 'A') {
        isAPressed = false;
    }
    if (event.key === 'r' || event.key === 'R') {
        isRPressed = false;
    }
});

function handleMouseClick(e) {
    // get mouse position relative to the canvas



    reOffset(); // Solve problem why this is needed

    var x = parseInt(e.clientX - offsetX);
    var y = parseInt(e.clientY - offsetY);
    // The context menu of the standard is always suppressed. This is for instance also done in diagrams.net
    e.preventDefault();
    e.stopPropagation();

    let found = {};

    if (showModelExplorer) {
        found = findListEntry(x, y);

        gMCElementClickHandled = found.element;

        if (typeof gMCElementClickHandled !== 'undefined') {

            if (gMCElementClickHandled.element != 'SOMIX.Grouping') {
                if (typeof diagramInfos.activeDiagram !== 'undefined') {
                    if (diagramms[diagramInfos.activeDiagram].generationInfoInternal.addedWithNeighbors.includes(gMCElementClickHandled.index)) {
                        if (isRPressed) {
                            // Duplicate Coding in ContextMenu.js and Click.js
                            redoAddWithNeighbors(gMCElementClickHandled);
                            activeDiagramChanged();
                        }
                    } else {
                        if (isAPressed) {
                            // Duplicate Coding in ContextMenu.js and Click.js
                            resetRepositionRequired();
                            addWithNeighbors(gMCElementClickHandled, true);
                            doRepositioningOfRequired();
                            activeDiagramChanged();
                        }
                    }
                    drawModelExplorer();
                }

            }
        }

    }


}
