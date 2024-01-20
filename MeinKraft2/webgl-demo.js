import { drawScene } from "./draw-scene.js";

import { initShaderProgram } from "./shader.js";
import { vsSource } from "./vertexShader.js";
import { fsSource } from "./fragmentShader.js";

import { Key } from "./key.js";
import { Mouse } from "./mouse.js";
import { Camera } from "./camera.js";
import { loadTextures } from "./texture.js";

import { World } from "./world.js";
import { Model } from "./model.js";

let deltaTime = 0;

main();

//
// start here
//
function main() {
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
            textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
            time: gl.getUniformLocation(shaderProgram, "uTime"),
        },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    
    let world = new World();
    world.generate();

    //let models = [];
    //models.push(Model.Cube([0, 2, 0], [0, 0, 0], [1, 1, 1]));

    let buffers = [];
    buffers.push(Model.Cube().bufferData(gl));

    // load texture
    loadTextures(gl);

    let then = 0;

    // Draw the scene repeatedly
    function render(now) {
        now *= 1e-3; // convert to seconds
        deltaTime = now - then;
        then = now;

        Camera.handleInput(Key, Mouse, deltaTime);
        
        //let hit = Camera.raycast(world);
        //console.log(hit);        

        Mouse.reset();
        
        Camera.update();

        drawScene(gl, programInfo, buffers[0], Camera, world.chunks);

        requestAnimationFrame(render);
    }
    render(0);
}

