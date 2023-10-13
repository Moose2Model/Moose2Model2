'use strict';
// From https://stackoverflow.com/questions/31601393/create-context-menu-using-jquery-with-html-5-canvas
// Adapted. Requires JQuery
// New version where JQuery will be removed

let gMC_url = '';
/** The element that is processed by the context menu */
let gMCElementContextHandled;
/** @deprecated */
let contextMenuClickStarted = false;
let lastMousedowndAt = { x: 0, y: 0 };

//j2 let jqueryMenu = $('#contextMenu');
const NewMenu = document.getElementById('contextMenu');

NewMenu.style.position = 'absolute';

NewMenu.style.top = '150px';
NewMenu.style.left = '150px';
// hide the context menu
//j2 jqueryMenu.hide();
NewMenu.hidden = true;

// Test clearing list

while (NewMenu.firstChild) {
  NewMenu.removeChild(NewMenu.firstChild);
}

// Test appending item
var li = document.createElement("li");
li.appendChild(document.createTextNode("Four"));
NewMenu.appendChild(li);


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

  //j2 jqueryMenu.hide();

  NewMenu.hidden = true;
}

// function handleDragMouseMove(e) {
//   contextMenuClickStarted = false;
// }

function handleContextMouseOut(e) {
  //j2 jqueryMenu.hide();

  NewMenu.hidden = true;
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
  if (!showExplorer) {
    found = findNearestElement(cameraToPaneX(x), cameraToPaneY(y), cameraToPaneScale(20));
  } else {
    if (showModelExplorer) {
      found = findListEntry(x, y);
    }
    else if (showM2mExplorer) {
      found = findM2mListEntry(x, y);
      if (typeof found !== 'undefined') {
        handleReadM2mClose();
        ReadDisplayedDiagram(found.element.fileHandle);
        return (false);
      }
    }
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
      if (diagramInfos.displayedDiagram == diagramInfos.activeDiagram) {
        m.push('Comment');
      } else {
        m.push('Displayed <> Active: Comment');
      }

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
        m.push('Pin All');
        m.push('Unpin All');
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
    m.push('Index: ' + gMCElementContextHandled.index);

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
      m.push('Start Force-directed graph', 'Stop Force-directed graph', 'Force-Direct for 0.5s');

      let otherArrays = returnOtherDiagrams();
      for (const oA of otherArrays) {
        m.push(oA);
      }
    }
  };





  // showContextMenu(x, y);
  //ok jqueryMenu.show();
  NewMenu.hidden = false;
  // var m = ['Start Force-directed graph', 'Stop Force-directed graph'];
  //ok  jqueryMenu.empty();

  // Clear list with all context menu items
  while (NewMenu.firstChild) {
    NewMenu.removeChild(NewMenu.firstChild);
  }

  //j2 jqueryMenu.css({ left: x, top: y });
  NewMenu.style.top = y + 'px';
  NewMenu.style.left = x + 'px';
  //ok for (var i = 0; i < m.length; i++) {
  //ok   $('<li>', { text: m[i], 'data-fn': i, }).appendTo(jqueryMenu[0]);
  //ok }

  // append items to context menu
  for (var i = 0; i < m.length; i++) {

    var li = document.createElement("li");
    li.addEventListener('click', ContextMenuClicked);


    li.appendChild(document.createTextNode(m[i]));
    NewMenu.appendChild(li);

  }

  return (false);
}

function ContextMenuClicked(e) {

  NewMenu.hidden = true;
  if (this.outerText == 'Start Force-directed graph') {
    if (typeof diagramms[diagramInfos.displayedDiagram] !== 'undefined') {
      diagramms[diagramInfos.displayedDiagram].forceFeedback = true;
      requestAnimationFrame = window.requestAnimationFrame(drawWhenForceDirectRequires);
      displayedDiagramChanged();
    }
  } else if (this.outerText == 'Stop Force-directed graph') {
    if (typeof diagramms[diagramInfos.displayedDiagram] !== 'undefined') {
      diagramms[diagramInfos.displayedDiagram].forceFeedback = false;
      window.cancelAnimationFrame(requestAnimationFrame);
    }
    // Start and Stop Force-directed graph after 0.5 seconds
  } else if (this.outerText == 'Force-Direct for 0.5s') {
    diagramms[diagramInfos.displayedDiagram].forceFeedback = true;
    requestAnimationFrame = window.requestAnimationFrame(drawWhenForceDirectRequires);
    displayedDiagramChanged();

    setTimeout(() => {
      diagramms[diagramInfos.displayedDiagram].forceFeedback = false;
      window.cancelAnimationFrame(requestAnimationFrame);
    }, 500);  // Stop after 500 milliseconds (0.5 seconds)

  } else if (this.outerText == 'Jump to code') {
    window.location.href = gMC_url;
    // requestAnimationFrame = window.requestAnimationFrame(drawWhenForceDirectRequires);
  } else if (this.outerText == 'Remove pinning') {
    const idx = diagramms[diagramInfos.displayedDiagram].pinned.indexOf(gMCElementContextHandled.index);
    if (idx !== -1) {
      diagramms[diagramInfos.displayedDiagram].pinned.splice(idx, 1); // delete this element from list
    }
    // requestAnimationFrame = window.requestAnimationFrame(drawWhenForceDirectRequires);
  } else if (this.outerText == 'Make this diagram active') {
    setDiagramActive(diagramInfos.displayedDiagram);
  } else if (this.outerText == 'Add element with all neighbors' || this.outerText == 'Displayed <> Active: Add element with all neighbors') {
    resetRepositionRequired();
    addWithNeighbors(gMCElementContextHandled, true);
    doRepositioningOfRequired();
    activeDiagramChanged();
  } else if (this.outerText == 'Remove: Add element with all neighbors' || this.outerText == 'Displayed <> Active: Remove: Add element with all neighbors') {
    redoAddWithNeighbors(gMCElementContextHandled);
    activeDiagramChanged();
  } else if (this.outerText == 'Comment' || this.outerText == 'Displayed <> Active: Comment') {
    comment(gMCElementContextHandled);
    activeDiagramChanged();
  } else if (this.outerText == 'Supress' || this.outerText == 'Supress with all children') {
    suppress(gMCElementContextHandled);
    activeDiagramChanged();
  } else if (this.outerText == 'Redo supress') {
    redoSuppress(gMCElementContextHandled);
    activeDiagramChanged();
  } else if (this.outerText == 'Toggle display of names') {
    toggleNameDisplay();
  } else if (this.outerText == 'Highlight used by') {
    highlightUsedBy(gMCElementContextHandled.index);
  } else if (this.outerText == 'Highlight') {
    highlight(gMCElementContextHandled.index);
  } else if (this.outerText == 'Highlight using') {
    highlightUsing(gMCElementContextHandled.index);
  } else if (this.outerText == 'Pin All') {
    pinAllElementsOfGrouping(gMCElementContextHandled.index);
  }
  else if (this.outerText == 'Unpin All') {
    unPinAllElementsOfGrouping(gMCElementContextHandled.index);
  }
  else {
    // Scan for a name of another diagram
    for (const c of returnOtherDiagrams()) {
      if (this.outerText == c) {
        switchDiagram(c);
        drawCompleteModel(ctx, g_width, g_height);
        // draw();
      }
    }
  }

}

function pinAllElementsOfGrouping(groupElementIndex) {
  // This function should iterate through all children of 'groupElementIndex' 
  // and add them to the array with pinned elements (if not already in there)

  // Read array parentChildByParent to find all children of groupElementIndex and add them to pinned
  if (parentChildByParent[groupElementIndex] != undefined) {
    for (const c of parentChildByParent[groupElementIndex]) {
      if (diagramms[diagramInfos.displayedDiagram].pinned.indexOf(c.child) == -1) {
        diagramms[diagramInfos.displayedDiagram].pinned.push(c.child);
      }
    }
  }
}

function unPinAllElementsOfGrouping(groupElementIndex) {
  // This function should iterate through all children of 'groupElement' 
  // and remove them from the array with pinned elements (if in there)

  // Read array parentChildByParent to find all children of groupElementIndex and remove them from pinned
  if (parentChildByParent[groupElementIndex] != undefined) {
    for (const c of parentChildByParent[groupElementIndex]) {
      if (diagramms[diagramInfos.displayedDiagram].pinned.indexOf(c.child) != -1) {
        diagramms[diagramInfos.displayedDiagram].pinned.splice(diagramms[diagramInfos.displayedDiagram].pinned.indexOf(c.child), 1);
      }
    }
  }
}

/**React on clicks in Menu */
/* $('#contextMenu').on('click', 'li', function (e) {
  // hide the context menu
  jqueryMenu.hide();

  NewMenu.hidden = true;
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
); */