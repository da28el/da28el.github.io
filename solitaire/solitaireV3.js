const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

const SUIT_SYMBOL = [
    "♥",        // 0
    "♦",        // 1
    "♣",        // 2
    "♠",        // 3
];

const VALUE_SYMBOL = [
    "Ace",      // 0
    "2",        // 1
    "3",        // 2
    "4",        // 3
    "5",        // 4
    "6",        // 5
    "7",        // 6
    "8",        // 7
    "9",        // 8
    "10",       // 9
    "Jack",     // 10
    "Queen",    // 11
    "King",     // 12
];


const CARD = (suit, value, visible = 1) => {
    return suit * 13 + value + visible * 52;
}

const SUIT = (card) => {
    if (card > 51) return SUIT(card - 52);
    return Math.floor(card / 13);
}
const VALUE = (card) => {
    return card % 13;
}
const VISIBLE = (card) => {
    return Math.floor(card / 52);
}
const SET_VISIBLE = (card, visible) => {
    return card % 52 + visible * 52;
}


function paint_card(card, x, y) {
    const outline = (x, y, color) => {
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(x, y, 140, 200);
        ctx.fillStyle = color;
        ctx.fillRect(x + 4, y + 4, 132, 192);
    };
    if (card === null) {
        outline(x, y, "rgb(127, 127, 127)");
        return;
    }
    if (VISIBLE(card) === 0){
        outline(x, y, "rgb(63, 63, 127)");
        return;
    } 
    else 
        outline(x, y, "rgb(255, 255, 255)");
    
    const suit = SUIT(card);
    const value = VALUE(card);

    if(suit < 2)
        ctx.fillStyle = "rgb(255, 0, 0)";    
    else
        ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.font = "42px Arial";
    ctx.fillText(SUIT_SYMBOL[suit], x + 55, y + 105);
    ctx.font = "22px Arial";
    ctx.fillText(VALUE_SYMBOL[value], x + 10, y + 28);
    ctx.fillText(VALUE_SYMBOL[value], x + 120-value.length*11, y + 1900);
}

const BOX = (card, x, y, z) => {
    return {
        card: card,
        x: x,
        y: y,
        z: z,
    };
};

const BOX_CONTAINS = (box, x, y) => {
    return x >= box.x && x < box.x + 140 && y >= box.y && y < box.y + 200;
}

function paint() {
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(0,0,width,height);

    paint_card(null, 20, 20);
    paint_card(null, 170, 20);
    paint_card(null, 320, 20);
    paint_card(null, 470, 20);
    paint_card(null, 620, 20);
    paint_card(null, 770, 20);
    paint_card(null, 920, 20);

    paint_card(null, 470, 500);
    paint_card(null, 620, 500);
    paint_card(null, 770, 500);
    paint_card(null, 920, 500);

    paint_card(null, 20, 500);
    paint_card(null, 170, 500);

    for (let box of boxes) {
        paint_card(box.card, box.x, box.y);
    }
}

// take a deck
let deck = [];
for (let suit = 0; suit < 4; suit++)
    for (let value = 0; value < 13; value++)
        deck.push(CARD(suit, value, 0));

// shuffle it around
let m = deck.length, t, i;
while (m) {
    i = Math.floor(Math.random() * m--);
    t = deck[m];
    deck[m] = deck[i];
    deck[i] = t;
}


let z = 1;
// and deal out the cards
let boxes = [];
for (let i = 0; i < 7; i++)
    for (let j = 0; j <= i; j++)
        if (i === j)
            boxes.push(BOX(SET_VISIBLE(deck.pop(), 1), 20 + 150 * i, 20 + 30 * j, z++));
        else
            boxes.push(BOX(deck.pop(), 20 + 150 * i, 20 + 30 * j, z++));
for (let i = 0; i < deck.length; i++)
    boxes.push(BOX(deck[i], 20, 500, z++));
paint();

// mouse handling
let mousePressed = false;
let selected = -1;
let sx = 0;
let sy = 0;

function flipSelectedBox() {
    if (selected === -1) return;
    let box = boxes[selected];
    box.card = SET_VISIBLE(box.card, 1 - VISIBLE(box.card));
}

function zsortSelected() {
    if (selected === -1) return;
    let box = boxes[selected];
    box.z = z++;
    selected = boxes.length - 1;
    boxes.sort((a, b) => a.z - b.z);
}

function moveBox(idx, dx, dy) {
    let box = boxes[idx];
    box.x += dx;
    box.y += dy;
    paint();
}

function flipDrawPile() {
    for (let i = 0; i < 52; i++) {
        let zmax = -1;
        let idx = -1;
        for(let j = 0; j < boxes.length; j++) {
            let box = boxes[j];
            if (BOX_CONTAINS(box, 240, 600)) {
                if (box.z > zmax) {
                    zmax = box.z;
                    idx = j;
                }
            }
        }
        if (idx !== -1) {
            selected = idx;
            flipSelectedBox();
            zsortSelected();
            boxes[selected].x = 20;
            boxes[selected].y = 500;
            selected = -1;
        }
    }
    paint();
}

function mouseDown(event) {
    if (event.button === 2 && selected !== -1) {
        flipSelectedBox();
        zsortSelected();
        paint();
        return;
    }
    if (event.button !== 0) return;
    mousePressed = true;
    if (selected === -1){
        let zsort = -1;
        for (let i = 0; i < boxes.length; i++) {
            let box = boxes[i];
            let rect = canvas.getBoundingClientRect();
            let xm = event.clientX - rect.left;
            let ym = event.clientY - rect.top;
            if(BOX_CONTAINS(box, xm, ym) && box.z > zsort) {
                selected = i;
                zsort = box.z;
            }
        }
    }
}

let autowin = true;
async function mouseUp(event) {
    if (event.button !== 0) return;
    
    selected = -1;
    mousePressed = false;
    sx = 0;
    sy = 0;

    let allVisible = true;
    for (let i = 0; i < boxes.length; i++) {
        let box = boxes[i];
        if (VISIBLE(box.card)) continue;
        allVisible = false;
        let show = true;
        for (let j = 0; j < boxes.length; j++) {
            if (i === j) continue;
            let other = boxes[j];
            if (BOX_CONTAINS(other, box.x + 70, box.y + 100) && other.z > box.z) {
                show = false;
                break;
            }
        }
        if (show) {
            box.card = SET_VISIBLE(box.card, 1);
        }
    }
    if (allVisible || autowin) {
        boxes.sort((a, b) => a.card - b.card);
        //for (let i = 0; i < boxes.length; i++) {
        //    boxes[i].z = z++;
        //}
        let aceOfHearts = 0;
        let aceOfDiamonds = 13;
        let aceOfClubs = 26;
        let aceOfSpades = 39;
        for(let i = 0; i < 52; i++) {
            let targetX, targetY;
            if (i < aceOfDiamonds) {
                targetX = boxes[aceOfHearts].x;
                targetY = boxes[aceOfHearts].y;
            }
            else if (i < aceOfClubs) {
                targetX = boxes[aceOfDiamonds].x;
                targetY = boxes[aceOfDiamonds].y;
            }
            else if (i < aceOfSpades) {
                targetX = boxes[aceOfClubs].x;
                targetY = boxes[aceOfClubs].y;
            }
            else {
                targetX = boxes[aceOfSpades].x;
                targetY = boxes[aceOfSpades].y;
            }
            let box = boxes[i];
            let dx = targetX - box.x;
            let dy = targetY - box.y;
            for(let j = 0; j < 10; j++) {
                await new Promise(r => setTimeout(r, 1));
                boxes[i].x += dx/10;
                boxes[i].y += dy/10;
                paint();
            }
            boxes[i].x = targetX;
            boxes[i].y = targetY;
        }
    }
    paint();
}

function mouseMove(event) {
    if (selected !== -1) {
        let stack = [selected];

        for (let i = 0; i < boxes.length; i++) {
            if (i === selected) continue;
            let box = boxes[i];
            if (BOX_CONTAINS(box, boxes[selected].x + 70, boxes[selected].y + 200) && box.z > boxes[selected].z) {
                stack.push(i);
            }
        }

        for (let i = 0; i < stack.length; i++) {
            moveBox(stack[i], event.movementX, event.movementY);
        }
        
        sx += event.movementX;
        sy += event.movementY;
        if (sx * sx + sy * sy > 1000) {
            for (let i = 0; i < stack.length; i++) {
                boxes[stack[i]].z = z++;
                selected = boxes.length - stack.length;
            }
            boxes.sort((a, b) => a.z - b.z);
        }
        paint();
    }
}
