class vec2{
    x:number;
    y:number;
    constructor(x:number = 0, y:number = 0){
        this.x = x;
        this.y = y;
    }
    set(x:number, y:number):vec2 {
        this.x = x;
        this.y = y;
        return this;
    }
    length():number{
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    add(v:vec2){
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    static add(v1:vec2, v2:vec2){
        return new vec2(v1.x+v2.x, v1.y+v2.y);
    }
    sub(v:vec2){
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    static sub(v1:vec2, v2:vec2){
        return new vec2(v1.x-v2.x, v1.y-v2.y);
    }
    scale(s:number){
        this.x *= s;
        this.y *= s;
        return this;
    }
    static scale(v:vec2, s:number){
        return new vec2(v.x*s, v.y*s);
    }
    copy = () => {return new vec2(this.x, this.y);}
    str = () => {return `(${this.x},${this.y})`;}
}

class body{
    pos:vec2;
    vel:vec2;
    force:vec2;
    mass:number;
    color:string;
    constructor(p:vec2, v:vec2, m:number, c:string){
        this.pos = p;
        this.vel = v;
        this.force = new vec2();
        this.mass = m;
        this.color = c;
    }
    update(dt:number){
        this.vel.add(vec2.scale(this.force, dt));
        this.pos.add(vec2.scale(this.vel, dt/this.mass));
        this.force.set(0,0);
    }
    draw(){
        ctx1.beginPath();
        ctx1.fillStyle = this.color;
        ctx1.arc(this.pos.x+xoffset1, this.pos.y+yoffset1, this.mass, 0, 2*Math.PI);
        ctx1.fill();
        
        ctx2.beginPath();
        ctx2.fillStyle = this.color;
        ctx2.arc(this.pos.x+xoffset2, yoffset2, this.mass, 0, 2*Math.PI);
        ctx2.fill();
    }
}

// Kraft på b1 från b2
let G:number = 1;
function Fg(b1:body, b2:body):vec2{
    let R:vec2 = vec2.sub(b2.pos, b1.pos);
    let r:number = R.length();
    return R.scale(G * b1.mass * b2.mass / (r*r));
}

const canvas1 = document.getElementById("left") as HTMLCanvasElement;
const ctx1 = canvas1.getContext("2d") as CanvasRenderingContext2D;

const canvas2 = document.getElementById("right") as HTMLCanvasElement;
const ctx2 = canvas2.getContext("2d") as CanvasRenderingContext2D;

const width1 = canvas1.width;// = window.innerWidth;
const height1 = canvas1.height;// = window.innerHeight;
const width2 = canvas2.width;// = window.innerWidth;
const height2 = canvas2.height;// = window.innerHeight;

const xoffset1 = width1/2;
const yoffset1 = height1/2;
const xoffset2 = width2/2;
const yoffset2 = height2/2;

const dt = 0.1;
let time = 0.0;

let bodies:body[] = [];
let traces:vec2[] = [];
let traceT:number[] = [];

function paintBackground(){
    ctx1.fillStyle = "#000000";
    ctx1.fillRect(0,0,width1,height1);
    ctx2.fillStyle = "#000000";
    ctx2.fillRect(0,0,width1,height1);
}
function paintBodies(){
    for(let i = 0; i < bodies.length; i++){
        bodies[i].draw();
    }
}
function init(){
    bodies = [];
    traces = [];
    traceT = [];
    
    let earth = new body(new vec2(), new vec2(), 100, '#1AA7EC');
    let moon = new body(new vec2(200, 0), new vec2(0, 200), 20, '#808080')
    let asteroid = new body(new vec2(240, 0), new vec2(0, 25), 5,'#393939');
    
    bodies.push(earth);
    bodies.push(moon);
    bodies.push(asteroid);
    
    paintBackground();
    paintBodies();
}

let af = -1;
function start(){
    if(af == -1)
        loop();
    else{
        cancelAnimationFrame(af);
        init();
        loop();
    }
}

function loop(){
    paintBackground();
    let sorted = bodies.slice();
    sorted.sort((n1:body, n2:body) => {if(n1.pos.y > n2.pos.y) return 1; else return -1; return 0;});
    for(let i = 0; i < traces.length; i++){
        ctx1.fillStyle = '#ffffff';
        ctx1.fillRect(traces[i].x+xoffset1, traces[i].y+yoffset1, 1, 1);
        ctx2.fillStyle = '#ffffff';
        ctx2.fillRect(traces[i].x+xoffset1, 10*(time-traceT[i])+yoffset1, 1, 1)
    }
    for(let i = 0; i < bodies.length; i++){
        sorted[i].draw();
        for(let j = 0; j < bodies.length; j++){
            if(i == j) break;
            let f = Fg(bodies[i], bodies[j])
            bodies[i].force.add(f);
        }
    }
    for(let i = 0; i < bodies.length; i++){
        bodies[i].update(dt);
        traces.push(bodies[i].pos.copy());
        traceT.push(time);
    }
    af = requestAnimationFrame(loop);
    time += dt;
}

const G_in = document.getElementById("G_in") as HTMLInputElement;
const G_ut = document.getElementById("G_ut") as HTMLParagraphElement;
function updateInput(){
    G = +G_in.value;
    G_ut.innerHTML = "G: " + G;
}

init();