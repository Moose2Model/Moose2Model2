'use strict';
// From https://stackoverflow.com/questions/31601393/create-context-menu-using-jquery-with-html-5-canvas
// Adapted. Requires JQuery

let gMC_url = '';
/** The element that is processed by the context menu */
let gMCElementContextHandled;
/** @deprecated */
let contextMenuClickStarted = false;
let lastMousedowndAt = { x: 0, y: 0 };

let jqueryMenu = $('#contextMenu');
// hide the context menu
jqueryMenu.hide();


canvas.addEventListener('mousedown', handleContextMouseDown, false);
// canvas.addEventListener('mousemove', handleDragMouseMove, false);
// canvas.addEventListener('mouseup', handleMouseUp, false);


// canvas.addEventListener('mousedown', handleContextMouseDown, false);
canvas.addEventListener('contextmenu', handleContextMenu, false);
// This causes the Menu to not shown at all:
// canvas.addEventListener('mouseout', handleContextMouseOut, false);


function handleContextMouseDown(e) {
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
        contextMenuClickStarted = true;

        reOffset(); // Solve problem why this is needed

        var x = parseInt(e.clientX - offsetX);
        var y = parseInt(e.clientY - offsetY);
        lastMousedowndAt.x = x;
        lastMousedowndAt.y = y;
        break;
      default:
        which = 'unknown';
    }
  }

  jqueryMenu.hide();
}

// function handleDragMouseMove(e) {
//   contextMenuClickStarted = false;
// }

function handleContextMouseOut(e) {
  jqueryMenu.hide();
}

function handleContextMenu(e) {
  // function handleMouseUp(e) {
  if (!contextMenuClickStarted) {
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

  if (which != 'right') {
    return;
  }

  // get mouse position relative to the canvas

  reOffset(); // Solve problem why this is needed

  var x = parseInt(e.clientX - offsetX);
  var y = parseInt(e.clientY - offsetY);
  // The context menu of the standard is always suppressed. This is for instance also done in diagrams.net
  e.preventDefault();
  e.stopPropagation();

  if (Math.abs(x - lastMousedowndAt.x) > 5 || Math.abs(y - lastMousedowndAt.y > 5)) {
    return;
  }

  let nameText = '';
  let linkToEditorText = '';
  let techtypeText = '';
  let uniqueNameText = 'No element found';
  let found = {};
  if (!showModelExplorer) {
    found = findNearestElement(cameraToPaneX(x), cameraToPaneY(y), cameraToPaneScale(20));
  } else {
    found = findListEntry(x, y);
  }
  gMCElementContextHandled = found.element;

  gMC_url = '';
  if (typeof gMCElementContextHandled !== 'undefined') {

    // Handle context menu, when an element is clicked

    uniqueNameText = gMCElementContextHandled.uniqueName;
    techtypeText = gMCElementContextHandled.technicalType;
    nameText = gMCElementContextHandled.name;
    linkToEditorText = gMCElementContextHandled.linkToEditor;
    gMC_url = gMCElementContextHandled.linkToEditor; // So that it is globaly available in case the link is clicked

    var m = [nameText, techtypeText, uniqueNameText, linkToEditorText];
    if (gMCElementContextHandled.element != 'SOMIX.Grouping') {
      if (typeof diagramInfos.activeDiagram !== 'undefined') {
        if (diagramms[diagramInfos.activeDiagram].generationInfoInternal.addedWithNeighbors.includes(gMCElementContextHandled.index)) {
          if (diagramInfos.displayedDiagram == diagramInfos.activeDiagram) {
            m.unshift('Remove: Add element with all neighbors');
          } else {
            m.unshift('Displayed <> Active: Remove: Add element with all neighbors');
          }
        } else {
          if (diagramInfos.displayedDiagram == diagramInfos.activeDiagram) {
            m.unshift('Add element with all neighbors');
          } else {
            m.unshift('Displayed <> Active: Add element with all neighbors');
          }
        }
      } else {
        m.unshift('Add or Remove not possible - No active diagram');
      }

    }
    if (typeof diagramInfos.activeDiagram !== 'undefined') {

      m.push('Comment');

      if (gMCElementContextHandled.element == 'SOMIX.Code' || gMCElementContextHandled.element == 'SOMIX.Data') {
        if (diagramms[diagramInfos.activeDiagram].generationInfoInternal.suppressed.includes(gMCElementContextHandled.index)) {
          m.push('Redo supress');
        } else {
          m.push('Supress');
        }
      }
      if (gMCElementContextHandled.element == 'SOMIX.Grouping') {
        if (diagramms[diagramInfos.activeDiagram].generationInfoInternal.suppressed.includes(gMCElementContextHandled.index)) {
          m.push('Redo supress');
        } else {
          m.push('Supress with all children');
        }
      }
    }
    if (linkToEditorText != '') {
      m.push('Jump to code');
    };
    if (diagramms[diagramInfos.displayedDiagram].pinned.indexOf(gMCElementContextHandled.index) > -1) {
      m.push('Remove pinning');
    };
    if (diagramms[diagramInfos.displayedDiagram].type == circuitDiagramForSoftwareType) {
      m.push('Highlight used by');
      m.push('Highlight');
      m.push('Highlight using');
    }

  } else {
    // Handle context menu, when the pane is clicked
    var m = [];
    if (typeof diagramInfos.displayedDiagram !== 'undefined') {
      if (diagramms[diagramInfos.displayedDiagram].type == circuitDiagramForSoftwareType) {
        if (diagramInfos.displayedDiagram != diagramInfos.activeDiagram) {
          m.unshift('Make this diagram active');
        }
      }
      if (diagramms[diagramInfos.displayedDiagram].type != circuitDiagramForSoftwareType) {
        m.push('Toggle display of names');
      }
      m.push('Start Force-directed graph', 'Stop Force-directed graph');

      let otherArrays = returnOtherDiagrams();
      for (const oA of otherArrays) {
        m.push(oA);
      }
    }
  };



  // showContextMenu(x, y);
  jqueryMenu.show();
  // var m = ['Start Force-directed graph', 'Stop Force-directed graph'];
  jqueryMenu.empty();
  jqueryMenu.css({ left: x, top: y });
  for (var i = 0; i < m.length; i++) {
    $('<li>', { text: m[i], 'data-fn': i, }).appendTo(jqueryMenu[0]);
  }

  return (false);
}

/**React on clicks in Menu */
$('#contextMenu').on('click', 'li', function (e) {
  // hide the context menu
  jqueryMenu.hide();
  if ($(this).text() == 'Start Force-directed graph') {
    if (typeof diagramms[diagramInfos.displayedDiagram] !== 'undefined') {
      diagramms[diagramInfos.displayedDiagram].forceFeedback = true;
      requestAnimationFrame = window.requestAnimationFrame(drawWhenForceDirectRequires);
    }
  } else if ($(this).text() == 'Stop Force-directed graph') {
    if (typeof diagramms[diagramInfos.displayedDiagram] !== 'undefined') {
      diagramms[diagramInfos.displayedDiagram].forceFeedback = false;
      window.cancelAnimationFrame(requestAnimationFrame);
    }
  } else if ($(this).text() == 'Jump to code') {
    window.location.href = gMC_url;
    // requestAnimationFrame = window.requestAnimationFrame(drawWhenForceDirectRequires);
  } else if ($(this).text() == 'Remove pinning') {
    const idx = diagramms[diagramInfos.displayedDiagram].pinned.indexOf(gMCElementContextHandled.index);
    if (idx !== -1) {
      diagramms[diagramInfos.displayedDiagram].pinned.splice(idx, 1); // delete this element from list
    }
    // requestAnimationFrame = window.requestAnimationFrame(drawWhenForceDirectRequires);
  } else if ($(this).text() == 'Make this diagram active') {
    setDiagramActive(diagramInfos.displayedDiagram);
  } else if ($(this).text() == 'Add element with all neighbors' || $(this).text() == 'Displayed <> Active: Add element with all neighbors') {
    addWithNeighbors(gMCElementContextHandled);
  } else if ($(this).text() == 'Remove: Add element with all neighbors' || $(this).text() == 'Displayed <> Active: Remove: Add element with all neighbors') {
    redoAddWithNeighbors(gMCElementContextHandled);
  } else if ($(this).text() == 'Comment') {
    comment(gMCElementContextHandled);
  } else if ($(this).text() == 'Supress' || $(this).text() == 'Supress with all children') {
    suppress(gMCElementContextHandled);
  } else if ($(this).text() == 'Redo supress') {
    redoSuppress(gMCElementContextHandled);
  } else if ($(this).text() == 'Toggle display of names') {
    toggleNameDisplay();
  } else if ($(this).text() == 'Highlight used by') {
    highlightUsedBy(gMCElementContextHandled.index);
  } else if ($(this).text() == 'Highlight') {
    highlight(gMCElementContextHandled.index);
  } else if ($(this).text() == 'Highlight using') {
    highlightUsing(gMCElementContextHandled.index);
  }
  else {
    // Scan for a name of another diagram
    for (const c of returnOtherDiagrams()) {
      if ($(this).text() == c) {
        switchDiagram(c);
        drawCompleteModel(ctx, g_width, g_height);
        // draw();
      }
    }
  }
}
);