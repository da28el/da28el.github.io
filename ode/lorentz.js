let canvas1 = document.getElementById("background");
let canvas2 = document.getElementById("overlay");
let ctx1 = canvas1.getContext('2d');
let ctx2 = canvas2.getContext('2d');
let width = canvas1.width; // = window.innerWidth;
let height = canvas1.height; // = window.innerHeight;

let r = 28;
let s = 10;
let b = 8/3;

const add = (v1,v2) => [v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2]];
const mul = (s,v) => [s*v[0], s*v[1], s*v[2]];

let f = (p) => {
    let x = p[0]; let y = p[1]; let z = p[2];
    return [
        s*(y - x),
        r*x - y - x*z,
        x*y - b*z
    ];
}

function eulerMethod(y, dt) {
    return add(y, mul(dt, f(y)));
}

function midpointMethod(y, dt) {
    return add(y, mul(dt, f(add(y, mul(dt/2, f(y))))));
}

function rk4(y, dt) {
    let k1 = f(y);
    let k2 = f(add(y, mul(dt/2, k1)));
    let k3 = f(add(y, mul(dt/2, k2)));
    let k4 = f(add(y, mul(dt, k3)));
    return add(y, mul(dt/6, add(add(add(k1, mul(2, k2)), mul(2, k3)), k4)));
}

// ctx1.fillStyle = "#ffffff";
// ctx1.fillRect(0,0,width,height);
v1 = [0,1,1.05];
v2 = [0,1,1.051];
v3 = [0,1,1.053];

const dt = 0.01;

function loop(){
    ctx2.clearRect(0, 0, width, height);
    ctx1.strokeStyle = "rgba(255,0,0,0.5)";//"#ff0000";
    ctx1.beginPath();
    ctx1.moveTo(width/2 + v1[0]*5, height/2 - v1[1]*5);
    v1 = rk4(v1, dt);
    ctx1.lineTo(width/2 + v1[0]*5, height/2 - v1[1]*5);
    ctx1.stroke();
    ctx2.fillStyle = "rgba(255,0,0,0.5)";;
    ctx2.fillRect(width/2 + v1[0]*5 - 2, height/2 - v1[1]*5 - 2, 4, 4);

    ctx1.strokeStyle = "rgba(0,255,0,0.5)";
    ctx1.beginPath();
    ctx1.moveTo(width/2 + v2[0]*5, height/2 - v2[1]*5);
    v2 = rk4(v2, dt);
    ctx1.lineTo(width/2 + v2[0]*5, height/2 - v2[1]*5);
    ctx1.stroke();
    ctx2.fillStyle = "rgba(0,255,0,0.5)";
    ctx2.fillRect(width/2 + v2[0]*5 - 2, height/2 - v2[1]*5 - 2, 4, 4);

    ctx1.strokeStyle = "rgba(0,0,255,0.5)";
    ctx1.beginPath();
    ctx1.moveTo(width/2 + v3[0]*5, height/2 - v3[1]*5);
    v3 = rk4(v3, dt);
    ctx1.lineTo(width/2 + v3[0]*5, height/2 - v3[1]*5);
    ctx1.stroke();
    ctx2.fillStyle = "rgba(0,0,255,0.5)";
    ctx2.fillRect(width/2 + v3[0]*5 - 2, height/2 - v3[1]*5 - 2, 4, 4);


    requestAnimationFrame(loop);
}
loop();


