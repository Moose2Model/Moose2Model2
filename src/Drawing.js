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

    if (mouseover) {

        // var canvas = document.getElementById('pane');


        // var raf;
        // if (canvas.getContext) {
        // var ctx = canvas.getContext('2d');

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
        // var canvas = document.getElementById('pane');
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
        if (forceFeedback) {
            forceDirecting(width, height);
        }
        drawCompleteModel(ctx, width, height);
        if (forceFeedback) {
            requestAnimationFrame = window.requestAnimationFrame(draw);
        }
        // }
    }
}
canvas.addEventListener('mouseover', function (e) {
    requestAnimationFrame = window.requestAnimationFrame(draw);
    mouseover = true;
});

// canvas.addEventListener('mouseout', function (e) {
//     window.cancelAnimationFrame(requestAnimationFrame);
//     mouseover = false;
// });
