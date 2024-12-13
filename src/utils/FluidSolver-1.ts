import * as THREE from 'three';

// Shader code for fluid simulation
const baseVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const advectionShader = `
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

varying vec2 vUv;

void main() {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    gl_FragColor = dissipation * texture2D(uSource, coord);
}`;

const divergenceShader = `
uniform sampler2D uVelocity;
uniform vec2 texelSize;

varying vec2 vUv;

void main() {
    float L = texture2D(uVelocity, vUv - vec2(texelSize.x, 0.0)).x;
    float R = texture2D(uVelocity, vUv + vec2(texelSize.x, 0.0)).x;
    float T = texture2D(uVelocity, vUv + vec2(0.0, texelSize.y)).y;
    float B = texture2D(uVelocity, vUv - vec2(0.0, texelSize.y)).y;

    gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const pressureShader = `
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 texelSize;

varying vec2 vUv;

void main() {
    float L = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
    float R = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
    float T = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;
    float B = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;
    float C = texture2D(uPressure, vUv).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;

const gradientSubtractShader = `
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 texelSize;

varying vec2 vUv;

void main() {
    float L = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
    float R = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
    float T = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;
    float B = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

const splatShader = `
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;

varying vec2 vUv;

void main() {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
}`;

export class FluidSolver {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.OrthographicCamera;
  private scene: THREE.Scene;
  private mesh: THREE.Mesh;

  private velocityFBO: THREE.WebGLRenderTarget;
  private pressureFBO: THREE.WebGLRenderTarget;
  private divergenceFBO: THREE.WebGLRenderTarget;
  private dyeFBO: THREE.WebGLRenderTarget;

  private advectionMaterial: THREE.ShaderMaterial;
  private divergenceMaterial: THREE.ShaderMaterial;
  private pressureMaterial: THREE.ShaderMaterial;
  private gradientSubtractMaterial: THREE.ShaderMaterial;
  private splatMaterial: THREE.ShaderMaterial;

  constructor(renderer: THREE.WebGLRenderer, width: number, height: number) {
    this.renderer = renderer;

    // Setup camera and scene
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene();
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.scene.add(this.mesh);

    // Create render targets
    const options = {
      type: THREE.FloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    };

    this.velocityFBO = new THREE.WebGLRenderTarget(width, height, options);
    this.pressureFBO = new THREE.WebGLRenderTarget(width, height, options);
    this.divergenceFBO = new THREE.WebGLRenderTarget(width, height, options);
    this.dyeFBO = new THREE.WebGLRenderTarget(width, height, options);

    // Create materials
    const texelSize = new THREE.Vector2(1 / width, 1 / height);

    this.advectionMaterial = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: advectionShader,
      uniforms: {
        uVelocity: { value: null },
        uSource: { value: null },
        texelSize: { value: texelSize },
        dt: { value: 0.016 },
        dissipation: { value: 0.98 },
      },
    });

    this.divergenceMaterial = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: divergenceShader,
      uniforms: {
        uVelocity: { value: null },
        texelSize: { value: texelSize },
      },
    });

    this.pressureMaterial = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: pressureShader,
      uniforms: {
        uPressure: { value: null },
        uDivergence: { value: null },
        texelSize: { value: texelSize },
      },
    });

    this.gradientSubtractMaterial = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: gradientSubtractShader,
      uniforms: {
        uPressure: { value: null },
        uVelocity: { value: null },
        texelSize: { value: texelSize },
      },
    });

    this.splatMaterial = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: splatShader,
      uniforms: {
        uTarget: { value: null },
        aspectRatio: { value: width / height },
        color: { value: new THREE.Vector3() },
        point: { value: new THREE.Vector2() },
        radius: { value: 0.01 },
      },
    });
  }

  step(dt: number) {
    // Advect velocity
    this.mesh.material = this.advectionMaterial;
    this.advectionMaterial.uniforms.uVelocity.value = this.velocityFBO.texture;
    this.advectionMaterial.uniforms.uSource.value = this.velocityFBO.texture;
    this.advectionMaterial.uniforms.dt.value = dt;
    this.renderer.setRenderTarget(this.velocityFBO);
    this.renderer.render(this.scene, this.camera);

    // Compute divergence
    this.mesh.material = this.divergenceMaterial;
    this.divergenceMaterial.uniforms.uVelocity.value = this.velocityFBO.texture;
    this.renderer.setRenderTarget(this.divergenceFBO);
    this.renderer.render(this.scene, this.camera);

    // Solve pressure
    this.mesh.material = this.pressureMaterial;
    this.pressureMaterial.uniforms.uDivergence.value = this.divergenceFBO.texture;
    for (let i = 0; i < 20; i++) {
      this.pressureMaterial.uniforms.uPressure.value = this.pressureFBO.texture;
      this.renderer.setRenderTarget(this.pressureFBO);
      this.renderer.render(this.scene, this.camera);
    }

    // Subtract pressure gradient
    this.mesh.material = this.gradientSubtractMaterial;
    this.gradientSubtractMaterial.uniforms.uPressure.value = this.pressureFBO.texture;
    this.gradientSubtractMaterial.uniforms.uVelocity.value = this.velocityFBO.texture;
    this.renderer.setRenderTarget(this.velocityFBO);
    this.renderer.render(this.scene, this.camera);

    // Advect dye
    this.mesh.material = this.advectionMaterial;
    this.advectionMaterial.uniforms.uVelocity.value = this.velocityFBO.texture;
    this.advectionMaterial.uniforms.uSource.value = this.dyeFBO.texture;
    this.renderer.setRenderTarget(this.dyeFBO);
    this.renderer.render(this.scene, this.camera);
  }

  splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
    // Add velocity
    this.mesh.material = this.splatMaterial;
    this.splatMaterial.uniforms.uTarget.value = this.velocityFBO.texture;
    this.splatMaterial.uniforms.point.value.set(x, y);
    this.splatMaterial.uniforms.color.value.set(dx, dy, 0);
    this.splatMaterial.uniforms.radius.value = 0.01;
    this.renderer.setRenderTarget(this.velocityFBO);
    this.renderer.render(this.scene, this.camera);

    // Add dye
    this.splatMaterial.uniforms.uTarget.value = this.dyeFBO.texture;
    this.splatMaterial.uniforms.color.value.set(color[0], color[1], color[2]);
    this.renderer.setRenderTarget(this.dyeFBO);
    this.renderer.render(this.scene, this.camera);
  }

  getDyeTexture(): THREE.Texture {
    return this.dyeFBO.texture;
  }

  getVelocityTexture(): THREE.Texture {
    return this.velocityFBO.texture;
  }

  dispose() {
    this.velocityFBO.dispose();
    this.pressureFBO.dispose();
    this.divergenceFBO.dispose();
    this.dyeFBO.dispose();

    this.mesh.geometry.dispose();
    this.advectionMaterial.dispose();
    this.divergenceMaterial.dispose();
    this.pressureMaterial.dispose();
    this.gradientSubtractMaterial.dispose();
    this.splatMaterial.dispose();
  }
} 


