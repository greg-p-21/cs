// Gregory Polmatier
var socket = io();


// Draw on Canvas Starter Code From:
// https://stackoverflow.com/questions/2368784/draw-on-html5-canvas-using-a-mouse
var canvas, ctx, flag = false,
    drawStartX = 0,
    drawCurrentX = 0,
    drawStartY = 0,
    drawCurrentY = 0,
    isSingleDot = false;

var color = "black",
    strokeWidth = 2;

function init() {
    /* canvas stuff */
    canvas = document.getElementById('paintCanvas');
    ctx = canvas.getContext("2d");

    // Not used
    // w = canvas.width;
    // h = canvas.height;

    canvas.addEventListener("mousemove", function (event) {
        findxy('move', event)
    }, false);
    canvas.addEventListener("mousedown", function (event) {
        findxy('down', event)
    }, false);
    canvas.addEventListener("mouseup", function (event) {
        findxy('up', event)
    }, false);
    canvas.addEventListener("mouseout", function (event) {
        findxy('out', event)
    }, false);
    /********************************/

    // get name 
    socket.emit('newName', prompt("Enter Name", "Greg"));


}

function setColor(colorSelectBox) {
    switch (colorSelectBox.id) {
        case "green":
            color = "green";
            break;
        case "blue":
            color = "blue";
            break;
        case "red":
            color = "red";
            break;
        case "yellow":
            color = "yellow";
            break;
        case "orange":
            color = "orange";
            break;
        case "black":
            color = "black";
            break;
        case "white":
            color = "white";
            break;
    }
    if (color == "white") strokeWidth = 14;
    else strokeWidth = 2;

}

function draw() {
    ctx.beginPath();
    ctx.moveTo(drawStartX, drawStartY);
    ctx.lineTo(drawCurrentX, drawCurrentY);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    ctx.closePath();
}

function erase() {
    var m = confirm("Want to clear");
    if (m) {
        ctx.clearRect(0, 0, w, h);
        document.getElementById("canvasimg").style.display = "none";
    }
}

function save() {
    document.getElementById("canvasimg").style.border = "2px solid";
    var dataURL = canvas.toDataURL();
    document.getElementById("canvasimg").src = dataURL;
    document.getElementById("canvasimg").style.display = "inline";
}

function findxy(res, e) {
    if (res == 'down') {
        drawStartX = drawCurrentX;
        drawStartY = drawCurrentY;
        drawCurrentX = e.clientX - canvas.offsetLeft;
        drawCurrentY = e.clientY - canvas.offsetTop;

        flag = true;
        isSingleDot = true;
        if (isSingleDot) {
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.fillRect(drawCurrentX, drawCurrentY, 2, 2);
            ctx.closePath();
            isSingleDot = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            drawStartX = drawCurrentX;
            drawStartY = drawCurrentY;
            drawCurrentX = e.clientX - canvas.offsetLeft;
            drawCurrentY = e.clientY - canvas.offsetTop;
            draw();
        }
    }
}