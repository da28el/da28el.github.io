class vec2{
    x;
    y;
    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    length(){
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    add(v){
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    static add(v1, v2){
        return new vec2(v1.x+v2.x, v1.y+v2.y);
    }
    sub(v){
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    static sub(v1, v2){
        return new vec2(v1.x-v2.x, v1.y-v2.y);
    }
    scale(s){
        this.x *= s;
        this.y *= s;
        return this;
    }
    static scale(v, s){
        return new vec2(v.x*s, v.y*s);
    }
    copy = () => {return new vec2(this.x, this.y);}
    str = () => {return `(${this.x},${this.y})`;}
    strRound = () => {return `(${Math.round(this.x)},${Math.round(this.y)})`;}
}

class rocket{
    pos;
    vel;
    f;
    mass;
    theta;

    rocket_color = "#808080";
    rocket_vertices = [[-8, 16],
                       [ 8, 16],
                       [ 8,-16],
                       [ 0,-32],
                       [-8,-16]];

    flame_color = "rgb(255,127,127)";
    flame_vertices = [[ 6, 16],
                      [-6, 16],
                      [ 0, 24]];

    constructor(p, v, m){
        this.pos = p;
        this.vel = v;
        this.f = new vec2();
        this.mass = m;
        this.theta = 0;
    }

    update(dt){
        this.vel.add(vec2.scale(this.f, dt/this.mass));
        this.pos.x += dt*this.vel.x;
        if(this.pos.y < yoffset || this.vel.y < 0)
            this.pos.y += dt*this.vel.y;
        else{
            if(this.vel.length() > 3 || Math.abs(this.theta) > Math.PI/3){
                this.crash();
                Key.reset();
                this.theta = 0;
            }
            this.theta *= dt;
            this.vel.set(0,0);
        }
        this.f.set(0,0);
        this.theta += (this.theta*dt/this.mass);

        if(this.pos.x > width)
            this.pos.x -= width;

        if(this.pos.x < 0)
            this.pos.x += width;
    }

    draw(vertices = this.rocket_vertices, color = this.rocket_color){
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.pos.x + vertices[0][0]*Math.cos(this.theta) - vertices[0][1]*Math.sin(this.theta),
                   this.pos.y + vertices[0][0]*Math.sin(this.theta) + vertices[0][1]*Math.cos(this.theta));
        for(let i = 0; i < vertices.length; i++){
            ctx.lineTo(this.pos.x + vertices[i][0]*Math.cos(this.theta) - vertices[i][1]*Math.sin(this.theta),
                       this.pos.y + vertices[i][0]*Math.sin(this.theta) + vertices[i][1]*Math.cos(this.theta));
        }
        
        ctx.lineTo(this.pos.x + vertices[0][0]*Math.cos(this.theta) - vertices[0][1]*Math.sin(this.theta),
                   this.pos.y + vertices[0][0]*Math.sin(this.theta) + vertices[0][1]*Math.cos(this.theta));
        ctx.fill();
    }

    turn(angle){
        this.theta += angle;
        this.theta = this.theta % (2*Math.PI);
    }

    boost(thrust){  // thrust ϵ [0, 1] 
        thrust = Math.max(thrust, 0);
        thrust = Math.min(thrust, 1);
        this.f.x += thrust*Math.sin(this.theta)*this.mass;
        this.f.y -= thrust*Math.cos(this.theta)*this.mass;

        this.draw(this.flame_vertices, this.flame_color);
    }

    gravity(){
        this.f.y += 10;
    }

    crash(){
        for(let c = 0; c < 4; c++){ // draw explosion
            ctx.beginPath();
            ctx.fillStyle = `rgb(255,${127+c*30},${127+c*30})`;
            ctx.arc(this.pos.x, yoffset+16, this.vel.length()*(4-c), 0, 2*Math.PI);
            ctx.fill();
        }
        setTimeout(() => {  // msg
            alert("Crashed, the blood of the crew is on your hands.");
        }, 10);
    }
}

let Key = {
    _pressed: {},
    
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,

    isDown: function(keyCode){
        return this._pressed[keyCode];
    },
    onKeydown: function(event) {
        this._pressed[event.keyCode] = true;
    },  
    onKeyup: function(event) {
        delete this._pressed[event.keyCode];
    },
    reset: function(){
        this._pressed = {};
    }
};

let Mouse = {

    x: 0,
    y: 0,
    pressed: false,

    getMousePos: function(evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
    },

    move: function(event){
        let pos = this.getMousePos(event);
        this.x = pos.x;
        this.y = pos.y;
    },

    down: function(event){
        this.pressed = true;
    },

    up: function(event){
        this.pressed = false;
    }

}

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

const xoffset = width/2;
const yoffset = 3*height/4;

const dt = 0.5;

let ship = new rocket(new vec2(xoffset, 5.5*height/8), new vec2(), 100);

ctx.fillStyle = "rgb(64,64,128)";
ctx.fillRect(0,0,width,height);
ctx.fillStyle = "rgb(64,128,64)";
ctx.fillRect(0,yoffset,width,height-yoffset);
ctx.fillStyle = "rgb(64,100,64)";
ctx.fillRect(0,yoffset+8,width,height-yoffset-8);

ship.draw();

window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

function input(){
    if(Key.isDown(Key.UP))
        ship.boost(0.2);
    if(Key.isDown(Key.LEFT))
        ship.turn(-0.05);
    if(Key.isDown(Key.RIGHT))
        ship.turn(0.05);
}

let PID = {
    Kp: 0,
    Ki: 0,
    Kd: 0,
    e: 0,
    i: 0,
    d: 0,
    u: 0,
    update(r, y){
        let e0 = this.e;
        this.e = y - r;
        this.i += this.e*dt;
        this.i = Math.max(this.i, 100);
        this.d = (this.e - e0)/dt;
        this.u = this.Kp * this.e
               + this.Ki * this.i
               + this.Kd * this.d;
        return this.u;
    }

}

let PID_angle = {
    Kp: 0,
    Ki: 0,
    Kd: 0,
    e: 0,
    i: 0,
    d: 0,
    u: 0,
    update(r, y){
        let e0 = this.e;
        this.e = y - r;
        this.i += this.e*dt;
        this.i = Math.max(this.i, 100);
        this.d = (this.e - e0)/dt;
        this.u = this.Kp * this.e
                + this.Ki * this.i
                + this.Kd * this.d;
        return this.u;
    }
}

function params(){
    PID.Kp = +document.getElementById("Kp").value;
    PID.Ki = +document.getElementById("Ki").value;
    PID.Kd = +document.getElementById("Kd").value;
}

let history_r = [];
let history_y = [];

let desired = height/2;

function control(){
    let r = desired;
    let y = ship.pos.y;
    const steer = PID.update(r, y);
    ship.boost(steer);

    let r_angle = 0;
    let y_angle = ship.theta;
    const steer_angle = PID_angle.update(r_angle, y_angle);
    ship.turn(steer_angle);

    // UI
    const xoffset = 40;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`PID: error = ${PID.e.toFixed(2)}, output = ${PID.u.toFixed(2)}`, xoffset, 20);
    history_r.push(r);
    history_y.push(y);
    if(history_r.length > xoffset)
        history_r.splice(0, 1);
    if(history_y.length > xoffset)
        history_y.splice(0, 1);
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.fillRect(xoffset, r-5, 10, 10);
    for(let i = 0; i < history_r.length; i++)
        ctx.fillRect(i, history_r[i], 2, 2);
    ctx.fillStyle = "rgb(0, 0, 255)";
    ctx.fillRect(xoffset, y-5, 10, 10);
    for(let i = 0; i < history_y.length; i++)
        ctx.fillRect(i, history_y[i], 2, 2);
    
}

function loop(){
    ctx.fillStyle = "rgb(64,64,128)";
    ctx.fillRect(0,0,width,height);
    ctx.fillStyle = "rgb(64,100,64)";
    ctx.fillRect(0,yoffset,width,height-yoffset);
    ctx.fillStyle = "rgb(64,128,64)";
    ctx.fillRect(0,yoffset+16,width,height-yoffset-16);

    input();

    if(Mouse.pressed){
        desired = Mouse.y;
    }

    control();

    ship.draw(ship.rocket_vertices, ship.rocket_color);
    ship.gravity();
    ship.update(dt);
    
    requestAnimationFrame(loop);
}
//loop();
