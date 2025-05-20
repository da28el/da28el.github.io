var path = document.getElementById("path");
var trace = document.getElementById("trace");
var ctx1 = path.getContext("2d");
var ctx2 = trace.getContext("2d");
var size = 720;

const rose = (a, k) => {
    return {
        x: (t) => a * Math.cos(k * t) * Math.cos(t),
        y: (t) => a * Math.cos(k * t) * Math.sin(t)
    };
};

let theta = 0;
let n_plots = 5;
let plots = [];
for (let i = 1; i < n_plots + 1; i++) {
    let row = [];
    for (let j = 1; j < n_plots + 1; j++) {
        row.push(rose(0.25 * size / n_plots, i / j));
    }
    plots.push(row);
}
ctx1.fillStyle = "#000000";
ctx1.fillRect(0, 0, size, size);
ctx1.fillStyle = "#ffffff";
ctx1.font = "32px courier"
ctx1.fillText("n", 48, 20);
for (let i = 0; i < n_plots; i++) {
    ctx1.fillText(i + 1, 8 + (i + 0.5) * size / n_plots, 22);
}
ctx1.fillText("d", 20, 48);
for (let i = 0; i < n_plots; i++) {
    ctx1.fillText(i + 1, 22, 16 + (i + 0.5) * size / n_plots);
}
ctx1.fillStyle = "rgba(255,255,255,0.5)";
ctx2.fillStyle = "#ff00ff";
function loop() {
    ctx2.clearRect(0, 0, size, size);
    for (let i = 0; i < n_plots; i++) {
        for (let j = 0; j < n_plots; j++) {
            const x = (i + 0.5) * size / n_plots + plots[i][j].x(theta) + 10;
            const y = (j + 0.5) * size / n_plots + plots[i][j].y(theta) + 10;
            ctx1.beginPath();
            ctx1.arc(x, y, 2, 0, 2*Math.PI);
            ctx1.fill();
            ctx2.beginPath();
            ctx2.arc(x, y, 4, 0, 2*Math.PI);
            ctx2.fill();
        }
    }

    theta += 0.015;

    requestAnimationFrame(loop);
}
loop();
