let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width; // = window.innerWidth;
let height = canvas.height; // = window.innerHeight;
canvas.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); }
const message = document.getElementById("message");

// CONFIG
const ANCHOR = new Vec2(width / 2, height / 2);

// Globals
let pendulum_n = 1;
let pendulum_theta = 0;
let pendulum_r = 180;

function drawBackground() {
    ctx.fillStyle = "#b0e0e6";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(ANCHOR.x - 100, ANCHOR.y, 200, 2);
    for (let x = ANCHOR.x - 100; x < ANCHOR.x + 101; x += 20) {
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(x, ANCHOR.y);
        ctx.lineTo(x + 10, ANCHOR.y - 20);
        ctx.stroke();
    }
}

function drawPendulum() {
    const r = Vec2.multiply(Vec2.fromAngle(pendulum_theta + Math.PI/2), pendulum_r);
    const p = Vec2.add(
        r,
        ANCHOR
    );
    // path
    ctx.beginPath();
    ctx.setLineDash([6, 8]);
    ctx.arc(ANCHOR.x, ANCHOR.y, pendulum_r, 0, 2 * Math.PI);
    ctx.stroke();
    // angle
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(ANCHOR.x, ANCHOR.y);
    ctx.lineTo(ANCHOR.x, ANCHOR.y + pendulum_r / 2);
    ctx.stroke();
    ctx.strokeStyle = ctx.fillStyle = "rgb(255,64,64)";
    ctx.setLineDash([]);
    const lowerBound = Math.min(pendulum_theta + Math.PI/2, Math.PI / 2);
    const upperBound = Math.max(pendulum_theta + Math.PI/2, Math.PI / 2);
    ctx.beginPath();
    ctx.arc(ANCHOR.x, ANCHOR.y, pendulum_r / 4, lowerBound, upperBound);
    ctx.stroke();
    // // text
    const textPosition = Vec2.add(
        Vec2.multiply(Vec2.fromAngle((lowerBound + upperBound) / 2), pendulum_r / 3),
        ANCHOR
    );
    ctx.font = "16px sans-serif";
    ctx.fillText("θ", textPosition.x, textPosition.y);
    // line
    ctx.strokeStyle = ctx.fillStyle = "#000000";
    if (pendulum_theta > Math.PI/2) {
        ctx.beginPath();
        ctx.moveTo(ANCHOR.x, ANCHOR.y);
        ctx.lineTo(ANCHOR.x - r.x / 4, ANCHOR.y - r.y / 4);
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.moveTo(ANCHOR.x, ANCHOR.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    // pendulum
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText("θ = " + Math.abs(pendulum_theta / Math.PI).toFixed(2) + "π", 50, 50);
}

drawBackground();

const Mouse = {
    x: 0,
    y: 0,
    lastClickX: -1,
    lastClickY: -1,
    connectingFrom: null,
    movingNode: null,
    mouseDown: (e) => {
        if (Mouse.x > width * 2 / 3) {
            Mouse.mouseOOB();
            return;
        }

        if (e.button == 2) {

            return;
        }
        Mouse.lastClickX = Mouse.x;
        Mouse.lastClickY = Mouse.y;
    },
    mouseUp: (e) => {
        if (Mouse.x > width * 2 / 3) {
            Mouse.mouseOOB();
            return;
        }

        Mouse.movingNode = null;


        Mouse.lastClickX = -1;
        Mouse.lastClickY = -1;
    },
    mouseMove: (e) => {

        var rect = canvas.getBoundingClientRect();
        Mouse.x = e.clientX - rect.left;
        Mouse.y = e.clientY - rect.top;

        if (Mouse.x >= width * 2 / 3) Mouse.mouseOOB();

    },
    mouseOOB: () => {
        Mouse.lastClickX = -1;
        Mouse.lastClickY = -1;
        Mouse.connectingFrom = null;
        Mouse.movingNode = null;
    }
};


function loop() {
    drawBackground();
    drawPendulum();
    requestAnimationFrame(loop);
    pendulum_theta = 1/pendulum_r * Math.sin(pendulum_theta) - 0.99*pendulum_theta;
    // pendulum_theta = +document.getElementById("theta").value;
    pendulum_theta %= 2 * Math.PI;
}

loop();
