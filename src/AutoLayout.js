'use strict';

const ALscale = 4;
const AlMaxStep = 10; // Maximal distance to move an element in one step
const initialAutolayoutState = {
    springLength: 28 * ALscale,
    maxRepulsionLength: 20 * ALscale,
    complModelPositionChange: [],
};

function ALspring(x1, y1, x2, y2, springLength) {
    let vect = { x: (x2 - x1) / ALscale, y: (y2 - y1) / ALscale };
    let dist = Math.sqrt(vect.x ** 2 + vect.y ** 2);
    let forceMagnitude = ALscale * (dist - springLength / ALscale);
    return { x: forceMagnitude * vect.x, y: forceMagnitude * vect.y };
}

function ALrepulsion(x1, y1, x2, y2, maxRepulsionLength) {
    let vect = { x: (x2 - x1) / ALscale, y: (y2 - y1) / ALscale };
    let dist = Math.sqrt(vect.x ** 2 + vect.y ** 2);
    let fact = dist > maxRepulsionLength ? 0 : dist < 0.1 * ALscale ? 100 : 1 / (dist ** 2);
    fact *= -40000;
    return { x: ALscale * vect.x * fact, y: ALscale * vect.y * fact };
}

function calculateAttractionForces(diagram, type) {
    let interactions = type === 'calls' ? callByCaller : accessByAccessor;
    let changePosArray = diagram.layoutingState.complModelPositionChange;
    let step = 0.00002;

    for (let j = 1; j < interactions.length; j++) {
        const interaction = interactions[j];
        if (!interaction) continue;

        for (const interactionItem of interaction) {
            
            const source = interactionItem.caller || interactionItem.accessor;
            const target = interactionItem.called || interactionItem.accessed;


            const sourcePos = diagram.complModelPosition[source];
            const targetPos = diagram.complModelPosition[target];
            if (!sourcePos || !targetPos || !sourcePos.visible || !targetPos.visible) continue;

            let force = ALspring(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y, diagram.layoutingState.springLength);


            if (!changePosArray[source]) {
                changePosArray[source] = { x: 0, y: 0 }; 
            }
            if (!changePosArray[target]) {
                changePosArray[target] = { x: 0, y: 0 }; 
            }

            changePosArray[source].x += step * force.x;
            changePosArray[source].y += step * force.y;
            changePosArray[target].x -= step * force.x;
            changePosArray[target].y -= step * force.y;

        }
    }

}

function calculateRepulsionForces(diagram) {    
    let changePosArray = diagram.layoutingState.complModelPositionChange;
    let step = 0.00002;

    for (let i = 1; i < diagram.complModelPosition.length; i++) {
        const sourcePos = diagram.complModelPosition[i];
        if (!sourcePos || !sourcePos.visible) continue;

        for (let j = i + 1; j < diagram.complModelPosition.length; j++) {
            const targetPos = diagram.complModelPosition[j];
            if (!targetPos || !targetPos.visible) continue;

            let force = ALrepulsion(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y, diagram.layoutingState.maxRepulsionLength);

            if (!changePosArray[i]) {
                changePosArray[i] = { x: 0, y: 0 }; 
            }
            if (!changePosArray[j]) {
                changePosArray[j] = { x: 0, y: 0 };
            }

            changePosArray[i].x += step * force.x;
            changePosArray[i].y += step * force.y;
            changePosArray[j].x -= step * force.x;
            changePosArray[j].y -= step * force.y;
        }
    }
}


function autoLayout(width, height) {
    const diagram = diagramms[diagramInfos.displayedDiagram];
    resetLayoutState(diagram);

    let nElements = countVisibleElements(diagram.complModelPosition);
    if (nElements <= 1) return true;

    calculateAttractionForces(diagram, 'calls');
    calculateAttractionForces(diagram, 'accesses');
    calculateRepulsionForces(diagram);
    applyCorrections(diagram);

    return true;
}

function resetLayoutState(diagram) {
    diagram.layoutingState.complModelPositionChange = [];
}

function countVisibleElements(elements) {
    return elements.reduce((count, elem) => count + (elem && elem.visible ? 1 : 0), 0);
}

function applyCorrections(diagram) {
    const changePosArray = diagram.layoutingState.complModelPositionChange;
    let maxDiff = 0;

    // Determine the maximum change across all elements to calculate the correction factor
    diagram.complModelPosition.forEach((element, index) => {
        if (!element || !element.visible || !changePosArray[index]) return;
        const totalXChange = Math.abs(changePosArray[index].x || 0);
        const totalYChange = Math.abs(changePosArray[index].y || 0);
        maxDiff = Math.max(maxDiff, totalXChange, totalYChange);
    });

    // Calculate the correction factor based on the maximum change
    let corrFact = maxDiff > AlMaxStep ? (1 / maxDiff) : AlMaxStep;

    // Apply the correction factor to the new position of each element
    diagram.complModelPosition.forEach((element, index) => {
        if (!element || !element.visible) return;
        if (diagram.pinned && diagram.pinned.includes(index)) return; // Ignore pinned elements
        if (!changePosArray[index]) return; // Ignore elements without change
        let changePositionX = changePosArray[index].x * corrFact;
        let changePositionY = changePosArray[index].y * corrFact;

        // Update the positions in the diagram
        diagram.complModelPosition[index].x += changePositionX;
        diagram.complModelPosition[index].y += changePositionY;

    });
}

