let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width; // = window.innerWidth;
let height = canvas.height; // = window.innerHeight;
canvas.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); }
const message = document.getElementById("message");

// CONFIG
const ANCHOR = new Vec2(width/2, height*0.1);
const nodeSize = 24;

const LABEL_COLOR = {
    0: "rgba(0,0,0,0.1)",
    1: "rgb(0,255,0)", // green
    2: "rgb(255,0,0)", // red
    3: "rgb(0,0,255)"  // blue
};

// Globals
let pendulum_n = 1;

function drawBackground() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
}

function drawPendulum() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(ANCHOR.x - 100, ANCHOR.y, 200, 2)
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
            let collision = getCollision(nodeColliders);
            if (collision != null) {
                Mouse.movingNode = collision.parent;
            } else {
                Mouse.mouseOOB();
            }
            return;
        }
        Mouse.lastClickX = Mouse.x;
        Mouse.lastClickY = Mouse.y;

        let collision = getCollision(nodeColliders);
        if (collision == null) {
            if (getCollision(labelColliders) == null) {
                generateLabelColliders();
            } else {
                // 
            }
        } else {
            Mouse.connectingFrom = collision;
        }

    },
    mouseUp: (e) => {
        if (Mouse.x > width * 2 / 3) {
            Mouse.mouseOOB();
            return;
        }

        Mouse.movingNode = null;

        if (Mouse.connectingFrom != null) {
            let collision = getCollision(nodeColliders);
            if (collision != null && collision != Mouse.connectingFrom) {
                edges.push([Mouse.connectingFrom.parent, collision.parent, false]);
            }
            Mouse.connectingFrom = null;
        }

        labelColliders.shift();
        let collision = getCollision(labelColliders);
        if (collision != null) {
            nodes.push(TNode(Mouse.x, Mouse.y, collision.label));
            generateNodeColliders();
        }
        labelColliders = [];
        Mouse.lastClickX = -1;
        Mouse.lastClickY = -1;
    },
    mouseMove: (e) => {

        var rect = canvas.getBoundingClientRect();
        Mouse.x = e.clientX - rect.left;
        Mouse.y = e.clientY - rect.top;

        if (Mouse.x >= width * 2 / 3) Mouse.mouseOOB();

        if (Mouse.movingNode != null) {
            Mouse.movingNode.x = Mouse.x;
            Mouse.movingNode.y = Mouse.y;
            generateNodeColliders();
        }

        if (labelColliders.length > 0 && getCollision(labelColliders) !== null) {

        } else {
            Mouse.lastClickX = -1;
            Mouse.lastClickY = -1;
            labelColliders = [];

        }

    },
    mouseOOB: () => {
        Mouse.lastClickX = -1;
        Mouse.lastClickY = -1;
        Mouse.connectingFrom = null;
        Mouse.movingNode = null;
        labelColliders = [];
    }
};


function loop() {
    drawBackground();
    drawLines();
    drawNodes();
    drawLabelSelection();
    drawTrees();
    requestAnimationFrame(loop);
}

loop();
