'use strict';

canvas.addEventListener('wheel', zoom);

function zoom(event) {
    if (typeof diagramInfos !== 'undefined') {
        if (!showExplorer) {
            event.preventDefault();

            const sign = event.deltaY * -0.01;
            zoomDisplayedDiagram(sign);
            //             const originalZoomfactor = diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor;
            //             let newZoomfactor = originalZoomfactor;

            //             //let test = Math.pow(2, 1 / 4) * Math.pow(2, 1 / 4) * Math.pow(2, 1 / 4) * Math.pow(2, 1 / 4);
            //             if (sign > 0) {
            //                 newZoomfactor *= Math.pow(2, 1 / 4)
            //             }
            //             else {
            //                 newZoomfactor /= Math.pow(2, 1 / 4)
            //             }

            //             // Remove restriction of zoom factor. This causes problems together with zoom to fit.
            // /*             // Restrict scale
            //             if (newZoomfactor < .001) {
            //                 newZoomfactor = originalZoomfactor;
            //             } else if (newZoomfactor > 21) {
            //                 newZoomfactor = originalZoomfactor;
            //             } */
            //             diagramms[diagramInfos.displayedDiagram].cameraSettings.zoomfactor = newZoomfactor;


            // clear the canvas and redraw all shapes
            drawCompleteModel(ctx, g_width, g_height);
        }
        else {
            if (showModelExplorer) {
                event.preventDefault();
                const sign = event.deltaY * -0.01;
                if (sign > 0) {
                    if (startExplorerLine >= 0) {
                        startExplorerLine -= scrollExplorerLine;
                        if (startExplorerLine < 0) {
                            startExplorerLine = 0;
                        }
                    }
                }
                else {
                    startExplorerLine += scrollExplorerLine;
                    // Do not scroll farther than the end:
                    if (startExplorerLine > endExplorerLine) {
                        // Show at least 5 lines at the end
                        startExplorerLine = endExplorerLine - 5;
                        if (startExplorerLine < 0) {
                            startExplorerLine = 0;
                        }
                    }

                }
                drawModelExplorer()
            }
            else if (showM2mExplorer) {
                event.preventDefault();
                const sign = event.deltaY * -0.01;
                if (sign > 0) {
                    if (startM2mExplorerLine >= 0) {
                        startM2mExplorerLine -= scrollM2mExplorerLine;
                        if (startM2mExplorerLine < 0) {
                            startM2mExplorerLine = 0;
                        }
                    }
                }
                else {
                    startM2mExplorerLine += scrollM2mExplorerLine;
                    // Do not scroll farther than the end:
                    if (startM2mExplorerLine > endM2mExplorerLine) {
                        // Show at least 5 lines at the end
                        startM2mExplorerLine = endM2mExplorerLine - 5;
                        if (startM2mExplorerLine < 0) {
                            startM2mExplorerLine = 0;
                        }
                    }

                }
                drawM2mExplorer()

            }
        }
    }

}