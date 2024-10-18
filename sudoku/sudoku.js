let cells = document.querySelectorAll(".cell");
const message = document.getElementById("message");
const restart = document.getElementById("restart");
const next = document.getElementById("nextLevel");
const radios = document.getElementById("radio").children;

let board = [];
let size = 1;
let difficulty = 0.66;

let hue = 187;


function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = +clickedCell.getAttribute('cell-index');

    if (event.button === 2) {
        board[clickedCellIndex] = 0;
    }
    else {
        board[clickedCellIndex] = board[clickedCellIndex] % size + 1;
    }

    const clickedCellString = board[clickedCellIndex];
    clickedCell.textContent = clickedCellString ? clickedCellString : '';

    if (checkResult()) {
        message.classList.add("anim");
        next.disabled = false;
    }

    hue += 5;
    document.body.style.backgroundColor = `hsl(${hue}, 51.9%, 79.6%)`;

}

function restartGame() {

    if (document.getElementById('n1').checked) size = 1;
    else if (document.getElementById('n2').checked) size = 2;
    else if (document.getElementById('n4').checked) size = 4;
    else if (document.getElementById('n9').checked) size = 9;
    else if (document.getElementById('n16').checked) size = 16;
        
    assembleHTML();

    board = Array(size*size).fill(0);

    generateSolution();

    blackout();

    updateCells();
    
    message.classList.remove("anim");
    next.disabled = true;

    function assembleHTML() {
        const htmlBoard = document.getElementById("board");
        htmlBoard.textContent = "";
        htmlBoard.style.gridTemplateColumns = `repeat(${size}, ${400/size}px)`;
        for (let htmlCellIndex = 0; htmlCellIndex < size*size; htmlCellIndex++){
            const htmlCell = document.createElement("div");
            htmlCell.className = "cell";
            htmlCell.setAttribute("cell-index", htmlCellIndex);
            htmlCell.style.width = 400/size + "px";
            htmlCell.style.height = 400/size + "px";
            htmlCell.style.fontSize = 256/size + "px";

            const n = size;
            const m = Math.floor(Math.sqrt(n));
            const idx = Math.floor((htmlCellIndex % n) / m) + m * Math.floor(htmlCellIndex / (n * m));

            const color = `hsl(${Math.floor(360*5*(idx-1)/size + 180)}, 50%, 70%)`

            htmlCell.style.backgroundColor = color;
            htmlCell.setAttribute("color", color);
            
            htmlBoard.appendChild(htmlCell);
        }
    
        cells = document.querySelectorAll(".cell");
    
        cells.forEach(cell => {
            cell.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); handleCellClick(e); }
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('mouseover', ()=>{cell.style.backgroundColor = "#ffffff"});
            cell.addEventListener('mouseout', ()=>{cell.style.backgroundColor = cell.getAttribute("color")});
        });
    }
    
    function generateSolution() {
        const n = size;
        const numbers = Array.from({length:n}, (v,k)=>k+1);
    
        let counter = 0;
        
        while(!solveBoard(0)){
            board.fill(0, 0, board.length);
            counter = 0;
        }
    
        function solveBoard(idx) {
            if (counter++ >= size*size*10) return false;
            if (idx >= n*n) return true;
    
            if(board[idx] !== 0) {
                return solveBoard(idx + 1);
            }
    
            for (let num of fisherYatesShuffle(numbers)) {
                if(isValid(idx, num)) {
                    board[idx] = num;
    
                    if(solveBoard(idx + 1)) {
                        return true;
                    }
    
                    board[idx] = 0;
                }
            }
            return false;
        }
    
        function isValid(idx, num) {
            return (
                !getRow(idx).includes(num) &&
                !getColumn(idx).includes(num) &&
                !getArea(idx).includes(num)
            );
        }
    
    }
    
    function blackout() {
        const n = size;
        for (let p = 0; p < Math.round(difficulty*n*n); p++) {
            const x = Math.floor(Math.random()*n);
            const y = Math.floor(Math.random()*n);
            
            const z = board[x + y*n];
            if (z === 0) p--;
            
            board[x + y*n] = 0;
        }
    }
    
    function updateCells() {
        for (let q = 0; q < cells.length; q++){
            
            const cell = cells[q];
            const cellIndex = +cell.getAttribute('cell-index');

            if (board[cellIndex] !== 0) {
                cell.textContent = board[cellIndex];
                cell.classList.add("pre");
            } else {
                cell.textContent = '';
                cell.classList.remove("pre");
            }
        }
    
    }

}

function nextLevel() {
    let selectedButton = Array.from(radios).filter((v)=>v.checked)[0];
    switch(selectedButton.id) {
        case "n1": radios[1].checked = true;
        break
        case "n2": radios[2].checked = true;
        break
        case "n4": radios[3].checked = true;
        break
        case "n9": radios[4].checked = true;
        break
        case "n16":
            message.innerText = "🎉";
        break
    }
    restartGame();
}

function checkResult() {

    const check = (lst) => {
        const row = new Set(lst);
        const zero = new Set([0]);
        return row.difference(zero).size === size;
    }

    for (let x = 0; x < size; x++) {
        if (!check(getRow(x))) return false;
    }
    for (let y = 0; y < size; y++) {
        if (!check(getColumn(y))) return false;
    }
    return true;
}

function getRow(i) {
    const n = size;
    const idx = n * Math.floor(i / n);
    return board.slice(idx, idx + n);
}

function getColumn(i) {
    const n = size;
    const idx = i % n;
    return Array.from({ length: n }, (_, e) => (board[idx + n * e]));
}

function getArea(i) {
    const n = size;
    const m = Math.floor(Math.sqrt(n));
    const idx = Math.floor((i % n) / m) + m * Math.floor(i / (n * m));
    const c = m * (idx % m);
    const r = m * Math.floor(idx / m);
    let rv = [];
    for (let x = 0; x < m; x++) {
        for (let y = 0; y < m; y++) {
            rv.push(board[(r + x) * n + (c + y)]);
        }
    }
    return rv;
}

function fisherYatesShuffle(lst) {
    let a = lst.slice();
    for (let i = a.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * a.length);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}


restart.addEventListener('click', restartGame);
next.addEventListener('click', nextLevel);
for (let radioButton of radios) {
    radioButton.addEventListener('click', restartGame);
}

restartGame();