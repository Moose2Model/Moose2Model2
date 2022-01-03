'use strict';

function positionRandom(width, height) {

    function random(number) {
        return Math.floor(Math.random() * number);
    }
    const offset = 20;
    const w = width - offset * 2;
    const h = height - offset * 2;


    complModelPosition = [];


    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {

            let position = {
                x: random(w) + offset,
                y: random(h) + offset,
            };

            complModelPosition[mEBI['index']] = position;

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
    complModelPosition = [];


    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {

            let position = {
                x: x,
                y: y,
            };

            complModelPosition[mEBI['index']] = position;

            x += scale;
            if (x > (width - offset)) {
                x = offset;
                y += scale;
            }
        }
    }
};

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
    complModelPosition = [];


    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {

            x = w3 + w4 * Math.cos(angle);
            y = w3 + w4 * Math.sin(angle);

            let position = {
                x: x,
                y: y,
            };

            complModelPosition[mEBI['index']] = position;
            angle += dAngle;
        }
    }
};

function forceDirecting(width, height) {

    const w2 = Math.min(width, height);
    let nElements = 1;
    for (const mEBI of modelElementsByIndex) {
        nElements += 1;
    }

    if (nElements == 1) {
        return;
    }

    let complModelPositionNew = [];

    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {

            let position = {
                // x: complModelPosition[mEBI['index']].x,
                // y: complModelPosition[mEBI['index']].y,
                x: 0,
                y: 0,
            };
            complModelPositionNew[mEBI['index']] = position;
        }
    }

    const avgLen = w2 / Math.sqrt(nElements);
    // const step = 0.00002; // für 300kb Model
    // const step = 0.000001; // für 4 MB Model
    const step = 0.00002;

    function spring(x1, y1, x2, y2) {
        let vect = {
            x: x2 - x1,
            y: y2 - y1
        };
        let dist = Math.sqrt(vect.x * vect.x + vect.y * vect.y);
        let force = {
            x: vect.x * (dist - avgLen),
            y: vect.y * (dist - avgLen)
        };
        return force;
    };

    function repulsion(x1, y1, x2, y2) {
        let vect = {
            x: x2 - x1,
            y: y2 - y1
        };
        let dist = Math.sqrt(vect.x * vect.x + vect.y * vect.y);
        let fact = 1;
        if (dist > 20) {
            fact = 0;
        } else if (dist < 0.1) {
            fact = 100;
        } else { fact = 1 / (dist * dist) };
        fact = -fact * 2000;
        let force = {
            x: vect.x * fact,
            y: vect.y * fact
        };
        return force;
    };

    for (const pCBP of parentChildByParent) {
        if (typeof pCBP !== 'undefined') {
            for (const pC of pCBP) {
                let pCForce = spring(
                    complModelPosition[pC['parent']].x,
                    complModelPosition[pC['parent']].y,
                    complModelPosition[pC['child']].x,
                    complModelPosition[pC['child']].y);
                complModelPositionNew[pC['parent']].x += 0.2 * step * pCForce.x; // Make parent more heavy, therefore a factor 0.2
                complModelPositionNew[pC['parent']].y += 0.2 * step * pCForce.y; // Make parent more heavy, therefore a factor 0.2
                complModelPositionNew[pC['child']].x -= step * pCForce.x;
                complModelPositionNew[pC['child']].y -= step * pCForce.y;
            }
        }
    };

    for (const cBC of callByCaller) {
        if (typeof cBC !== 'undefined') {
            for (const cC of cBC) {
                let cCForce = spring(
                    complModelPosition[cC['caller']].x,
                    complModelPosition[cC['caller']].y,
                    complModelPosition[cC['called']].x,
                    complModelPosition[cC['called']].y);
                complModelPositionNew[cC['caller']].x += step * cCForce.x;
                complModelPositionNew[cC['caller']].y += step * cCForce.y;
                complModelPositionNew[cC['called']].x -= step * cCForce.x;
                complModelPositionNew[cC['called']].y -= step * cCForce.y;
            }
        }
    };

    for (const aBA of accessByAccessor) {
        if (typeof aBA !== 'undefined') {
            for (const aA of aBA) {
                let aAForce = spring(
                    complModelPosition[aA['accessor']].x,
                    complModelPosition[aA['accessor']].y,
                    complModelPosition[aA['accessed']].x,
                    complModelPosition[aA['accessed']].y);
                complModelPositionNew[aA['accessor']].x += step * aAForce.x;
                complModelPositionNew[aA['accessor']].y += step * aAForce.y;
                complModelPositionNew[aA['accessed']].x -= step * aAForce.x;
                complModelPositionNew[aA['accessed']].y -= step * aAForce.y;
            }
        }
    };

    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {
            for (const mEBI2 of modelElementsByIndex) {
                if (typeof mEBI2 !== 'undefined') {
                    if (mEBI != mEBI2) {
                        let eForce = repulsion(
                            complModelPosition[mEBI['index']].x,
                            complModelPosition[mEBI['index']].y,
                            complModelPosition[mEBI2['index']].x,
                            complModelPosition[mEBI2['index']].y);
                        complModelPositionNew[mEBI['index']].x += step * eForce.x;
                        complModelPositionNew[mEBI['index']].y += step * eForce.y;
                        complModelPositionNew[mEBI2['index']].x -= step * eForce.x;
                        complModelPositionNew[mEBI2['index']].y -= step * eForce.y;
                    }
                }
            }
        }
    }

    // Determine correction factor

    let maxDiff = 0.
    let corrFact = 1;

    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {

            if (Math.abs(complModelPositionNew[mEBI['index']].x) > maxDiff) {
                maxDiff = Math.abs(complModelPositionNew[mEBI['index']].x);
            };
            if (Math.abs(complModelPositionNew[mEBI['index']].y) > maxDiff) {
                maxDiff = Math.abs(complModelPositionNew[mEBI['index']].y);
            };
        }
    }

    if (maxDiff > 100) {
        corrFact = 100 / maxDiff;
    }

    // Calculate new positions

    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {

            let position = {
                x: corrFact * complModelPositionNew[mEBI['index']].x + complModelPosition[mEBI['index']].x,
                y: corrFact * complModelPositionNew[mEBI['index']].y + complModelPosition[mEBI['index']].y,
            };
            complModelPosition[mEBI['index']] = position;
        }
    }
};