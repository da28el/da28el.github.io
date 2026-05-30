let canvas = document.querySelector("canvas");
let ctx = canvas.getContext('2d');
let width = canvas.width; // = window.innerWidth;
let height = canvas.height; // = window.innerHeight;

let Key = {
    _pressed: {},
    
    SPACE: 32,
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    Q: 81,
    E: 69,

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

const g = -9.8;
const m = 1.0;
const r = 0.1;
const dt = 0.05;
const w = Math.PI/2;
const F_w = 10000;


const State = (x, y, t, xd, yd, td) => [
    x, y, t, xd, yd, td, 0, 0
]

const f_rocket = (state) => {
    let [x, y, t, xd, yd, td, F, T] = state;
    let xdd = F * Math.cos(t - Math.PI/2) / m;
    let ydd = F * Math.sin(t - Math.PI/2) / m - g;
    let tdd = T / m;
    return State(xd, yd, td, xdd, ydd, tdd);
}

const f_drone = (state) => {
    let [x, y, t, xd, yd, td, F1, F2] = state;
    let xdd = (F1 + F2) * Math.cos(t - Math.PI/2) / m;
    let ydd = (F1 + F2) * Math.sin(t - Math.PI/2) / m - g;
    let tdd = (F1 - F2) * r / (m);
    return State(xd, yd, td, xdd, ydd, tdd);
}

const f_boat = (state) => {
    let [x, y, a, b, xd, yd, ad, bd] = state;

    let F = F_w * Math.cos(w - a + b) * Math.sin(b);
    let xdd = F * Math.cos(a - Math.PI/2) / m;
    let ydd = F * Math.sin(a - Math.PI/2) / m;

    return State(xd, yd, ad, bd, xdd, ydd);
}

const add = (v1,v2) => v1.map((v, i) => v+v2[i]);
const mul = (s,v) => v.map(vi=>vi*s);

function eulerMethod(y, dt) {
    return add(y, mul(dt, f(y)));
}

function midpointMethod(y, dt) {
    return add(y, mul(dt, f(add(y, mul(dt/2, f(y))))));
}

function rk4(y, dt, f) {
    let k1 = f(y);
    let k2 = f(add(y, mul(dt/2, k1)));
    let k3 = f(add(y, mul(dt/2, k2)));
    let k4 = f(add(y, mul(dt, k3)));
    return add(y, mul(dt/6, add(add(add(k1, mul(2, k2)), mul(2, k3)), k4)));
}

const inputRocket = (state) => {
    if (Key.isDown(Key.W)) state[6] += 20;
    if (Key.isDown(Key.A)) state[7] -= 1;
    if (Key.isDown(Key.D)) state[7] += 1;
    return state;
}

const inputDrone = (state) => {
    if (Key.isDown(Key.A)) state[6] += 1500;
    if (Key.isDown(Key.D)) state[7] += 1500;
    return state;
}

const inputBoat = (state) => {
    if (Key.isDown(Key.A)) state[6] -= 0.4;
    if (Key.isDown(Key.D)) state[6] += 0.4;
    if (Key.isDown(Key.W)) state[7] -= 0.4;
    if (Key.isDown(Key.S)) state[7] += 0.4;
    return state;
}

const drawBackground = () => {
    ctx.fillStyle = "#6AB";
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = "#5A9";
    ctx.fillRect(0, height * 4/5, width, height);
    
    ctx.fillStyle = "#6BA";
    ctx.fillRect(0, height * 4/5, width, 20);

    ctx.filter = "blur(1px)";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.2, 50, 0, 2*Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = "#fff";
    ctx.font = "italic small-caps bold 20px/2 cursive";
    ctx.fillText("Håll dig i cirkeln", width * 0.2 + 60, height * 0.2);
    ctx.font = "italic small-caps bold 16px/2 cursive";
    ctx.fillText("Kör med A och D", width * 0.2 + 60, height * 0.2 + 20);
    
    ctx.filter = "none";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#f00";
    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.2, 50, 0, 2*Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = "#f00";
    ctx.font = "italic small-caps bold 20px/2 cursive";
    ctx.fillText("Håll dig i cirkeln", width * 0.2 + 60, height * 0.2);
    ctx.font = "italic small-caps bold 16px/2 cursive";
    ctx.fillText("Kör med A och D", width * 0.2 + 60, height * 0.2 + 20);

}

const drawSea = () => {
    ctx.fillStyle = "#6AB";
    ctx.fillRect(0, 0, width, height);

    ctx.filter = "blur(2px)";
    ctx.fillStyle = "#BA7";
    ctx.fillRect(0, height - 20, width, height); 
    ctx.fillStyle = "#bbb";
    ctx.fillRect(0, height - 22, width, 4); 
    ctx.filter = "none";
}

const drawRocket = (state, player) => {
    ctx.translate(...state.slice(0, 2));
    ctx.rotate(state[2] - Math.PI/2);
    if (player) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(-21, -11, 42, 22);
        ctx.beginPath();
        ctx.moveTo(21, -11);
        ctx.lineTo(31, 0);
        ctx.lineTo(21, 11);
        ctx.fill();
    }
    ctx.fillStyle = `rgba(102, 102, 102, ${player ? 1.0 : 0.2})`;
    ctx.fillRect(-20, -10, 40, 20);
    ctx.beginPath();
    ctx.moveTo(20, -10);
    ctx.lineTo(30, 0);
    ctx.lineTo(20, 10);
    ctx.fill();
    if (state[6] === 0) {
        ctx.resetTransform();
        return;
    }
    ctx.filter = "blur(2px)";
    ctx.fillStyle = `rgba(221, 85, 85, ${player ? 1.0 : 0.2})`;
    ctx.beginPath();
    ctx.moveTo(-20, -10);
    ctx.lineTo(-40, 0);
    ctx.lineTo(-20, 10);
    ctx.fill();
    ctx.fillStyle = `rgba(238, 102, 102, ${player ? 1.0 : 0.2})`;
    ctx.beginPath();
    ctx.moveTo(-20, -8);
    ctx.lineTo(-35, 0);
    ctx.lineTo(-20, 8);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 119, 119, ${player ? 1.0 : 0.2})`;
    ctx.beginPath();
    ctx.moveTo(-20, -5);
    ctx.lineTo(-30, 0);
    ctx.lineTo(-20, 5);
    ctx.fill();
    ctx.filter = "none";
    ctx.resetTransform();
}

const drawDrone = (state) => {
    ctx.fillStyle = "#666";
    ctx.translate(...state.slice(0, 2));
    ctx.rotate(state[2] - Math.PI/2);
    ctx.fillRect(-8, -32, 16, 64);
    ctx.beginPath();
    ctx.moveTo(-15, -32);
    ctx.lineTo(-5, -24);
    ctx.lineTo(-15, -16);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-15, 32);
    ctx.lineTo(-5, 24);
    ctx.lineTo(-15, 16);
    ctx.fill();
    ctx.filter = "blur(2px)";
    if (state[6] > 0) {
        ctx.fillStyle = "#D55";
        ctx.beginPath();
        ctx.moveTo(-15, -30);
        ctx.lineTo(-25, -24);
        ctx.lineTo(-15, -18);
        ctx.fill();
        ctx.fillStyle = "#E66";
        ctx.beginPath();
        ctx.moveTo(-15, -28);
        ctx.lineTo(-25, -24);
        ctx.lineTo(-15, -20);
        ctx.fill();
        ctx.fillStyle = "#F77";
        ctx.beginPath();
        ctx.moveTo(-15, -26);
        ctx.lineTo(-25, -24);
        ctx.lineTo(-15, -22);
        ctx.fill();
    }
    if (state[7] > 0) {
        ctx.fillStyle = "#D55";
        ctx.beginPath();
        ctx.moveTo(-15, 30);
        ctx.lineTo(-25, 24);
        ctx.lineTo(-15, 18);
        ctx.fill();
        ctx.fillStyle = "#E66";
        ctx.beginPath();
        ctx.moveTo(-15, 28);
        ctx.lineTo(-25, 24);
        ctx.lineTo(-15, 20);
        ctx.fill();
        ctx.fillStyle = "#F77";
        ctx.beginPath();
        ctx.moveTo(-15, 26);
        ctx.lineTo(-25, 24);
        ctx.lineTo(-15, 22);
        ctx.fill();
    }
    
    ctx.filter = "none";
    ctx.resetTransform();
}

const drawBoat = (state) => {
    let [x, y, a, b, xd, yd, ad, bd] = state;
    // hull
    ctx.fillStyle = "#B74";
    ctx.translate(x, y);
    ctx.rotate(a - Math.PI/2);
    ctx.beginPath();
    ctx.moveTo(-15, 10);
    ctx.lineTo(15, 0);
    ctx.lineTo(-15, -10);
    ctx.fill();
    // sail
    ctx.strokeStyle = "#753";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(20 * Math.sin(b - Math.PI/2), 20 * Math.cos(b - Math.PI/2));
    ctx.stroke();

    ctx.resetTransform();

    // wind
    ctx.fillRect(95, 95, 10, 10);
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(100 + 20 * Math.cos(w), 100 + 20 * Math.sin(w));
    ctx.stroke();
}

const stepRocket = (state) => {
    const nextState = rk4(state, dt, f_rocket);
    state[0] = nextState[0];
    state[1] = nextState[1];
    state[2] = nextState[2] % (2*Math.PI);
    state[3] = nextState[3];
    state[4] = nextState[4];
    state[5] = nextState[5] * 0.9;
    state[6] = 0;
    state[7] = 0;

    // if (state[0] < 0 || state[0] > width) state[0] = (state[0] + width) % width;
    if (state[1] >= height * 4/5) {
        state[1] = Math.min(height * 4/5, state[1]);
        // state[2] *= 0.8;
        state[3] *= 0.8;
        state[4] = Math.min(0, state[4]);
        // state[5] *= 0.5;

    }
    return state;
}

const stepDrone = (state) => {
    const nextState = rk4(state, dt, f_drone);
    state[0] = nextState[0];
    state[1] = nextState[1];
    state[2] = nextState[2] % (2*Math.PI);
    state[3] = nextState[3];
    state[4] = nextState[4];
    state[5] = nextState[5];
    state[6] = 0;
    state[7] = 0;

    if (state[0] < 0 || state[0] > width) state[0] = (state[0] + width) % width;
    if (state[1] > height * 4/5) {
        state[1] = height * 4/5;
        state[2] *= 0.95;
        state[3] *= 0.9;
        state[4] = Math.min(0, state[4]);
        state[5] *= 0.9;
        userScore = 0;
    }
    return state;
}

const stepBoat = (state) => {
    const nextState = rk4(state, dt, f_boat);
    const xd = nextState[4];
    const yd = nextState[5];
    const xh = Math.cos(nextState[2] - Math.PI/2);
    const yh = Math.sin(nextState[2] - Math.PI/2);
    const v = (xd * xh) + (yd * yh);
    nextState[0] = Math.max(20, Math.min(nextState[0], width - 20));
    nextState[1] = Math.max(20, Math.min(nextState[1], height - 20));
    nextState[2] %= 2*Math.PI
    nextState[3] = Math.min(Math.PI/2, Math.max(nextState[3], -Math.PI/2));
    nextState[4] = v * xh * 0.9;
    nextState[5] = v * yh * 0.9;
    nextState[6] = 0;
    nextState[7] = 0;
    return nextState;
}

let rocket = State(width/2, height * 3/4, 0, 0, 0, 0);
let drone = State(width/2, height * 3/4, 0, 0, 0, 0);
let boat = State(width/2, height - 50, 0, 0, 0, 0);

function main() {
    nPopulation = 100;
    const nSensors = 8;
    const nOutputs = 2;
    innov = nSensors * nOutputs;
    let population = Array(nPopulation).fill(null).map(() => Genome(nSensors, nOutputs));
    let speciesList = [];
    let nextSpeciesId = 1;

    let userScore = 0;
    let userScoreBest = 0;
    let aiScores = Array(nPopulation).fill(0);
    let aiScoreBest = 0;

    const cost = (state) => {
        let angle = state[2] % (2 * Math.PI);
        if (angle > Math.PI) angle -= 2 * Math.PI;
        else if (angle < -Math.PI) angle += 2 * Math.PI;
    
        return angle**2 + (state[0]/width - 0.2)**2 + (state[1]/height - 0.2)**2 + (0.5 * state[5]**2);
    }

    async function runGeneration(genIndex) {
        const agents = Array(nPopulation).fill(null).map((v, i) => State(width/2, height * 3/4, 0, 0, 0, 0));
        const networks = population.map(genome => incubate(genome));
        let costs = Array(nPopulation).fill(0);
        let iteration = 0;

        userScore = 0;
        aiScores = aiScores.fill(0);

        rocket = State(width/2, height * 3/4, 0, 0, 0, 0);
        
        await new Promise(resolve => {
            function loop1() {
                iteration++;
                drawBackground();
                
                ctx.fillStyle = "#f00";
                ctx.font = "italic small-caps bold 24px/2 cursive";
                ctx.fillText("User Score: " + userScore.toFixed(2), width * 0.025, height * 0.05);
                ctx.fillText("User Best: " + userScoreBest.toFixed(2), width * 0.25, height * 0.05);

                ctx.fillStyle = "#f00";
                ctx.font = "italic small-caps bold 24px/2 cursive";
                ctx.fillText("AI Score: " + Math.max(...aiScores).toFixed(2), width * 0.025 + 26, height * 0.09);
                ctx.fillText("AI Best: " + aiScoreBest.toFixed(2), width * 0.25 + 26, height * 0.09);


                ctx.fillStyle = "#f00";
                ctx.font = "italic small-caps bold 24px/2 cursive";
                ctx.fillText("Generation: " + (genIndex + 1), width * 0.8, height * 0.05);
                
                ctx.fillStyle = "#922";
                ctx.beginPath();
                ctx.arc(width/2, height * 0.05, 20, 0, 2*Math.PI);
                ctx.fill();
                ctx.fillStyle = "#f44";
                ctx.beginPath();
                ctx.moveTo(width/2, height * 0.05)
                ctx.arc(width/2, height * 0.05, 19, -Math.PI/2, 2*Math.PI * iteration / 1000 - Math.PI/2);
                ctx.fill();

                for (let i = 0; i < nPopulation; i++) {
                    const agent = agents[i];
                    let F = forward(networks[i], [
                        agent[0] / width,
                        agent[1] / height,
                        Math.cos(agent[2]),
                        Math.sin(agent[2]),
                        agent[3] / 20.0,
                        agent[4] / 20.0,
                        agent[5] / 5.0,
                        1.0,
                    ]);
                    agent[6] = 10 * (F[0] + 1);
                    agent[7] = F[1];
                    drawRocket(agent);

                    agents[i] = stepRocket(agents[i]);

                    costs[i] += cost(agent);
                    
                    const r_2 = (agent[0] - width * 0.2)**2 + (agent[1] - height * 0.2)**2;
                    if (r_2 <= 50**2)
                        aiScores[i] += dt;
                }

                userScoreBest = Math.max(userScoreBest, userScore);
                aiScoreBest = Math.max(aiScoreBest, Math.max(...aiScores));

                costs = costs.map((v, i) => (v * (1 - aiScores[i] / 1000)));

                rocket = inputRocket(rocket);
                drawRocket(rocket, true);
                rocket = stepRocket(rocket);

                const r_2 = (rocket[0] - width * 0.2)**2 + (rocket[1] - height * 0.2)**2;
                if (r_2 <= 50**2)
                    userScore += dt;

                if (iteration < 1000)
                        requestAnimationFrame(loop1);
                else
                    resolve();
            }
            loop1();
        });

        const specimens = population.map((genome, idx) => {
            const fitness = 1 / (costs[idx] + 1);
            return {genome, fitness, adjustedFitness: fitness};
        });

        [speciesList, nextSpeciesId] = speciatePopulation(specimens, speciesList, nextSpeciesId);
        population = reproducePopulation(speciesList);

        runGeneration(genIndex + 1);
    }

    runGeneration(0);
}
main();
