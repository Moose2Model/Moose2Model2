// Requires JQuery


let $onClickInfo = $('#onClickInfo');
// hide the context menu
$onClickInfo.hide();

// $('#contextMenu').on('click', 'li', function (e) {
//   // hide the context menu
//   $menu.hide();
//   if ($(this).text() == 'Start Force-directed graph') {
//     forceFeedback = true;
//   } else {
//     forceFeedback = false;
//   }
// });

canvas.addEventListener('mousedown', handleMouseDown2, false);
canvas.addEventListener('click', handleMouseClick, false);

function handleMouseDown2(e) {
    // hide the context menu
    $onClickInfo.hide();
}

function findElement(x, y) {
    let minDistance = -1;
    let minIndex = 0;

    for (let i = 1; i < complModelPosition.length; i++) { // List start with index 1

        let distance = (x - complModelPosition[i].x) * (x - complModelPosition[i].x) + (y - complModelPosition[i].y) * (y - complModelPosition[i].y);
        if (minDistance < 0) {
            minDistance = distance;
            minIndex = i;
        } else if (distance < minDistance) {
            minDistance = distance;
            minIndex = i;
        }
    }

    return modelElementsByIndex[minIndex];

}

function handleMouseClick(e) {
    //   // tell the browser we're handling this event
    //   e.preventDefault();
    //   e.stopPropagation();
    reOffset();
    var x = parseInt(e.clientX - offsetX);
    var y = parseInt(e.clientY - offsetY);
    let nameText = '';
    let linkToEditorText = '';
    let techtypeText = '';
    let uniqueNameText = 'No element found';
    let element = findElement(x, y);
    if (typeof element !== 'undefined') {
        uniqueNameText = element.uniqueName;
        techtypeText = element.technicalType;
        nameText = element.name;
        linkToEditorText = element.linkToEditor;
    };

    // if (!r) { $onClickInfo.hide(); return; }
    $onClickInfo.show();
    let InfoText = 'Mouse is Clicked at x: ' + x + ' y: ' + y;
    var m = [InfoText, nameText, techtypeText, uniqueNameText, linkToEditorText];
    $onClickInfo.empty();
    $onClickInfo.css({ left: x, top: y });
    for (var i = 0; i < m.length; i++) {
        $('<li>', { text: m[i], 'data-fn': i, }).appendTo($onClickInfo[0]);
    }

    return (false);
}

// function showContextMenu(x, y) {
//   // if (!r) { $onClickInfo.hide(); return; }
//   $onClickInfo.show();
//   var m = ['Start Force-directed graph', 'Stop Force-directed graph'];
//   $onClickInfo.empty();
//   $onClickInfo.css({ left: x, top: y });
//   for (var i = 0; i < m.length; i++) {
//     $('<li>', { text: m[i], 'data-fn': i, }).appendTo($onClickInfo[0]);
//   }
// }