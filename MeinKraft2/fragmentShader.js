const fsSource = 
`
precision mediump float;

varying highp vec2 vTextureCoord;
varying highp vec3 vNormal;

uniform sampler2D uSampler;
uniform float uLight;

void main()
{
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
    
    gl_FragColor = vec4(texelColor.rgb * uLight, texelColor.a);
}
`;

export { fsSource };