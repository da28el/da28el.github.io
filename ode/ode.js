let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width; // = window.innerWidth;
let height = canvas.height; // = window.innerHeight;
canvas.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); }


function drawBackground() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
}

drawBackground();

function range(x0, x1, dx = 1, f = null) {
    let r = [];
    for(let x = x0; x < x1; x += dx) {
        r.push(f == null ? x : f(x));
    }
    return r;
}

function plot(f, x = [], y = [], c = "#ff0000") {
    if (x.length != y.length) {
        console.log(x.length + " != " + y.length);
        return;
    } 
    ctx.fillStyle = c;
    for (let i = 0; i < x.length; i++) {
        ctx.fillRect(x[i], height - y[i], 2, 2);
    }
}

drawBackground();
x = range(0, 2*Math.PI, 0.1);
y = range()
plot(x, range(), height/4, "#000000")

function loop() {
    drawBackground();
    requestAnimationFrame(loop);
}

// loop();
