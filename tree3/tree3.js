let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width; // = window.innerWidth;
let height = canvas.height; // = window.innerHeight;
canvas.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); }

// CONFIG
const nodeSize = 24;
const labelSelectorSize = 25;
const labelSelectorOffsetX = 25;
const labelSelectorOffsetY = 35;
const labelSelectorBreakRange = 75;

const LABEL_COLOR = {
    0: "rgba(0,0,0,0.1)",
    1: "rgb(0,255,0)", // green
    2: "rgb(255,0,0)", // red
    3: "rgb(0,0,255)"  // blue
};

// Globals
let TREE_n = 1;
let nodes = [];
let edges = [];
let nodeColliders = [];
let labelColliders = [];
let trees = [];

const TNode = (x, y, label) => {
    return {
        x: x,
        y: y,
        label: label,
        children: [],
        matched: false
    }
}

function inf_embedded(v, fv) {
    const match = (v, fv) => ((v.label == fv.label) && (!fv.checked));
    // Naive case
    if (v == null) return true // empty is embeddable in n2
    if (fv == null) return false // n1 not embeddable in empty

    if (match(v, fv)) {
        fv.matched = true; // mark vertex used
        let matchedAll = true;
        for (let i = 0; i < v.children.length; i++) {
            let matchFound = false;
            for (let j = 0; j < fv.children.length; j++) {
                if (inf_embedded(v.children[i], fv.children[j])) {
                    matchFound = true;
                    break;
                }
            }
            if (!matchFound) {
                matchedAll = false;
                break;
            }
        }
        return matchedAll;
    }

    for (let j = 0; j < fv.children.length; j++) {
        if  (inf_embedded(v, fv.children[j])){
            return true;
        }
    }

    return false;
}

function submitTree(rootNode) {

}

const Collider = (x, y, r, label, parent = null) => {
    return { x, y, r, label, parent }
}

function generateNodeColliders() {
    nodeColliders = [];
    nodes.forEach(element => {
        nodeColliders.push(Collider(element.x, element.y, nodeSize, element.label, element));
    });
}

function getCollision(colliders) {
    if (colliders == null) return null;
    for (let i = 0; i < colliders.length; i++) {
        const element = colliders[i];
        let dx = MouseLogic.x - element.x;
        let dy = MouseLogic.y - element.y;
        if (dx * dx + dy * dy < element.r * element.r) {
            return element;
        }

    }
    return null;
}

function drawCollider(collider, label) {
    if (collider == nodeColliders[0]) {
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(collider.x, collider.y, collider.r - 5, 0, 2 * Math.PI);
        ctx.fill();
        //ctx.fillText("ROOT", collider.x-15, collider.y-10)
    }
    ctx.fillStyle = LABEL_COLOR[label];
    ctx.beginPath();
    ctx.arc(collider.x, collider.y, collider.r - 8, 0, 2 * Math.PI);
    ctx.fill();
}

function generateLabelColliders() {
    // label-break-range
    labelColliders.push(Collider(MouseLogic.lastClickX, MouseLogic.lastClickY, labelSelectorBreakRange, 0));
    switch (TREE_n) {
        case 1:
            labelColliders.push(Collider(MouseLogic.lastClickX, MouseLogic.lastClickY - labelSelectorOffsetY, labelSelectorSize, 1));
            break;

        case 2:
            labelColliders.push(Collider(MouseLogic.lastClickX - labelSelectorOffsetX, MouseLogic.lastClickY - labelSelectorOffsetY * 2 / 3, labelSelectorSize, 1));
            labelColliders.push(Collider(MouseLogic.lastClickX + labelSelectorOffsetX, MouseLogic.lastClickY - labelSelectorOffsetY * 2 / 3, labelSelectorSize, 2));
            break;

        case 3:
            labelColliders.push(Collider(MouseLogic.lastClickX - labelSelectorOffsetX * 1.5, MouseLogic.lastClickY - labelSelectorOffsetY / 2, labelSelectorSize, 1));
            labelColliders.push(Collider(MouseLogic.lastClickX, MouseLogic.lastClickY - labelSelectorOffsetY, labelSelectorSize, 2));
            labelColliders.push(Collider(MouseLogic.lastClickX + labelSelectorOffsetX * 1.5, MouseLogic.lastClickY - labelSelectorOffsetY / 2, labelSelectorSize, 3));
            break;
    }
}

function drawLabelSelection() {

    labelColliders.forEach(element => {
        drawCollider(element, element.label);
    });

}

function drawNodes() {
    nodeColliders.forEach(element => {
        drawCollider(element, element.label);
    });
}

function drawLines() {
    const line = (x1, y1, x2, y2) => {
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };

    if (MouseLogic.connectingFrom != null) {
        line(MouseLogic.connectingFrom.x, MouseLogic.connectingFrom.y, MouseLogic.x, MouseLogic.y);
    }
    edges.forEach(element => {
        line(element[0].x, element[0].y, element[1].x, element[1].y);
    });
}

function drawBackground() {
    ctx.fillStyle = "rgb(240,240,210)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(0,255,0,0.5)";
    ctx.fillRect(width * 2 / 3, 0, width, height / 3);
    ctx.fillStyle = "rgba(255,0,0,0.5)";
    ctx.fillRect(width * 2 / 3, height / 3, width, height * 2 / 3);
    ctx.fillStyle = "rgba(0,0,255,0.5)";
    ctx.fillRect(width * 2 / 3, height * 2 / 3, width, height);
}


drawBackground();

const MouseLogic = {
    x: 0,
    y: 0,
    lastClickX: -1,
    lastClickY: -1,
    connectingFrom: null,
    movingNode: null,
    mouseDown: (e) => {
        if (MouseLogic.x > width * 2 / 3) {
            MouseLogic.mouseOOB();
            return;
        }

        if (e.button == 2) {
            let collision = getCollision(nodeColliders);
            if (collision != null) {
                MouseLogic.movingNode = collision.parent;
            }
            return;
        }
        MouseLogic.lastClickX = MouseLogic.x;
        MouseLogic.lastClickY = MouseLogic.y;

        let collision = getCollision(nodeColliders);
        if (collision == null) {
            if (getCollision(labelColliders) == null) {
                generateLabelColliders();
            } else {
                // 
            }
        } else {
            MouseLogic.connectingFrom = collision;
        }

    },
    mouseUp: (e) => {
        if (MouseLogic.x > width * 2 / 3) {
            MouseLogic.mouseOOB();
            return;
        }

        MouseLogic.movingNode = null;

        if (MouseLogic.connectingFrom != null) {
            let collision = getCollision(nodeColliders);
            if (collision != null) {
                edges.push([MouseLogic.connectingFrom.parent, collision.parent]);
            }
            MouseLogic.connectingFrom = null;
        }

        labelColliders.shift();
        let collision = getCollision(labelColliders);
        if (collision != null) {
            nodes.push(TNode(MouseLogic.x, MouseLogic.y, collision.label));
            generateNodeColliders();
        }
        labelColliders = [];
        MouseLogic.lastClickX = -1;
        MouseLogic.lastClickY = -1;
    },
    mouseMove: (e) => {

        var rect = canvas.getBoundingClientRect();
        MouseLogic.x = e.clientX - rect.left;
        MouseLogic.y = e.clientY - rect.top;

        if (MouseLogic.x >= width * 2 / 3) MouseLogic.mouseOOB();

        if (MouseLogic.movingNode != null) {
            MouseLogic.movingNode.x = MouseLogic.x;
            MouseLogic.movingNode.y = MouseLogic.y;
            generateNodeColliders();
        }

        if (labelColliders.length > 0 && getCollision(labelColliders) !== null) {

        } else {
            MouseLogic.lastClickX = -1;
            MouseLogic.lastClickY = -1;
            labelColliders = [];

        }

    },
    mouseOOB: () => {
        MouseLogic.lastClickX = -1;
        MouseLogic.lastClickY = -1;
        MouseLogic.connectingFrom = null;
        MouseLogic.movingNode = null;
        labelColliders = [];
    }
};

function reset() {
    MouseLogic.mouseOOB();
    nodes = [];
    edges = [];
    nodeColliders = [];
    labelColliders = [];
}

function loop() {
    drawBackground();
    drawLines();
    drawNodes();
    drawLabelSelection();

    requestAnimationFrame(loop);
}

loop();
