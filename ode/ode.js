let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width; // = window.innerWidth;
let height = canvas.height; // = window.innerHeight;
canvas.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); }

// config

// globals
let zoom = height / 8;
let zoomX = 45;
let offset = [width * 0.05, height * 0.95]; // [x, y]
let f = (y, t) => { return y };
let g = (x) => { return Math.exp(x) };
let h = 1;

let drawplots = [0, 0, 0];

function eulerMethod(y, t, dt) {
    return y + f(y, t) * dt;
}

function midpointMethod(y, t, dt) {
    return y + dt*f(y + (dt/2)*f(y, t), t + dt/2);
}

function rk4(y, t, dt) {
    let k1 = f(y, t);
    let k2 = f(y + k1*dt/2, t + dt/2);
    let k3 = f(y + k2*dt/2, t + dt/2);
    let k4 = f(y + k3*dt, t + dt);
    return y + dt/6 * (k1 + 2*k2 + 2*k3 + k4);
}

function plot() {
    clear();
    plotNumeric(g);
    if(drawplots[0])plotDiscrete(eulerMethod);
    if(drawplots[1])plotDiscrete(midpointMethod, "#0000ff");
    if(drawplots[2])plotDiscrete(rk4, "#009900");
}

function plotDiscrete(f, c="#ff0000", t0 = 0, t1 = 11, y0 = 1, dt=h) {
    let y = y0;
    let points = [{xn: t0, tn: y}]
    for (let t = t0 + dt; t < t1; t += dt) {
        y = f(y, t, dt);
        points.push({
            xn: t,
            yn: y
        });
    }
    ctx.fillStyle = c;
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.moveTo(offset[0], -zoom + offset[1]);
    for (let point of points) {
        ctx.fillRect(point.xn * zoomX + offset[0]-2, - point.yn * zoom + offset[1]-2, 4, 4);
        ctx.lineTo(point.xn * zoomX + offset[0], - point.yn * zoom + offset[1]);
    }
    ctx.stroke();
}

function plotNumeric(f) {
    let t0 = -1
    let t1 = 11
    let y = 1;
    let dt = 2 / zoomX;
    let numeric = [];
    for (let t = t0 + dt; t < t1; t += dt) {
        y = f(t);
        numeric.push({
            xn: t, 
            yn: y
        })
    }
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(numeric[0].xn * zoomX + offset[0], -numeric[0].yn * zoom + offset[1]);
    for (let point of numeric) {
        ctx.lineTo(point.xn * zoomX + offset[0], - point.yn * zoom + offset[1]);
    }
    ctx.stroke();
}

function clear() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#005500";
    const delta = zoom > 300 ? 0.1 : 1;
    for (let y = Math.round(-offset[1] / zoom); y < (height - offset[1]) / zoom; y += delta) {
        if (zoom < 15 && y % 5 != 0) continue;
        if (zoom < 5 && y % 10 != 0) continue;
        if (zoom < 2 && y % 50 != 0) continue;
        if (zoom < 1 && y % 100 != 0) continue;
        if (zoom < 0.5 && y % 500 != 0) continue;
        if (zoom < 0.1 && y % 1000 != 0) continue;
        ctx.fillRect(0, y * zoom + offset[1], 20, 1);
        ctx.fillText(-y.toFixed(1), 10, y * zoom + offset[1] - 5);
    }
    for (let x = Math.floor(-offset[0] / zoomX); x < (width - offset[0]) / zoomX; x += 1) {
        ctx.fillRect(x * zoomX + offset[0], 0, 1, 20);
        ctx.fillText(+x.toFixed(1), x * zoomX + offset[0] + 5, 10)
    }
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(0, offset[1], width, 2);
    ctx.fillStyle = "#0000ff";
    ctx.fillRect(offset[0], 0, 2, height);

}

plot();

const Mouse = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    click: false,
    mouseDown: (e) => {
        // Mouse.dx = Mouse.x;
        // Mouse.dy = Mouse.y;
        Mouse.click = true;
    },
    mouseUp: (e) => {
        Mouse.dx = 0;
        Mouse.dy = 0;
        Mouse.click = false;
    },
    mouseMove: (e) => {
        var rect = canvas.getBoundingClientRect();
        const newX = e.clientX - rect.left;
        const newY = e.clientY - rect.top;

        Mouse.dx = newX - Mouse.x;
        Mouse.dy = newY - Mouse.y;

        Mouse.x = newX;
        Mouse.y = newY;
        if (Mouse.click) {
            offset[0] += Mouse.dx;
            offset[1] += Mouse.dy;
            plot();
        }
    },
    mouseOOB: () => {
        Mouse.mouseUp(null);
    },
    zoom: (event) => {
        event.preventDefault();
        zoom -= 10 * zoom / event.deltaY;
        plot();
    }
};