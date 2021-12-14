class vec3{
    x:number;
    y:number;
    z:number;
    constructor(x:number, y:number, z:number){
        this.x = x; this.y = y; this.z = z;
    }
    copy():vec3{
        return new vec3(this.x, this.y, this.z);
    }
}

class triangle{
    p:vec3[];
    constructor(p){
        this.p = p;
    }
    copy(){
        let r = [];
        for(let v of this.p)
            r.push(v.copy());
        return r;
    }
}

class mesh{
    tris:triangle[] = [];
}

class mat4{
    m:number[][];
    constructor(){   
        this.m = [
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
        ];
    }
        
    f(i:vec3):vec3{
        let x = i.x * this.m[0][0] + i.y * this.m[1][0] + i.z * this.m[2][0] + this.m[3][0];
        let y = i.x * this.m[0][1] + i.y * this.m[1][1] + i.z * this.m[2][1] + this.m[3][1];
        let z = i.x * this.m[0][2] + i.y * this.m[1][2] + i.z * this.m[2][2] + this.m[3][2];
        let w = i.x * this.m[0][3] + i.y * this.m[1][3] + i.z * this.m[2][3] + this.m[3][3];
        if(w != 0){
            x /= w; y /= w; z /= w;
        }
        return new vec3(x, y, z);
    }
}

// Rendering
//----------
const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const width = canvas.width;
const height = canvas.height;

function drawTriangle(x1, y1, x2, y2, x3, y3, c){
    const drawLine = (x1, y1, x2, y2) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    ctx.strokeStyle = c;
    drawLine(x1, y1, x2, y2);
    drawLine(x2, y2, x3, y3);
    drawLine(x3, y3, x1, y1);
}

// Setup
//------

// Meshcube
const meshCube:mesh = new mesh();
meshCube.tris = [
    // S
    new triangle([new vec3(0,0,0), new vec3(0,1,0), new vec3(1,1,0)]),
    new triangle([new vec3(0,0,0), new vec3(1,1,0), new vec3(1,0,0)]),
    // E
    new triangle([new vec3(1,0,0), new vec3(1,1,0), new vec3(1,1,1)]),
    new triangle([new vec3(1,0,0), new vec3(1,1,1), new vec3(1,0,1)]),
    // N
    new triangle([new vec3(1,0,1), new vec3(1,1,1), new vec3(0,1,1)]),
    new triangle([new vec3(1,0,1), new vec3(0,1,1), new vec3(0,0,1)]),
    // W
    new triangle([new vec3(0,0,1), new vec3(0,1,1), new vec3(0,1,0)]),
    new triangle([new vec3(0,0,1), new vec3(0,1,0), new vec3(0,0,0)]),
    // T
    new triangle([new vec3(0,1,0), new vec3(0,1,1), new vec3(1,1,1)]),
    new triangle([new vec3(0,1,0), new vec3(1,1,1), new vec3(1,1,0)]),
    // B
    new triangle([new vec3(1,0,1), new vec3(0,0,1), new vec3(0,0,0)]),
    new triangle([new vec3(1,0,1), new vec3(0,0,0), new vec3(1,0,0)]),
];

// Projection matrix properties
let near = 0.1;
let far = 1000;
let fov = 90;
let aRatio = width/height;
let fovRad = 1 / Math.tan(fov/360 * Math.PI);
// Projection matrix
let projMat = new mat4();
projMat.m[0][0] = aRatio * fovRad;
projMat.m[1][1] = fovRad;
projMat.m[2][2] = far/(far - near);
projMat.m[3][2] = -(far * near)/(far - near);
projMat.m[2][3] = 1;
projMat.m[3][3] = 0;


// Controlls
let tspd = document.getElementById("tspd") as HTMLInputElement;
let xspd = document.getElementById("xspd") as HTMLInputElement;
let yspd = document.getElementById("yspd") as HTMLInputElement;
let zspd = document.getElementById("zspd") as HTMLInputElement;

let theta = 0;
function loop(){
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,width,height);

    // Rotation
    let speed = +tspd.value;
    let xspeed = +xspd.value;
    let yspeed = +yspd.value;
    let zspeed = +zspd.value;
    let rotXmat = new mat4();
    let rotYmat = new mat4();
    let rotZmat = new mat4();
    theta += speed;
    // Rot-x
    rotXmat.m[0][0] = 1;
    rotXmat.m[1][1] = Math.cos(theta*xspeed);
    rotXmat.m[1][2] = Math.sin(theta*xspeed);
    rotXmat.m[2][1] = Math.sin(-theta*xspeed);
    rotXmat.m[2][2] = Math.cos(theta*xspeed);
    rotXmat.m[3][3] = 1;
    // Rot-y
    rotYmat.m[0][0] = Math.cos(theta*yspeed);
    rotYmat.m[0][2] = Math.sin(theta*yspeed);
    rotYmat.m[1][1] = 1;
    rotYmat.m[2][0] = Math.sin(-theta*yspeed);
    rotYmat.m[2][2] = Math.cos(theta*yspeed);
    rotYmat.m[3][3] = 1;
    // Rot-z
    rotZmat.m[0][0] = Math.cos(theta*zspeed);
    rotZmat.m[0][1] = Math.sin(theta*zspeed);
    rotZmat.m[1][0] = Math.sin(-theta*zspeed);
    rotZmat.m[1][1] = Math.cos(theta*zspeed);
    rotZmat.m[2][2] = 1;
    rotZmat.m[3][3] = 1;
    
    // Draw triangles
    for(let tri of meshCube.tris){
        
        let triRotated:triangle = new triangle(tri.copy());
        triRotated.p[0] = rotXmat.f(triRotated.p[0]);
        triRotated.p[1] = rotXmat.f(triRotated.p[1]);
        triRotated.p[2] = rotXmat.f(triRotated.p[2]);
        triRotated.p[0] = rotYmat.f(triRotated.p[0]);
        triRotated.p[1] = rotYmat.f(triRotated.p[1]);
        triRotated.p[2] = rotYmat.f(triRotated.p[2]);
        triRotated.p[0] = rotZmat.f(triRotated.p[0]);
        triRotated.p[1] = rotZmat.f(triRotated.p[1]);
        triRotated.p[2] = rotZmat.f(triRotated.p[2]);


        let triTranslated:triangle = new triangle(triRotated.copy());
        triTranslated.p[0].z = triRotated.p[0].z + 3;
        triTranslated.p[1].z = triRotated.p[1].z + 3;
        triTranslated.p[2].z = triRotated.p[2].z + 3;
        

        let triProjected:triangle = new triangle([
            projMat.f(triTranslated.p[0]),
            projMat.f(triTranslated.p[1]),
            projMat.f(triTranslated.p[2]),    
        ]);

        // Scale
        triProjected.p[0].x += 1; triProjected.p[0].y += 1;
        triProjected.p[1].x += 1; triProjected.p[1].y += 1;
        triProjected.p[2].x += 1; triProjected.p[2].y += 1; 

        triProjected.p[0].x *= 0.5 * width;
        triProjected.p[0].y *= 0.5 * height;
        triProjected.p[1].x *= 0.5 * width;
        triProjected.p[1].y *= 0.5 * height;
        triProjected.p[2].x *= 0.5 * width;
        triProjected.p[2].y *= 0.5 * height;

        // Draw
        drawTriangle(
            triProjected.p[0].x, triProjected.p[0].y,
            triProjected.p[1].x, triProjected.p[1].y,
            triProjected.p[2].x, triProjected.p[2].y,
            "#ffffff"
        );
        
    }


    requestAnimationFrame(loop);
}

loop();