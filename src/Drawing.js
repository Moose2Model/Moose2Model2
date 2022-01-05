'use strict';
// For Canvas sometimes needed

// function resizeCanvas() {
//     let g_width = window.innerWidth - 40;
//     let g_height = window.innerHeight - 100;
// }

function supportRetina() {
    resizeCanvas();
    // var canvas = document.getElementById('pane');
    // increase the actual size of our canvas
    canvas.width = g_width * devicePixelRatio;
    canvas.height = g_height * devicePixelRatio;

    // ensure all drawing operations are scaled
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // scale everything down using CSS
    canvas.style.width = g_width + 'px';
    canvas.style.height = g_height + 'px';
};

function cameraToCanvasX(x) {

    return diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor * (x + diagramms[diagramInfos.displayedDiagram].cameraSettings.move.x) + g_width / 2;

}

function cameraToPaneX(canvasX) {

    return - diagramms[diagramInfos.displayedDiagram].cameraSettings.move.x + (canvasX - g_width / 2) / diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor;

}

function cameraToCanvasY(y) {

    return diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor * (y + diagramms[diagramInfos.displayedDiagram].cameraSettings.move.y) + g_height / 2;

}

function cameraToPaneY(canvasY) {

    return - diagramms[diagramInfos.displayedDiagram].cameraSettings.move.y + (canvasY - g_height / 2) / diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor;

}

function cameraToCanvasScale(size) {
    return diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor * size;
}

function cameraToPaneScale(size) {
    return size / diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor;
}

function drawCompleteModel(ctx, width, height) {
    if (typeof diagramms[diagramInfos.displayedDiagram] === 'undefined') {
        // Do not draw when no diagram exists
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (diagramms[diagramInfos.displayedDiagram].complModelPosition.length == 0) {
        ctx.font = '15px san-serif';
        ctx.fillStyle = 'black'
        ctx.fillText('This diagram is currently empty: ' + diagramInfos.displayedDiagram, 10, 50);
        return;
    }


    for (const cmp of diagramms[diagramInfos.displayedDiagram].complModelPosition) {
        if (typeof cmp !== 'undefined') {
            // Draw parent child relations
            let tempArray = parentChildByParent[cmp.index];
            if (typeof tempArray !== 'undefined') {
                for (const pC of tempArray) {
                    if (typeof pC !== 'undefined') {
                        if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['child']] !== 'undefined') {
                            ctx.lineWidth = cameraToCanvasScale(1);
                            ctx.beginPath();
                            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                            ctx.moveTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['parent']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['parent']].y));
                            ctx.lineTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['child']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['child']].y));
                            ctx.stroke();
                        }
                    }
                }
            }

            // Draw calls

            tempArray = callByCaller[cmp.index];
            if (typeof tempArray !== 'undefined') {
                for (const cC of tempArray) {
                    if (typeof cC !== 'undefined') {
                        if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']] !== 'undefined') {
                            ctx.lineWidth = cameraToCanvasScale(1);
                            ctx.beginPath();
                            ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
                            ctx.moveTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].y));
                            ctx.lineTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].y));
                            ctx.stroke();
                        }
                    }
                }
            }

            // Draw accesses

            tempArray = accessByAccessor[cmp.index];
            if (typeof tempArray !== 'undefined') {
                for (const aA of tempArray) {
                    if (typeof aA !== 'undefined') {
                        if (typeof diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']] !== 'undefined') {
                            ctx.lineWidth = cameraToCanvasScale(1);
                            ctx.beginPath();
                            ctx.strokeStyle = 'rgba(0, 0, 255, 0.2)';
                            ctx.moveTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessor']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessor']].y));
                            ctx.lineTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']].y));
                            ctx.stroke();
                        }
                    }
                }
            }

            // Draw elements

            // tempArray = modelElementsByIndex[cmp.index];
            // if (typeof tempArray !== 'undefined') {
            let mEBI = modelElementsByIndex[cmp.index];

            if (typeof mEBI !== 'undefined') {
                let size = 3;
                ctx.beginPath();
                switch (mEBI['element']) {
                    case 'SOMIX.Grouping':
                        ctx.fillStyle = 'black';
                        size = cameraToCanvasScale(4);
                        break;
                    case 'SOMIX.Code':
                        ctx.fillStyle = 'red';
                        size = cameraToCanvasScale(2);
                        break;
                    case 'SOMIX.Data':
                        ctx.fillStyle = 'blue';
                        size = cameraToCanvasScale(2);
                        break;
                }
                ctx.arc(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x),
                    cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y), size, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }

    // for (const mEBI of modelElementsByIndex) {
    //     if (typeof mEBI !== 'undefined') {
    //         let size = 3;
    //         ctx.beginPath();
    //         switch (mEBI['element']) {
    //             case 'SOMIX.Grouping':
    //                 ctx.fillStyle = 'black';
    //                 size = cameraToCanvasScale(4);
    //                 break;
    //             case 'SOMIX.Code':
    //                 ctx.fillStyle = 'red';
    //                 size = cameraToCanvasScale(2);
    //                 break;
    //             case 'SOMIX.Data':
    //                 ctx.fillStyle = 'blue';
    //                 size = cameraToCanvasScale(2);
    //                 break;
    //         }
    //         ctx.arc(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x),
    //             cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y), size, 0, 2 * Math.PI);
    //         ctx.fill();
    //     }
    // }
};

function drawCompleteModelOld(ctx, width, height) {
    if (typeof diagramms[diagramInfos.displayedDiagram] === 'undefined') {
        // Do not draw when no diagram exists
        return;
    }
    if (diagramms[diagramInfos.displayedDiagram].type != completeDiagramType) {
        ctx.font = '15px san-serif';
        ctx.fillStyle = 'red'
        ctx.fillText('The type of this diagram is not yet supported: ' + diagramInfos.displayedDiagram, 10, 50);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const pCBP of parentChildByParent) {
        if (typeof pCBP !== 'undefined') {
            for (const pC of pCBP) {
                ctx.lineWidth = cameraToCanvasScale(1);
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.moveTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['parent']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['parent']].y));
                ctx.lineTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['child']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[pC['child']].y));
                ctx.stroke();
            }
        }
    };

    for (const cBC of callByCaller) {
        if (typeof cBC !== 'undefined') {
            for (const cC of cBC) {
                ctx.lineWidth = cameraToCanvasScale(1);
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
                ctx.moveTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].y));
                ctx.lineTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].y));
                ctx.stroke();
            }
        }
    };

    for (const aBA of accessByAccessor) {
        if (typeof aBA !== 'undefined') {
            for (const aA of aBA) {
                ctx.lineWidth = cameraToCanvasScale(1);
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0, 0, 255, 0.2)';
                ctx.moveTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessor']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessor']].y));
                ctx.lineTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[aA['accessed']].y));
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
                    size = cameraToCanvasScale(4);
                    break;
                case 'SOMIX.Code':
                    ctx.fillStyle = 'red';
                    size = cameraToCanvasScale(2);
                    break;
                case 'SOMIX.Data':
                    ctx.fillStyle = 'blue';
                    size = cameraToCanvasScale(2);
                    break;
            }
            ctx.arc(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x),
                cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y), size, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
};

function drawAlways() {
    draw(true)
}

function drawWhenForceDirectRequires() {
    draw(false)
}

function draw(always = true) {

    // if (mouseover) {

    let width = window.innerWidth - 40;
    let height = window.innerHeight - 40;
    g_width = width;
    g_height = height;

    supportRetina();
    let redraw = true;
    if (typeof diagramms[diagramInfos.displayedDiagram] !== 'undefined') {
        if (diagramms[diagramInfos.displayedDiagram].forceFeedback) {
            let redraw = forceDirecting(width, height);
        }
    }
    if (redraw || always) {
        drawCompleteModel(ctx, width, height);
    }
    if (typeof diagramms[diagramInfos.displayedDiagram] !== 'undefined') {
        if (diagramms[diagramInfos.displayedDiagram].forceFeedback) {
            requestAnimationFrame = window.requestAnimationFrame(drawWhenForceDirectRequires);
        }
    }
    // }
}
canvas.addEventListener('mouseover', function (e) {
    requestAnimationFrame = window.requestAnimationFrame(drawWhenForceDirectRequires);
    mouseover = true;
});

// canvas.addEventListener('mouseout', function (e) {
//     window.cancelAnimationFrame(requestAnimationFrame);
//     mouseover = false;
// });
