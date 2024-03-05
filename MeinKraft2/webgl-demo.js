import { drawScene } from "./draw-scene.js";

import { initShaderProgram } from "./shader.js";
import { vsSource } from "./vertexShader.js";
import { fsSource } from "./fragmentShader.js";

import { Key } from "./key.js";
import { Mouse } from "./mouse.js";
import { Camera } from "./camera.js";
import { loadTextures } from "./texture.js";
import { initOverlay, updateOverlay } from "./hud.js";

import { World } from "./world.js";
import { Block } from "./block.js";
import { Model } from "./model.js";

let deltaTime = 0;

let showOverlay = false;

main();

//
// start here
//

function main() {
    // displays
    const overlays = initOverlay();

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

    console.log('WebGL version: ', gl.getParameter(gl.VERSION));
    console.log('WebGL vendor : ', gl.getParameter(gl.VENDOR));
    console.log('WebGL supported extensions: ', gl.getSupportedExtensions());

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
            sampler: gl.getUniformLocation(shaderProgram, "uSampler"),
            light: gl.getUniformLocation(shaderProgram, "uLight"),
            time: gl.getUniformLocation(shaderProgram, "uTime"),
        },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    
    let world = new World();

    let buffers = [];
    buffers.push(Model.Cube().bufferData(gl));
    buffers.push(Model.Quad().bufferData(gl));

    // load texture
    loadTextures(gl);

    let then = 0;

    let placeBlock = 1;

    // Draw the scene repeatedly
    function render(now) {
        // timing
        now *= 1e-3; // convert to seconds
        deltaTime = now - then;
        then = now;

        // input
        Camera.handleInput(Key, Mouse, deltaTime);
        Camera.update();
        
        // raycast target block
        let ray = Camera.raycast(world);
        if(ray.hit != null) {
            if(Mouse.isDown(Mouse.LEFT)) {
                world.breakBlock(ray.hit.position[0], ray.hit.position[1], ray.hit.position[2]);
            }
            if(Mouse.isDown(Mouse.RIGHT)) {
                let x = Math.round(ray.side[0]);
                let y = Math.round(ray.side[1]);
                let z = Math.round(ray.side[2]);
                world.placeBlockId(x, y, z, placeBlock);
            }
        }

        if(Key.isDown(Key.N1)) {
            placeBlock = Block.IDs.GRASS;
        }
        if(Key.isDown(Key.N2)) {
            placeBlock = Block.IDs.DIRT;
        }
        if(Key.isDown(Key.N3)) {
            placeBlock = Block.IDs.STONE;
        }

        Mouse.reset();
        
        // gldraw
        drawScene(gl, programInfo, buffers, Camera, world, placeBlock);

        // overlay
        if(Key.isDown(Key.L)) {
            showOverlay = !showOverlay;
            Key.release(Key.L);
        }
        
        updateOverlay(overlays, deltaTime, Camera, world, showOverlay);
    
        requestAnimationFrame(render);
    }
    render(0);
}

