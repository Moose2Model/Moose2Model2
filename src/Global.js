'use strict';
// store a reference to our file handle
let fileHandle;

// This are all global variables which contain informations on a loaded model
// They are enhanced when more than a single mse model is loaded
let modelElementsByUniqueKey = {};
let modelElementsByIndex = [];
let parentChildByParent = [];
let parentChildByChild = [];
let callByCaller = [];
let callByCalled = [];
let accessByAccessor = [];
let accessByAccessed = [];
// These global variables are only needed when an mse model is loaded:
let indexByMSEIndex = [];
let currentIndex = 1;
// // For picture of complete Model
// /** @deprecated */
// let complModelPosition = [];
/** The main Canvas for drawings */
var canvas = document.getElementById('pane');
var ctx = canvas.getContext('2d');
let requestAnimationFrame;
let mouseover = false;
let forceFeedback = false;

// To support mouse event handling
function reOffset() {
    var BB = canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;
}
let offsetX, offsetY;
reOffset();
window.onscroll = function (e) { reOffset(); }
window.onresize = function (e) { reOffset(); }
canvas.onresize = function (e) { reOffset(); }

function findNearestElement(x, y, maxDistance) {
    let minDistanceSquared = -1;
    let minIndex = 0;

    for (let i = 1; i < diagramms[activeDiagram].complModelPosition.length; i++) { // List start with index 1

        let distance = (x - diagramms[activeDiagram].complModelPosition[i].x) * (x - diagramms[activeDiagram].complModelPosition[i].x) + (y - diagramms[activeDiagram].complModelPosition[i].y) * (y - diagramms[activeDiagram].complModelPosition[i].y);
        if (minDistanceSquared < 0) {
            minDistanceSquared = distance;
            minIndex = i;
        } else if (distance < minDistanceSquared) {
            minDistanceSquared = distance;
            minIndex = i;
        }
    }
    if (minDistanceSquared < maxDistance*maxDistance) {
        // Return nearest element only when it is nearer than maxDistance
        return modelElementsByIndex[minIndex];
    }

}


function uniqueKey(technicalType, uniqueName) {
    return technicalType + '..' + uniqueName; // TODO is a .. enough to have always unique keys?
};

function initializeBuildModel() {
    // Call before a new mse model is loaded
    indexByMSEIndex = [];
    currentIndex = 1;
}

function updateMSEIndex(mseIndex) {
    if (typeof indexByMSEIndex[mseIndex] === 'undefined') {
        indexByMSEIndex[mseIndex] = currentIndex;
        currentIndex += 1;
    }
};

function buildModel(elementName, idVal, nameVal, uniqueNameVal, technicalTypeVal, linkToEditorVal, parentVal, childVal, isMainVal, callerVal, calledVal, accessorVal, accessedVal, isWriteVal, isReadVal, isDependentVal) {

    let cont = '';
    let countUnknownElement = 0;
    if (elementName == 'SOMIX.Grouping' || elementName == 'SOMIX.Code' || elementName == 'SOMIX.Data') {
        updateMSEIndex(idVal);
        const index = indexByMSEIndex[idVal];
        const element = {
            element: elementName,
            index: index,
            name: nameVal,
            technicalType: technicalTypeVal,
            uniqueName: uniqueNameVal,
            linkToEditor: linkToEditorVal,
        };
        modelElementsByUniqueKey[uniqueKey(technicalTypeVal, uniqueNameVal)] = element;
        modelElementsByIndex[index] = element;
    }
    else if (elementName == 'SOMIX.ParentChild') {
        updateMSEIndex(parentVal);
        updateMSEIndex(childVal);
        const parent = indexByMSEIndex[parentVal];
        const child = indexByMSEIndex[childVal];
        const parentChild = {
            parent: parent,
            child: child,
            isMain: isMainVal
        };
        if (typeof parentChildByParent[parent] === 'undefined') {
            parentChildByParent[parent] = [parentChild];
        } else {
            parentChildByParent[parent].push(parentChild);
        };
        if (typeof parentChildByChild[child] === 'undefined') {
            parentChildByChild[child] = [parentChild];
        } else {
            parentChildByChild[child].push(parentChild);
        };
    }
    else if (elementName == 'SOMIX.Call') {
        updateMSEIndex(callerVal);
        updateMSEIndex(calledVal);
        const caller = indexByMSEIndex[callerVal];
        const called = indexByMSEIndex[calledVal];

        const call = {
            caller: caller,
            called: called,
        };
        if (typeof callByCaller[caller] === 'undefined') {
            callByCaller[caller] = [call];
        } else {
            callByCaller[caller].push(call);
        };
        if (typeof callByCalled[called] === 'undefined') {
            callByCalled[called] = [call];
        } else {
            callByCalled[called].push(call);
        };

    }
    else if (elementName == 'SOMIX.Access') {
        updateMSEIndex(accessorVal);
        updateMSEIndex(accessedVal);
        const accessor = indexByMSEIndex[accessorVal];
        const accessed = indexByMSEIndex[accessedVal];

        const access = {
            accessor: accessor,
            accessed: accessed,
            isWrite: isWriteVal,
            isRead: isReadVal,
            isDependent: isDependentVal
        };

        if (typeof accessByAccessor[accessor] === 'undefined') {
            accessByAccessor[accessor] = [access];
        } else {
            accessByAccessor[accessor].push(access);
        };

        if (typeof accessByAccessed[accessed] === 'undefined') {
            accessByAccessed[accessed] = [access];
        } else {
            accessByAccessed[accessed].push(access)
        };
    }
    else {
        // TODO handle unknown elements
    };

    switch (elementName) {
        case 'SOMIX.Grouping':
            cont = cont + elementName + ' name: ' + nameVal + ' uniqueName: ' + uniqueNameVal + ' technicalType: ' + technicalTypeVal + '|';
            break;
        case 'SOMIX.Code':
            cont = cont + elementName + ' name: ' + nameVal + ' uniqueName: ' + uniqueNameVal + ' technicalType: ' + technicalTypeVal + '|';
            break;
        case 'SOMIX.Data':
            cont = cont + elementName + ' name: ' + nameVal + ' uniqueName: ' + uniqueNameVal + ' technicalType: ' + technicalTypeVal + '|';
            break;
        case 'SOMIX.ParentChild':
            cont = cont + elementName + ' parent: ' + parentVal + ' child: ' + childVal + ' isMain: ' + isMainVal + '|';
            break;
        case 'SOMIX.Call':
            cont = cont + elementName + ' caller: ' + callerVal + ' called: ' + calledVal + '|';
            break;
        case 'SOMIX.Access':
            cont = cont + elementName + ' accessor: ' + accessorVal + ' accessed: ' + accessedVal + ' isWrite: ' + isWriteVal + ' isRead: ' + isReadVal + ' isDependent: ' + isDependentVal + '|';
            break;
        default:
            countUnknownElement += 1;
    };
    return cont;
}
