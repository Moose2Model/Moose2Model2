'use strict';

// Functions in the Playground should not be used regularly

function drawBalls(ctx, width, height) {

    function random(number) {
        return Math.floor(Math.random() * number);
    }
    for (let i = 0; i < 100; i++) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(113,121,208,0.1)';
        ctx.arc(random(width), random(height), random(100), 0, 2 * Math.PI);
        ctx.fill();
    }
};

function positionRandom(width, height) {

    function random(number) {
        return Math.floor(Math.random() * number);
    }
    const offset = 20;
    const w = width - offset * 2;
    const h = height - offset * 2;


    diagramms[activeDiagram.name].complModelPosition = [];


    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {

            let position = {
                x: random(w) + offset,
                y: random(h) + offset,
            };

            diagramms[activeDiagram.name].complModelPosition[mEBI['index']] = position;

        }
    }
};

function positionBoxed(width, height) {
    const offset = 20;
    const w = width - offset * 2;
    const h = height - offset * 2;
    const area = h * w;
    let nElements = 1;

    for (const mEBI of modelElementsByIndex) {
        nElements += 1;
    }
    const area2 = Math.max(area / nElements, 1);
    const scale = Math.sqrt(area2);
    let x = offset;
    let y = offset;
    diagramms[activeDiagram.name].complModelPosition = [];


    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {

            let position = {
                x: x,
                y: y,
            };

            diagramms[activeDiagram.name].complModelPosition[mEBI['index']] = position;

            x += scale;
            if (x > (width - offset)) {
                x = offset;
                y += scale;
            }
        }
    }
};