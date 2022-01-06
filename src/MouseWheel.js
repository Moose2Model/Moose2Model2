'use strict';

canvas.addEventListener('wheel', zoom);

function zoom(event) {
    if (typeof diagramInfos !== 'undefined') {
        event.preventDefault();

        const sign = event.deltaY * -0.01;
        const originalZoomfactor = diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor;
        let newZoomfactor = originalZoomfactor;

        let test = Math.pow(2, 1 / 4) * Math.pow(2, 1 / 4) * Math.pow(2, 1 / 4) * Math.pow(2, 1 / 4);
        if (sign > 0) {
            newZoomfactor *= Math.pow(2, 1 / 4)
        }
        else {
            newZoomfactor /= Math.pow(2, 1 / 4)
        }

        // Restrict scale
        if (newZoomfactor < .0125) {
            newZoomfactor = originalZoomfactor;
        } else if (newZoomfactor > 21) {
            newZoomfactor = originalZoomfactor;
        }
        diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor = newZoomfactor;


        // clear the canvas and redraw all shapes
        drawCompleteModel(ctx, g_width, g_height);
    }

}