// From https://stackoverflow.com/questions/31601393/create-context-menu-using-jquery-with-html-5-canvas
// Adapted. Requires JQuery

var cw = canvas.width;
var ch = canvas.height;
function reOffset() {
    var BB = canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;
}
var offsetX, offsetY;
reOffset();
window.onscroll = function (e) { reOffset(); }
window.onresize = function (e) { reOffset(); }

var $menu = $('#contextMenu');

var rects = [];
rects.push({ x: 50, y: 50, width: 50, height: 50, color: "red", contextMenu: ['One red', 'Two red'] });
rects.push({ x: 150, y: 100, width: 75, height: 75, color: "blue", contextMenu: ['One blue', 'Two blue'] });

ctx.clearRect(0, 0, cw, ch);
for (var i = 0; i < rects.length; i++) {
    var rect = rects[i];
    ctx.beginPath();
    ctx.fillStyle = rect.color;
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.fill();
}

$('#contextMenu').on('click', 'li', function (e) {
    // hide the context menu
    // showContextMenu();
    $menu.hide();
    if ($(this).text() == 'Start Force-Feedback'){
      forceFeedback = true;
    } else {
      forceFeedback = false;
    }
    // alert('Context selection: ' + $(this).text());
});

// hide the context menu
showContextMenu();

canvas.addEventListener('mousedown', handleMouseDown, false);
canvas.addEventListener('contextmenu', handleContextMenu, false);

function handleMouseDown(e) {
    // hide the context menu
    showContextMenu();
}

function handleContextMenu(e) {
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();

    // get mouse position relative to the canvas
    var x = parseInt(e.clientX - offsetX);
    var y = parseInt(e.clientY - offsetY);

    
    showContextMenu(x, y);

    // // hide the context menu
    // showContextMenu();

    // // check each rect for hits
    // for (var i = 0; i < rects.length; i++) {
    //     var rect = rects[i];
    //     var rectRight = rect.x + rect.width;
    //     var rectBottom = rect.y + rect.height;

    //     // check each rect for hits
    //     if (x >= rect.x && x <= rectRight && y >= rect.y && y <= rectBottom) {
    //         showContextMenu(rect, x, y);
    //     }
    // }
    return (false);
}

function showContextMenu(x, y) {
    // if (!r) { $menu.hide(); return; }
    $menu.show();
    var m = ['Start Force-Feedback', 'Stop Force-Feedback'];
    $menu.empty();
    $menu.css({ left: x, top: y });
    for (var i = 0; i < m.length; i++) {
        $('<li>', { text: m[i], 'data-fn': i, }).appendTo($menu[0]);
    }
}