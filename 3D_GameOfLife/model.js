class Model {
    constructor(vertices, indices, normals, position = [0, 0, 0]) {
        this.vertices = vertices;
        this.indices = indices;
        this.normals = normals;
        this.position = position;
    }

    bufferData(gl) {
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);

        return {
            position: this.positionBuffer,
            normal: this.normalBuffer,
            indices: this.indexBuffer,
        };
    }

    modelMatrix(cameraPosition) {
        let model = mat4.create();

        let modelPosition = vec3.create();
        vec3.sub(modelPosition, this.position, cameraPosition)

        mat4.translate(
            model, // destination matrix
            model, // matrix to translate
            modelPosition // amount to translate
        );

        return model;
    }

    static Cube(position = [0, 0, 0]) {
        const vertices = [
            // Front face
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            // Back face
            -1.0, 1.0, -1.0,
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            // Top face
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            // Bottom face
            1.0, -1.0, -1.0,
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            // Right face
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            // Left face
            -1.0, -1.0, 1.0,
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
        ];

        const indices = [
            0, 1, 2, 0, 2, 3, // front
            4, 5, 6, 4, 6, 7, // back
            8, 9, 10, 8, 10, 11, // top
            12, 13, 14, 12, 14, 15, // bottom
            16, 17, 18, 16, 18, 19, // right
            20, 21, 22, 20, 22, 23, // left
        ];

        const vertexNormals = [
            // Front
            [0.0, 0.0, 1.0],
            // Back
            [0.0, 0.0, -1.0],
            // Top
            [0.0, 1.0, 0.0],
            // Bottom
            [0.0, -1.0, 0.0],
            // Right
            [1.0, 0.0, 0.0],
            // Left
            [-1.0, 0.0, 0.0],
        ];
    
        let normals = [];
    
        for (let i = 0; i < vertexNormals.length; i++) {
            const normal = vertexNormals[i];
            for (let j = 0; j < 4; j++) {
                normals = normals.concat(normal);
            }
        }

        return new Model(vertices, indices, normals, position);
    }

}



export { Model }