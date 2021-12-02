var vec2 = /** @class */ (function () {
    function vec2(x, y) {
        var _this = this;
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.copy = function () { return new vec2(_this.x, _this.y); };
        this.str = function () { return "(" + _this.x + "," + _this.y + ")"; };
        this.strRound = function () { return "(" + Math.round(_this.x) + "," + Math.round(_this.y) + ")"; };
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
    vec2.prototype.add = function (v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    };
    vec2.add = function (v1, v2) {
        return new vec2(v1.x + v2.x, v1.y + v2.y);
    };
    vec2.prototype.sub = function (v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    };
    vec2.sub = function (v1, v2) {
        return new vec2(v1.x - v2.x, v1.y - v2.y);
    };
    vec2.prototype.scale = function (s) {
        this.x *= s;
        this.y *= s;
        return this;
    };
    vec2.scale = function (v, s) {
        return new vec2(v.x * s, v.y * s);
    };
    return vec2;
}());
var Ball = /** @class */ (function () {
    function Ball(p, v, m, c) {
        this.pos = p;
        this.vel = v;
        this.mass = m;
        this.color = c;
    }
    Ball.prototype.update = function (dt) {
        this.pos.add(vec2.scale(this.vel, dt));
        if ((this.pos.x + this.mass) >= width) {
            this.vel.x *= -1;
            this.pos.x -= 1;
        }
        if ((this.pos.x - this.mass) <= 0) {
            this.vel.x *= -1;
            this.pos.x += 1;
        }
        if ((this.pos.y + this.mass) >= height) {
            this.vel.y *= -1;
            this.pos.y -= 1;
        }
        if ((this.pos.y - this.mass) <= 0) {
            this.vel.y *= -1;
            this.pos.y += 1;
        }
    };
    Ball.prototype.draw = function () {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x, this.pos.y, this.mass, 0, 2 * Math.PI);
        ctx.fill();
    };
    return Ball;
}());
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;
var dt = 0.15;
var balls = [];
var click = new Audio('collision.mp3');
function random(min, max) {
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
}
function collision(b1, b2) {
    var r = vec2.sub(b1.pos, b2.pos).length();
    r = r - b1.mass - b2.mass;
    if (r > 0)
        return;
    var p = vec2.sub(b1.pos, b2.pos);
    p.scale(1 / p.length()).scale(dt);
    b1.pos.add(p);
    b2.pos.add(p.scale(-1));
    var sum = b1.mass + b2.mass;
    var c = (b1.mass - b2.mass) / sum;
    var v1x = c * b1.vel.x + 2 * b2.mass / sum * b2.vel.x;
    var v1y = c * b1.vel.y + 2 * b2.mass / sum * b2.vel.y;
    var v2x = 2 * b1.mass / sum * b1.vel.x - c * b2.vel.x;
    var v2y = 2 * b1.mass / sum * b1.vel.y - c * b2.vel.y;
    b1.vel.x = v1x;
    b1.vel.y = v1y;
    b2.vel.x = v2x;
    b2.vel.y = v2y;
    click.play();
}
function addBall() {
    var m = random(10, 20);
    var b = new Ball(new vec2(random(m, width - m), random(m, height - m)), new vec2(random(-5, 5), random(-5, 5)), m, "rgb(" + random(0, 255) + "," + random(0, 255) + "," + random(0, 255) + ")");
    balls.push(b);
}
function loop() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    for (var i = 0; i < balls.length; i++) {
        for (var j = 0; j < balls.length; j++) {
            if (i != j)
                collision(balls[i], balls[j]);
        }
        balls[i].update(dt);
        balls[i].draw();
    }
    requestAnimationFrame(loop);
}
addBall();
loop();
