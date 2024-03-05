const canvas = [document.getElementById("canvas_manual"), document.getElementById("canvas_pid1"), document.getElementById("canvas_pid2"), document.getElementById("canvas_nn")];
const ctx = [canvas[0].getContext("2d"), canvas[1].getContext("2d"), canvas[2].getContext("2d"), canvas[3].getContext("2d")];

let Key = {
    _pressed: {},
    
    SPACE: 32,
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    Q: 81,
    E: 69,
    G: 71,

    isDown: function(keyCode){
        return this._pressed[keyCode];
    },
    onKeyDown: function(event) {
        this._pressed[event.keyCode] = true;
    },  
    onKeyUp: function(event) {
        delete this._pressed[event.keyCode];
    },
    reset: function(){
        this._pressed = {};
    },
    release: function(keyCode){
        delete this._pressed[keyCode];
    }
};

window.addEventListener('keyup',    function(event) { Key.onKeyUp(event);   }, false);
window.addEventListener('keydown',  function(event) { Key.onKeyDown(event); }, false);

const width = canvas[0].width;
const height = canvas[0].height;

function assert(condition, pointer) {
    if (!condition) {
        throw new Error("Error at " + pointer);
    }
}

const DRONE_R = 0.05; // Wingspan
const DRONE_THRUST_MAX = 0.2; // Thrust


const IDX_X = {
    p1: 0, p2: 1, // Position [x, y]
    v1: 2, v2: 3, // Velocity [vx, vy]
    a1: 4, a2: 5, // Acceleration [ax, ay]
    theta: 6,    // Angle
    omega: 7,    // Angular velocity
    alpha: 8,    // Angular acceleration
    t1: 9, t2: 10, // Thrust [left, right]
};
function drone_x(p = [width/2, height*0.9], v = [0, 0], a = [0, 0], theta = 0, omega = 0, alpha = 0, thrust = [0, 0]) {
    return [
        p[0], p[1], // Position [x, y]
        v[0], v[1], // Velocity [vx, vy]
        a[0], a[1], // Acceleration [ax, ay]
        theta,      // Angle
        omega,      // Angular velocity
        alpha,      // Angular acceleration
        thrust[0], thrust[1], // Thrust [left, right]
    ];
}

const IDX_DX = {
    v1: 0, v2: 1, // Velocity [vx, vy]
    a1: 2, a2: 3, // Acceleration [ax, ay]
    omega: 6,    // Angular velocity
    alpha: 7,    // Angular acceleration
};
function drone_dx(x = drone_x()) {
    return [
        x[2], x[3], // Velocity [vx, vy]
        0, 0, // Acceleration [ax, ay]
        0, 0,       // 0, 0, [a']
        x[7],      // Angular velocity
        0,      // Angular acceleration
        0,          // 0, [alpha']
        0, 0,       // 0, 0, [Thrust'] [left, right]
    ];

}

// Vector functions
function add(v1, v2) {
    assert(v1.length == v2.length, this);
    let v = [];
    for (let i = 0; i < v1.length; i++) {
        v[i] = v1[i] + v2[i];
    }
    return v;
}

function multiply(v, s) {
    assert(!isNaN(s), this);
    let u = [];
    for (let i = 0; i < v.length; i++) {
        u[i] = v[i] * s;
    }
    return u;
}

function length_2(v) {
    let sum = 0;
    for (let i = 0; i < v.length; i++) {
        sum += v[i] * v[i];
    }
    return sum;
}

function length(v) {
    return Math.sqrt(length_2(v));
}

// paint functions
function paint_drone(x, color = "rgb(0,0,0)", ctx_idx = 0) {
    let i = ctx_idx;
    ctx[i].save();
    ctx[i].translate(x[IDX_X.p1], x[IDX_X.p2]);
    ctx[i].rotate(x[IDX_X.theta]);
    ctx[i].fillStyle = color
    ctx[i].beginPath();
    ctx[i].fillRect(-25, -5, 50, 10);
    // left jet
    ctx[i].moveTo(-15, 0);
    ctx[i].lineTo(-20, 10);
    ctx[i].lineTo(-10, 10);
    ctx[i].fill();
    
    // right jet
    ctx[i].moveTo(15, 0);
    ctx[i].lineTo(20, 10);
    ctx[i].lineTo(10, 10);
    ctx[i].fill();

    // thruster
    if (x[IDX_X.t1] > 0) {
        ctx[i].fillStyle = "rgb(255,0,0)";
        ctx[i].beginPath();
        ctx[i].moveTo(-15, 20);
        ctx[i].lineTo(-20, 10);
        ctx[i].lineTo(-10, 10);
        ctx[i].fill();
    }

    if (x[IDX_X.t2] > 0) {
        ctx[i].fillStyle = "rgb(255,0,0)";
        ctx[i].beginPath();
        ctx[i].moveTo(15, 20);
        ctx[i].lineTo(20, 10);
        ctx[i].lineTo(10, 10);
        ctx[i].fill();
    }

    ctx[i].restore();
}

function paint_background(ctx_idx = 0) {
    let i = ctx_idx;
    ctx[i].fillStyle = "rgb(255,255,255)";
    ctx[i].fillRect(0,0,width,height,25);
    ctx[i].fillStyle = "rgb(127,127,127)";
    ctx[i].fillRect(0,height*0.9,width,height*0.1);
}

// bang-bang control
function input(x) {
    if (Key.isDown(Key.Q)) {
        x[IDX_X.t1] = DRONE_THRUST_MAX;
    } else {
        x[IDX_X.t1] = 0;
    }
    if (Key.isDown(Key.E)) {
        x[IDX_X.t2] = DRONE_THRUST_MAX;
    } else {
        x[IDX_X.t2] = 0;
    }
    if (Key.isDown(Key.G)) {
        x[IDX_X.t1] = DRONE_THRUST_MAX;
        x[IDX_X.t2] = DRONE_THRUST_MAX;
    }
    return x;
}

// eulers method
function ode_solve(x, dx, dt) {
    let y1 = add(x, multiply(dx, dt));
    let y2 = add(x, multiply(add(dx, drone_dx(y1)), dt/2));
    return y1;
}

function update(x, dt) {
    let dx = drone_dx(x);

    // thrust
    let theta = x[IDX_X.theta] - Math.PI / 2;
    if (x[IDX_X.t1] > 0) {
        let tau = DRONE_R * x[IDX_X.t1];
        dx[IDX_DX.alpha] += tau;
        dx[IDX_DX.a1] += Math.cos(theta) * x[IDX_X.t1];
        dx[IDX_DX.a2] += Math.sin(theta) * x[IDX_X.t1];
    }
    if (x[IDX_X.t2] > 0) {
        let tau = -DRONE_R * x[IDX_X.t2];
        dx[IDX_DX.alpha] += tau;
        dx[IDX_DX.a1] += Math.cos(theta) * x[IDX_X.t2];
        dx[IDX_DX.a2] += Math.sin(theta) * x[IDX_X.t2];
    }
    // gravity
    dx[IDX_DX.a2] += 0.1;
    
    // loop around
    if (x[IDX_X.p1] > width) {
        x[IDX_X.p1] -= width;
    } else if (x[IDX_X.p1] < 0) {
        x[IDX_X.p1] += width;
    }
    x = ode_solve(x, dx, dt);
    // crash
    if (x[IDX_X.p2] > height*0.9) {
        x[IDX_X.p2] = height*0.9;
        x[IDX_X.v1] *= 0.9;
        x[IDX_X.v2] = 0;
        x[IDX_X.omega] *= 0.9;
    }

    return x;
}

const PID = (P, I, D) => {
    return {
        Kp: P,
        Ki: I,
        Kd: D,
        e: 0,
        i: 0,
        d: 0,
        MAX_INTEGRAL: 1000,
        update: function(e, dt) {
            this.d = (e - this.e) / dt;
            this.i = Math.min(Math.max(this.i + e * dt, 0), this.MAX_INTEGRAL);
            this.e = e;
            this.u = Math.min(this.Kp * e + this.Ki * this.i + this.Kd * this.d, DRONE_THRUST_MAX);
            return this.u;
        }
    }
};


class Layer {
    constructor(n, m) {
        this.n = n; this.m = m;
        this.w = Array(this.m).fill(0).map(() => Array(this.n).fill(0).map(() => Math.random()*1.5-1));
        this.b = Array(this.m).fill(0).map(() => Math.random()*1.5-1);
    }
    forward(x) {
        let y = Array(this.m).fill(0);
        for (let i = 0; i < this.m; i++) {
            for (let j = 0; j < this.n; j++) {
                y[i] += this.w[i][j] * x[j];
            }
            y[i] += this.b[i];
        }
        if (this.n > 2) return y.map(this.tanh);
        return y.map(this.ReLU);
    }
    ReLU(y) {
        return y > 0 ? y : 0.01 * y;
    }
    Sigmoid(y) {
        return 1/(1+Math.exp(-y));
    }
    tanh(y) {
        return Math.tanh(4*y);
    }
};

class Network {
    constructor(alt = false) {
        if (alt) this.layers = [new Layer(2, 2), new Layer(2, 1)];
        else this.layers = [new Layer(12, 6), new Layer(6, 2)];
    }
    forward(x) {
        let xp = [];
        if (x.length == 11) xp = [width/2-x[0], 200-x[1], x[2], x[3], x[4], x[5], Math.cos(x[6]), Math.sin(x[6]), x[7], x[8], x[9], x[10], x[11]];
        else xp = x;
        for (let i = 0; i < this.layers.length; i++) {
            xp = this.layers[i].forward(xp);
        }
        return xp;
    }
    static breed(dad, mom, mutation_rate = 0.1, alt = false) {
        let child = new Network(alt);
        for (let i = 0; i < child.layers.length; i++) {
            for (let j = 0; j < child.layers[i].m; j++) {
                for (let k = 0; k < child.layers[i].n; k++) {
                    child.layers[i].w[j][k] = Math.random() > 0.5 ? dad.layers[i].w[j][k] : mom.layers[i].w[j][k];
                    child.layers[i].w[j][k] += Math.random() > 0.5 ? (2*Math.random()-1)*mutation_rate : 0;
                }
                child.layers[i].b[j] = Math.random() > 0.5 ? dad.layers[i].b[j] : mom.layers[i].b[j];
                child.layers[i].b[j] += Math.random() > 0.5 ? (2*Math.random()-1)*mutation_rate : 0;
            }
        }
        return child;
    }
}

function breed(dad, mom, mutation_rate = 0.1) {
    let child = new Layer(2, 1);
    for (let j = 0; j < child.m; j++) {
        for (let k = 0; k < child.n; k++) {
            child.w[j][k] = Math.random() > 0.5 ? dad.w[j][k] : mom.w[j][k];
            child.w[j][k] += Math.random() > 0.5 ? (2*Math.random()-1)*mutation_rate : 0;
        }
        child.b[j] = Math.random() > 0.5 ? dad.b[j] : mom.b[j];
        child.b[j] += Math.random() > 0.5 ? (2*Math.random()-1)*mutation_rate : 0;
    }
    return child;
}

let layer_y1 = 0; let layer_y2 = 1; let layer_y3 = 1; let layer_y4 = 2;
let layer_x1 = 0; let layer_x2 = 0;
let layer_champion = new Layer(2, 1);
async function layer_test() {
    const W1 = document.getElementById("output_W1");
    const W2 = document.getElementById("output_W2");
    const B = document.getElementById("output_B");
    const LOSS = document.getElementById("output_LOSS");
    const update_outputs = (w1, w2, b, l) => {
        W1.value = w1.toFixed(4);
        W2.value = w2.toFixed(4);
        B.value = b.toFixed(4);
        LOSS.value = l.toFixed(4);
    }

    const C = (output, expected) => { return 0.5 * (output - expected)**2; };
    const n_layers = 1000;
    let layers = [];
    let cost = [];
    for (let i = 0; i < n_layers; i++) {
        layers.push(new Layer(2, 1));
        cost.push(0);
    }

    for (let gen = 0; gen < 1000; gen++) {
        for (let i = 0; i < n_layers; i++) {
            cost[i] += C(layers[i].forward([0, 0])[0], layer_y1);
            cost[i] += C(layers[i].forward([0, 1])[0], layer_y2);
            cost[i] += C(layers[i].forward([1, 0])[0], layer_y3);
            cost[i] += C(layers[i].forward([1, 1])[0], layer_y4);
        }
        let dad = cost.indexOf(Math.min(...cost));
        let dad_cost = cost[dad];
        cost[dad] = Math.max(...cost);
        let mom = cost.indexOf(Math.min(...cost));
        cost[dad] = dad_cost;

        update_outputs (
            layers[dad].w[0][0],
            layers[dad].w[0][1],
            layers[dad].b[0],
            cost[dad]
        );

        layer_champion = layers[0];
        number_input(7, layer_x1);

        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 1);
        });

        let layers_prime = [layers[dad], layers[mom]];
        for (let i = 0; i < n_layers; i++) {
            cost[i] = 0;
            if (i < 2) continue;
            if (i >= n_layers/2) layers_prime[i] = new Layer(2, 1);
            else layers_prime[i] = breed(layers[dad], layers[mom]);
        }
        layers = [...layers_prime];
    }
}


let network_x1 = [0, 0, 1, 1]; let network_x2 = [0, 1, 0, 1]; let network_y = [0, 1, 1, 0];
let network_champion = new Network(true); let network_forward_x1 = 0; let network_forward_x2 = 0;
async function network_test() {
    const W1_11 = document.getElementById("output_1W11");
    const W1_12 = document.getElementById("output_1W12");
    const W1_21 = document.getElementById("output_1W21");
    const W1_22 = document.getElementById("output_1W22");
    const B1_1 = document.getElementById("output_1B1");
    const B1_2 = document.getElementById("output_1B2");
    const W2_1 = document.getElementById("output_2W1");
    const W2_2 = document.getElementById("output_2W2");
    const B2 = document.getElementById("output_2B");
    const LOSS = document.getElementById("output_2LOSS");

    const update_outputs = (w1_11, w1_12, w1_21, w1_22, b1_1, b1_2, w2_1, w2_2, b2, loss) => {
        W1_11.value = w1_11.toFixed(4);
        W1_12.value = w1_12.toFixed(4);
        W1_21.value = w1_21.toFixed(4);
        W1_22.value = w1_22.toFixed(4);
        B1_1.value = b1_1.toFixed(4);
        B1_2.value = b1_2.toFixed(4);
        W2_1.value = w2_1.toFixed(4);
        W2_2.value = w2_2.toFixed(4);
        B2.value = b2.toFixed(4);
        LOSS.value = loss.toFixed(4);
    }

    const C = (output, expected) => { return 0.5 * (output - expected)**2; };
    const n_population = 1000;
    let networks = [];
    let cost = [];
    for (let i = 0; i < n_population; i++) {
        networks.push(new Network(true));
        cost.push(0);
    }

    for (let gen = 0; gen < 1000; gen++) {   
        for (let i = 0; i < n_population; i++) {
            cost[i] += C(networks[i].forward([network_x1[0], network_x2[0]])[0], network_y[0]);
            cost[i] += C(networks[i].forward([network_x1[1], network_x2[1]])[0], network_y[1]);
            cost[i] += C(networks[i].forward([network_x1[2], network_x2[2]])[0], network_y[2]);
            cost[i] += C(networks[i].forward([network_x1[3], network_x2[3]])[0], network_y[3]);
        }
        
        let dad = cost.indexOf(Math.min(...cost));
        let dad_cost = cost[dad];
        cost[dad] = Math.max(...cost);
        let mom = cost.indexOf(Math.min(...cost));
        cost[dad] = dad_cost;
        
        update_outputs (
            networks[dad].layers[0].w[0][0],
            networks[dad].layers[0].w[0][1],
            networks[dad].layers[0].w[1][0],
            networks[dad].layers[0].w[1][1],
            networks[dad].layers[0].b[0],
            networks[dad].layers[0].b[1],
            networks[dad].layers[1].w[0][0],
            networks[dad].layers[1].w[0][1],
            networks[dad].layers[1].b[0],
            cost[dad]
        );

        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 1);
        });
        
        let networks_prime = [networks[dad], networks[mom]];
        for (let i = 0; i < n_population; i++) {
            cost[i] = 0;
            if (i < 2) continue;
            if (i >= n_population/2) networks_prime[i] = new Network(true);
            else networks_prime[i] = Network.breed(networks[dad], networks[mom], 0.1, true);
        }
        networks = [...networks_prime];

        network_champion = networks[0];
        number_input(21, network_forward_x1);
    }
}

// main functions
let running = [false, false, false, false];

let time_scale = 50;
function main() {
    let x = drone_x();
    let lastTime = 0;
    function loop() {
        if (!running[0]) {
            return;
        }
        let currentTime = Date.now();
        let dt = (currentTime - lastTime) / 1000.0;
        lastTime = currentTime;
        paint_background(0);

        ctx[0].fillStyle = "rgb(255,0,0)";
        ctx[0].beginPath();
        ctx[0].arc(width/2, 200, 50, 0, 2 * Math.PI);
        ctx[0].fill();
        ctx[0].fillStyle = "rgb(255,255,255)";
        ctx[0].beginPath();
        ctx[0].arc(width/2, 200, 45, 0, 2 * Math.PI);
        ctx[0].fill();
        ctx[0].fillStyle = "rgb(255,0,0)";
        ctx[0].font = "italic small-caps bold 16px/2 cursive";
        ctx[0].fillText("Håll dig i cirkeln", width/2+60, 180);
        ctx[0].font = "italic small-caps bold 12px/2 cursive";
        ctx[0].fillText("Kör med Q och E", width/2+80, 210);

        x = input(x);
        x = update(x, time_scale*dt);
        paint_drone(x, "rgb(0,0,0)", 0);
        requestAnimationFrame(loop);
    }
    loop();
}

let user_kp = 0.3;
let user_ki = 0.02;
let user_kd = 0.2;
function main_pid() {
    let n_drones = 8;
    let x = [];
    let pid = [];
    for (let i = 0; i < n_drones; i++) {
        x.push(drone_x());
        x[i][IDX_X.p1] = width / 4 + 60*(i) - 30*(n_drones-1);
        pid.push(PID(0.1*(i+1), 0.005*(i+2), 0.04*(i+3)));
    }

    let user_x = drone_x();
    user_x[IDX_X.p1] = width / 4;
    let user_pid = PID(user_kp, user_ki, user_kd);

    let lastTime = 0;
    function loop() {
        if (!running[1]) {
            return;
        }
        let currentTime = Date.now();
        let dt = (currentTime - lastTime) / 1000.0;
        lastTime = currentTime;
        paint_background(1);
        paint_background(2);

        // lag guard
        if (dt > 0.1) {
            dt = 0.1;
        }

        ctx[1].fillStyle = "rgb(255,0,0)";
        ctx[1].fillRect(0, 198, width, 4);
        ctx[2].fillStyle = "rgb(255,0,0)";
        ctx[2].fillRect(0, 198, width, 4);
        ctx[1].font = "italic bold 32px Fira Sans serif";
        ctx[1].fillText("r", 10, 180);

        user_pid.Kp = user_kp;
        user_pid.Ki = user_ki;
        user_pid.Kd = user_kd;

        for (let i = 0; i < n_drones; i++) {

            let u = pid[i].update(x[i][IDX_X.p2] - 200, dt);

            x[i][IDX_X.t1] = Math.max(0, Math.min(DRONE_THRUST_MAX, u));
            x[i][IDX_X.t2] = Math.max(0, Math.min(DRONE_THRUST_MAX, u));

            x[i] = update(x[i], 50*dt);

            paint_drone(x[i], "rgb(0,0,0)", 1);
        }

        let u = user_pid.update(user_x[IDX_X.p2] - 200, dt);
        user_x[IDX_X.t1] = Math.max(0, Math.min(DRONE_THRUST_MAX, u));
        user_x[IDX_X.t2] = Math.max(0, Math.min(DRONE_THRUST_MAX, u));

        user_x = update(user_x, 50*dt);
        paint_drone(user_x, "rgb(0,0,255)", 2);

        requestAnimationFrame(loop);
    }
    loop();
}

let nn_n_drones = 500;
let nn_generation_length = 8e2
let nn_dt_factor = 50;
let nn_pretrain = false;
let pretrain0 = new Network();
pretrain0.layers[0].b = [-0.388441761618404,-0.5024214791452735,-0.7508295712886084,-0.39785807909321264,0.5606481907160212,0.38254122641839017];
pretrain0.layers[0].w = [
    [0.48663288205721367,0.47432486470591406,0.14091241480821526,0.2901043867995586,-0.8804440847461218,0.5639061150297711,0.2143177653068434,0.5083905679943137,-0.4520826885142066,0.013842149596647244,0.15164911712713336,-0.528009093414919],
    [0.47752017686872295,-0.26453808665248,-0.8365772293867435,-0.21291875588579867,-1.137748643653278,0.36415282814341926,0.602266892151796,-0.1734991522137367,0.06196665438646843,-0.20225736379690798,0.5409074116342112,-1.206946154590524],
    [0.09548813084968895,0.018388950359956656,0.37206753120743113,-0.7738113758736604,0.14615595221819117,0.20147507676270268,0.1402603108526762,-0.19718009233266018,-0.15866264396771024,-0.16286446686059955,-0.2025272630116511,-0.9234265814469329],
    [-0.9793928642283691,-0.7734090590469133,-0.9367277691572912,-0.41627250921509884,-0.9650099206802953,0.5753550359348867,0.2345905658929237,0.011358709182831675,-0.9523387189263736,0.11210897136198766,-0.4058125437178105,0.47295346843186353],
    [-0.9211746458453248,-0.5375881252628303,0.23013793138306685,0.28171285754130637,0.44303031918795577,-0.9511238189442045,-0.837173454736387,-0.8391199831742262,0.9448937551082365,0.350309132811588,-0.8949970032589697,-0.20097789964320906],
    [-0.4219747126684822,0.9052590100639493,-0.5612680411062054,-0.5953948995362008,0.6666744741832218,-0.6557094377092828,-1.2736061934377492,0.14160717059343567,-0.6785207578254794,0.05970540678408415,-0.15342696274854092,0.32119114347568695]
];
pretrain0.layers[1].b = [-0.6075352230447079,-0.419005120704277];
pretrain0.layers[1].w = [
    [0.23370019267118253,-0.10022282043795527,-0.9808030062621308,0.17679867029087087,-0.5232369534942104,-1.2824745298219706],
    [-0.9338869387748925,-0.3153928668122367,-0.6645515059339403,-0.41559760903143295,-0.09696000662934166,-0.36230981019811814]
];
let pretrain1 = new Network();
pretrain1.layers[0].b = [-0.19982955203240263,-0.20196807921709417,-0.05489769772341393,-0.6134286412073904,0.042839145726929144,0.5052851742948375];
pretrain1.layers[0].w = [
    [0.15831146182841366,0.02120345510855738,0.3207048701869354,-0.8766734594915977,-0.8215184556791527,-0.8746330427527524,0.5400536018220394,-0.31672862508379884,-0.45890202284232323,-0.6240104425384261,-0.48971139338765307,-0.47463875881431333],
    [-0.6243228780068568,-0.15056088950206387,-0.44118221524363155,-0.8915938976154303,-0.8964156275134187,0.43399692697077463,-0.32950867224849156,-0.6531843812763239,0.30962787968979305,0.1454664523974064,-0.839433025729639,0.022456940296986118],
    [-1.083080683539524,-0.5429297148804964,-0.7257468459492389,-0.016006757104234402,-0.32610774635071027,0.22440441401151043,-0.799019913305073,0.2002582854929335,0.06677182763103619,-0.7380458738610304,-0.24341391189555156,-0.09025280480998031],
    [0.4632039981487924,0.2956190127268593,-0.04956156554524046,-0.5830724908536885,-0.4039070683595801,-0.5967588856729299,-0.6102400090773783,0.1251305368698874,0.10032625670375801,0.04646067142270646,0.2272904905039281,0.06750344307651926],
    [0.36553924624074674,0.4473196958280415,0.1975283060073624,0.2866041150171438,0.01514014774131068,0.24124562605059985,-0.7136418345357533,0.3906334182610482,-0.3740468474406785,0.5321295077051021,-0.3385386352287181,0.39073491657799747],
    [0.42262551600610687,0.5508767965396234,-0.7031184785087413,-0.22401030890991724,0.39694578172316364,0.37379380647952265,-0.6481202782714068,-0.22705456758832304,0.5358403247323407,-0.45455010883078617,-0.6973120815051645,-0.5637508134794265]
];
pretrain1.layers[1].b = [0.16864148161598974,-0.19414742592503048];
pretrain1.layers[1].w = [
    [-0.4939747696451688,-0.9485069298794491,0.2532083467531525,-0.37221211609058175,0.05481198661423213,-0.2499122096048081],
    [-0.9317290854101723,-0.0603839332677405,0.39979199512777613,-0.17689942931985994,0.23135200680686274,0.02236686861426123]
];
let target_x = width/2;
let target_y = 200;
function main_nn() {
    let x = [];
    let nn = [];
    let error = [];
    for (let i = 0; i < nn_n_drones; i++) {
        x.push(drone_x());
        error.push(0);
        if(nn_pretrain) nn.push(pretrain1);
        else nn.push(new Network());
    }


    let mutation_rate = 0.1;
    let generation = 0;

    let lastTime = 0;
    function loop() {
        if (!running[2]) {
            return;
        }
        let currentTime = Date.now();
        let dt = (currentTime - lastTime) / 1000.0;
        lastTime = currentTime;
        paint_background(3);
        for (let i = 18; i > 0; i--) {
            ctx[3].fillStyle = "rgb(255,0,0," + (18-i)/18 + ")";
            ctx[3].beginPath();
            ctx[3].arc(target_x, target_y, 40*i, 0, 2 * Math.PI);
            ctx[3].fill();
            ctx[3].fillStyle = "rgb(255,255,255)";
            ctx[3].beginPath();
            ctx[3].arc(target_x, target_y, 40*i-10, 0, 2 * Math.PI);
            ctx[3].fill();
        }
        ctx[3].fillStyle = "rgb(127,127,127)";
        ctx[3].fillRect(0,height*0.9,width,height*0.1);

        // lag guard
        if (dt > 0.01) {
            dt = 0.01;
        }
        
        for (let i = 0; i < nn_n_drones; i++) {
            let y = nn[i].forward(x[i]);
            x[i][IDX_X.t1] = Math.max(0, Math.min(DRONE_THRUST_MAX, y[0]));
            x[i][IDX_X.t2] = Math.max(0, Math.min(DRONE_THRUST_MAX, y[1]));

            // log performance for optimal breeding
            x[i] = update(x[i], nn_dt_factor*dt);
            error[i] += (x[i][IDX_X.p2] - target_y)**2 + (x[i][IDX_X.p1] - target_x)**2;// + 100*(x[i][IDX_X.omega])**2;

            // paint
            paint_drone(x[i], "rgb(0,0,0,0.1)", 3);
        }
        paint_drone(x[0], "rgb(0,0,255)", 3);

        // breeding time
        if (++generation >= nn_generation_length) {
            generation = 0;
            mutation_rate *= 0.9999;

            let dad = error.indexOf(Math.min(...error));
            console.log(error[dad], nn[dad]);
            error[dad] = Math.max(...error);
            let mom = error.indexOf(Math.min(...error));
            
            let dad_network = nn[dad];
            let mom_network = nn[mom];
            let nn_prime = [dad_network, mom_network, Network.breed(dad_network, dad_network), Network.breed(mom_network, mom_network)];
            for (let i = 0; i < nn_n_drones; i++) {
                error[i] = 0;
                x[i] = drone_x();
                if (i < 4) continue;
                else if (i >= nn_n_drones*3/4) nn_prime.push(new Network());
                else if (i >= nn_n_drones/2) nn_prime.push(Network.breed(dad_network, new Network(), mutation_rate));
                else nn_prime.push(Network.breed(dad_network, mom_network, mutation_rate));
            }
            nn = [...nn_prime];
        }

        requestAnimationFrame(loop);
    }

    loop();
}

paint_background(0);
paint_background(1);
paint_background(2);
paint_background(3);

function button(value){
    switch(value){
        case 0:
            running[0] = true;
            main();
            break;
        case 1:
            running[0] = false;
            break;
        case 2:
            running[1] = true;
            main_pid();
            break;
        case 3:
            running[1] = false;
            break;
        case 4:
            running[2] = true;
            main_nn();
            break;
        case 5:
            running[2] = false;
            break;
        case 6:
            layer_test();
            break;
        case 7:
            network_test();
            break;
    }
}

function slider(value) {
    time_scale = value;
}

function number_input(op, value) {
    switch(op){
        case 0:
            user_kp = +value;
            break;
        case 1:
            user_ki = +value;
            break;
        case 2:
            user_kd = +value;
            break;
        case 3:
            layer_y1 = +value;
            break;
        case 4:
            layer_y2 = +value;
            break;
        case 5:
            layer_y3 = +value;
            break;
        case 6:
            layer_y4 = +value;
            break;
        case 7:
            layer_x1 = +value;
            let layer_forward1 = +layer_champion.forward([layer_x1, layer_x2]);
            if (layer_forward1) document.getElementById("output_Y").value = layer_forward1.toFixed(4);
            break;
        case 8:
            layer_x2 = +value;
            let layer_forward2 = +layer_champion.forward([layer_x1, layer_x2]);
            if (layer_forward2) document.getElementById("output_Y").value = layer_forward2.toFixed(4);
            break;
        case 9:
            network_x1[0] = +value;
            break;
        case 10:
            network_x2[0] = +value;
            break;
        case 11:
            network_y[0] = +value;
            break;
        case 12:
            network_x1[1] = +value;
            break;
        case 13:
            network_x2[1] = +value;
            break;
        case 14:
            network_y[1] = +value;
            break;
        case 15:
            network_x1[2] = +value;
            break;
        case 16:
            network_x2[2] = +value;
            break;
        case 17:
            network_y[2] = +value;
            break;
        case 18:
            network_x1[3] = +value;
            break;
        case 19:
            network_x2[3] = +value;
            break;
        case 20:
            network_y[3] = +value;
            break;
        case 21:
            network_forward_x1 = +value;
            let network_forward1 = +network_champion.forward([network_forward_x1, network_forward_x2]);
            if (network_forward1) document.getElementById("output_forward_Y").value = network_forward1.toFixed(4);
            break;
        case 22:
            network_forward_x2 = +value;
            let network_forward2 = +network_champion.forward([network_forward_x1, network_forward_x2]);
            if (network_forward2) document.getElementById("output_forward_Y").value = network_forward2.toFixed(4);
            break;
        case 23:
            nn_n_drones = +value;
            break;
        case 24:
            nn_generation_length = +value;
            break;
        case 25:
            nn_dt_factor = +value;
            break;
        case 26:
            nn_pretrain = value;
            break;
    }
}

//main();
//main_pid();
//main_nn();