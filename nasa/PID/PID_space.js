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
        this.pos.y += dt*this.vel.y;
        this.f.set(0,0);
        this.theta += (this.theta*dt/this.mass);
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

    turn(thrust){
        //this.theta += angle;
        //this.theta = this.theta % (2*Math.PI);
        thrust = Math.max(thrust, -0.05);
        thrust = Math.min(thrust, 0.05);
        this.f.x += thrust*Math.cos(this.theta)*this.mass;
        this.f.y += thrust*Math.sin(this.theta)*this.mass;
    }

    boost(thrust){  // thrust ϵ [-1, 1] 
        thrust = Math.max(thrust, -0.05);
        thrust = Math.min(thrust, 0.1);
        this.f.x += thrust*Math.sin(this.theta)*this.mass;
        this.f.y -= thrust*Math.cos(this.theta)*this.mass;

        this.draw(this.flame_vertices, this.flame_color);
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

ctx.fillStyle = "rgb(0,0,0)";
ctx.fillRect(0,0,width,height);

ship.draw();

window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

function input(){
    if(Key.isDown(Key.UP))
        ship.boost(0.2);
    if(Key.isDown(Key.DOWN))
        ship.boost(-0.2);
    if(Key.isDown(Key.LEFT))
        ship.turn(-0.2);
    if(Key.isDown(Key.RIGHT))
        ship.turn(0.2);
}

let PID_y = {
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

let PID_x = {
    Kp: 0,
    Ki: 0,
    Kd: 0,
    e: 0,
    i: 0,
    d: 0,
    u: 0,
    update(r, y){
        let e0 = this.e;
        this.e = r - y;
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
    PID_y.Kp = +document.getElementById("Kp").value;
    PID_x.Kp = +document.getElementById("Kp").value;
    PID_y.Ki = +document.getElementById("Ki").value;
    PID_x.Ki = +document.getElementById("Ki").value;
    PID_y.Kd = +document.getElementById("Kd").value;
    PID_x.Kd = +document.getElementById("Kd").value;
}

let history_r_y = [];
let history_y_y = [];
let history_r_x = [];
let history_y_x = [];

let desired_y = height/2;
let desired_x = width/2;

function control(){
    let r_y = desired_y;
    let y_y = ship.pos.y;
    const steer_y = PID_y.update(r_y, y_y);
    ship.boost(steer_y);

    let r_x = desired_x;
    let y_x = ship.pos.x;
    const steer_x = PID_x.update(r_x, y_x);
    ship.turn(steer_x);

    // UI y
    const xoffset = 40;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`PID(y): error = ${PID_y.e.toFixed(2)}, output = ${PID_y.u.toFixed(2)}`, xoffset, 20);
    history_r_y.push(r_y);
    history_y_y.push(y_y);
    if(history_r_y.length > xoffset)
        history_r_y.splice(0, 1);
    if(history_y_y.length > xoffset)
        history_y_y.splice(0, 1);
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.fillRect(xoffset, r_y-5, 10, 10);
    for(let i = 0; i < history_r_y.length; i++)
        ctx.fillRect(i, history_r_y[i], 2, 2);
    ctx.fillRect(xoffset, r_y-1, width-xoffset, 2);
    ctx.fillStyle = "rgb(0, 0, 255)";
    ctx.fillRect(xoffset, y_y-5, 10, 10);
    for(let i = 0; i < history_y_y.length; i++)
        ctx.fillRect(i, history_y_y[i], 2, 2);
    // UI x
    const yoffset = 40;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`PID(x): error = ${PID_x.e.toFixed(2)}, output = ${PID_x.u.toFixed(2)}`, xoffset, yoffset);
    history_r_x.push(r_x);
    history_y_x.push(y_x);
    if(history_r_x.length > xoffset)
        history_r_x.splice(0, 1);
    if(history_y_x.length > xoffset)
        history_y_x.splice(0, 1);
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.fillRect(r_x-5, height-yoffset, 10, 10);
    for(let i = 0; i < history_r_x.length; i++)
        ctx.fillRect(history_r_x[i], height-i, 2, 2);
    ctx.fillRect(r_x-1, 0, 2, height-yoffset);
    ctx.fillStyle = "rgb(0, 0, 255)";
    ctx.fillRect(y_x-5, height-yoffset, 10, 10);
    for(let i = 0; i < history_y_x.length; i++)
        ctx.fillRect(history_y_x[i], height-i, 2, 2);
    
    
}

function loop(){
    ctx.fillStyle = "rgb(10,10,10)";
    ctx.fillRect(0,0,width,height);

    input();

    if(Mouse.pressed){
        desired_y = Mouse.y;
        desired_x = Mouse.x;
    }

    control();

    ship.draw(ship.rocket_vertices, ship.rocket_color);
    ship.update(dt);
    
    requestAnimationFrame(loop);
}
//loop();
