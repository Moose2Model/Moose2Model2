'use strict';

function positionCircle(width, height) {
    const offset = 20;
    const w2 = Math.min(width, height);
    const w4 = w2 / 2 - offset;
    let nElements = 1;
    for (const mEBI of modelElementsByIndex) {
        nElements += 1;
    }
    const dAngle = 2 * Math.PI / nElements;
    let angle = 0;

    let x = 0;
    let y = 0;
    diagramms[activeDiagram.name].complModelPosition = [];


    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {

            x = w4 * Math.cos(angle);
            y = w4 * Math.sin(angle);

            let position = {
                index: mEBI['index'],
                x: x,
                y: y,
            };

            diagramms[activeDiagram.name].complModelPosition[mEBI['index']] = position;
            angle += dAngle;
        }
    }
};

