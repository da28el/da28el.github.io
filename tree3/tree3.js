let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width; // = window.innerWidth;
let height = canvas.height; // = window.innerHeight;
canvas.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); }

// CONFIG
const nodeSize = 8;
const labelSelectorSize = 15;
const labelSelectorOffsetX = 20;
const labelSelectorOffsetY = 30;
const labelSelectorBreakRange = 50;

const LABEL_COLOR = {
    0: "rgba(0,0,0,0.1)",
    1: "rgb(0,255,0)", // green
    2: "rgb(255,0,0)", // red
    3: "rgb(0,0,255)"  // blue
};

// Globals
let TREE_n = 1;
let nodes = [];
let nodeColliders = [];
let labelColliders = [];
let trees = [];

const TNode = (x, y, label, children = []) => {
    return {
        x: x,
        y: y,
        label: label,
        children: children
    }
}

function countNodes(root) {
    let nodes = []
    const dfs = (n) => {
        if (n == 0) return
        nodes.push(n)
        n.children.forEach(c => dfs(c)) 
    }
    dfs(root)
    return nodes.length
}

function inf_embedded(rootNode1, rootNode2) {

}

function submitTree(rootNode) {

}

const Collider = (x, y, r, label, parent = null) => {
    return { x, y, r, label, parent }
}

function addChild(parent, child) {
    for (let i = 0; i < parent.children.length; i++) {
        if (parent.children[i] == child) return;
    }
    for (let j = 0; j < child.children.length; j++) {
        if (child.children[j] == parent) return
    }
    parent.children.push(child);
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
    ctx.fillStyle = LABEL_COLOR[label];
    ctx.beginPath();
    ctx.arc(collider.x, collider.y, collider.r, 0, 2 * Math.PI);
    ctx.fill();
    if (collider == nodeColliders[0]) {
        ctx.fillStyle = "#000000";
        ctx.fillText("ROOT", collider.x-15, collider.y-10)
    }
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
    const arrow = (x1, y1, x2, y2) => {
        const theta = 2.5*Math.PI/3
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        let dx = x2 - x1;
        let dy = y2 - y1;
        let r = Math.sqrt(dx*dx+dy*dy);
        dx = 20*dx/r;
        dy = 20*dy/r;
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 + dx * Math.cos(theta) - dy * Math.sin(theta), y2 + dx * Math.sin(theta) + dy * Math.cos(theta))
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 + dx * Math.cos(-theta) - dy * Math.sin(-theta), y2 + dx * Math.sin(-theta) + dy * Math.cos(-theta))
        ctx.stroke();
    };

    if (MouseLogic.connectingFrom != null) {
        arrow(MouseLogic.connectingFrom.x, MouseLogic.connectingFrom.y, MouseLogic.x, MouseLogic.y);
    }
    nodes.forEach(element => {
        element.children.forEach(child => {
            arrow(element.x, element.y, child.x, child.y);
        });
    });
}

function drawBackground() {
    ctx.fillStyle = "rgb(240,240,210";
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
        if (MouseLogic.x > width * 2 / 3){
            MouseLogic.mouseOOB();
            return;
        } 

        MouseLogic.movingNode = null;

        if (MouseLogic.connectingFrom != null) {
            let collision = getCollision(nodeColliders);
            if (collision != null) {
                addChild(MouseLogic.connectingFrom.parent, collision.parent);
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

function loop() {
    drawBackground();
    drawLines();
    drawNodes();
    drawLabelSelection();

    requestAnimationFrame(loop);
}

loop();
