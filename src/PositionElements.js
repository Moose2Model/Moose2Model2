'use strict';

function positionCircle(width, height) {
    const offset = 20;
    const w2 = Math.min(width, height);
    const w3 = w2 / 2;
    const w4 = w3 - offset;
    let nElements = 1;
    for (const mEBI of modelElementsByIndex) {
        nElements += 1;
    }
    const dAngle = 2 * Math.PI / nElements;
    let angle = 0;


    // const w = width - offset * 2;
    // const h = height - offset * 2;
    // const area = h * w;
    // const area2 = Math.max(area / nElements, 1);
    // const scale = Math.sqrt(area2);
    let x = 0;
    let y = 0;
    diagramms[activeDiagram].complModelPosition = [];


    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {

            x = w3 + w4 * Math.cos(angle);
            y = w3 + w4 * Math.sin(angle);

            let position = {
                x: x,
                y: y,
            };

            diagramms[activeDiagram].complModelPosition[mEBI['index']] = position;
            angle += dAngle;
        }
    }
};

