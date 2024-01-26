const vsSource = 
`
attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec3 vLighting;
varying highp vec3 vNormal;

precision mediump float;

void main()
{
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

    highp vec3 ambientLight = vec3(0.6);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.4, 1.0, 0.2));
    
    highp float directional = max(dot(aVertexNormal, directionalVector), 0.0);
    vLighting = 0.8*ambientLight + (directionalLightColor * directional);
    vNormal = aVertexNormal;
}
`;

export { vsSource };