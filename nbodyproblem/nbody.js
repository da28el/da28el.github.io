let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width; // = window.innerWidth;
let height = canvas.height; // = window.innerHeight;
canvas.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); }

// CONFIG
const G = 10;
const MASS = 1;
const PARTICLE_SIZE = 4;
const SUBDIVISIONS = 5;

// OBJECTS
class Particle {
    constructor(p = new Vec2(), v = new Vec2(), a = new Vec2()) {
        this.p = p;
        this.v = v;
        this.a = a;
    }
    toString() {
        return `{p:${this.p.x, this.p.y}, v:${this.v.x, this.v.y}, a:${this.a.x, this.a.y}}`;
    }
}

// Globals
let particles = [];

// Simulation
function populate(n = 100) {
    for (let i = 0; i < n; i++) {
        let x = Math.random() * width;
        let y = Math.random() * height;
        particles.push(new Particle(new Vec2(x, y)));
    }
}

function attract() {
    let partitions = [];
    for (let y = 0; y < height; y += height / SUBDIVISIONS) {
        let partition = [];        
        for (let x = 0; x < width; x += width / SUBDIVISIONS) {

        }
        partitions.push()
    }
}

populate();


// Rendering
function drawBackground() {
    ctx.fillStyle = "rgb(4,4,1)";
    ctx.fillRect(0, 0, width, height);
}

function drawParticles() {
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    particles.forEach(e => ctx.fillRect(e.p.x, e.p.y, 1, 1));
}

function drawGrid() {
    ctx.fillStyle = "rgb(255,0,0)";
    for (let x = 0; x < width; x += width / SUBDIVISIONS) {
        ctx.fillRect(x, 0, 1, height);
    }
    for (let y = 0; y < height; y += height / SUBDIVISIONS) {
        ctx.fillRect(0, y, width, 1);
    }
}

// MainLoop
function loop() {
    drawBackground();
    drawGrid();
    drawParticles();
    requestAnimationFrame(loop);
} loop();

// MouseHandling
const MouseLogic = {
    x: 0,
    y: 0,
    mouseDown: (e) => {

        if (e.button == 2) {
            return;
        }

    },
    mouseUp: (e) => {
    },
    mouseMove: (e) => {

        var rect = canvas.getBoundingClientRect();
        MouseLogic.x = e.clientX - rect.left;
        MouseLogic.y = e.clientY - rect.top;

    },
    mouseOOB: () => {
    }
};