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

    // Draw background
    if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayNewElementBox == true) {
        ctx.lineWidth = cameraToCanvasScale(1);
        ctx.setLineDash([cameraToCanvasScale(8), cameraToCanvasScale(2)]);
        ctx.strokeStyle = 'gray'
        ctx.strokeRect(cameraToCanvasX(newElBoxX), cameraToCanvasY(newElBoxY), cameraToCanvasScale(newElBoxWidth), cameraToCanvasScale(newElBoxHeight));
        ctx.setLineDash([]);

        ctx.fillStyle = 'gray';

        // var textMeasurement = ctx.measureText('foo'); // TextMetrics object
        // textMeasurement.width; // 16;

        let scaledFontSize = cameraToCanvasScale(12);
        ctx.textAlign = 'right';
        ctx.font = scaledFontSize + 'px Arial san-serif';
        ctx.fillText('New elements are placed here', cameraToCanvasX(newElBoxX + newElBoxWidth), cameraToCanvasY(newElBoxY + newElBoxHeight + 12));
        ctx.textAlign = 'start';

    }

    // Draw elements

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
                            let startX = diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].x;
                            let startY = diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].y;
                            let endX = diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].x;
                            let endY = diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].y;

                            ctx.lineWidth = cameraToCanvasScale(1);
                            ctx.beginPath();
                            ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
                            ctx.moveTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['caller']].y));
                            ctx.lineTo(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].x), cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[cC['called']].y));
                            ctx.stroke();

                            let deltaX = endX - startX;
                            let deltaY = endY - startY;
                            let length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                            if (length > 0.1) { // TODO how to handle very short edges?
                                let unitX = deltaX / length;
                                let unitY = deltaY / length;

                                let unitA1X = 0.866*unitX-0.5*unitY;
                                let unitA1Y = 0.5*unitX+0.866*unitY;
                                let unitA2X = 0.866*unitX+0.5*unitY;
                                let unitA2Y = -0.5*unitX+0.866*unitY;

                                let startArrow1X = endX - 7 * unitA1X;
                                let startArrow1Y = endY - 7 * unitA1Y;
                                let startArrow2X = endX - 7 * unitA2X;
                                let startArrow2Y = endY - 7 * unitA2Y;
                                ctx.beginPath();
                                ctx.moveTo(cameraToCanvasX(endX), cameraToCanvasY(endY));
                                ctx.lineTo(cameraToCanvasX(startArrow1X), cameraToCanvasY(startArrow1Y));
                                ctx.moveTo(cameraToCanvasX(endX), cameraToCanvasY(endY));
                                ctx.lineTo(cameraToCanvasX(startArrow2X), cameraToCanvasY(startArrow2Y));
                                ctx.stroke();
                            

                            }

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
                if (diagramms[diagramInfos.displayedDiagram].diagramType == bulletPointDiagramType) {
                    let size = 3;
                    ctx.beginPath();
                    switch (mEBI['element']) {
                        case 'SOMIX.Grouping':
                            if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames) {
                                ctx.fillStyle = 'gray'; // Texts cannot be read when the ball is black
                            } else {
                                ctx.fillStyle = 'black';
                            }
                            size = cameraToCanvasScale(4);
                            break;
                        case 'SOMIX.Code':
                            if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames) {
                                ctx.fillStyle = 'orange'; // Makes reading easier
                            } else {
                                ctx.fillStyle = 'red';
                            }
                            size = cameraToCanvasScale(2);
                            break;
                        case 'SOMIX.Data':
                            if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames) {
                                ctx.fillStyle = 'lightBlue'; // Makes reading easier
                            } else {
                                ctx.fillStyle = 'blue';
                            }
                            size = cameraToCanvasScale(2);
                            break;
                    }
                    ctx.arc(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x),
                        cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y), size, 0, 2 * Math.PI);
                    ctx.fill();
                    if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames == true) {
                        const fontsize = 3;
                        ctx.fillStyle = 'black';
                        let scaledFontSize = cameraToCanvasScale(fontsize);
                        ctx.textAlign = 'center';
                        ctx.font = scaledFontSize + 'px Arial san-serif';
                        ctx.fillText(mEBI.name, cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x),
                            cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y + fontsize * .3));
                        ctx.textAlign = 'standard';
                    }
                }
                else if (diagramms[diagramInfos.displayedDiagram].diagramType == circuitDiagramForSoftwareDiagramType) {
                    let size = 3;
                    ctx.beginPath();
                    switch (mEBI['element']) {
                        case 'SOMIX.Grouping':
                            ctx.fillStyle = 'gray';
                            size = cameraToCanvasScale(4);
                            break;
                        case 'SOMIX.Code':
                            ctx.fillStyle = 'orange';
                            size = cameraToCanvasScale(2);
                            break;
                        case 'SOMIX.Data':
                            ctx.fillStyle = 'lightBlue';
                            size = cameraToCanvasScale(2);
                            break;
                    }
                    ctx.arc(cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x),
                        cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y), size, 0, 2 * Math.PI);
                    ctx.fill();
                    if (diagramms[diagramInfos.displayedDiagram].diagramSettings.displayElementNames == true) {
                        const fontsize = 3;
                        ctx.fillStyle = 'black';
                        let scaledFontSize = cameraToCanvasScale(fontsize);
                        ctx.textAlign = 'center';
                        ctx.font = scaledFontSize + 'px Arial san-serif';
                        ctx.fillText(mEBI.name, cameraToCanvasX(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].x),
                            cameraToCanvasY(diagramms[diagramInfos.displayedDiagram].complModelPosition[mEBI['index']].y + fontsize * .3));
                        ctx.textAlign = 'standard';
                    }
                }
                else { window.alert('Internal error. Unknown type in drawing.') }
            }
        }
    }

    //     // Draw further informations
    // ctx.moveTo(g_width - 20, g_height - 10);
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial san-serif';
    ctx.fillText(Math.round(100 * diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor) + '%', g_width - 40, g_height - 10);

};



function drawAlways() {
    draw(true)
}

function drawWhenForceDirectRequires() {
    draw(false)
}

function draw(always = true) {

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
});

