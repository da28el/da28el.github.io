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

var rocket = /** @class */ (function () {

    function rocket(p, v, m) {

        this.rocket_color = "#808080";

        this.rocket_vertices = [[-8, 16],

            [8, 16],

            [8, -16],

            [0, -32],

            [-8, -16]];

        this.flame_color = "rgb(255,127,127)";

        this.flame_vertices = [[6, 16],

            [-6, 16],

            [0, 24]];

        this.pos = p;

        this.vel = v;

        this.f = new vec2();

        this.mass = m;

        this.theta = 0;

    }

    rocket.prototype.update = function (dt) {

        this.vel.add(vec2.scale(this.f, dt / this.mass));

        this.pos.x += dt * this.vel.x;

        if (this.pos.y < yoffset || this.vel.y < 0)

            this.pos.y += dt * this.vel.y;

        else {

            if (this.vel.length() > 3 || Math.abs(this.theta) > Math.PI / 2) {

                this.crash();

                Key.reset();

                this.theta = 0;

            }

            this.theta *= dt;

            this.vel.set(0, 0);

        }

        this.f.set(0, 0);

        this.theta += (this.theta * dt / this.mass);

    };

    rocket.prototype.draw = function (vertices, color) {

        if (vertices === void 0) { vertices = this.rocket_vertices; }

        if (color === void 0) { color = this.rocket_color; }

        ctx.fillStyle = color;

        ctx.beginPath();

        ctx.moveTo(this.pos.x + vertices[0][0] * Math.cos(this.theta) - vertices[0][1] * Math.sin(this.theta), this.pos.y + vertices[0][0] * Math.sin(this.theta) + vertices[0][1] * Math.cos(this.theta));

        for (var i = 0; i < vertices.length; i++) {

            ctx.lineTo(this.pos.x + vertices[i][0] * Math.cos(this.theta) - vertices[i][1] * Math.sin(this.theta), this.pos.y + vertices[i][0] * Math.sin(this.theta) + vertices[i][1] * Math.cos(this.theta));

        }

        ctx.lineTo(this.pos.x + vertices[0][0] * Math.cos(this.theta) - vertices[0][1] * Math.sin(this.theta), this.pos.y + vertices[0][0] * Math.sin(this.theta) + vertices[0][1] * Math.cos(this.theta));

        ctx.fill();

    };

    rocket.prototype.turn = function (angle) {

        this.theta += angle;

        this.theta = this.theta % (2 * Math.PI);

    };

    rocket.prototype.boost = function (thrust) {

        this.f.x += thrust * Math.sin(this.theta) * this.mass;

        this.f.y -= thrust * Math.cos(this.theta) * this.mass;

        this.draw(this.flame_vertices, this.flame_color);

    };

    rocket.prototype.gravity = function () {

        this.f.y += 10;

    };

    rocket.prototype.crash = function () {

        for (var c = 0; c < 4; c++) {

            ctx.beginPath();

            ctx.fillStyle = "rgb(255," + (127 + c * 30) + "," + (127 + c * 30) + ")";

            ctx.arc(this.pos.x, yoffset + 16, this.vel.length() * (4 - c), 0, 2 * Math.PI);

            ctx.fill();

        }

        setTimeout(function () {

            alert("Crashed, the blood of the crew is on your hands.");

        }, 10);

    };

    return rocket;

}());

var Key = {

    _pressed: {},

    LEFT: 37,

    UP: 38,

    RIGHT: 39,

    DOWN: 40,

    isDown: function (keyCode) {

        return this._pressed[keyCode];

    },

    onKeydown: function (event) {

        this._pressed[event.keyCode] = true;

    },

    onKeyup: function (event) {

        delete this._pressed[event.keyCode];

    },

    reset: function () {

        this._pressed = {};

    }

};

var canvas = document.querySelector("canvas");

var ctx = canvas.getContext("2d");

var width = canvas.width;

var height = canvas.height;

var xoffset = width / 2;

var yoffset = 3 * height / 4;

var dt = 0.5;

// ctx.transform(1, 0, 0, -1, width/2, height);

/*(-w/2,h)  (w/2,h)*

 *  ╔══════════╗   *

 *  ║          ║   *

 *  ╚══════════╝   *

 *(-w/2,0)  (w/2,0)*/

var ship = new rocket(new vec2(xoffset, 5.5 * height / 8), new vec2(), 100);

ctx.fillStyle = "rgb(64,64,128)";

ctx.fillRect(0, 0, width, height);

ctx.fillStyle = "rgb(64,128,64)";

ctx.fillRect(0, yoffset, width, height - yoffset);

ctx.fillStyle = "rgb(64,100,64)";

ctx.fillRect(0, yoffset + 8, width, height - yoffset - 8);

ship.draw();

window.addEventListener('keyup', function (event) { Key.onKeyup(event); }, false);

window.addEventListener('keydown', function (event) { Key.onKeydown(event); }, false);

function input() {

    if (Key.isDown(Key.UP))

        ship.boost(0.2);

    if (Key.isDown(Key.LEFT))

        ship.turn(-0.05);

    if (Key.isDown(Key.RIGHT))

        ship.turn(0.05);

}

function loop() {

    ctx.fillStyle = "rgb(64,64,128)";

    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgb(64,100,64)";

    ctx.fillRect(0, yoffset, width, height - yoffset);

    ctx.fillStyle = "rgb(64,128,64)";

    ctx.fillRect(0, yoffset + 16, width, height - yoffset - 16);

    input();

    ship.draw(ship.rocket_vertices, ship.rocket_color);

    ship.gravity();

    ship.update(dt);

    requestAnimationFrame(loop);

}

loop();

