'use strict';

let filteredModel = [];
let startExplorerLine = 0;
let scrollExplorerLine = 1;
let endExplorerLine = 1;
let listPositionToEntries = [];

function filterModelText(element) {
    //if(element.name.test(exploreModelFilter.value) == true){
    const regex = new RegExp(exploreModelFilter.value,'i');
    if (regex.test(element.completeName)) {
        return element;
    }
}

function filterModel() {
    let unFilteredModel = [];
    let i = 0;
    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {
            unFilteredModel[i] = {};
            unFilteredModel[i].index = mEBI.index;
            unFilteredModel[i].name = mEBI.name;
            i += 1;
        }
    }

    // Build complete name
    for (const f of unFilteredModel) {
        if (typeof f !== 'undefined') {
            if (typeof parentChildByChild[f.index] !== 'undefined') {
                for (const pCBC of parentChildByChild[f.index]) {
                    if (pCBC.isMain) {
                        if (typeof modelElementsByIndex[pCBC.parent] !== 'undefined') {
                            f.completeName = modelElementsByIndex[pCBC.parent].name + '>>' + f.name;
                        }
                        else { f.completeName = f.name; }
                    }
                }
            }
            if (typeof f.completeName === 'undefined') {
                f.completeName = f.name;
            }
        }
    }

    filteredModel = unFilteredModel.filter(filterModelText);

    // exploreModelFilter.value contains the filter string


}

function compareModel(a, b) {
    if (a.completeName < b.completeName) {
        return -1;
    }
    if (a.completeName > b.completeName) {
        return 1;
    }
    return 0;
}

function findListEntry(x, y) {
    let found = {};
    let foundElement;
    found.inComment = false;
    for (const e of listPositionToEntries) {
        if (y >= e.yMin && y < e.yMax) {
            foundElement = modelElementsByIndex[e.element.index];
        }
    }
    found.element = foundElement;
    return found;
}


function drawModelExplorer() {

    filterModel();

    filteredModel.sort(compareModel);

    endExplorerLine = filteredModel.length;
    if (endExplorerLine == 0) {
        endExplorerLine = 1;
    }

    if (startExplorerLine > endExplorerLine) {
        // Make sure that always something is visible
        startExplorerLine = endExplorerLine - 5;
        if (startExplorerLine < 0) {
            startExplorerLine = 0;
        }
    }

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

    listPositionToEntries = [];

    for (let i = 0; i <= linesForElements; i++) {
        let lineDisplay = startExplorerLine + i;
        if (typeof filteredModel[lineDisplay] !== 'undefined') {
            ctx.fillText(filteredModel[lineDisplay].completeName, xPosElements, yPosElements);
        }

        let listPositionToEntry = {}
        listPositionToEntry.element = filteredModel[lineDisplay];
        listPositionToEntry.yMin = yPosElements - fontSize;
        listPositionToEntry.yMax = yPosElements;
        listPositionToEntries.push(listPositionToEntry);

        yPosElements += lineDifference;

    }


}