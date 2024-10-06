let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width; // = window.innerWidth;
let height = canvas.height; // = window.innerHeight;
canvas.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); }
const message = document.getElementById("message");

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
let trees = [[], [], []];

const TNode = (x, y, label) => {
    return {
        x: x,
        y: y,
        label: label,
        children: [],
        matched: false
    }
}

function logNode(node, tab = 0) {
    let msg = "[" + node.label + "]";
    for (let i = 0; i < tab; i++) msg += "\t";
    console.log(msg, tab)
    for (let j = 0; j < node.children.length; j++)
        logNode(node.children[j], tab+1);
}


function inf_embedded(v, fv) {
    const match = (v, fv) => ((v.label == fv.label) && (!fv.matched));
    // Naive case
    if (v == null) return true
    if (fv == null) return false

    if (match(v, fv)) {
        fv.matched = true;
        let matchedChildrenV = [].fill(false, 0, v.children.length);
        let availableChildrenFv = [];
        for (let i = 0; i < fv.children.length; i++)
            if(!fv.children[i].matched) availableChildrenFv.push(fv.children[i]);

        for (let i = 0; i < v.children.length; i++) {
            let matchFound = false;
            for (let j = 0; j < availableChildrenFv.length; j++) {
                if (inf_embedded(v.children[i], availableChildrenFv[j])) {
                    matchFound = true;
                    availableChildrenFv.splice(j, 1);
                    break;
                }
            }
            if (!matchFound) {
                fv.matched = false;
                return false;
            }
        }
        return true;
    }

    for (let j = 0; j < fv.children.length; j++) {
        if (inf_embedded(v, fv.children[j])) {
            return true;
        }
    }

    return false;
}

let T1_root = TNode(0,0,1);
let T2_root = TNode(0,0,2);
T2_root.children = [TNode(0,0,1)];

function unmatch(root) {
    root.matched = false;
    for (let i = 0; i < root.children.length; i++)
        unmatch(root.children[i]);
}

function isCyclic(root) {
    unmatch(root);
    let cycle = false;
    const dfs = (n) => {
        if (n.matched) {
            cycle = true;
            return;
        }
        n.matched = true;
        for(let i = 0; i < n.children.length; i++)
            dfs(n.children[i]);
    }
    dfs(root);
    unmatch(root);
    return cycle;
}

function isDisjointed(root) {
    unmatch(root);
    const dfs = (n) => {
        n.matched = true;
        for(let i = 0; i < n.children.length; i++)
            dfs(n.children[i]);
    }
    dfs(root);
    for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].matched) return true;
    }
    unmatch(root);
    return false;
}

function validateTree(root) {
    let maxVertices = trees[TREE_n - 1].length;
    if (nodes.length > maxVertices + 1) {
        message.value = "Trädet får max ha " + (maxVertices + 1) + "st frön! Läs reglerna igen";
        return false;
    }

    if (isCyclic(root)) {
        message.value = "Trädet få inte vara cykliskt! Läs reglerna igen";
        return false;
    }

    if (isDisjointed(root)) {
        message.value = "Du får bara göra ett träd åt gången, kom ihåg att koppla ihop alla frön";
        return false;
    }

    for (let i = 0; i < maxVertices; i++) {
        let T1 = trees[TREE_n - 1][i];
        unmatch(T1);
        unmatch(root);
        if (inf_embedded(T1, root)) {
            message.value = "Trädet innehåller träd #" + (i + 1) + "! Gör om och gör rätt";
            return false;
        }
    }

    return true;

}

function resizeAndMoveTree(root) {
    // average position
    let avgX = 0;
    let avgY = 0;
    const avgP = (e) => {
        avgX += e.x;
        avgY += e.y;
        for (let i = 0; i < e.children.length; i++)
            avgP(e.children[i])
    }
    avgP(root);
    avgX /= nodes.length;
    avgY /= nodes.length;
    // offset and scale
    const offsetScale = (e) => {
        e.x -= avgX;
        e.x /= 6;
        e.y -= avgY;
        e.y /= 6;
        if (TREE_n == 1) {
            e.x += width * 2.5 / 3;
            e.y += height / 6;
        } else if (TREE_n == 2) {
            e.x += width * 2 / 3 + (trees[TREE_n - 1].length + 0.5) * width / 9;
            e.y += height / 2;
        } else {
            e.x += width * 2 / 3 + (trees[TREE_n - 1].length % 6 + 0.25) * width / 18;
            e.y += height * 1.45 / 2 + Math.floor(trees[TREE_n - 1].length / 6) * 50;
        }
        for (let i = 0; i < e.children.length; i++)
            offsetScale(e.children[i]);
    }
    offsetScale(root);

}

function submitTree() {
    if (nodes.length == 0) return;
    let root = parentTree(nodes[0]);
    if (validateTree(root)) {
        message.value = "";
        resizeAndMoveTree(root);
        trees[TREE_n - 1].push(root);
    }
    clearTree();
}

function parentTree(root) {
    for (let i = 0; i < edges.length; i++) {
        let edge = edges[i];
        if (edge[2] || edge[0] == edge[1]) continue;
        if (edge[0] == root) {
            root.children.push(edge[1]);
            edge[2] = true;
        } else if (edge[1] == root) {
            root.children.push(edge[0]);
            edge[2] = true;
        }
    }
    for (let j = 0; j < root.children.length; j++) {
        let child = root.children[j];
        parentTree(child);
    }
    return root;
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

function drawTrees() {
    const drawLine = (x1, y1, x2, y2) => {
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };
    const drawTree = (root, isFirst = false) => {
        if (isFirst) {
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(root.x, root.y, 7, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.fillStyle = LABEL_COLOR[root.label];
        ctx.beginPath();
        ctx.arc(root.x, root.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        for (let c = 0; c < root.children.length; c++) {
            let child = root.children[c];
            drawLine(root.x, root.y, child.x, child.y);
            drawTree(child);
        }

    }
    for (let n = 0; n < 3; n++) {
        for (let i = 0; i < trees[n].length; i++) {
            let tree = trees[n][i];
            drawTree(tree, true);
        }
    }
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
            } else {
                MouseLogic.mouseOOB();
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
            if (collision != null && collision != MouseLogic.connectingFrom) {
                edges.push([MouseLogic.connectingFrom.parent, collision.parent, false]);
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

function clearTree() {
    MouseLogic.mouseOOB();
    nodes = [];
    edges = [];
    nodeColliders = [];
    labelColliders = [];
}

function resetTrees() {
    trees = [[],[],[]];
    clearTree();
}

function loop() {
    drawBackground();
    drawLines();
    drawNodes();
    drawLabelSelection();
    drawTrees();
    requestAnimationFrame(loop);
}

loop();