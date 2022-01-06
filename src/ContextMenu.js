'use strict';
// From https://stackoverflow.com/questions/31601393/create-context-menu-using-jquery-with-html-5-canvas
// Adapted. Requires JQuery

let gMC_url = '';
/** The element that is processed by the context menu */
let gMCElementContextHandled;

let $menu = $('#contextMenu');
// hide the context menu
$menu.hide();



canvas.addEventListener('mousedown', handleContextMouseDown, false);
canvas.addEventListener('contextmenu', handleContextMenu, false);
// This causes the Menu to not shown at all:
// canvas.addEventListener('mouseout', handleContextMouseOut, false);

function handleContextMouseDown(e) {
  $menu.hide();
}
function handleContextMouseOut(e) {
  $menu.hide();
}

function handleContextMenu(e) {
  // tell the browser we're handling this event
  e.preventDefault();
  e.stopPropagation();

  // get mouse position relative to the canvas

  reOffset(); // Solve problem why this is needed

  var x = parseInt(e.clientX - offsetX);
  var y = parseInt(e.clientY - offsetY);


  let nameText = '';
  let linkToEditorText = '';
  let techtypeText = '';
  let uniqueNameText = 'No element found';
  gMCElementContextHandled = findNearestElement(cameraToPaneX(x), cameraToPaneY(y), cameraToPaneScale(20));
  gMC_url = '';
  if (typeof gMCElementContextHandled !== 'undefined') {

    // Handle context menu, when an element is clicked

    uniqueNameText = gMCElementContextHandled.uniqueName;
    techtypeText = gMCElementContextHandled.technicalType;
    nameText = gMCElementContextHandled.name;
    linkToEditorText = gMCElementContextHandled.linkToEditor;
    gMC_url = gMCElementContextHandled.linkToEditor; // So that it is globaly available in case the link is clicked

    let InfoText = 'Mouse is Clicked at x: ' + x + ' y: ' + y;
    var m = [InfoText, nameText, techtypeText, uniqueNameText, linkToEditorText];
    if (typeof diagramInfos.activeDiagram !== 'undefined') {
      m.unshift('Add element with all neighbours');
    }
    if (linkToEditorText != '') {
      m.push('Jump to code');
    };
    if (diagramms[diagramInfos.displayedDiagram].pinned.indexOf(gMCElementContextHandled.index) > -1) {
      m.push('Remove pinning');
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
      m.push('Toggle display of names');
      m.push('Start Force-directed graph', 'Stop Force-directed graph');

      let otherArrays = returnOtherDiagrams();
      for (const oA of otherArrays) {
        m.push(oA);
      }
    }
  };



  // showContextMenu(x, y);
  $menu.show();
  // var m = ['Start Force-directed graph', 'Stop Force-directed graph'];
  $menu.empty();
  $menu.css({ left: x, top: y });
  for (var i = 0; i < m.length; i++) {
    $('<li>', { text: m[i], 'data-fn': i, }).appendTo($menu[0]);
  }

  return (false);
}

/**React on clicks in Menu */
$('#contextMenu').on('click', 'li', function (e) {
  // hide the context menu
  $menu.hide();
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
  } else if ($(this).text() == 'Add element with all neighbours') {

    addWithNeighbors(gMCElementContextHandled);
  } else if ($(this).text() == 'Toggle display of names') {

    toggleNameDisplay();


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