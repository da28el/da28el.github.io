var vec2 = /** @class */ (function () {
    function vec2(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
    }
    vec2.prototype.set = function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    };
    vec2.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    vec2.prototype.str = function () {
        return "(" + this.x + ", " + this.y + ") - |" + this.length() + "|";
    };
    return vec2;
}());
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var width = canvas.width; // = window.innerWidth;
var height = canvas.height; // = window.innerHeight;
var Ball = /** @class */ (function () {
    function Ball(pos, vel, color, size) {
        this.pos = pos;
        this.vel = vel;
        this.color = color;
        this.size = size;
    }
    Ball.prototype.draw = function () {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    };
    Ball.prototype.update = function () {
        if ((this.pos.x + this.size) >= width) {
            this.vel.x *= -1;
        }
        if ((this.pos.x - this.size) <= 0) {
            this.vel.x *= -1;
        }
        if ((this.pos.y + this.size) >= height) {
            this.vel.y *= -1;
        }
        if ((this.pos.y - this.size) <= 0) {
            this.vel.y *= -1;
        }
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    };
    return Ball;
}());
function random(min, max) {
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
}
var balls = [];
addBall();
var ballCount = document.getElementById("ballcount");
function addBall() {
    var size = random(10, 20);
    var ball = new Ball(new vec2(random(size, width - size), random(size, height - size)), new vec2(random(-7, 7), random(-7, 7)), "rgb(" + random(0, 255) + "," + random(0, 255) + "," + random(0, 255) + ")", size);
    balls.push(ball);
    ballCount.innerHTML = "#" + balls.length;
}
var theta = 0;
function loop() {
    theta += 0.01;
    ctx.fillStyle = "rgba(" + 255 * Math.sin(theta) + "," + 255 * Math.cos(theta) + "," + 255 * Math.tan(theta) + ", 0.25)";
    ctx.fillRect(0, 0, width, height);
    for (var i = 0; i < balls.length; i++) {
        balls[i].draw();
        balls[i].update();
    }
    requestAnimationFrame(loop);
}
loop();
/*
interface Point{
    id: number,
    name: string,
    x: number,
    y:number
};

function getPoint(id: number): Point{
    return {
        id: id,
        name: `P${id}`,
        x: 10.0,
        y: 20.0
    }
}
const strPoint = (p: Point) => {
    return `Point ${point.name} - x: ${point.x}, y: ${point.y}`;
}

const point = getPoint(1);
console.log(strPoint(point).toLocaleUpperCase());
*/
