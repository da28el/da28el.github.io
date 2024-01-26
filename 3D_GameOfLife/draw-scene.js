import { WORLD_SIZE } from "./world.js";

function drawScene(gl, programInfo, buffer, camera, world) {
    gl.clearColor(0.2, 0.2, 0.5, 1.0); // Clear to black, fully opaque
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
    // not wireframe
    //gl.polygonMode(gl.FRONT_AND_BACK, gl.FILL);

    // Clear the canvas before we start drawing on it.
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
  
    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 250.0;
    const projectionMatrix = mat4.create();
  
    // shared uniform matrices
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    let viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, camera.position, camera.target(), camera.WORLD_UP);

    // attributes
    setPositionAttribute(gl, buffer, programInfo);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indices);
    
    setNormalAttribute(gl, buffer, programInfo);

    gl.useProgram(programInfo.program);

    // shared uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );


    // draw
    for(let x = 0; x < WORLD_SIZE; x++) {
        for(let y = 0; y < WORLD_SIZE; y++) {
            for(let z = 0; z < WORLD_SIZE; z++) {
                let state = world.getState(x, y, z);
                if(state == 0) continue;
                drawModel(gl, programInfo, buffer, camera, [x, y, z], viewMatrix);              
            }
        }
    }
}

function drawModel(gl, programInfo, buffer, camera, position, viewMatrix) {

    let modelMatrix = mat4.create();
    let modelPosition = vec3.create();
    vec3.sub(modelPosition, vec3.scale(vec3.create(), position, 2), camera.position);
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

    { // draw
        const vertexCount = 36;
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