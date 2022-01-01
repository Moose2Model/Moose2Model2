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
        parentChildByParent[parent] = parentChild;
        parentChildByChild[child] = parentChild;
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

        callByCaller[caller] = call;
        callByCalled[called] = call;
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

        accessByAccessor[accessor] = access;
        accessByAccessed[accessed] = access;
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
