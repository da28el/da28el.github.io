let Key = {
    _pressed: {},
    
    SPACE: 32,
    W: 87,
    S: 83,

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

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const width = canvas.width;
const height = canvas.height;

window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

/*************/
/* variables */
/*************/

let running = false;

// ground
const ground_y = height*4/5;
let distance = 0;

/* dino */
// image
const dino_w = 32;
const dino_h = 64;
const dino_run1 = new Image(16, 32);
dino_run1.src = "plant1.png";
const dino_run2 = new Image(16, 32);
dino_run2.src = "plant2.png";
let dino_anim = 0;
// physics
const dino_ax = 1e-3;               // acceleration
const dino_ay = 0.6;
let dino_vx = 4;                    // velocity
let dino_vy = 0;
const dino_x = width/2 - dino_w;    // position
let dino_y = ground_y-dino_h;
let dino_grounded = true;           // groundcheck

/* obstacles */
const obstacle_w = 32;
const obstacle_h = 64;
const obstacle_img = new Image(39,39);//new Image(16, 32);
obstacle_img.src = "obstacle.png";
let obstacles_x = [];
let obstacles_y = [];
let obstacle_cooldown = 0;

/* points */
const point_w = 16;
const point_h = 16;
const point_img = new Image(16, 16);
point_img.src = "water.png";
let points_x = [];
let points_y = [];
let point_cooldown = 0;
let point_count = 0;

/*************/
/* functions */
/*************/

function draw_background()
{
    // sky
    ctx.fillStyle = "rgb(128,128,255)";
    ctx.fillRect(0,0,width,height);
    // ground (grass)
    ctx.fillStyle = "rgb(86,125,70)";
    ctx.fillRect(0,ground_y,width,height-ground_y);
    // dirt
    ctx.fillStyle = "rgb(64,100,60)";
    ctx.fillRect(0,ground_y+16,width,height-ground_y-16);
}

/* dino */
function draw_dino()
{
    if(dino_anim < 10)
        ctx.drawImage(dino_run1, dino_x, dino_y, dino_w, dino_h);
    else if(dino_anim < 20)
        ctx.drawImage(dino_run2, dino_x, dino_y, dino_w, dino_h);
    else
    {
        dino_anim = 0;
        draw_dino();
    }
    dino_anim++;
}

function update_dino(dt)
{
    // grounded
    if(dino_y + dino_vy * dt > ground_y - dino_h)
    {
        dino_y = ground_y - dino_h;
        dino_vy = 0;
        dino_grounded = true;
    }
    else // in air
    {
        dino_vy += dino_ay * dt;
        dino_y += dino_vy * dt;
        dino_grounded = false;
    }

    // accelerate
    dino_vx += dino_ax * dt;
    distance += dino_vx * dt;
}

/* obstacles */
function draw_obstacles()
{
    for(let i = 0; i < obstacles_x.length; i++)
    {
        ctx.drawImage(obstacle_img, obstacles_x[i], obstacles_y[i], obstacle_w, obstacle_h);
    }
}

function update_obstacles(dt)
{
    for(let i = 0; i < obstacles_x.length; i++)
    {
        // move obstacles
        obstacles_x[i] -= dino_vx * dt;
        // remove obstacles if out of bounds 
        if(obstacles_x[0] < -obstacle_w)
        {
            obstacles_x.shift();
            obstacles_y.shift();
        }
    }
    obstacle_cooldown -= dt;
}

function spawn_obstacle()
{
    if(obstacle_cooldown > 0)
        return;
    obstacles_x.push(width);
    obstacles_y.push(ground_y - obstacle_h);
    obstacle_cooldown = 35;
}

function obstacle_collision()
{
    const padding = 8;
    for(let i = 0; i < obstacles_x.length; i++)
    {
        if(dino_x < obstacles_x[i] + obstacle_w - padding &&
            dino_x + dino_w > obstacles_x[i] + padding &&
            dino_y < obstacles_y[i] + obstacle_h - 2*padding &&
            dino_h + dino_y > obstacles_y[i] + 2*padding)
            return true;
    }
    return false;
}

/* points */
function draw_points()
{
    for(let i = 0; i < points_x.length; i++)
    {
        ctx.drawImage(point_img, points_x[i], points_y[i], point_w, point_h);
    }
    ctx.drawImage(point_img, width-50, 5, point_w, point_h);
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = "16px Arial";
    ctx.fillText(": " + point_count, width-30, 20);
}

function update_points(dt)
{
    for(let i = 0; i < points_x.length; i++)
    {
        // move points
        points_x[i] -= dino_vx * dt;
        // remove points if out of bounds
        if(points_x[0] < -point_w)
        {
            points_x.shift();
            points_y.shift();
        }
    }
    point_cooldown -= dt;
}

function spawn_point()
{
    if(point_cooldown > 0)
        return;
    points_x.push(width);
    const lower = ground_y - point_h;
    const upper = ground_y - point_h - 128;
    points_y.push(lower - Math.random() * (lower - upper));
    point_cooldown = 70;
}

function point_collision()
{
    const padding = 8;
    for(let i = 0; i < points_x.length; i++)
    {
        if(dino_x < points_x[i] + point_w - padding &&
            dino_x + dino_w > points_x[i] + padding &&
            dino_y < points_y[i] + point_h - 2*padding &&
            dino_h + dino_y > points_y[i] + 2*padding)
            return true;
    }
    return false;
}


function draw_score()
{
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = "16px Arial";
    ctx.fillText("Score: " + Math.round(distance/10), 10, 20);
}


async function start()
{
    draw();
    distance = 0;
    dino_vx = 4;
    dino_vy = 0;
    dino_y = ground_y - dino_h;
    obstacles_x = [];
    obstacles_y = [];
    obstacle_cooldown = 0;
    points_x = [];
    points_y = [];
    point_cooldown = 0;
    point_count = 0;
    Key.reset();

    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = "16px Arial";
    ctx.fillText("Press SPACE to start", width/2 - 80, height/2);

    const promise = new Promise((resolve) => {
        window.addEventListener('keydown', function(event) {
            if(Key.isDown(Key.SPACE))
                resolve();
        }, false);
    });

    await promise;
    running = true;
    loop();
}

function reset()
{
    running = false;
    start();
}

function draw()
{
    draw_background();
    draw_obstacles();
    draw_points();
    draw_dino();
    draw_score();
}

function input()
{
    const jump = (Key.isDown(Key.SPACE) || Key.isDown(Key.W)) && dino_grounded;
    const duck = Key.isDown(Key.S) && !Key.isDown(Key.SPACE) && !Key.isDown(Key.W) && !dino_grounded;
    if(jump)
        dino_vy = -12;
    else if(duck)
        dino_vy = 12;
}


function update(dt){
    update_dino(dt);
    update_obstacles(dt);
    update_points(dt);
    if(Math.random() < 0.01)
        spawn_obstacle();
    if(Math.random() < 0.005)
        spawn_point();
    if(point_collision())
    {
        points_x.shift();
        points_y.shift();
        point_count++;
    }
    if(obstacle_collision())
        reset();
}

let lastTime = Date.now();
async function loop(){
    const now = Date.now();
    const dt = now - lastTime;
    lastTime = now;

    if(!running)
    {
        return;
    }
        draw();
        input();
        update(dt/15);

    requestAnimationFrame(loop);
}

start();