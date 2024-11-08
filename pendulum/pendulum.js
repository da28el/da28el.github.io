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
let pendulum_omega = 0;
let pendulum_alpha = 0;
let pendulum_r = 180;
let pendulum_dampening = 0;

let showV = false;
let showA = false;
let showG = false;

function drawBackground() {
    ctx.fillStyle = "#b0e0e6";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(ANCHOR.x - 100, ANCHOR.y, 200, 2);
    for (let x = ANCHOR.x - 100; x < ANCHOR.x + 101; x += 20) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
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
    ctx.lineWidth = 1;
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
    // theta text
    const textPosition = Vec2.add(
        Vec2.multiply(Vec2.fromAngle((lowerBound + upperBound) / 2), pendulum_r / 3),
        ANCHOR
    );
    ctx.font = "16px sans-serif";
    ctx.fillText("θ", textPosition.x, textPosition.y);
    // line
    ctx.strokeStyle = ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.moveTo(ANCHOR.x, ANCHOR.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    // pendulum
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
    ctx.fill();

    ctx.lineWidth = 4;
    // gravity
    if(showG) {
        // radial component
        const grx = 9.8 * Math.cos(pendulum_theta + Math.PI/2)*Math.sin(pendulum_theta + Math.PI/2);
        const gry = 9.8 * Math.sin(pendulum_theta + Math.PI/2)*Math.sin(pendulum_theta + Math.PI/2);
        ctx.fillStyle = ctx.strokeStyle = "#00ffff";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + 5*grx, p.y + 5*gry);
        ctx.stroke();
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.strokeText("gr", p.x + 5*grx, p.y + 5*gry);
        ctx.stroke();
        ctx.fillText("gr", p.x + 5*grx, p.y + 5*gry);
        // tangental component
        const gtx = 9.8 * -Math.cos(pendulum_theta + Math.PI/2)*Math.sin(pendulum_theta + Math.PI/2);
        const gty = 9.8 * Math.cos(pendulum_theta + Math.PI/2)*Math.cos(pendulum_theta + Math.PI/2);
        ctx.fillStyle = ctx.strokeStyle = "#ffff00";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + 5*gtx, p.y + 5*gty);
        ctx.stroke();
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.strokeText("gt", p.x + 5*gtx, p.y + 5*gty);
        ctx.stroke();
        ctx.fillText("gt", p.x + 5*gtx, p.y + 5*gty);
        // gravity
        ctx.fillStyle = ctx.strokeStyle = "#ff00ff";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y + 5*9.8);
        ctx.stroke();
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.strokeText("g", p.x, p.y + 5*9.8);
        ctx.stroke();
        ctx.fillText("g", p.x, p.y + 5*9.8);
    }
    // velocity
    const vx = pendulum_r*pendulum_omega * -Math.sin(pendulum_theta + Math.PI/2);
    const vy = pendulum_r*pendulum_omega *  Math.cos(pendulum_theta + Math.PI/2);
    if (showV) {    
        ctx.fillStyle = ctx.strokeStyle = "#0000ff";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + vx, p.y + vy);
        ctx.stroke();
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.strokeText("v", p.x + vx, p.y + vy);
        ctx.stroke();
        ctx.fillText("v", p.x + vx, p.y + vy);
    }
    // acceleration
    if (showA) {

        const ax = -vy * pendulum_omega - pendulum_r * -Math.sin(pendulum_theta + Math.PI/2) * pendulum_alpha;
        const ay =  vx * pendulum_omega + pendulum_r *  Math.cos(pendulum_theta + Math.PI/2) * pendulum_alpha;
        ctx.fillStyle = ctx.strokeStyle = "#00dd00";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + 2*ax, p.y + 2*ay);
        ctx.stroke();
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.strokeText("a", p.x + 2*ax, p.y + 2*ay);
        ctx.stroke();
        ctx.fillText("a", p.x + 2*ax, p.y + 2*ay);
    }
    // radian text
    ctx.fillStyle = "#ff0000";
    ctx.fillText("θ = " + Math.abs(pendulum_theta / Math.PI).toFixed(2) + "π", 50, 50);
    ctx.fillText("x = cos(θ) = " + Math.cos(pendulum_theta + Math.PI/2).toFixed(2), 50, 75);
    ctx.fillText("y = sin(θ) = " +-Math.sin(pendulum_theta + Math.PI/2).toFixed(2), 50, 100);

}

const Mouse = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    isDown: false,
    mouseDown: (event) => {
        Mouse.isDown = true;
    },
    mouseUp: (event) => {
        Mouse.isDown = false;
    },
    mouseMove: (event) => {
        var rect = canvas.getBoundingClientRect();
        const newX = event.clientX - rect.left;
        const newY = event.clientY - rect.top;
        Mouse.dx = newX - Mouse.x;
        Mouse.dy = newY - Mouse.y;
        Mouse.x = newX;
        Mouse.y = newY;
    },
    mouseOOB: () => {
        Mouse.mouseUp(null);
    }
}

const add = (v1,v2) => [v1[0]+v2[0], v1[1]+v2[1]];
const mul = (s,v) => [s*v[0], s*v[1]];

let f = (p) => {
    let theta = p[0];
    let omega = p[1];
    return [
        omega - 2*pendulum_dampening * theta,
        (-9.8/pendulum_r) * Math.sin(theta)
    ];
}

function rk4(y, dt) {
    let k1 = f(y);
    let k2 = f(add(y, mul(dt/2, k1)));
    let k3 = f(add(y, mul(dt/2, k2)));
    let k4 = f(add(y, mul(dt, k3)));
    return add(y, mul(dt/6, add(add(add(k1, mul(2, k2)), mul(2, k3)), k4)));
}

y0 = [0, 0];
function loop() {
    drawBackground();
    drawPendulum();
    y0 = rk4(y0, 0.1);
    y0[0] = y0[0] % (2 * Math.PI);
    pendulum_theta = y0[0];
    pendulum_omega = y0[1];
    pendulum_alpha = (-9.8/pendulum_r) * Math.sin(pendulum_theta);
    if(Mouse.isDown) {
        const arg = Math.atan2(ANCHOR.y - Mouse.y, ANCHOR.x - Mouse.x) + Math.PI/2;
        const angleDiff = arg - y0[0];
        const target = ((angleDiff + 3*Math.PI) % (2 * Math.PI)) - Math.PI;
        y0[0] += 0.1 * target;
        y0[1] = 0;
        // y0[1] = Math.atan2(Mouse.dy, Mouse.dx) + Math.PI/2;
    }

    requestAnimationFrame(loop);
}

loop();
