'use strict';

canvas.addEventListener('wheel', zoom);

function zoom(event) {
    if (typeof activeDiagram !== 'undefined') {
        event.preventDefault();

        const sign = event.deltaY * -0.01;

        let test = Math.pow(2, 1 / 4) * Math.pow(2, 1 / 4) * Math.pow(2, 1 / 4) * Math.pow(2, 1 / 4);
        if (sign > 0) {
            diagramms[activeDiagram].camerSettings.zoomfactor *= Math.pow(2, 1 / 4)
        }
        else {
            diagramms[activeDiagram].camerSettings.zoomfactor /= Math.pow(2, 1 / 4)
        }

        // Restrict scale
        diagramms[activeDiagram].camerSettings.zoomfactor = Math.min(Math.max(.0125, diagramms[activeDiagram].camerSettings.zoomfactor), 20);

        // clear the canvas and redraw all shapes
        drawCompleteModel(ctx, g_width, g_height);
    }

}