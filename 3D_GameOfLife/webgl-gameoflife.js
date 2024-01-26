import { drawScene } from "./draw-scene.js";

import { initShaderProgram } from "./shader.js";
import { vsSource } from "./vertexShader.js";
import { fsSource } from "./fragmentShader.js";

import { Key } from "./key.js";
import { Mouse } from "./mouse.js";
import { Camera } from "./camera.js";

import { World } from "./world.js";
import { Model } from "./model.js";

let deltaTime = 0;

// show debug
let debug = true;

main();

function main() {

    // world/state setup
    let world = new World();

    // debug displays
    let cycle = 0;
    const overlay = document.querySelector("#overlay");
    const fps_display = document.querySelector("#framerate");
    const camera_display = document.querySelector("#camera");
    const time_display = document.querySelector("#timestep");
    const fps_node = document.createTextNode("");
    const camera_node = document.createTextNode("");
    const time_node = document.createTextNode("");
    fps_display.appendChild(fps_node);
    camera_display.appendChild(camera_node);
    time_display.appendChild(time_node);

    // html controls
    const speed_control = document.querySelector("#speed_rule");
    const underpopulation_control = document.querySelector("#u_rule");
    const overpopulation_control = document.querySelector("#o_rule");
    const reproduction_control = document.querySelector("#r_rule");
    const moore2D_control = document.querySelector("#moore2D_rule");
    // html buttons
    const play_control = document.querySelector("#play_button");
    const pause_control = document.querySelector("#pause_button");
    const reset_control = document.querySelector("#reset_button");
    const step_control = document.querySelector("#step_button");
    const soup_control = document.querySelector("#soup_button");
    const save_control = document.querySelector("#save_button");
    const load_control = document.querySelector("#load_button");
    
    // control variables
    let speed = 4;
    let underpopulation = 2;
    let overpopulation = 3;
    let reproduction = 3;
    let moore2D = true;

    // controls
    speed_control.addEventListener("input", () => {
        speed = +speed_control.value;
    });
    underpopulation_control.addEventListener("input", () => {
        underpopulation = +underpopulation_control.value;
    });
    overpopulation_control.addEventListener("input", () => {
        overpopulation = +overpopulation_control.value;
    });
    reproduction_control.addEventListener("input", () => {
        reproduction = +reproduction_control.value;
    });
    moore2D_control.addEventListener("input", () => {
        moore2D = moore2D_control.checked;
    });

    // button variable
    let run_continuous = false;

    // buttons
    play_control.addEventListener("click", () => {
        run_continuous = true;
    });
    pause_control.addEventListener("click", () => {
        run_continuous = false;
    });
    reset_control.addEventListener("click", () => {
        world.reset();
    });
    step_control.addEventListener("click", () => {
        world.update(underpopulation, overpopulation, reproduction, moore2D);
    });
    soup_control.addEventListener("click", () => {
        world.soup();
    });
    save_control.addEventListener("click", () => {
        alert(world.getStateString(speed, underpopulation, overpopulation, reproduction, moore2D));
    });
    load_control.addEventListener("click", () => {
        let repr = prompt("State string:");
        let settings = world.setStateString(repr);
        speed = settings[0]; speed_control.value = speed;
        underpopulation = settings[1]; underpopulation_control.value = underpopulation;
        overpopulation = settings[2]; overpopulation_control.value = overpopulation;
        reproduction = settings[3]; reproduction_control.value = reproduction;
        moore2D = !settings[4]; moore2D_control.checked = moore2D?true:false;
    });



    // canvas & webgl setup
    const canvas = document.querySelector("#glcanvas");
    // Initialize the GL context
    const gl = canvas.getContext("webgl");
    

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert(
            "Unable to initialize WebGL. Your browser or machine may not support it."
        );
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex shader program

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Collect all the info needed to use the shader program.
    // Look up which attribute our shader program is using
    // for aVertexPosition and look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
        },
    };

    // cube model
    let buffers = [];
    buffers.push(Model.Cube().bufferData(gl));

    // time (t0)
    let then = 0;

    // Draw the scene repeatedly (animation frame)
    function render(now) {
        // timing
        now *= 1e-3; // convert to seconds
        deltaTime = now - then;
        then = now;

        cycle++;

        // keyboard & mouse input
        Camera.handleInput(Key, Mouse, deltaTime);
        Camera.update();
        
        // raycast target block
        let ray = Camera.raycast(world);
        if(ray.hit != null) {
            // place block
            if(Mouse.isDown(Mouse.LEFT)) {
                world.setState(ray.hit[0], ray.hit[1], ray.hit[2], 0);
            }
            // break block
            if(Mouse.isDown(Mouse.RIGHT)) {
                let x = Math.round(ray.side[0]);
                let y = Math.round(ray.side[1]);
                let z = Math.round(ray.side[2]);
                world.setState(x, y, z, 1);
            }
        }

        // step simulation
        if(Key.isDown(Key.R)) {
            console.log("update");
            world.update(underpopulation, overpopulation, reproduction, !moore2D);
            Key.release(Key.R); // avoid multiple updates
        }

        if(Key.isDown(Key.T)) {
            console.log("toggle");
            run_continuous = !run_continuous;            
            Key.release(Key.T);
        }

        if(Key.isDown(Key.Y)) {
            console.log("reset");
            world.reset();
            Key.release(Key.Y);
        }

        if(run_continuous && !(cycle % (50-5*speed) )) {
            world.update(underpopulation, overpopulation, reproduction, !moore2D);
        }

        
        // debug
        if(Key.isDown(Key.L)) {
            debug = !debug;
            Key.release(Key.L);
        }

        // update debug displays
        overlay.style.display = debug ? "block" : "none";
        if(debug) {
            if(cycle % 10 == 0) fps_node.nodeValue = (1 / deltaTime).toFixed(2);
            camera_node.nodeValue = Camera.position[0].toFixed(2) + ", " + Camera.position[1].toFixed(2) + ", " + Camera.position[2].toFixed(2);
            time_node.nodeValue = world.time;
        }

        // gldraw
        drawScene(gl, programInfo, buffers[0], Camera, world);
    
        // resets mousemovement (avoid drift when mouse not moving)
        Mouse.reset();

        requestAnimationFrame(render);
    }
    render(0);
}

