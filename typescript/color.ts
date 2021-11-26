const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;// = window.innerWidth;
const height = canvas.height;// = window.innerHeight;

let paint = false;
let size:number = 4;
let slider = document.getElementById("range") as HTMLInputElement;
let sizeIndicator = document.getElementById("sizeValue");
let color = "#000000";
let colorPicker = document.getElementById("picker") as HTMLInputElement;

ctx.fillStyle = `rgba(240,240,210, 0.25)`;
ctx.fillRect(0,0,width,height);

function startDraw(){
    paint = true;
}

function stopDraw(){
    paint = false;
}

function updateColor(){
    color = colorPicker.value;
}

function updateSize(){
    size = +slider.value;
    sizeIndicator.innerHTML = "#" + size;
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function draw(evt) {
    updateSize();
    updateColor();
    if(paint){
        var pos = getMousePos(canvas, evt);
        ctx.fillStyle = color;
        ctx.fillRect(pos.x, pos.y, size, size);
    }
}

function fill(){
    updateColor();
    ctx.fillStyle = color;
    ctx.fillRect(0,0,width,height);
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