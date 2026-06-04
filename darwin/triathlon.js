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


const inputDrone = (state) => {
    if (Key.isDown(Key.A)) state[6] += 10;
    if (Key.isDown(Key.D)) state[7] += 10;
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

const stepDrone = (state) => {
    const nextState = rk4(state, dt, f_drone);
    state[0] = nextState[0];
    state[1] = nextState[1];
    state[2] = nextState[2] % (2*Math.PI);
    state[3] = nextState[3];
    state[4] = nextState[4];
    state[5] = nextState[5] * 0.99;
    state[6] = 0;
    state[7] = 0;

    if (state[0] < 0 || state[0] > width) state[0] = (state[0] + width) % width;
    if (state[1] > height * 4/5) {
        state[1] = Math.min(height * 4/5, state[1]);
        state[3] *= 0.8;
        state[4] = Math.min(0, state[4]);
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

const drawText = (
    genIndex, iteration, 
    targetX, targetY, 
    userScore, userScoreBest, 
    aiScores, aiScoreBest
) => {
    // player score
    ctx.fillStyle = "#f00";
    ctx.font = "italic small-caps bold 24px/2 cursive";
    ctx.fillText("User Score: " + userScore.toFixed(2), width * 0.025, height * 0.05);
    ctx.fillText("User Best: " + userScoreBest.toFixed(2), width * 0.25, height * 0.05);
                
    if (genIndex > 0) {
        // ai score
        ctx.fillStyle = "#f00";
        ctx.font = "italic small-caps bold 24px/2 cursive";
        ctx.fillText("AI Score: " + Math.max(...aiScores).toFixed(2), width * 0.025 + 26, height * 0.09);
        ctx.fillText("AI Best: " + aiScoreBest.toFixed(2), width * 0.25 + 26, height * 0.09);
    }

    // generation text
    ctx.fillStyle = "#f00";
    ctx.font = "italic small-caps bold 24px/2 cursive";
    ctx.fillText("Generation: " + genIndex, width * 0.8, height * 0.05);

    // generation progress
    ctx.fillStyle = "#922";
    ctx.beginPath();
    ctx.arc(width/2, height * 0.05, 20, 0, 2*Math.PI);
    ctx.fill();
    ctx.fillStyle = "#f44";
    ctx.beginPath();
    ctx.moveTo(width/2, height * 0.05)
    ctx.arc(width/2, height * 0.05, 19, -Math.PI/2, 2*Math.PI * iteration / (genIndex === 0 ? 2000 : 1000) - Math.PI/2);
    ctx.fill();

    // circle background
    ctx.filter = "blur(1px)";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.arc(width * targetX, height * targetY, 50, 0, 2*Math.PI);
    ctx.stroke();
    ctx.filter = "none"; 

    // circle
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#f00";
    ctx.beginPath();
    ctx.arc(width * targetX, height * targetY, 50, 0, 2*Math.PI);
    ctx.stroke();

    // circle text background
    ctx.fillStyle = "#fff";
    ctx.font = "italic small-caps bold 20px/2 cursive";
    ctx.fillText("Håll dig i cirkeln", width * targetX + 60, height * targetY);
    ctx.font = "italic small-caps bold 16px/2 cursive";
    ctx.fillText("Kör med W, A och D", width * targetX + 60, height * targetY + 20);
                
    // circle text
    ctx.fillStyle = "#f00";
    ctx.font = "italic small-caps bold 20px/2 cursive";
    ctx.fillText("Håll dig i cirkeln", width * targetX + 60, height * targetY);
    ctx.font = "italic small-caps bold 16px/2 cursive";
    ctx.fillText("Kör med W, A och D", width * targetX + 60, height * targetY + 20);

    if (genIndex === 0 && iteration > 500) {
        if (userScore > 10) {
            ctx.fillStyle = "#ff0";
            ctx.font = "italic small-caps bold 20px/2 cursive";
            ctx.fillText("Nu börjar du få till det!", width * 0.6, height * 0.3);
        } else {
            ctx.fillStyle = "#ff0";
            ctx.font = "italic small-caps bold 20px/2 cursive";
            ctx.fillText("Är det svårart?", width * 0.6, height * 0.3);
        }
    }

    if (genIndex === 1) {
        ctx.fillStyle = "#ff0";
        ctx.font = "italic small-caps bold 20px/2 cursive";
        ctx.fillText("Nu tar vi och slänger in några", width * 0.6, height * 0.3);
        ctx.fillText("neurala nätverk som får styra raketer.", width * 0.6, height * 0.33);
    }
    if (genIndex === 2) {
        ctx.fillStyle = "#ff0";
        ctx.font = "italic small-caps bold 20px/2 cursive";
        ctx.fillText("Som du kanske märker är dom", width * 0.6, height * 0.3);
        ctx.fillText("inte särskilt duktiga än...", width * 0.6, height * 0.33);
    }
    if (genIndex === 3) {
        ctx.fillStyle = "#ff0";
        ctx.font = "italic small-caps bold 20px/2 cursive";
        ctx.fillText("Dom behöver lite tid för", width * 0.6, height * 0.3);
        ctx.fillText("att lära sig.", width * 0.6, height * 0.33);
    }
    if (genIndex === 4) {
        ctx.fillStyle = "#ff0";
        ctx.font = "italic small-caps bold 20px/2 cursive";
        ctx.fillText("Du kan lära dig medan du spelar,", width * 0.6, height * 0.3);
        ctx.fillText("men nätverken lär sig bara ", width * 0.6, height * 0.33);
        ctx.fillText("mellan generationer.", width * 0.6, height * 0.36);
    }
    if (genIndex === 5) {
        ctx.fillStyle = "#ff0";
        ctx.font = "italic small-caps bold 20px/2 cursive";
        ctx.fillText("Du märker ju att den försöker,", width * 0.6, height * 0.3);
        ctx.fillText("men det ser ju inte ut att vara", width * 0.6, height * 0.33);
        ctx.fillText("någon större utmaning att vinna.", width * 0.6, height * 0.36);
    }
    if (genIndex === 6) {
        ctx.fillStyle = "#ff0";
        ctx.font = "italic small-caps bold 20px/2 cursive";
        ctx.fillText("Här är en raket tränad över 3000", width * 0.6, height * 0.3);
        ctx.fillText("generationer. Se om det är lika", width * 0.6, height * 0.33);
        ctx.fillText("lätt nu då.", width * 0.6, height * 0.36);
    }
    if (genIndex === 7) {
        ctx.fillStyle = "#ff0";
        ctx.font = "italic small-caps bold 20px/2 cursive";
        ctx.fillText("Nu märker du att den har blivit", width * 0.6, height * 0.3);
        ctx.fillText("betydligt bättre, näst intill", width * 0.6, height * 0.33);
        ctx.fillText("optimal.", width * 0.6, height * 0.36);
    }
    if (genIndex >= 8) {
        ctx.fillStyle = "#ff0";
        ctx.font = "italic small-caps bold 20px/2 cursive";
        ctx.fillText("Det var allt jag hade att visa", width * 0.6, height * 0.3);
        ctx.fillText("än så länge, nu när koden funkar", width * 0.6, height * 0.33);
        ctx.fillText("och nätverken kan lära sig har", width * 0.6, height * 0.36);
        ctx.fillText("jag många fler planer och tester.", width * 0.6, height * 0.39);
        ctx.fillText("Ha det bra tills dess.", width * 0.6, height * 0.42);
    }
}

let drone = State(width/2, height * 3/4, 0, 0, 0, 0);
let boat = State(width/2, height - 50, 0, 0, 0, 0);
let car = State(width/2, height / 2, 0, 0, 0, 0); 
function demo() {
    // drawBackground();
    // drone = inputDrone(drone);
    // drawDrone(drone);
    // stepDrone(drone);

    drawSea();
    boat = inputBoat(boat);
    drawBoat(boat);
    stepBoat(boat);

    requestAnimationFrame(demo);
} demo();

function main() {
    let bestFitness = 0;
    let bestFitnessGen = 0;
    nPopulation = 200;
    const nSensors = 8;
    const nOutputs = 2;
    innov = nSensors * nOutputs;
    const pretrained = {"nodeGenes":[{"node":1,"type":"sensor"},{"node":2,"type":"sensor"},{"node":3,"type":"sensor"},{"node":4,"type":"sensor"},{"node":5,"type":"sensor"},{"node":6,"type":"sensor"},{"node":7,"type":"sensor"},{"node":8,"type":"sensor"},{"node":9,"type":"output"},{"node":10,"type":"output"},{"node":11,"type":"hidden"},{"node":12,"type":"hidden"},{"node":13,"type":"hidden"},{"node":14,"type":"hidden"},{"node":15,"type":"hidden"},{"node":16,"type":"hidden"},{"node":17,"type":"hidden"},{"node":18,"type":"hidden"},{"node":19,"type":"hidden"}],"connectionGenes":[{"input":1,"output":9,"weight":0.8035326728370898,"enabled":false,"innov":16},{"input":2,"output":9,"weight":-0.2548470251044446,"enabled":false,"innov":17},{"input":3,"output":9,"weight":-0.2591046699570672,"enabled":false,"innov":18},{"input":4,"output":9,"weight":-0.1426177345486614,"enabled":false,"innov":19},{"input":5,"output":9,"weight":-0.9217611428200423,"enabled":false,"innov":20},{"input":6,"output":9,"weight":-0.8760100122047209,"enabled":false,"innov":21},{"input":15,"output":18,"weight":1,"enabled":true,"innov":22},{"input":8,"output":9,"weight":0.5234811337624071,"enabled":false,"innov":23},{"input":1,"output":10,"weight":0.8755051244703248,"enabled":false,"innov":24},{"input":2,"output":10,"weight":-0.5556298499603105,"enabled":false,"innov":25},{"input":3,"output":10,"weight":0.582716613739905,"enabled":false,"innov":26},{"input":4,"output":10,"weight":-0.5536168053607677,"enabled":true,"innov":27},{"input":5,"output":10,"weight":-1.1226999581368469,"enabled":true,"innov":28},{"input":6,"output":10,"weight":0.8682769278802058,"enabled":true,"innov":29},{"input":7,"output":10,"weight":-1.1820941789002586,"enabled":true,"innov":30},{"input":14,"output":16,"weight":0.05600749357569686,"enabled":true,"innov":31},{"input":1,"output":14,"weight":0.04767505523731526,"enabled":true,"innov":32},{"input":2,"output":11,"weight":0.1849022901993649,"enabled":false,"innov":34},{"input":11,"output":9,"weight":0.8213127109089741,"enabled":false,"innov":35},{"input":3,"output":11,"weight":0.4915368619314756,"enabled":false,"innov":36},{"input":6,"output":11,"weight":-0.26940675181966084,"enabled":true,"innov":38},{"input":8,"output":11,"weight":-0.05199817797744362,"enabled":false,"innov":39},{"input":18,"output":16,"weight":-0.0709117637384067,"enabled":true,"innov":46},{"input":17,"output":10,"weight":-0.17087030161839034,"enabled":true,"innov":47},{"input":5,"output":12,"weight":-0.365429219484437,"enabled":false,"innov":48},{"input":1,"output":12,"weight":0.6342945090269575,"enabled":true,"innov":49},{"input":2,"output":13,"weight":1.04566500848017,"enabled":true,"innov":55},{"input":13,"output":9,"weight":-0.8346580918098532,"enabled":false,"innov":56},{"input":11,"output":12,"weight":0.464785803970637,"enabled":true,"innov":57},{"input":10,"output":12,"weight":-0.9079849164311204,"enabled":true,"innov":62},{"input":7,"output":13,"weight":0.7081829825629439,"enabled":false,"innov":71},{"input":14,"output":9,"weight":1.0180670672352454,"enabled":true,"innov":76},{"input":10,"output":13,"weight":0.10179524721334995,"enabled":true,"innov":77},{"input":10,"output":14,"weight":0.09465166953653298,"enabled":true,"innov":78},{"input":13,"output":14,"weight":1.5152034468875832,"enabled":true,"innov":79},{"input":14,"output":10,"weight":-0.04306012822085412,"enabled":true,"innov":82},{"input":17,"output":16,"weight":-0.4558035622419472,"enabled":true,"innov":84},{"input":16,"output":15,"weight":-0.03286464605723056,"enabled":false,"innov":86},{"input":4,"output":18,"weight":1,"enabled":true,"innov":91},{"input":5,"output":16,"weight":0.6318399970648944,"enabled":true,"innov":92},{"input":15,"output":10,"weight":0.20793651451763973,"enabled":true,"innov":95},{"input":4,"output":15,"weight":-0.21197911175639034,"enabled":false,"innov":110},{"input":15,"output":17,"weight":-0.06932901162459149,"enabled":false,"innov":111},{"input":16,"output":9,"weight":0.9617271002516291,"enabled":true,"innov":119},{"input":13,"output":16,"weight":0.8672063425427642,"enabled":true,"innov":121},{"input":4,"output":16,"weight":-0.0709117637384067,"enabled":false,"innov":124},{"input":15,"output":16,"weight":0.6036747234584555,"enabled":true,"innov":133},{"input":17,"output":13,"weight":0.0517158555746338,"enabled":true,"innov":148},{"input":7,"output":17,"weight":-0.2373060739543428,"enabled":true,"innov":161},{"input":16,"output":19,"weight":1,"enabled":true,"innov":27},{"input":19,"output":15,"weight":-0.03286464605723056,"enabled":true,"innov":28}]}
    let population = Array(nPopulation).fill(null).map(() => Genome(nSensors, nOutputs));
    innov = Math.max(...population.map(p => p.connectionGenes.innov), innov) + 1;
    let speciesList = [];
    let nextSpeciesId = 1;

    let targetX = 0.2;
    let targetY = 0.2;

    let userScore = 0;
    let userScoreBest = 0;
    let aiScores = Array(nPopulation).fill(0);
    let aiScoreBest = 0;

    async function runGeneration(genIndex) {
        if (genIndex === 6) {
            population = population.map(() => clone(pretrained));
            speciesList = [];
        }

        const agents = Array(nPopulation).fill(null).map((v, i) => State(width/2, height * 3/4, 0, 0, 0, 0));
        const networks = population.map(genome => incubate(genome));

        let bestDistance = Array(nPopulation).fill(Infinity);
        let timeOnTarget = Array(nPopulation).fill(0);
        let alive = Array(nPopulation).fill(true);

        let iteration = 0;

        userScore = 0;
        if (genIndex === 1) userScoreBest = 0;
        aiScores = aiScores.fill(0);

        rocket = State(width/2, height * 3/4, 0, 0, 0, 0);
        
        await new Promise(resolve => {
            function loop() {
                iteration++;

                drawBackground();
                
                drawText(genIndex, iteration, targetX, targetY, userScore, userScoreBest, aiScores, aiScoreBest);
                

                for (let i = 0; i < nPopulation && genIndex > 0; i++) {
                    if (!alive[i]) continue;

                    const agent = agents[i];
                    let F = forward(networks[i], [
                        agent[0] / width - targetX,
                        agent[1] / height - targetY,
                        Math.cos(agent[2]),
                        Math.sin(agent[2]),
                        agent[3] / 20.0,
                        agent[4] / 20.0,
                        agent[5] / 5.0,
                        1.0,
                    ]);
                    agent[6] = 10 * (F[0] + 1);
                    agent[7] = F[1] * 10;
                    drawRocket(agent);

                    agents[i] = stepRocket(agents[i]);

                    if (agent[0] < -100 || agent[0] > width + 100 || agent[1] < -100) {
                        alive[i] = false;
                        continue;
                    }

                    const distanceToTarget = Math.hypot(agent[0]/width - targetX, agent[1]/height - targetY);
                    if (distanceToTarget < bestDistance[i]) {
                        bestDistance[i] = distanceToTarget;
                    }

                    if (distanceToTarget < 0.05) {
                        let angleError = Math.abs(agent[2] % (2 * Math.PI));
                        if (angleError > Math.PI) angleError -= 2 * Math.PI;

                        let stabilityPenalty = (agent[3]**2 + agent[4]**2) * 0.1 + Math.abs(angleError);
                        timeOnTarget[i] += dt / (1 + stabilityPenalty);
                    }

                    const r_2 = (agent[0] - width * targetX)**2 + (agent[1] - height * targetY)**2;
                    if (r_2 <= 50**2)
                        aiScores[i] += dt;
                }

                rocket = inputRocket(rocket);
                drawRocket(rocket, true);
                rocket = stepRocket(rocket);
                if (rocket[0] < 0 || rocket[0] > width) rocket[0] = (rocket[0] + width) % width;

                const r_2 = (rocket[0] - width * targetX)**2 + (rocket[1] - height * targetY)**2;
                if (r_2 <= 50**2)
                    userScore += dt;

                userScoreBest = Math.max(userScore, userScoreBest);
                aiScoreBest = Math.max(Math.max(...aiScores), aiScoreBest);

                if (iteration < 1000 || (genIndex === 0 && iteration < 2000))
                        requestAnimationFrame(loop);
                else
                    resolve();
            }
            loop();
        });

        const specimens = population.map((genome, idx) => {
            const fitness = (1 + timeOnTarget[idx]) / (bestDistance[idx] + 0.01);
            return {genome, fitness, adjustedFitness: fitness};
        });

        let sortedSpecimens = specimens.sort((a, b) => b.fitness - a.fitness);
        
        if (sortedSpecimens[0].fitness > bestFitness) {
            bestFitness = sortedSpecimens[0].fitness;
            bestFitnessGen = genIndex;
        }

        [speciesList, nextSpeciesId] = speciatePopulation(specimens, speciesList, nextSpeciesId);
        population = reproducePopulation(speciesList);

        runGeneration(genIndex + 1);
    }

    runGeneration(0);
}
// main();
