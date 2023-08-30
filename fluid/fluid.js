
class Fluid{
    constructor(size, iter, diff, visc, dt){
        this.N = size;
        this.iter = iter;
        this.dt = dt;
        this.diff = diff;
        this.visc = visc;

        this.s = new Array(this.N * this.N).fill(0.0);
        this.density = new Array(this.N * this.N).fill(0.0);

        this.Vx = new Array(this.N * this.N).fill(0.0);
        this.Vy = new Array(this.N * this.N).fill(0.0);

        this.Vx0 = new Array(this.N * this.N).fill(0.0);
        this.Vy0 = new Array(this.N * this.N).fill(0.0);
    }

    set_boundary(b, x){
        let N = this.N;

        // sides
        for(let i = 1; i < N - 1; i++){
            x[this.idx(i, 0  )] = b == 2 ? -x[this.idx(i, 1)] : x[this.idx(i, 1)];
            x[this.idx(i, N - 1)] = b == 2 ? -x[this.idx(i, N - 2)] : x[this.idx(i, N - 2)];
        }
        for(let j = 1; j < this.N - 1; j++){
            x[this.idx(0, j)] = b == 1 ? -x[this.idx(1, j)] : x[this.idx(1, j)];
            x[this.idx(N - 1, j)] = b == 1 ? -x[this.idx(N - 2, j)] : x[this.idx(N - 2, j)];
        }

        // corners
        x[this.idx(0, 0)] = 0.5 * (x[this.idx(1, 0)] + x[this.idx(0, 1)]);
        x[this.idx(0, N - 1)] = 0.5 * (x[this.idx(1, N - 1)] + x[this.idx(0, N - 2)]);
        x[this.idx(N - 1, 0)] = 0.5 * (x[this.idx(N - 2, 0)] + x[this.idx(N - 1, 1)]);
        x[this.idx(N - 1, N - 1)] = 0.5 * (x[this.idx(N - 2, N - 1)] + x[this.idx(N - 1, N - 2)]);
    }

    lin_solve(b, x, x0, a, c){
        let N = this.N;

        let cRecip = 1.0 / c;
        for(let k = 0; k < this.iter; k++){
            for(let j = 1; j < N - 1; j++){
                for(let i = 1; i < N - 1; i++){
                    x[this.idx(i, j)] = (
                        x0[this.idx(i, j)] + 
                        a * (
                            x[this.idx(i + 1, j)] + 
                            x[this.idx(i - 1, j)] + 
                            x[this.idx(i    , j + 1)] + 
                            x[this.idx(i    , j - 1)]
                            )
                        ) * cRecip;
                }
            }
            this.set_boundary(b, x);
        }
    }

    diffuse(b, x, x0, diff, dt){
        let a = dt * diff * (this.N - 2) * (this.N - 2);
        this.lin_solve(b, x, x0, a, 1 + 6 * a);
    }

    advect(b, d, d0, vx, vy, dt){
        let N = this.N;

        let i0, i1, j0, j1;

        let dtx = dt * (N - 2);
        let dty = dt * (N - 2);

        let s0, s1, t0, t1;
        let tmp1, tmp2, x, y;

        let Nfloat = N;
        let ifloat, jfloat;
        let i, j;

        for(j = 1, jfloat = 1; j < N - 1; j++, jfloat++){
            for(i = 1, ifloat = 1; i < N - 1; i++, ifloat++){
                tmp1 = dtx * vx[this.idx(i, j)];
                tmp2 = dty * vy[this.idx(i, j)];
                x = ifloat - tmp1;
                y = jfloat - tmp2;

                if(x < 0.5) x = 0.5;
                if(x > Nfloat + 0.5) x = Nfloat + 0.5;
                i0 = Math.floor(x);
                i1 = i0 + 1.0;
                if(y < 0.5) y = 0.5;
                if(y > Nfloat + 0.5) y = Nfloat + 0.5;
                j0 = Math.floor(y);
                j1 = j0 + 1.0;

                s1 = x - i0;
                s0 = 1.0 - s1;
                t1 = y - j0;
                t0 = 1.0 - t1;

                let i0i = parseInt(i0);
                let i1i = parseInt(i1);
                let j0i = parseInt(j0);
                let j1i = parseInt(j1);

                d[this.idx(i, j)] = (
                    s0 * (
                        t0 * d0[this.idx(i0i, j0i)] + 
                        t1 * d0[this.idx(i0i, j1i)]
                        ) + 
                    s1 * (
                        t0 * d0[this.idx(i1i, j0i)] + 
                        t1 * d0[this.idx(i1i, j1i)]
                        )
                    );
            }
        }
        this.set_boundary(b, d);
    }

    project(vx, vy, p, div){
        let N = this.N;

        for(let j = 1; j < N - 1; j++){
            for(let i = 1; i < N - 1; i++){
                div[this.idx(i, j)] = -0.5 * (
                    vx[this.idx(i + 1, j)] -
                    vx[this.idx(i - 1, j)] +
                    vy[this.idx(i, j + 1)] -
                    vy[this.idx(i, j - 1)]
                ) / N;
                p[this.idx(i, j)] = 0;
            }
        }
        this.set_boundary(0, div);
        this.set_boundary(0, p);
        this.lin_solve(0, p, div, 1, 4); // (0, p, div, 1, 4)?

        for(let j = 1; j < N - 1; j++){
            for(let i = 1; i < N - 1; i++){
                vx[this.idx(i, j)] -= 0.5 * (p[this.idx(i + 1, j)] - p[this.idx(i - 1, j)]) * N;
                vy[this.idx(i, j)] -= 0.5 * (p[this.idx(i, j + 1)] - p[this.idx(i, j - 1)]) * N;
            }
        }
        this.set_boundary(1, vx);
        this.set_boundary(2, vy);
    }

    step(){
        let N = this.N;
        let visc = this.visc;
        let diff = this.diff;
        let dt = this.dt;
        let Vx = this.Vx;
        let Vy = this.Vy;
        let Vx0 = this.Vx0;
        let Vy0 = this.Vy0;
        let s = this.s;
        let density = this.density;

        this.diffuse(1, Vx0, Vx, visc, dt);
        this.diffuse(2, Vy0, Vy, visc, dt);

        this.project(Vx0, Vy0, Vx, Vy);

        this.advect(1, Vx, Vx0, Vx0, Vy0, dt);
        this.advect(2, Vy, Vy0, Vx0, Vy0, dt);

        this.project(Vx, Vy, Vx0, Vy0);

        this.diffuse(0, s, density, diff, dt);
        this.advect(0, density, s, Vx, Vy, dt);
    }

    add_density(x, y, amount){
        let i = this.idx(x, y);
        this.density[i] += amount;
    }

    add_velocity(x, y, amountX, amountY){
        let i = this.idx(x, y);
        this.Vx[i] += amountX;
        this.Vy[i] += amountY;
    }

    get_density(x, y){
        let i = this.idx(x, y);
        return this.density[i];
    }

    get_velocity_x(x, y){
        let i = this.idx(x, y);
        return this.Vx[i];
    }

    get_velocity_y(x, y){
        let i = this.idx(x, y);
        return this.Vy[i];
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
let iter = 12;
let diff = 0.000001;
let visc = 0.000001;
let dt = 0.5;

let fluid = new Fluid(N, iter, diff, visc, dt);
fluid.step();

let cellSize = width / N;

function draw(){    
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
    for(let j = 1; j < N-1; j++){
        for(let i = 1; i < N-1; i++){
            let d = fluid.get_density(i, j);
            draw_cell(i, j, d);
        }
    }
}

function draw_cell(i, j, d){
    let x = i * cellSize;
    let y = j * cellSize;
    ctx.fillStyle = get_color(d);
    ctx.fillRect(x, y, cellSize, cellSize);
}

function get_color(d){
    let t = d >= 1.0 ? 1.0 : d <= 0.0 ? 0.0 : d;
    return `rgb(${255 * (d)}, 0, ${255 * (1-d)})`;
}

function loop(){
    fluid.step();
    draw();
    requestAnimationFrame(loop);
}

loop();

let mouseclick = false;
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function mouse_down(e){
    mouseclick = true;
}

let drag_x = 0;
let drag_y = 0;
let drag_button = 0;
function mouse_move(e){
    if(mouseclick){
        drag_button = e.button;
        let pos = getMousePos(canvas, e);
        let x = pos.x;
        let y = pos.y;
        let i = Math.floor(x / cellSize);
        let j = Math.floor(y / cellSize);
        fluid.add_density(i, j, 10 * (drag_button == 0 ? 1 : -1));
        fluid.add_velocity(i, j, (x - drag_x), (y - drag_y));
        drag_x = x;
        drag_y = y;
    }
}   

function mouse_up(e){
    mouseclick = false;
}
