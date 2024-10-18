let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width; // = window.innerWidth;
let height = canvas.height; // = window.innerHeight;
canvas.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); }

function clear() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#005500";
    const delta = zoom > 300 ? 0.1 : 1;
    for (let y = Math.round(-offset[1] / zoom); y < (height - offset[1]) / zoom; y += delta) {
        if (zoom < 15 && y % 5 != 0) continue;
        ctx.fillRect(0, y * zoom + offset[1], 20, 1);
        ctx.fillText(-y.toFixed(1), 10, y * zoom + offset[1] - 5);
    }
    for (let x = Math.floor(-offset[0] / zoom); x < (width - offset[0]) / zoom; x += delta) {
        if (zoom < 15 && x % 5 != 0) continue;
        ctx.fillRect(x * zoom + offset[0], 0, 1, 20);
        ctx.fillText(+x.toFixed(1), x * zoom + offset[0] + 5, 10)
    }
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(0, offset[1], width, 2);
    ctx.fillStyle = "#0000ff";
    ctx.fillRect(offset[0], 0, 2, height);

} clear();


function plot(c = "#000000") {
    ctx.fillStyle = "#00ffff";
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.fillRect
    for (let x = -(width + offset[0]) / zoom; x < (width - offset[0]) / zoom; x += 1 / zoom) {
        ctx.lineTo(x * zoom + offset[0], - f(x) * zoom + offset[1]);
    }
    ctx.stroke();
} plot();


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
            clear();
            plot();
        }
    },
    mouseOOB: () => {
        Mouse.mouseUp(null);
    },
    zoom: (event) => {
        event.preventDefault();
        zoom -= 10 * zoom / event.deltaY;
        clear();
        plot(f);
    }
};