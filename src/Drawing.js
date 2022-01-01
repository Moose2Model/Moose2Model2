'use strict';
// For Canvas sometimes needed
let g_width = window.innerWidth - 40;
let g_height = window.innerHeight - 40;

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
                x: complModelPosition[mEBI['index']].x,
                y: complModelPosition[mEBI['index']].y,
            };
            complModelPositionNew[mEBI['index']] = position;
        }
    }

    const avgLen = w2 / Math.sqrt(nElements);
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
        } else { fact = 1 / ( dist * dist ) };
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
                complModelPositionNew[pC['parent']].x += step * pCForce.x;
                complModelPositionNew[pC['parent']].y += step * pCForce.y;
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

    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {

            let position = {
                x: complModelPositionNew[mEBI['index']].x,
                y: complModelPositionNew[mEBI['index']].y,
            };
            complModelPosition[mEBI['index']] = position;
        }
    }
};

function drawCompleteModel(ctx, width, height) {

    for (const pCBP of parentChildByParent) {
        if (typeof pCBP !== 'undefined') {
            for (const pC of pCBP) {
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.moveTo(complModelPosition[pC['parent']].x, complModelPosition[pC['parent']].y);
                ctx.lineTo(complModelPosition[pC['child']].x, complModelPosition[pC['child']].y);
                ctx.stroke();
            }
        }
    };

    for (const cBC of callByCaller) {
        if (typeof cBC !== 'undefined') {
            for (const cC of cBC) {
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
                ctx.moveTo(complModelPosition[cC['caller']].x, complModelPosition[cC['caller']].y);
                ctx.lineTo(complModelPosition[cC['called']].x, complModelPosition[cC['called']].y);
                ctx.stroke();
            }
        }
    };

    for (const aBA of accessByAccessor) {
        if (typeof aBA !== 'undefined') {
            for (const aA of aBA) {
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0, 0, 255, 0.2)';
                ctx.moveTo(complModelPosition[aA['accessor']].x, complModelPosition[aA['accessor']].y);
                ctx.lineTo(complModelPosition[aA['accessed']].x, complModelPosition[aA['accessed']].y);
                ctx.stroke();
            }
        }
    };

    for (const mEBI of modelElementsByIndex) {
        if (typeof mEBI !== 'undefined') {
            let size = 3;
            ctx.beginPath();
            switch (mEBI['element']) {
                case 'SOMIX.Grouping':
                    ctx.fillStyle = 'black';
                    size = 4;
                    break;
                case 'SOMIX.Code':
                    ctx.fillStyle = 'red';
                    size = 2;
                    break;
                case 'SOMIX.Data':
                    ctx.fillStyle = 'blue';
                    size = 2;
                    break;
            }
            ctx.arc(complModelPosition[mEBI['index']].x, complModelPosition[mEBI['index']].y, size, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
};

function draw() {



    var canvas = document.getElementById('pane');


    var raf;
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        // // Coding to improve drawing in case of Retina displays

        // // get current size of the canvas
        // let rect = canvas.getBoundingClientRect();

        // // increase the actual size of our canvas
        // canvas.width = rect.width * devicePixelRatio;
        // canvas.height = rect.height * devicePixelRatio;

        // // ensure all drawing operations are scaled
        // ctx.scale(devicePixelRatio, devicePixelRatio);

        // // scale everything down using CSS
        // canvas.style.width = rect.width + 'px';
        // canvas.style.height = rect.height + 'px';


        // Resize canvas to make it big and
        // coding to improve drawing in case of Retina displays

        let width = window.innerWidth - 40;
        let height = window.innerHeight - 40;
        g_width = width;
        g_height = height;
        var canvas = document.getElementById('pane');
        // increase the actual size of our canvas
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;

        // ensure all drawing operations are scaled
        ctx.scale(devicePixelRatio, devicePixelRatio);

        // scale everything down using CSS
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';



        // ctx.lineWidth = 1;
        // ctx.beginPath();
        // ctx.moveTo(10.5, 5);
        // ctx.lineTo(10.5, 140);
        // ctx.stroke();

        // ctx.font = '20px serif';
        // ctx.fillText(currentIndex, 10, 150);

        // var text = ctx.measureText(currentIndex); // TextMetrics object
        // var width_of_text = text.width; // 16;

        // ctx.fillText('With of number: ' + width_of_text, 10, 100);
        // drawBalls(ctx, width / 2, height / 2);

        // positionBoxed(width, height);
        forceDirecting(width, height);
        drawCompleteModel(ctx, width, height);
        raf = window.requestAnimationFrame(draw);
    }
}
// canvas.addEventListener('mouseover', function (e) {
//     raf = window.requestAnimationFrame(draw);
// });

// canvas.addEventListener('mouseout', function (e) {
//     window.cancelAnimationFrame(raf);
// });
