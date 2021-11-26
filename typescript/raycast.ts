// Objects
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
    str():string{
        return `(${this.x}, ${this.y}) - |${this.length()}|`
    }

    copy(){
        return new vec2(this.x, this.y);
    }

    static add(v1:vec2, v2:vec2):vec2{
        return new vec2(v1.x+v2.x, v1.y+v2.y);
    }

    static sub(v1:vec2, v2:vec2):vec2{
        return new vec2(v1.x-v2.x, v1.y-v2.y);
    }

    static normal(v:vec2){
        return new vec2(v.x/v.length(), v.y/v.length());
    }

    static scale(v:vec2, s:number):vec2{
        return new vec2(v.x*s, v.y*s);
    }

    static fromAngle(theta:number):vec2{
        theta *= Math.PI/180;
        return new vec2(Math.cos(theta), Math.sin(theta));
    }
}

class boundry{
    p1:vec2;
    p2:vec2;
    constructor(v1:vec2, v2:vec2){
        this.p1 = v1; this.p2 = v2;
    }
}

class ray{
    pos:vec2;
    dir:vec2;
    static max_dist:number = 1500;
    constructor(p:vec2, d:vec2){
        this.pos = p; this.dir = d;
    }
    collision(b:boundry):vec2{
        let x1 = this.pos.x;
        let y1 = this.pos.y;
        let x2 = this.dir.x * ray.max_dist;
        let y2 = this.dir.y * ray.max_dist;
        let x3 = b.p1.x;
        let y3 = b.p1.y;
        let x4 = b.p2.x;
        let y4 = b.p2.y;

        let d = (x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
        if(d == 0)
            return new vec2(0,0);
        let t = (x1-x3)*(y3-y4)-(y1-y3)*(x3-x4);
        let u = (x2-x1)*(y1-y3)-(y2-y1)*(x1-x3);

        t /= d;
        u /= d;

        if(u > 0 && u < 1 && t > 0 && t < 1)
            return new vec2(x3 + u*(x4-x3), y3 + u*(y4-y3));

        return vec2.scale(this.dir, ray.max_dist);
    }
}

class source{
    pos:vec2;
    dir:vec2;
    rays = [];
    constructor(p:vec2){
        this.pos = p;
        this.dir = new vec2();
    }
    cast(n:number){
        const a = Math.round(360/n);
        for(let i = 0; i < n; i++)
            this.rays.push(new ray(this.pos, vec2.fromAngle(a*i)));
    }
}

// DOM
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let raycount = document.getElementById("range") as HTMLInputElement;

const width = canvas.width;// = window.innerWidth;
const height = canvas.height;// = window.innerHeight;

let s = new source(new vec2(width/2, height/2));
let boundries = [];
// Edge boundries
boundries.push(new boundry(new vec2(0,0), new vec2(width,0)));
boundries.push(new boundry(new vec2(0,0), new vec2(0,height)));
boundries.push(new boundry(new vec2(width,0), new vec2(width,height)));
boundries.push(new boundry(new vec2(0,height), new vec2(width,height)));

function paint(){
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0,0,width,height);
    s.rays = [];
    s.cast(+raycount.value);
    
    for(let j = 0; j < boundries.length; j++){
        ctx.strokeStyle = 'rgb(255,0,0)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(boundries[j].p1.x, boundries[j].p1.y);
        ctx.lineTo(boundries[j].p2.x, boundries[j].p2.y);
        ctx.stroke();
    }

    for(let i = 0; i < s.rays.length; i++){
        let nearest = vec2.scale(new vec2(2,2),ray.max_dist+1);
        for(let j = 0; j < boundries.length; j++){
            let z:vec2 = s.rays[i].collision(boundries[j]);
            if(vec2.sub(s.pos, z).length() < vec2.sub(s.pos, nearest).length())
                nearest = z;
        }
        ctx.strokeStyle = 'rgb(255,255,255)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.rays[i].pos.x, s.rays[i].pos.y);
        ctx.lineTo(nearest.x, nearest.y);
        ctx.stroke();
    
    }
}

const drawLine = (x1:number, y1:number, x2:number, y2:number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}


function moveSource(evt){
    var pos = getMousePos(canvas, evt);
    s.pos.x = pos.x;
    s.pos.y = pos.y;
    paint();
}

let bp1:vec2 = new vec2();
function startBoundry(evt){
    let pos = getMousePos(canvas, evt);
    bp1.set(pos.x, pos.y);
}
function endBoundry(evt){
    let pos = getMousePos(canvas, evt);
    boundries.push(new boundry(bp1.copy(), new vec2(pos.x, pos.y)))
}

paint();