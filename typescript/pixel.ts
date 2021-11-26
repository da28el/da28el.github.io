const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;// = window.innerWidth;
const height = canvas.height;// = window.innerHeight;

const square_number = document.getElementById('squares') as HTMLInputElement;
const color_picker = document.getElementById('picker') as HTMLInputElement;
const grid_button = document.getElementById('grid') as HTMLInputElement;

let array = [];
let squares:number = +square_number.value;
let w = width/squares;
let h = height/squares;
let color = color_picker.value;

function init(){
    squares = +square_number.value;
    w = width/squares;
    h = height/squares;

    array = [];

    for(let i = 0; i < squares*squares; i++)
        array.push('#FFFFFF');

    paint();
}

const getIndex = (x:number, y:number) => {
    return x+y*squares;
}

function grid(){
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 1;
    for(let i = 0; i < squares; i++){
        ctx.beginPath();
        ctx.moveTo(i*w,0);
        ctx.lineTo(i*w,height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i*h);
        ctx.lineTo(width, i*h);
        ctx.stroke();
    }
}

function draw(){
    for(let i = 0; i < squares; i++){
        for(let j = 0; j < squares; j++){
            ctx.fillStyle = array[getIndex(j, i)];
            ctx.fillRect(j*w, i*h, w, h);
        }
    }
}

function paint(){
    // Fill white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0,0,width,height);
    // Draw squares
    draw();
    // Draw grid
    if(grid_button.checked)
        grid();
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

let brush = false;
function startDraw(evt){
    color = color_picker.value;
    brush = true;
    activate(evt)
}
function stopDraw(){brush = false}
function activate(evt){
    if(brush){
        const pos = getMousePos(canvas, evt);
        array[getIndex(Math.floor(pos.x/w), Math.floor(pos.y/h))] = color;
        paint();
    }
}

init();