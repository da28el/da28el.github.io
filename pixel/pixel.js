var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var width = canvas.width; // = window.innerWidth;
var height = canvas.height; // = window.innerHeight;
var square_number = document.getElementById('squares');
var color_picker = document.getElementById('picker');
var grid_button = document.getElementById('grid');
var array = [];
var squares = +square_number.value;
var w = width / squares;
var h = height / squares;
var color = color_picker.value;
function init() {
    squares = +square_number.value;
    w = width / squares;
    h = height / squares;
    array = [];
    for (var i = 0; i < squares * squares; i++)
        array.push('#FFFFFF');
    paint();
}
var getIndex = function (x, y) {
    return x + y * squares;
};
function grid() {
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 1;
    for (var i = 0; i < squares; i++) {
        ctx.beginPath();
        ctx.moveTo(i * w, 0);
        ctx.lineTo(i * w, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * h);
        ctx.lineTo(width, i * h);
        ctx.stroke();
    }
}
function draw() {
    for (var i = 0; i < squares; i++) {
        for (var j = 0; j < squares; j++) {
            ctx.fillStyle = array[getIndex(j, i)];
            ctx.fillRect(j * w, i * h, w, h);
        }
    }
}
function paint() {
    // Fill white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    // Draw squares
    draw();
    // Draw grid
    if (grid_button.checked)
        grid();
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
var brush = false;
function startDraw(evt) {
    color = color_picker.value;
    brush = true;
    activate(evt);
}
function stopDraw() { brush = false; }
function activate(evt) {
    if (brush) {
        var pos = getMousePos(canvas, evt);
        array[getIndex(Math.floor(pos.x / w), Math.floor(pos.y / h))] = color;
        paint();
    }
}
init();
