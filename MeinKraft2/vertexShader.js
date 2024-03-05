const vsSource = 
`
precision mediump float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uTime;

varying highp vec2 vTextureCoord;
varying highp vec3 vNormal;

void main()
{
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
    vNormal = aVertexNormal;
    vTextureCoord = aTextureCoord;
}
`;

export { vsSource };