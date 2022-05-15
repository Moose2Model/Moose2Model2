'use strict';

let filteredModel = [];
let startExplorerLine = 0;
let scrollExplorerLine = 1;

function filterModel() {
    filteredModel = modelElementsByIndex;
}


function drawModelExplorer() {

    filterModel();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let yPosElements = 50;
    let xPosElements = 10;
    let fontSize = 15;
    let lineDifference = fontSize;

    ctx.font = fontSize + 'px sans-serif';
    ctx.fillStyle = 'black'
    ctx.fillText('The model explorer will be displayed here', xPosElements, yPosElements);
    yPosElements += lineDifference;
    ctx.fillText('The second line goes here', xPosElements, yPosElements);
    yPosElements += lineDifference;

    let linesForElements = Math.floor((canvas.height - yPosElements) / lineDifference);
    linesForElements -= 1;
    scrollExplorerLine = Math.floor(linesForElements / 2);

    /*     for (const f of filteredModel) {
            if (typeof f !== 'undefined') {
                yPosElements += 15;
                ctx.fillText(f.name, xPosElements, yPosElements);
            }
        } */

    for (let i = 0; i <= linesForElements; i++) {
        let lineDisplay = startExplorerLine + i;
        if (typeof filteredModel[lineDisplay] !== 'undefined') {
            ctx.fillText(filteredModel[lineDisplay].name, xPosElements, yPosElements);
        }
        yPosElements += lineDifference;
    }


}