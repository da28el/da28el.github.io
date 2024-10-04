let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width; // = window.innerWidth;
let height = canvas.height; // = window.innerHeight;
canvas.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); }

// CONFIG
const nodeSize = 8;
const labelSelectorSize = 15;
const labelSelectorOffsetX = 20;
const labelSelectorOffsetY = 30;
const labelSelectorBreakRange = 50;


// Globals
let TREE_n = 1;
let nodes = [];
let nodeColliders = [];
let labelColliders = [];
let trees = [];

const TNode = (x, y, color, children = []) => {
    return {
        x: x,
        y: y,
        color: color,
        children: children
    }
}

function inf_embedded(rootNode1, rootNode2) {
    
}

function submitTree(rootNode) {
    
}

const Collider = (x, y, r, color, parent = null) => {
    return { x, y, r, color, parent }
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
        nodeColliders.push(Collider(element.x, element.y, nodeSize, element.color, element));
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

function drawCollider(collider, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(collider.x, collider.y, collider.r, 0, 2 * Math.PI);
    ctx.fill();
}

function generateLabelColliders() {
    // label-break-range
    labelColliders.push(Collider(MouseLogic.lastClickX, MouseLogic.lastClickY, labelSelectorBreakRange, "rgba(0,0,0,0.1)"));
    switch (TREE_n) {
        case 1:
            labelColliders.push(Collider(MouseLogic.lastClickX, MouseLogic.lastClickY - labelSelectorOffsetY, labelSelectorSize, "rgb(0,255,0)"));
            break;

        case 2:
            labelColliders.push(Collider(MouseLogic.lastClickX - labelSelectorOffsetX, MouseLogic.lastClickY - labelSelectorOffsetY * 2 / 3, labelSelectorSize, "rgb(0,255,0)"));
            labelColliders.push(Collider(MouseLogic.lastClickX + labelSelectorOffsetX, MouseLogic.lastClickY - labelSelectorOffsetY * 2 / 3, labelSelectorSize, "rgb(255,0,0)"));
            break;

        case 3:
            labelColliders.push(Collider(MouseLogic.lastClickX - labelSelectorOffsetX * 1.5, MouseLogic.lastClickY - labelSelectorOffsetY / 2, labelSelectorSize, "rgb(0,255,0)"));
            labelColliders.push(Collider(MouseLogic.lastClickX, MouseLogic.lastClickY - labelSelectorOffsetY, labelSelectorSize, "rgb(255,0,0)"));
            labelColliders.push(Collider(MouseLogic.lastClickX + labelSelectorOffsetX * 1.5, MouseLogic.lastClickY - labelSelectorOffsetY / 2, labelSelectorSize, "rgb(0,0,255)"));
            break;
    }
}

function drawLabelSelection() {

    labelColliders.forEach(element => {
        drawCollider(element, element.color);
    });

}

function drawNodes() {
    nodeColliders.forEach(element => {
        drawCollider(element, element.color);
    });
}

function drawLines() {
    if (MouseLogic.connectingFrom != null) {
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(MouseLogic.connectingFrom.x, MouseLogic.connectingFrom.y);
        ctx.lineTo(MouseLogic.x, MouseLogic.y);
        ctx.stroke();
    }
    nodes.forEach(element => {
        element.children.forEach(child => {
            ctx.strokeStyle = "#000000";
            ctx.beginPath();
            ctx.moveTo(element.x, element.y);
            ctx.lineTo(child.x, child.y);
            ctx.stroke();
        });
    });
}

function drawBackground() {
    ctx.fillStyle = "rgb(240,240,210";
    ctx.fillRect(0, 0, width * 2 / 3, height);
    ctx.fillStyle = "rgb(140,140,110";
    ctx.fillRect(width * 2 / 3, 0, width, height);
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
        if (MouseLogic.x > width * 2/3) MouseLogic.mouseOOB();

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
        if (MouseLogic.x > width * 2/3) MouseLogic.mouseOOB();

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
            nodes.push(TNode(MouseLogic.x, MouseLogic.y, collision.color));
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

        if (MouseLogic.x >= width * 2/3) MouseLogic.mouseOOB();

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
