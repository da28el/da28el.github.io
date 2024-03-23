let time = 0.0;
let mouse = {x: 0, y: 0, z: 0};
let animFrame = null;
main();

function main() {
    time = 0.0;
    if (animFrame)
        cancelAnimationFrame(animFrame);
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2');

    if (!gl) {
        alert('Din webbläsare är ass loser');
        return;
    }

    const width = canvas.width;// = window.innerWidth;
    const height = canvas.height;// = window.innerHeight;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);


    const vsSource = 
    `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uMouse;

    varying highp vec2 vPos;
    varying float fTime;
    varying highp vec2 vResolution;
    varying highp vec3 vMouse;

    void main() {
        vPos = aVertexPosition.xy;
        fTime = uTime;
        vResolution = uResolution;
        vMouse = uMouse;
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
    `;

    // const fsSource = 
    // `
    // varying highp vec2 vPos;
    // void main() {
    //     gl_FragColor = vec4((vPos+1.0)/2.0, 1.0);
    // }
    // `;    

    const fsSource = "precision highp float;\n" + document.getElementById("shader").value;

    console.log(fsSource);

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            time: gl.getUniformLocation(shaderProgram, "uTime"),
            resolution: gl.getUniformLocation(shaderProgram, "uResolution"),
            mouse: gl.getUniformLocation(shaderProgram, "uMouse")
        },
    };

    const buffers = initBuffers(gl);

    render(gl, programInfo, buffers);
}

function initShaderProgram(gl, vsSource, fsSource) {
    function loadShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert("Det hjälper om du skriver fungerande kod bozo😝\n" + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Vad har du gjort fel den här gången??🤦🏻\n" + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

function initBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
    };
}

function render(gl, programInfo, buffers) {

    time += 0.01;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const identity = [
        1,0,0,0,
        0,1,0,0, 
        0,0,1,0, 
        0,0,0,1,
    ];
    
    const projectionMatrix = new Float32Array(identity);

    const modelViewMatrix = new Float32Array(identity);

    setPositionAttribute(gl, programInfo, buffers.position);
    
    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniform1f(programInfo.uniformLocations.time, time);
    gl.uniform2f(programInfo.uniformLocations.resolution, gl.canvas.width, gl.canvas.height);
    gl.uniform3f(programInfo.uniformLocations.mouse, mouse.x, mouse.y, mouse.z);
    
    {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
    animFrame = requestAnimationFrame(() => render(gl, programInfo, buffers));
}

function setPositionAttribute(gl, programInfo, buffer) {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
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



document.getElementById('shader').addEventListener('keydown', function(e) {
    if (e.key == 'Tab') {
      e.preventDefault();
      var start = this.selectionStart;
      var end = this.selectionEnd;
  
      this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 4;
    }
    if (e.key == 'Enter' && e.ctrlKey) {
        main();
    }
});

document.getElementById('canvas').addEventListener('mousemove', function(event) {
    const rect = document.querySelector('canvas').getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});

document.getElementById('canvas').addEventListener('mouseleave', function(event) {
    mouse.z = 0.0;
});

document.getElementById('canvas').addEventListener('mousedown', function(event) {
    mouse.z = 1.0;
});

document.getElementById('canvas').addEventListener('mouseup', function(event) {
    mouse.z = 0.0;
});