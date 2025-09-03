const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

const Vec = (x = 0, y = 0) => ({ x: x, y: y });
const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
const mlt = (v, t) => ({ x: v.x * t, y: v.y * t });
const dot = (a, b) => (a.x * b.x + a.y * b.y);
const len = (v)    => Math.hypot(v.x, v.y);
const norm = (v)   => { 
    const l = len(v);
    return len === 0 ? Vec() : mlt(v, 1/l);
} 

let scale = 40;

function drawVec(v, x, y) {
    const w = mlt(norm(v), 0.9);
    const l = len(v);
    ctx.strokeStyle = `rgb(${l}, ${l}, ${l})`
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, 2*Math.PI);
    ctx.moveTo(x, y);
    ctx.lineTo(x + scale * w.x, y + scale * w.y);
    ctx.stroke();
}

function drawField(f) {
    for (let y = scale / 2; y < height; y += scale) {
        for (let x = scale / 2; x < width; x += scale) {
            const v = f(x, y);
            drawVec(v, x, y);
        }
    }
}

let charges = [];

const newCharge = (x, y, q) => charges.push({
    x: x, y: y, q: q
});

function drawCharge(q) {
    ctx.fillStyle = q.q > 0 ? "#f00" : "#00f";
    ctx.beginPath();
    ctx.arc(q.x, q.y, 10, 0, 2*Math.PI);
    ctx.fill();
}

newCharge(width / 3, height / 2,  10);
newCharge(width*2/3, height / 2, -10);

const f = (x, y) => {
    let sum = Vec();
    for (let Q of charges) {
        const k_e = 1000000;
        const v = Vec(x - Q.x, y - Q.y);
        sum = add(sum, mlt(v, Q.q * k_e / (len(v)**3)));
    }
    return sum;
}

function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    drawField(f);
    charges.forEach((q) => drawCharge(q));
} draw();

let selected = null;

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    return {x, y};
}

document.addEventListener('mousedown', (evt) => {
    const {x, y} = getMousePos(evt);
    let minDist = 50;
    let closest = null;
    for (Q of charges) {
        const dist = Math.hypot(Q.x - x, Q.y - y);
        if (dist < minDist) {
            minDist = dist;
            closest = Q;
        }
    }
    selected = closest;
});

document.addEventListener('mousemove', (evt) => {
    if (!selected) return;
    const {x, y} = getMousePos(evt);
    selected.x = x; selected.y = y;
    draw();
});

document.addEventListener('mouseup', () => {
    selected = null;
});

document.querySelector("input").addEventListener("change", (evt) => {scale = 80 - evt.target.value; draw()});
