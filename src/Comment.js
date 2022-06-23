'use strict';

let lastElement;
const defaultOffsetX = 50;
const defaultOffsetY = -50;

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
        let mebi = modelElementsByIndex[lastElement.index];
        if (text != '') {
            if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[lastElement.index].boxX1 === 'undefined'){
                // So that a comment is always placed
                diagramms[diagramInfos.activeDiagram].complModelPosition[lastElement.index].boxX1 = 0.
            }
            if (typeof diagramms[diagramInfos.activeDiagram].complModelPosition[lastElement.index].boxY1 === 'undefined'){
                // So that a comment is always placed
                diagramms[diagramInfos.activeDiagram].complModelPosition[lastElement.index].boxY1 = 0.
            }
            if (mebi.element == 'SOMIX.Code' || mebi.element == 'SOMIX.Data') {
                diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[lastElement.index] =
                {
                    x: diagramms[diagramInfos.activeDiagram].complModelPosition[lastElement.index].x + defaultOffsetX,
                    y: diagramms[diagramInfos.activeDiagram].complModelPosition[lastElement.index].y + defaultOffsetY,
                    text: text
                };
            } else {
                diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[lastElement.index] =
                {
                    // For groupings x and y are not really meaningful in diagrams. 
                    // They make sense only in the force directed graph of all elements where they stand for the black dot.
                    // So place the comment at the upper left corner of the current box around all contained elements of the grouping.
                    x: diagramms[diagramInfos.activeDiagram].complModelPosition[lastElement.index].boxX1 + defaultOffsetX,
                    y: diagramms[diagramInfos.activeDiagram].complModelPosition[lastElement.index].boxY1 + defaultOffsetY,
                    text: text
                };
            }
        }
    } else {
        diagramms[diagramInfos.activeDiagram].generationInfoInternal.commentsByID[lastElement.index].text = text;
    }

}