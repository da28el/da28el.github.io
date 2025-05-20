

const scalar = (e) => {
    return [e, 0, 0, 0];
}

const vector = (e1, e2) => {
    return [0, e1, e2, 0];
}

const bivector = (e12) => {
    return [0, 0, 0, e12];
}

const multivector = (e, e1, e2, e12) => {
    return [e, e1, e2, e12];
}

const add = (mv1, mv2) => {
    return [
        mv1[0] + mv2[0],
        mv1[1] + mv2[1],
        mv1[2] + mv2[2],
        mv1[3] + mv2[3],
    ];
}

const sub = (mv1, mv2) => {
    return [
        mv1[0] - mv2[0],
        mv1[1] - mv2[1],
        mv1[2] - mv2[2],
        mv1[3] - mv2[3],
    ];
}

// (mv1 + mv2) / 2
const inner = (mv1, mv2) => {
    return [
        mv1[0] * mv2[0] + mv1[1] * mv2[1] + mv1[2] * mv2[2] - mv1[3] * mv2[3],
        0,
        0,
        0,
    ];
}

// (mv1 - mv2) / 2
const outer = (mv1, mv2) => {
    return [ // fel minustecken?
        0,
        mv1[0] * mv2[1] + mv1[1] * mv2[0] - mv1[2] * mv2[3] + mv1[3] * mv2[2],
        mv1[0] * mv2[2] + mv1[1] * mv2[3] + mv1[2] * mv2[0] - mv1[3] * mv2[1],
        mv1[0] * mv2[3] + mv1[1] * mv2[2] - mv1[2] * mv2[1] + mv1[3] * mv2[0],
    ]
}

// mv1 ∙ mv2 + mv1 ^ mv2
const product = (mv1, mv2) => {
    return [
        mv1[0] * mv2[0] + mv1[1] * mv2[1] + mv1[2] * mv2[2] - mv1[3] * mv2[3],
        mv1[0] * mv2[1] + mv1[1] * mv2[0] - mv1[2] * mv2[3] + mv1[3] * mv2[2],
        mv1[0] * mv2[2] + mv1[1] * mv2[3] + mv1[2] * mv2[0] - mv1[3] * mv2[1],
        mv1[0] * mv2[3] + mv1[1] * mv2[2] - mv1[2] * mv2[1] + mv1[3] * mv2[0],
    ];
}

const exp = (mv) => {
    const sin = Math.sin;
    const cos = Math.cos;
    const sinh = Math.sinh;
    const cosh = Math.cosh;
    return [
        Math.exp(mv[0])*(cosh(mv[1])*cosh(mv[2])*cos(mv[3]) - sinh(mv[1])*sinh(mv[2])*sin(mv[3])),
        Math.exp(mv[0])*(sinh(mv[1])*cosh(mv[2])*cos(mv[3]) - cosh(mv[1])*sinh(mv[2])*sin(mv[3])),
        Math.exp(mv[0])*(cosh(mv[1])*sinh(mv[2])*cos(mv[3]) + sinh(mv[1])*cosh(mv[2])*sin(mv[3])),
        Math.exp(mv[0])*(cosh(mv[1])*cosh(mv[2])*sin(mv[3]) + sinh(mv[1])*sinh(mv[2])*cos(mv[3]))
    ];
} 

const canvas = document.getElementById("ga200");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

let V = multivector(0, 0, 0, 0);
let theta = 0;

function drawGrid() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#fff";
    for (let i = 1; i < 10; i++) {
        const k = i === 5 ? 4 : 1
        const j = i * width / 10 - k/2;
        ctx.fillRect(0, j, width, k);
        ctx.fillRect(j, 0, k, height);
    }
} drawGrid();

function drawMultivector(mv, color, text = "") {
    const x0 = width / 2;
    const y0 = height / 2;
    const x1 = mv[1] * width / 10;
    const y1 = mv[2] * height / 10;
    
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    
    // bivector
    const sign = Math.sign(mv[3]);
    const z = Math.sqrt(Math.abs(mv[3])) * width / 10;
    ctx.filter = "brightness(500%)";
    ctx.fillStyle = color;
    ctx.fillRect(x0, y0, z, -z);
    
    ctx.filter = "brightness(50%)";
    ctx.strokeStyle = color; 
    ctx.strokeRect(x0, y0, z, -z);

    const swap = sign === -1 ? 1 : 0; 

    ctx.filter = "brightness(250%)";

    ctx.beginPath();
    ctx.moveTo(x0 - z*0.1 + swap*z, y0 - z*0.1);
    ctx.lineTo(x0 + swap*z, y0);
    ctx.lineTo(x0 + z*0.1 + swap*z, y0 - z*0.1);

    ctx.moveTo(x0 + z*0.9, y0 + z*0.1 - swap*z);
    ctx.lineTo(x0 + z, y0 - swap*z);
    ctx.lineTo(x0 + z*0.9, y0 - z*0.1 - swap*z);

    ctx.moveTo(x0 + z*0.9 - swap*z, y0 - z*0.9);
    ctx.lineTo(x0 + z - swap*z, y0 - z);
    ctx.lineTo(x0 + z*1.1 - swap*z, y0 - z*0.9);

    ctx.moveTo(x0 + z*0.1, y0 - z*0.9 + swap*z);
    ctx.lineTo(x0, y0 - z + swap*z);
    ctx.lineTo(x0 + z*0.1, y0 - z*1.1 + swap*z);
    ctx.stroke();
    
    ctx.filter = "none";

    // vector
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + x1, y0 - y1);
    ctx.stroke();
    ctx.arc(x0 + x1, y0 - y1, 4, 0, 2*Math.PI);
    ctx.stroke();

    // text
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText(text, x0 + x1 - 20, x0 - y1 - 10);
}

function drawVText() {
    ctx.fillStyle = "#fff";
    ctx.fillText("[" + 
        V[0].toFixed(2) + ", " +
        V[1].toFixed(2) + ", " +
        V[2].toFixed(2) + ", " +
        V[3].toFixed(2) +
        "]", 10, 20
    );
}

function drawMv() {
    drawGrid();
    drawMultivector(V, "#f11", "");
    drawVText();
} drawMv();

const input_e0 = document.getElementById("e0");
const input_e1 = document.getElementById("e1");
const input_e2 = document.getElementById("e2");
const input_e12 = document.getElementById("e12");

input_e0.addEventListener("change", () => {
    V[0] = +input_e0.value;
    drawMv();
});
input_e1.addEventListener("change", () => {
    V[1] = +input_e1.value;
    drawMv();
});
input_e2.addEventListener("change", () => {
    V[2] = +input_e2.value;
    drawMv();
});
input_e12.addEventListener("change", () => {
    V[3] = +input_e12.value;
    drawMv();
});


function drawRot() {
    drawGrid();
    drawMultivector(product(V, bivector(1)), "#1f1", "V*𝑖");
    drawMultivector(product(bivector(1), V), "#11f", "𝑖*V");
    if (theta > 0 && theta < 6.28) {
        drawMultivector(product(V, exp(bivector(theta))), "#ff1", "V*exp(𝑖θ)");
        drawMultivector(product(exp(bivector(theta)), V), "#f1f", "exp(𝑖θ)*V");
    }
    drawMultivector(V, "#f11", "V");
    drawVText();
}

function updateVectorFromMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const x0 = width / 2;
    const y0 = height / 2;
    V[1] = (mx - x0) * 10 / width;
    V[2] = -(my - y0) * 10 / height;
    drawRot();
}

function updateGeometricProduct() {
    const v1 = multivector(+input_e0_1.value, +input_e1_1.value, +input_e2_1.value, +input_e12_1.value);
    const v2 = multivector(+input_e0_2.value, +input_e1_2.value, +input_e2_2.value, +input_e12_2.value);
    const v3 = product(v1, v2);
    output_e0.value = v3[0];
    output_e1.value = v3[1];
    output_e2.value = v3[2];
    output_e12.value = v3[3];
}

const input_e0_1 = document.getElementById("e0-1-dim");
const input_e1_1 = document.getElementById("e1-1-dim");
const input_e2_1 = document.getElementById("e2-1-dim");
const input_e12_1 = document.getElementById("e12-1-dim");
const input_e0_2 = document.getElementById("e0-2-dim");
const input_e1_2 = document.getElementById("e1-2-dim");
const input_e2_2 = document.getElementById("e2-2-dim");
const input_e12_2 = document.getElementById("e12-2-dim");
const output_e0 = document.getElementById("e0-3-dim");
const output_e1 = document.getElementById("e1-3-dim");
const output_e2 = document.getElementById("e2-3-dim");
const output_e12 = document.getElementById("e12-3-dim");

input_e0_1.addEventListener('change', () => updateGeometricProduct());
input_e1_1.addEventListener('change', () => updateGeometricProduct());
input_e2_1.addEventListener('change', () => updateGeometricProduct());
input_e12_1.addEventListener('change', () => updateGeometricProduct());
input_e0_2.addEventListener('change', () => updateGeometricProduct());
input_e1_2.addEventListener('change', () => updateGeometricProduct());
input_e2_2.addEventListener('change', () => updateGeometricProduct());
input_e12_2.addEventListener('change', () => updateGeometricProduct());


let page = "";
const button_mv = document.getElementById("button-mv");
const button_rot = document.getElementById("button-rot");
const button_dim = document.getElementById("button-dim");
button_mv.addEventListener('click', () => {
    button_mv.disabled = true;
    button_rot.disabled = false;
    button_dim.disabled = false;
    page = "mv";
    updatePage();
    drawMv()
});
button_rot.addEventListener('click', () => {
    button_mv.disabled = false;
    button_rot.disabled = true;
    button_dim.disabled = false;
    page = "rot";
    updatePage();
    drawRot();
});
button_dim.addEventListener('click', () => {
    button_mv.disabled = false;
    button_rot.disabled = false;
    button_dim.disabled = true;
    page = "dim";
    updatePage();
});

function updatePage() {
    switch (page) {
        case "mv":
            document.getElementById('page-mv').style.display = 'block';
            document.getElementById('page-rot').style.display = 'none';
            document.getElementById('page-dim').style.display = 'none';
            document.getElementById('ga200').style.display = 'block';
            input_e0.value = V[0].toFixed(3);
            input_e1.value = V[1].toFixed(3);
            input_e2.value = V[2].toFixed(3);
            input_e12.value = V[3].toFixed(3);
            break;
        case "rot":
            document.getElementById('page-mv').style.display = 'none';
            document.getElementById('page-rot').style.display = 'block';
            document.getElementById('page-dim').style.display = 'none';
            document.getElementById('ga200').style.display = 'block';
            V[0] = 0;
            V[3] = 0;
            break;
        case "dim":
            document.getElementById('page-mv').style.display = 'none';
            document.getElementById('page-rot').style.display = 'none';
            document.getElementById('page-dim').style.display = 'block';
            document.getElementById('ga200').style.display = 'none';
            break;
    } 
} updatePage();

let isMouseDown = false;
canvas.addEventListener('mousedown', (e) => {
    if (page !== "rot") return;
    isMouseDown = true;
    updateVectorFromMouse(e)
});
document.addEventListener('mousemove', (e) => {
    if (page !== "rot") return;
    if (isMouseDown)
        updateVectorFromMouse(e);
});
canvas.addEventListener('mouseup', (e) => {
    if (page !== "rot") return;
    isMouseDown = false;
});
const rotation_slider = document.getElementById("theta"); 
rotation_slider.addEventListener("input", () => {
    theta = rotation_slider.value;
    drawRot();
}, false);
