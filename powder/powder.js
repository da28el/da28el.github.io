const MATERIAL = {
    AIR: {
        color: 'rgb(0, 0, 0)',
        behavior: 'none'
    },
    SAND: {
        color: 'rgb(191, 191, 64)', // yellow with reduced saturation
        behavior: 'fall'
    },
    WATER: {
        color: 'rgb(0, 0, 191)', // blue with reduced saturation
        behavior: 'flow'
    },
    FIRE: {
        color: 'rgb(191, 64, 64)', // red with reduced saturation
        behavior: 'burn'
    },
    WOOD: {
        color: 'rgb(139, 87, 55)', // brown with reduced saturation
        behavior: 'solid'
    },
    STONE: {
        color: 'rgb(128, 128, 128)', // gray (unchanged)
        behavior: 'solid'
    },
    OIL: {
        color: 'rgb(64, 64, 64)', // black with reduced saturation
        behavior: 'flow'
    },
    ACID: {
        color: 'rgb(0, 191, 0)', // green with reduced saturation
        behavior: 'corrode'
    },
    STEAM: {
        color: 'rgb(191, 191, 191)', // white with reduced saturation
        behavior: 'rise'
    },
    LAVA: {
        color: 'rgb(191, 87, 0)', // orange with reduced saturation
        behavior: 'burn'
    },
    PLANT: {
        color: 'rgb(0, 96, 0)', // green with reduced saturation
        behavior: 'grow'
    },
    GUNPOWDER: {
        color: 'rgb(127, 127, 127)', // dark gray with reduced saturation
        behavior: 'explode'
    },
    ICE: {
        color: 'rgb(173, 204, 230)', // light blue with reduced saturation
        behavior: 'solid'
    }
};

class Grid {
    constructor(size, dt) {
        this.N = size;
        this.dt = dt;
        this.grid = new Array(this.N*this.N).fill(MATERIAL.AIR);
        this.data = new Array(this.N*this.N).fill(0);
        this.time = new Array(this.N*this.N).fill(0);
        this.tick = 0; 
    }

    step() {
        let N = this.N;
        let dt = this.dt;
        let tick = this.tick;

        for (let y = N - 1; y >= 0; y--) {
            for (let x = 0; x < N; x++) {
                let index = this.idx(x, y);
                let material = this.grid[index];

                if(material === MATERIAL.AIR || this.time[index] > tick) {
                    continue;
                }
                this.time[index] = tick;

                // Determine the behavior of the material
                switch (material.behavior) {
                    case 'fall':
                        // Handle falling behavior (e.g., sand)
                        if(y < N - 1 && this.grid[index + N] === MATERIAL.AIR) {
                            this.swap(x, y, x, y + 1);
                        }   
                        break;
                    case 'flow':
                        const rand = Math.floor(Math.random() * 3) - 1;
                        if(y < N - 1 && this.grid[index + N] === MATERIAL.AIR) {
                            this.swap(x, y, x, y + 1);
                        }
                        else if(x < N - 1 && rand == 1 && this.grid[index + 1] === MATERIAL.AIR) {
                            this.swap(x, y, x + 1, y);
                        }
                        else if(x > 0 && rand == -1 && this.grid[index - 1] === MATERIAL.AIR) {
                            this.swap(x, y, x - 1, y);
                        }
                        break;
                    case 'rise':
                        // Handle rising behavior (e.g., steam)
                        if(y > 0 && this.grid[index - N] === MATERIAL.AIR) {
                            newGrid[index - N] = material;
                            newGrid[index] = MATERIAL.AIR;
                        } else {
                            newGrid[index] = material;
                        }
                        break;
                    case 'burn':
                        // Handle burning behavior (e.g., fire)
                        // (Implement burning logic here)
                        newGrid[index] = material;
                        break;
                    // Add more cases for other behaviors
                    default:
                        break;
                }
            }
        }
    }

    swap(x0, y0, x1, y1) {
        let material = this.grid[this.idx(x0, y0)];
        let data = this.data[this.idx(x0, y0)];
        let time = this.time[this.idx(x0, y0)];
        this.grid[this.idx(x0, y0)] = this.grid[this.idx(x1, y1)];
        this.data[this.idx(x0, y0)] = this.data[this.idx(x1, y1)];
        this.time[this.idx(x0, y0)] = this.time[this.idx(x1, y1)];
        this.data[this.idx(x1, y1)] = data;
        this.grid[this.idx(x1, y1)] = material;
        this.time[this.idx(x1, y1)] = time;
    }

    add_material(x, y, amount, material) {
        let i = this.idx(x, y);
        this.grid[i] = material;
    }

    get_material(x, y) {
        return this.grid[this.idx(x, y)];
    }
    
    idx(i, j){
        let N = this.N;
        if(i < 0) i = 0;
        if(j < 0) j = 0;
        if(i > N - 1) i = N - 1;
        if(j > N - 1) j = N - 1;
        return i + N * j;
    }
}

let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
let width = canvas.width;
let height = canvas.height;

let N = 96;
let dt = 1;

let grid = new Grid(N, dt);

const materialSize = width / N;

function draw(){
    for(let j = 0; j < N; j++){
        for(let i = 0; i < N; i++){
            let m = grid.get_material(i, j);
            draw_material(i, j, m);
        }
    }
}

function draw_material(i, j, m){
    let x = i * materialSize;
    let y = j * materialSize;
    ctx.fillStyle = m.color;
    ctx.fillRect(x, y, materialSize, materialSize);
}

function loop(){
    grid.step();
    draw();
    requestAnimationFrame(loop);
}

loop();


let drag_button = -1;
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function mouse_down(e){
    drag_button = e.button;
}

let drag_x = 0;
let drag_y = 0;
function mouse_move(e){
    if(drag_button < 0) {
        return;
    }
    else if(drag_button == 0){
        let pos = getMousePos(canvas, e);
        let x = pos.x;
        let y = pos.y;
        let i = Math.floor(pos.x / materialSize);
        let j = Math.floor(pos.y / materialSize);
        grid.add_material(i, j, 10, MATERIAL.WATER);
        drag_x = x;
        drag_y = y;
    }
    else {
        let pos = getMousePos(canvas, e);
        let x = Math.floor(pos.x / materialSize);
        let y = Math.floor(pos.y / materialSize);
        for(let i = -1; i <= 1; i++) {
            for(let j = -1; j <= 1; j++) {

                // drag_button == 1 ? fluid.clear_obstacle(x + i, y + j) : fluid.set_obstacle(x + i, y + j);
            }
        }
    }
}   

function mouse_up(e){
    drag_button = -1;
}