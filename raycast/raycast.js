// Objects
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
    vec2.prototype.copy = function () {
        return new vec2(this.x, this.y);
    };
    vec2.prototype.equal = function (v) {
        return (this.x === v.x) && (this.y === v.y);
    }
    vec2.add = function (v1, v2) {
        return new vec2(v1.x + v2.x, v1.y + v2.y);
    };
    vec2.sub = function (v1, v2) {
        return new vec2(v1.x - v2.x, v1.y - v2.y);
    };
    vec2.normal = function (v) {
        return new vec2(v.x / v.length(), v.y / v.length());
    };
    vec2.scale = function (v, s) {
        return new vec2(v.x * s, v.y * s);
    };
    vec2.fromAngle = function (theta) {
        theta *= Math.PI / 180;
        return new vec2(Math.cos(theta), Math.sin(theta));
    };
    return vec2;
}());
var boundry = /** @class */ (function () {
    function boundry(v1, v2) {
        this.p1 = v1;
        this.p2 = v2;
    }
    return boundry;
}());
var ray = /** @class */ (function () {
    function ray(p, d) {
        this.pos = p;
        this.dir = d;
    }
    ray.prototype.collision = function (b) {
        var x1 = this.pos.x;
        var y1 = this.pos.y;
        var x2 = this.dir.x * ray.max_dist;
        var y2 = this.dir.y * ray.max_dist;
        var x3 = b.p1.x;
        var y3 = b.p1.y;
        var x4 = b.p2.x;
        var y4 = b.p2.y;
        var d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (d == 0)
            return new vec2(0, 0);
        var t = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4);
        var u = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
        t /= d;
        u /= d;
        if (u > 0 && u < 1 && t > 0 && t < 1)
            return new vec2(x3 + u * (x4 - x3), y3 + u * (y4 - y3));
        return vec2.scale(this.dir, ray.max_dist);
    };
    ray.max_dist = 1500;
    return ray;
}());
var source = /** @class */ (function () {
    function source(p) {
        this.rays = [];
        this.pos = p;
        this.dir = new vec2();
    }
    source.prototype.cast = function (n) {
        var a = (360 / n);
        for (var i = 0; i < n; i++)
            this.rays.push(new ray(this.pos, vec2.fromAngle(a * i)));
    };
    return source;
}());
// DOM
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var raycount = document.getElementById("range");
var width = canvas.width; // = window.innerWidth;
var height = canvas.height; // = window.innerHeight;
var s = new source(new vec2(width / 2, height / 2));
var boundries = [];
// Edge boundries
boundries.push(new boundry(new vec2(0, 0), new vec2(width, 0)));
boundries.push(new boundry(new vec2(0, 0), new vec2(0, height)));
boundries.push(new boundry(new vec2(width, 0), new vec2(width, height)));
boundries.push(new boundry(new vec2(0, height), new vec2(width, height)));
function paint() {
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, width, height);
    s.rays = [];
    s.cast(+raycount.value);
    for (var j = 0; j < boundries.length; j++) {
        ctx.strokeStyle = 'rgb(255,0,0)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(boundries[j].p1.x, boundries[j].p1.y);
        ctx.lineTo(boundries[j].p2.x, boundries[j].p2.y);
        ctx.stroke();
    }
    for (var i = 0; i < s.rays.length; i++) {
        var nearest = vec2.scale(new vec2(2, 2), ray.max_dist + 1);
        for (var j = 0; j < boundries.length; j++) {
            var z = s.rays[i].collision(boundries[j]);
            if (vec2.sub(s.pos, z).length() < vec2.sub(s.pos, nearest).length())
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
var drawLine = function (x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
};
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
function moveSource(evt) {
    var pos = getMousePos(canvas, evt);
    s.pos.x = pos.x;
    s.pos.y = pos.y;
    paint();
}
var bp1 = new vec2();
function startBoundry(evt) {
    var pos = getMousePos(canvas, evt);
    bp1.set(pos.x, pos.y);
}
function endBoundry(evt) {
    var pos = getMousePos(canvas, evt);
    var v = new vec2(pos.x, pos.y);
    if (!bp1.equal(v))
        boundries.push(new boundry(bp1.copy(), v));
}
paint();
