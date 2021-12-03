function random(min, max) {
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
}
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var size = canvas.width = canvas.height;
var r = size / 2;
var display = document.getElementById("display");
var dots = document.getElementById("dots");
var inside = 0;
var outside = 0;
ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, size, size);
ctx.beginPath();
ctx.strokeStyle = "rgb(255,0,0)";
ctx.arc(size / 2, size / 2, r, 0, 2 * Math.PI);
ctx.stroke();
function addDot(n) {
    for (var i = 0; i < n; i++) {
        var x = random(0, size);
        var y = random(0, size);
        ctx.fillStyle = "rgb(" + random(0, 127) + "," + random(127, 255) + "," + random(127, 255) + ")";
        ctx.fillRect(x, y, 1, 1);
        if (x * x + y * y < r * r) {
            inside += 1;
        }
        else {
            outside += 1;
        }
    }
    ctx.beginPath();
    ctx.strokeStyle = "rgb(255,0,0)";
    ctx.arc(size / 2, size / 2, r, 0, 2 * Math.PI);
    ctx.stroke();
    display.innerHTML = "Pi ≈ " + 16 * inside / (inside + outside) + "<br>Dots: " + (inside + outside);
}
