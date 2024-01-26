const fsSource = 
`
varying highp vec3 vLighting;

varying highp vec3 vNormal;

precision mediump float;

void main()
{
    vec3 color = vNormal * 0.5 + 0.5;
    gl_FragColor = vec4(color, 1.0); //vec4(vLighting, 1.0);
}
`;

export { fsSource };