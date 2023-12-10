let Key = {
    _pressed: {},
    
    Q: 81,
    E: 69,
    A: 65,
    D: 68,
    Z: 90,
    C: 67,

    isDown: function(keyCode){
        return this._pressed[keyCode];
    },
    onKeydown: function(event) {
        this._pressed[event.keyCode] = true;
    },  
    onKeyup: function(event) {
        delete this._pressed[event.keyCode];
    },
    reset: function(){
        this._pressed = {};
    }
};

window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

let sum = (array, index) => {
    let sum = 0;
    for(let i = 0; i < array.length && i < index; i++)
        sum += array[i];
    return sum;
} 

function fn(x, y, l, a, n)
{
    return [l[n]*Math.cos(sum(a, n+1)) + x[n], 
            l[n]*Math.sin(sum(a, n+1)) + y[n]];
}

function dfnda(x, y, l, a, n)
{
    return [ l[n]*Math.sin(sum(a, n+1)), 
            -l[n]*Math.cos(sum(a, n+1))];
}

function update(x, y, l, a)
{
    for(let i = 0; i < 3; i++)
    {
        p = fn(x, y, l, a, i);
        x[i+1] = p[0];
        y[i+1] = p[1];
    }
    return [x, y];
}

function draw(x, y)
{
    ctx.strokeStyle = "rgb(255,255,255)";
    ctx.beginPath();
    ctx.arc(x[0], y[0], 5, 0, 2*Math.PI);
    ctx.stroke();
    for(let i = 0; i < 3; i++)
    {
        ctx.beginPath();
        ctx.moveTo(x[i], y[i]);
        ctx.lineTo(x[i+1], y[i+1]);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x[i+1], y[i+1], 5, 0, 2*Math.PI);
        ctx.stroke();
    }
}

function input(a)
{
    const step = 0.01*Math.PI;
    if(Key.isDown(Key.Q))
        a[0] -= step;
    if(Key.isDown(Key.E))
        a[0] += step;
    if(Key.isDown(Key.A))
        a[1] -= step;
    if(Key.isDown(Key.D))
        a[1] += step;
    if(Key.isDown(Key.Z))
        a[2] -= step;
    if(Key.isDown(Key.C))
        a[2] += step;
    return a;
}

let mousePressed = false;
let xm = 0;
let ym = 0;

function mouseDown()
{
    mousePressed = true;
}

function mouseMove(event)
{
    let rect = canvas.getBoundingClientRect();
    xm = event.clientX - rect.left;
    ym = event.clientY - rect.top;
}

function mouseUp()
{
    mousePressed = false;
}

function ik(x, y, l, a, xt, yt)
{
    // cost
    const C = (x3, y3, xt, yt) => {
        return (x3-xt)*(x3-xt) + (y3-yt)*(y3-yt);
    };
    // partial derivative
    const dCda = (x, y, l, a, xt, yt, n) => {
        return 2*(x[3]-xt)*dfnda(x, y, l, a, n)[0] + 2*(y[3]-yt)*dfnda(x, y, l, a, n)[1];
    };
    // gradient descent
    const gd = (x, y, l, a, xt, yt) => {
        for(let i = 0; i < 3; i++)
            a[i] += 0.00001*dCda(x, y, l, a, xt, yt, i);
        return a;
    };
    return gd(x, y, l, a, xt, yt);
}

let x = [240, 0, 0, 0];
let y = [300, 0, 0, 0];
let l = [90, 60, 60];
let a = [-Math.PI/4, -Math.PI/3, -Math.PI/3];

function loop(){
    
    // input
    a = input(a);
    if(mousePressed)
        a = ik(x, y, l, a, xm, ym);

    // background
    ctx.fillStyle = "rgb(64,64,128)";
    ctx.fillRect(0,0,width,height);

    // floor
    ctx.strokeStyle = "rgb(255,255,255)";
    ctx.beginPath();
    ctx.moveTo(x[0]-50, y[0]);
    ctx.lineTo(x[0]+50, y[0]);
    ctx.stroke();

    // range
    ctx.strokeStyle = "rgb(255,0,0)";
    ctx.beginPath();
    ctx.arc(x[0], y[0], sum(l, 3), 0, 2*Math.PI);
    ctx.stroke();

    // update
    p = update(x, y, l, a);
    x = p[0];
    y = p[1];

    // draw
    draw(x, y);

    requestAnimationFrame(loop);
}

loop();
