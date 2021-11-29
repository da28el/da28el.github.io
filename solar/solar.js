var vec2 = /** @class */ (function () {
    function vec2(x, y) {
        var _this = this;
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.copy = function () { return new vec2(_this.x, _this.y); };
        this.str = function () { return "(" + _this.x + "," + _this.y + ")"; };
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
var body = /** @class */ (function () {
    function body(p, v, m, c) {
        this.trace = [];
        this.traceT = [];
        this.pos = p;
        this.vel = v;
        this.force = new vec2();
        this.mass = m;
        this.color = c;
    }
    body.prototype.update = function (dt) {
        this.vel.add(vec2.scale(this.force, dt));
        this.pos.add(vec2.scale(this.vel, dt / this.mass));
        this.force.set(0, 0);
    };
    body.prototype.draw = function () {
        ctx1.beginPath();
        ctx1.fillStyle = this.color;
        ctx1.arc(this.pos.x + xoffset1, this.pos.y + yoffset1, this.mass, 0, 2 * Math.PI);
        ctx1.fill();
        ctx2.beginPath();
        ctx2.fillStyle = this.color;
        ctx2.arc(this.pos.x + xoffset2, yoffset2, this.mass, 0, 2 * Math.PI);
        ctx2.fill();
    };
    body.prototype.drawTrace = function () {
        for (var i = 0; i < this.trace.length; i++) {
            ctx1.fillStyle = '#ffffff';
            ctx1.fillRect(this.trace[i].x + xoffset1, this.trace[i].y + yoffset1, 1, 1);
            ctx2.fillStyle = '#ffffff';
            ctx2.fillRect(this.trace[i].x + xoffset1, 10 * (time - this.traceT[i]) + yoffset1, 1, 1);
        }
    };
    return body;
}());
// Kraft på b1 från b2
var G = 1;
function Fg(b1, b2) {
    var R = vec2.sub(b2.pos, b1.pos);
    var r = R.length();
    return R.scale(G * b1.mass * b2.mass / (r * r));
}
var canvas1 = document.getElementById("left");
var ctx1 = canvas1.getContext("2d");
var canvas2 = document.getElementById("right");
var ctx2 = canvas2.getContext("2d");
var width1 = canvas1.width; // = window.innerWidth;
var height1 = canvas1.height; // = window.innerHeight;
var width2 = canvas2.width; // = window.innerWidth;
var height2 = canvas2.height; // = window.innerHeight;
var xoffset1 = width1 / 2;
var yoffset1 = height1 / 2;
var xoffset2 = width2 / 2;
var yoffset2 = height2 / 2;
var dt = 0.1;
var time = 0.0;
var bodies = [];
function paintBackground() {
    ctx1.fillStyle = "#000000";
    ctx1.fillRect(0, 0, width1, height1);
    ctx2.fillStyle = "#000000";
    ctx2.fillRect(0, 0, width1, height1);
}
function paintBodies() {
    for (var i = 0; i < bodies.length; i++) {
        bodies[i].draw();
    }
}
function init() {
    bodies = [];
    var earth = new body(new vec2(), new vec2(), 100, '#1AA7EC');
    var moon = new body(new vec2(200, 0), new vec2(0, 200), 20, '#808080');
    var asteroid = new body(new vec2(240, 0), new vec2(0, 25), 5, '#393939');
    bodies.push(earth);
    bodies.push(moon);
    bodies.push(asteroid);
    paintBackground();
    paintBodies();
}
var af = -1;
function start() {
    if (af == -1)
        loop();
    else {
        cancelAnimationFrame(af);
        init();
        loop();
    }
}
function loop() {
    paintBackground();
    var sorted = bodies.slice();
    sorted.sort(function (n1, n2) { if (n1.pos.y > n2.pos.y)
        return 1;
    else
        return -1; return 0; });
    for (var i = 0; i < bodies.length; i++) {
        sorted[i].drawTrace();
        sorted[i].draw();
        for (var j = 0; j < bodies.length; j++) {
            if (i == j)
                break;
            var f = Fg(bodies[i], bodies[j]);
            bodies[i].force.add(f);
        }
    }
    for (var i = 0; i < bodies.length; i++) {
        bodies[i].update(dt);
        bodies[i].trace.push(bodies[i].pos.copy());
        bodies[i].traceT.push(time);
    }
    af = requestAnimationFrame(loop);
    time += dt;
}
var G_in = document.getElementById("G_in");
var G_ut = document.getElementById("G_ut");
function updateInput() {
    G = +G_in.value;
    G_ut.innerHTML = "G: " + G;
}
init();
loop();
