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
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x + xoffset, this.pos.y + yoffset, this.mass, 0, 2 * Math.PI);
        ctx.fill();
    };
    return body;
}());
// Kraft på b1 från b2
function Fg(b1, b2) {
    var R = vec2.sub(b1.pos, b2.pos);
    var r = R.length();
    var G = -1;
    return R.scale(G * b1.mass * b2.mass / (r * r));
}
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var width = canvas.width; // = window.innerWidth;
var height = canvas.height; // = window.innerHeight;
var xoffset = width / 2;
var yoffset = height / 2;
var bodies = [];
var earth = new body(new vec2(), new vec2(), 100, '#1AA7EC');
var moon = new body(new vec2(200, 0), new vec2(0, 200), 20, '#808080');
var asteroid = new body(new vec2(245, 0), new vec2(0, 25), 5, '#808080');
bodies.push(earth);
bodies.push(moon);
bodies.push(asteroid);
var traces = [];
function paint() {
    ctx.lineWidth = 1;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
}
function loop() {
    paint();
    for (var i = 0; i < traces.length; i++) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(traces[i].x + xoffset, traces[i].y + yoffset, 1, 1);
    }
    for (var i = 0; i < bodies.length; i++) {
        bodies[i].draw();
        for (var j = 0; j < bodies.length; j++) {
            if (i == j)
                break;
            var f = Fg(bodies[i], bodies[j]);
            bodies[i].force.add(f);
        }
    }
    for (var i = 0; i < bodies.length; i++) {
        bodies[i].update(0.1);
        traces.push(bodies[i].pos.copy());
    }
    requestAnimationFrame(loop);
}
loop();
