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
var body = /** @class */ (function () {
    function body(n, p, v, m, c) {
        this.trace = [];
        this.traceT = [];
        this.name = n;
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
        if (this.trace.length > traceCount) {
            var overflow = this.trace.length - traceCount;
            this.trace.splice(0, Math.round(dt * overflow));
            this.traceT.splice(0, Math.round(dt * overflow));
        }
    };
    body.prototype.draw1 = function () {
        ctx1.beginPath();
        ctx1.fillStyle = this.color;
        ctx1.arc(this.pos.x + xoffset1, this.pos.y + yoffset1, this.mass, 0, 2 * Math.PI);
        ctx1.fill();
    };
    body.prototype.draw2 = function () {
        ctx2.beginPath();
        ctx2.fillStyle = this.color;
        ctx2.arc(this.pos.x + xoffset2, yoffset2, this.mass * (1 + this.pos.y / width2), 0, 2 * Math.PI);
        ctx2.fill();
    };
    body.prototype.drawTrace1 = function () {
        for (var i = 0; i < this.trace.length; i++) {
            ctx1.fillStyle = '#ffffff';
            ctx1.fillRect(this.trace[i].x + xoffset1, this.trace[i].y + yoffset1, 1, 1);
        }
    };
    body.prototype.drawTrace2 = function () {
        for (var i = 0; i < this.trace.length; i++) {
            ctx2.fillStyle = '#ffffff';
            ctx2.fillRect(this.trace[i].x + xoffset1, 10 * (time - this.traceT[i]) + yoffset1, 1, 1);
        }
    };
    return body;
}());
var G = 1;
var showTrace = true;
var traceCount = 8192;
// Kraft på b1 från b2
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
        bodies[i].draw1();
        bodies[i].draw2();
    }
}
function init() {
    bodies = [];
    var earth = new body("Earth", new vec2(), new vec2(), 100, '#1AA7EC');
    var moon = new body("Moon", new vec2(200, 0), new vec2(0, 200), 20, '#808080');
    var asteroid = new body("Asteroid", new vec2(240, 0), new vec2(0, 25), 5, '#393939');
    bodies.push(earth);
    bodies.push(moon);
    bodies.push(asteroid);
    paintBackground();
    paintBodies();
    updateBodyTable();
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
function pause() {
    cancelAnimationFrame(af);
    af = -1;
}
function loop() {
    updateBodyTable();
    paintBackground();
    var sorted = bodies.slice();
    sorted.sort(function (n1, n2) { if (n1.pos.y > n2.pos.y)
        return 1;
    else
        return -1; return 0; });
    if (showTrace) {
        for (var i = 0; i < bodies.length; i++) {
            bodies[i].drawTrace1();
        }
    }
    for (var i = 0; i < bodies.length; i++) {
        bodies[i].draw1();
        if (showTrace) {
            sorted[i].drawTrace2();
        }
        sorted[i].draw2();
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
var dt_in = document.getElementById("dt_in");
var dt_ut = document.getElementById("dt_ut");
var trace_in = document.getElementById("trace");
var trace_count_in = document.getElementById("tracecount");
function updateInput() {
    G = +G_in.value;
    G_ut.innerHTML = "G: " + G;
    dt = +dt_in.value;
    dt_ut.innerHTML = "dt: " + dt;
    if (trace_in.checked) {
        showTrace = true;
    }
    else {
        showTrace = false;
    }
    traceCount = +trace_count_in.value;
}
var bodyTable = document.getElementById("bodytable");
function updateBodyTable() {
    while (bodyTable.firstChild)
        bodyTable.removeChild(bodyTable.firstChild);
    for (var i = 0; i < bodies.length; i++) {
        var row = document.createElement("tr");
        var rowName = document.createElement("td");
        rowName.innerHTML = bodies[i].name;
        var rowPos = document.createElement("td");
        rowPos.innerHTML = bodies[i].pos.strRound();
        var rowVel = document.createElement("td");
        rowVel.innerHTML = bodies[i].vel.strRound();
        var rowMass = document.createElement("td");
        rowMass.innerHTML = bodies[i].mass.toString();
        row.appendChild(rowName);
        row.appendChild(rowPos);
        row.appendChild(rowVel);
        row.appendChild(rowMass);
        bodyTable.appendChild(row);
    }
}
function addBody() {
    alert("Window width: " + width1 + ", Window height: " + height1);
    var n = prompt("name:");
    var posx = +prompt("position x:");
    var posy = +prompt("position y:");
    var velx = +prompt("velocity x:");
    var vely = +prompt("velocity y:");
    var mass = +prompt("mass:");
    var color = prompt("color [hex]:");
    var b = new body(n, new vec2(posx, posy), new vec2(velx, vely), mass, color);
    bodies.push(b);
}
init();
