const vsSource = 
`
attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uTime;

varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;

precision mediump float;

void main()
{
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

    vTextureCoord = aTextureCoord;

    float time = uTime / 10.0;

    highp vec3 ambientLight = vec3(0.6);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.4, 1.0, 0.2));
    
    highp float directional = max(dot(aVertexNormal, directionalVector), 0.0);
    vLighting = 0.8*ambientLight + (directionalLightColor * directional);
}
`;

export { vsSource };