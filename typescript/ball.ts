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
}

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;// = window.innerWidth;
const height = canvas.height;// = window.innerHeight;

class Ball{
    pos:vec2;
    vel:vec2;
    color:string;
    size:number;
    constructor(pos:vec2, vel:vec2, color:string, size:number){
        this.pos = pos; this.vel = vel; this.color = color; this.size = size;
    }
    draw(){
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2*Math.PI);
        ctx.fill();
    }
    update(){
        if((this.pos.x + this.size) >= width){
            this.vel.x *= -1;
        }
        if((this.pos.x - this.size) <= 0){
            this.vel.x *= -1;
        }
        if((this.pos.y + this.size) >= height){
            this.vel.y *= -1;
        }
        if((this.pos.y - this.size) <= 0){
            this.vel.y *= -1;
        }
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    }
}


function random(min:number, max:number):number{
    const num = Math.floor(Math.random()*(max - min + 1)) + min;
    return num
}

let balls = [];
addBall();

let ballCount = document.createElement("h3");
document.body.append(ballCount);

function addBall(){
    let size = random(10,20);
    let ball = new Ball(
        new vec2(
            random(size, width-size),
            random(size, height-size)
        ),
        new vec2(
            random(-7,7),
            random(-7,7)
        ),
        `rgb(${random(0,255)},${random(0,255)},${random(0,255)})`,
        size
    );
    balls.push(ball);
}

let theta = 0;


function loop(){
    theta += 0.01;
    ballCount.innerHTML = `#${balls.length}`
    ctx.fillStyle = `rgba(${255*Math.abs(Math.sin(theta))},${255*Math.abs(Math.cos(0.5*theta))},${255*Math.abs(Math.tan(theta))}, 0.25)`;
    ctx.fillRect(0,0,width,height);
    for(let i = 0; i < balls.length; i++){
        balls[i].draw();
        balls[i].update();
    }

    requestAnimationFrame(loop);
}

loop();