'use strict';
// For Canvas sometimes needed
let g_width = window.innerWidth - 40;
let g_height = window.innerHeight - 40;

function supportRetina() {
    let width = window.innerWidth - 40;
    let height = window.innerHeight - 40;
    g_width = width;
    g_height = height;
    // var canvas = document.getElementById('pane');
    // increase the actual size of our canvas
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;

    // ensure all drawing operations are scaled
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // scale everything down using CSS
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
};

function cameraToCanvasX(x) {

    return diagramms[activeDiagram].camerSettings.zoomfactor * (x + diagramms[activeDiagram].camerSettings.move.x) + g_width / 2;

}

function cameraToPaneX(canvasX) {

    return - diagramms[activeDiagram].camerSettings.move.x + (canvasX - g_width / 2) / diagramms[activeDiagram].camerSettings.zoomfactor;

}

function cameraToCanvasY(y) {

    return diagramms[activeDiagram].camerSettings.zoomfactor * (y + diagramms[activeDiagram].camerSettings.move.y) + g_height / 2;

}

function cameraToPaneY(canvasY) {

    return - diagramms[activeDiagram].camerSettings.move.y + (canvasY - g_height / 2) / diagramms[activeDiagram].camerSettings.zoomfactor;

}

function cameraToCanvasScale(size) {
    return diagramms[activeDiagram].camerSettings.zoomfactor * size;
}

function cameraToPaneScale(size) {
    return size / diagramms[activeDiagram].camerSettings.zoomfactor;
}

function drawCompleteModel(ctx, width, height) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const pCBP of parentChildByParent) {
        if (typeof pCBP !== 'undefined') {
            for (const pC of pCBP) {
                ctx.lineWidth = cameraToCanvasScale(1);
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.moveTo(cameraToCanvasX(diagramms[activeDiagram].complModelPosition[pC['parent']].x), cameraToCanvasY(diagramms[activeDiagram].complModelPosition[pC['parent']].y));
                ctx.lineTo(cameraToCanvasX(diagramms[activeDiagram].complModelPosition[pC['child']].x), cameraToCanvasY(diagramms[activeDiagram].complModelPosition[pC['child']].y));
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
                ctx.moveTo(cameraToCanvasX(diagramms[activeDiagram].complModelPosition[cC['caller']].x), cameraToCanvasY(diagramms[activeDiagram].complModelPosition[cC['caller']].y));
                ctx.lineTo(cameraToCanvasX(diagramms[activeDiagram].complModelPosition[cC['called']].x), cameraToCanvasY(diagramms[activeDiagram].complModelPosition[cC['called']].y));
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
                ctx.moveTo(cameraToCanvasX(diagramms[activeDiagram].complModelPosition[aA['accessor']].x), cameraToCanvasY(diagramms[activeDiagram].complModelPosition[aA['accessor']].y));
                ctx.lineTo(cameraToCanvasX(diagramms[activeDiagram].complModelPosition[aA['accessed']].x), cameraToCanvasY(diagramms[activeDiagram].complModelPosition[aA['accessed']].y));
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
            ctx.arc(cameraToCanvasX(diagramms[activeDiagram].complModelPosition[mEBI['index']].x),
                cameraToCanvasY(diagramms[activeDiagram].complModelPosition[mEBI['index']].y), size, 0, 2 * Math.PI);
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
    if (forceFeedback) {
        let redraw = forceDirecting(width, height);
    }
    if (redraw || always) {
        drawCompleteModel(ctx, width, height);
    }
    if (forceFeedback) {
        requestAnimationFrame = window.requestAnimationFrame(drawWhenForceDirectRequires);
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
