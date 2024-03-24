const fsSource = 
`
varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;

uniform sampler2D uSampler;

precision mediump float;

void main()
{
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
    
    gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
}
`;

export { fsSource };