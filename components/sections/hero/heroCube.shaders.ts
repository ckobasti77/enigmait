// GLSL for the hero cube, kept as inline template strings so Turbopack needs no glsl loader.
//
// Two independent inputs, never mixed:
//   - colour comes from the vertex position projected on a fixed object-space axis
//   - the reveal / snake window comes from `uv.x`, the normalised arc length baked into
//     TEXCOORD_0 of hero-cube.glb
// The colour is therefore locked to the geometry: it never travels with the head.

export const heroCubeVertexShader = /* glsl */ `
uniform vec3 uGradientDir;
uniform float uGradientRange;

varying float vT;
varying float vGradient;
varying vec3 vWorldNormal;
varying vec3 vWorldView;

void main() {
  vT = uv.x;
  vGradient = clamp(dot(position, uGradientDir) / (2.0 * uGradientRange) + 0.5, 0.0, 1.0);

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldNormal = mat3(modelMatrix) * normal;
  vWorldView = cameraPosition - worldPosition.xyz;

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const heroCubeFragmentShader = /* glsl */ `
uniform sampler2D uGradient;
uniform vec3 uSpecularColor;
uniform vec3 uLightDirection;
uniform float uHead;
uniform float uGap;
uniform float uHeadLength;
uniform float uEmissiveIntensity;

varying float vT;
varying float vGradient;
varying vec3 vWorldNormal;
varying vec3 vWorldView;

// Blinn-Phong exponent standing in for roughness 0.14 (2 / roughness^2 - 2), metalness 0.
const float SHININESS = 100.0;

void main() {
  // How far behind the head this fragment sits, walking backwards along the closed path.
  // mod() gives the wrap over 0/1 for free, so uHead can just slide forever.
  float behind = mod(uHead - vT, 1.0);
  if (behind > uGap) discard;

  vec3 base = texture2D(uGradient, vec2(vGradient, 0.5)).rgb;

  vec3 view = normalize(vWorldView);
  vec3 normal = normalize(vWorldNormal);
  if (!gl_FrontFacing) normal = -normal;

  float diffuse = max(dot(normal, uLightDirection), 0.0);
  vec3 halfway = normalize(uLightDirection + view);
  float specular = pow(max(dot(normal, halfway), 0.0), SHININESS);
  // Thin rim towards the specular colour, standing in for an environment map.
  float fresnel = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), 3.0);
  float head = 1.0 - smoothstep(0.0, uHeadLength, behind);

  vec3 color = base * (0.34 + 0.66 * diffuse);
  color += uSpecularColor * specular * 0.45;
  color += uSpecularColor * fresnel * 0.2;
  color += base * uEmissiveIntensity;
  color += (base * 0.85 + uSpecularColor * 0.55) * head * 1.3;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
