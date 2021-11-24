var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var width = canvas.width; // = window.innerWidth;
var height = canvas.height; // = window.innerHeight;
var paint = false;
var size = 4;
var slider = document.getElementById("range");
var sizeIndicator = document.getElementById("sizeValue");
var color = "#000000";
var colorPicker = document.getElementById("picker");
ctx.fillStyle = "rgba(240,240,210, 0.25)";
ctx.fillRect(0, 0, width, height);
function startDraw() {
    paint = true;
}
function stopDraw() {
    paint = false;
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
function draw(evt) {
    size = +slider.value;
    sizeIndicator.innerHTML = "#" + size;
    color = colorPicker.value;
    if (paint) {
        var pos = getMousePos(canvas, evt);
        ctx.fillStyle = color;
        ctx.fillRect(pos.x, pos.y, size, size);
    }
}
/*

function loop(){
    
    theta += 0.01;
    ctx.fillStyle = `rgba(240,240,210, 0.25)`;
    ctx.fillRect(0,0,width,height);

    requestAnimationFrame(loop);
}

loop();

*/ 
