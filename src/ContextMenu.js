'use strict';
// From https://stackoverflow.com/questions/31601393/create-context-menu-using-jquery-with-html-5-canvas
// Adapted. Requires JQuery



let $menu = $('#contextMenu');
// hide the context menu
$menu.hide();

$('#contextMenu').on('click', 'li', function (e) {
  // hide the context menu
  $menu.hide();
  if ($(this).text() == 'Start Force-directed graph') {
    forceFeedback = true;
    requestAnimationFrame = window.requestAnimationFrame(draw);
  } else {
    forceFeedback = false;
    window.cancelAnimationFrame(requestAnimationFrame);
  }
});

canvas.addEventListener('mousedown', handleMouseDown, false);
canvas.addEventListener('contextmenu', handleContextMenu, false);

function handleMouseDown(e) {
  $menu.hide();
}

function handleContextMenu(e) {
  // tell the browser we're handling this event
  e.preventDefault();
  e.stopPropagation();
  // reOffset(); // Because recalculating the offset appears not to work properly in all cases
  // get mouse position relative to the canvas
  var x = parseInt(e.clientX - offsetX);
  var y = parseInt(e.clientY - offsetY);

  showContextMenu(x, y);

  return (false);
}

function showContextMenu(x, y) {
  // if (!r) { $menu.hide(); return; }
  $menu.show();
  var m = ['Start Force-directed graph', 'Stop Force-directed graph'];
  $menu.empty();
  $menu.css({ left: x, top: y });
  for (var i = 0; i < m.length; i++) {
    $('<li>', { text: m[i], 'data-fn': i, }).appendTo($menu[0]);
  }
}