'use strict';

let lastElement;
const defaultOffsetX = -20;
const defaultOffsetY = 20;

function comment(element) {
    lastElement = element;
    let text;
    if (typeof diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[lastElement.index] === 'undefined') {
        text = '';
    } else {
        text = diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[lastElement.index].text;
    }
    handleCommentRequested(text);
}

function commentAdapted(text) {
    if (typeof diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[lastElement.index] === 'undefined') {
        if (text != '') {
            diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[lastElement.index] =
            {
                x: diagramms[diagramInfos.activeDiagram].complModelPosition[lastElement.index].x + defaultOffsetX,
                y: diagramms[diagramInfos.activeDiagram].complModelPosition[lastElement.index].y + defaultOffsetY,
                text: text
            };
        }
    } else {
        diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[lastElement.index].text = text;
    }

}