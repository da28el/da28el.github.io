import { CHUNK_SIZE } from "./world.js";

function drawScene(gl, programInfo, buffer, camera, world, selected) {
    gl.clearColor(0.2, 0.2, 0.8, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LESS); // Near things obscure far things
  
    gl.enable(gl.CULL_FACE); // Cull triangles which normal is not towards the camera
    gl.cullFace(gl.BACK); // Cull back face
    gl.frontFace(gl.CW); // Front face is counter clockwise

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // wireframe
    //gl.polygonMode(gl.FRONT_AND_BACK, gl.LINE);

    // Clear the canvas before we start drawing on it.
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
  
    const fieldOfView = (70 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 300.0;
    const projectionMatrix = mat4.create();
  
    // shared uniform matrices
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    let viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, camera.position, camera.target(), camera.WORLD_UP);

    // attributes
    setPositionAttribute(gl, buffer[0], programInfo);
    setTextureAttribute(gl, buffer[0], programInfo);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer[0].indices);
    
    setNormalAttribute(gl, buffer[0], programInfo);

    gl.useProgram(programInfo.program);

    // shared uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );
    gl.uniform1f(
        programInfo.uniformLocations.time,
        performance.now() / 1000
    );


    // draw cubes
    for(let chunk of world.chunks)
    {
        if(chunk == null) continue;
        // frustum culling
        let dx = chunk.x + CHUNK_SIZE/2 - camera.position[0];
        let dz = chunk.z + CHUNK_SIZE/2 - camera.position[2];
        let distance = [dx, dz];
        let norm = vec2.normalize(vec2.create(), distance);
        let dot = vec2.dot(norm, [camera.direction[0], camera.direction[2]]);
        if(vec2.length(distance) > 4*CHUNK_SIZE && dot < 0.0)
            continue;
        // max distance
        if(vec2.length(distance) > 8*CHUNK_SIZE)
            continue;
        for(let block of chunk.blocks)
        {
            if(block == null || block.id == 0 || !block.visible) continue;
            drawModel(gl, programInfo, camera, block, viewMatrix);
        }
    }

    // draw HUD
    gl.disable(gl.DEPTH_TEST);
    // attributes
    setPositionAttribute(gl, buffer[1], programInfo);
    setTextureAttribute(gl, buffer[1], programInfo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer[1].indices);
    setNormalAttribute(gl, buffer[1], programInfo);


    drawQuad(gl, programInfo, [-0.6,         -0.9, 0], [0.6/aspect, 0.1, 0], 0); // hotbar
    drawQuad(gl, programInfo, [-0.85 - (2-selected)/12,   -0.9, 0], [0.06/aspect, 0.06, 0], 1); // highlight
    drawQuad(gl, programInfo, [-0.85 - 1/12, -0.9, 0], [0.05/aspect, 0.05, 0], 11); // grass
    drawQuad(gl, programInfo, [-0.85 + 0/12, -0.9, 0], [0.05/aspect, 0.05, 0], 12); // dirt
    drawQuad(gl, programInfo, [-0.85 + 1/12, -0.9, 0], [0.05/aspect, 0.05, 0], 13); // stone


    /*
    
    -0.6-1/3    = -0.9333
                delta = 0.08333
    -0.85       = -0.85
                delta = 0.08333
    -0.1-2/3    = -0.7666
    
    */

}

function drawModel(gl, programInfo, camera, block, viewMatrix) {

    let modelMatrix = mat4.create();
    let modelPosition = vec3.create();
    vec3.sub(modelPosition, vec3.scale(vec3.create(), block.position, 2), camera.position);
    mat4.translate(
        modelMatrix, // destination matrix
        modelMatrix, // matrix to translate
        modelPosition // amount to translate
    );
    
    let modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

    // unique uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
    );

    gl.uniform1i(programInfo.uniformLocations.uSampler, 10+block.id);

    { // draw
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

}

function drawQuad(gl, programInfo, translation, scale, texture) {

    let modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, translation);
    mat4.scale(modelViewMatrix, modelViewMatrix, scale);

    // shared uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        mat4.create()
    );

    // unique uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
    );

    gl.uniform1i(programInfo.uniformLocations.uSampler, texture);

    { // draw
        const vertexCount = 6;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

}

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttribute(gl, buffer, programInfo) {
    const numComponents = 3; // pull out 2 values per iteration
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

function setNormalAttribute(gl, buffer, programInfo) {
    const numComponents = 3; // pull out 2 values per iteration
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normal);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}

function setTextureAttribute(gl, buffer, programInfo) {
    const numComponents = 2; // pull out 2 values per iteration
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
}

export { drawScene };