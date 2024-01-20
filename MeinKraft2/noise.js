function smoothstep(a0, a1, w) {
    return (a1 - a0) * (3 - w * 2) * w * w + a0;
}

function random_gradient(x, y) {
    const random = 2920 * Math.sin(x * 21942 + y * 171324 + 8912) * Math.cos(x * 23157 * y * 217832 + 9758);
    return [Math.cos(random), Math.sin(random)];
}

function dot_grid_gradient(ix, iy, x, y) {
    const dx = x - ix;
    const dy = y - iy;

    const gradient = random_gradient(ix, iy);

    return (dx * gradient[0] + dy * gradient[1]);
}

function perlin_noise(x, y) {
    const x0 = Math.floor(x);
    const x1 = x0 + 1;
    const y0 = Math.floor(y);
    const y1 = y0 + 1;

    const sx = x - x0;
    const sy = y - y0;

    let n0 = dot_grid_gradient(x0, y0, x, y);
    let n1 = dot_grid_gradient(x1, y0, x, y);
    const ix0 = smoothstep(n0, n1, sx);
    
    n0 = dot_grid_gradient(x0, y1, x, y);
    n1 = dot_grid_gradient(x1, y1, x, y);
    const ix1 = smoothstep(n0, n1, sx);

    return smoothstep(ix0, ix1, sy);
}

export { perlin_noise };

// const canvas = document.getElementById("glcanvas");
// const ctx = canvas.getContext("2d");

// const width = canvas.width;
// const height = canvas.height;

// function draw() {
//     for (let x = 0; x < width; x++)
//         for (let y = 0; y < height; y++) {
//             const value = perlin_noise(x / 100, y / 100);
//             ctx.fillStyle = `rgb(${value * 255}, ${value * 255}, ${value * 255})`;
//             ctx.fillRect(x, y, 1, 1);
//         }
// }

// draw();