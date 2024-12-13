import * as THREE from 'three';

interface FluidParams {
  dt: number;
  dyeDecay: number;
  pressureIterations: number;
  curlStrength: number;
}

export class FluidSolver {
  private gl: THREE.WebGLRenderer;
  private width: number;
  private height: number;
  private params: FluidParams;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private quad: THREE.Mesh;
  private texelSize: THREE.Vector2;

  // Double buffering for read/write operations
  private velocityFBO1: THREE.WebGLRenderTarget;
  private velocityFBO2: THREE.WebGLRenderTarget;
  private dyeFBO1: THREE.WebGLRenderTarget;
  private dyeFBO2: THREE.WebGLRenderTarget;
  private pressureFBO1: THREE.WebGLRenderTarget;
  private pressureFBO2: THREE.WebGLRenderTarget;
  private divergenceFBO: THREE.WebGLRenderTarget;
  private curlFBO: THREE.WebGLRenderTarget;

  // Materials
  private advectionMaterial: THREE.ShaderMaterial;
  private divergenceMaterial: THREE.ShaderMaterial;
  private pressureMaterial: THREE.ShaderMaterial;
  private gradientSubtractMaterial: THREE.ShaderMaterial;
  private curlMaterial: THREE.ShaderMaterial;
  private vorticityMaterial: THREE.ShaderMaterial;
  private splatMaterial: THREE.ShaderMaterial;

  constructor(gl: THREE.WebGLRenderer, width: number, height: number) {
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.params = {
      dt: 0.016,
      dyeDecay: 0.98,
      pressureIterations: 20,
      curlStrength: 30
    };

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geometry);
    this.scene.add(this.quad);

    this.texelSize = new THREE.Vector2(1.0 / width, 1.0 / height);

    // Create FBOs with floating point textures
    const createFBO = () => {
      return new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping
      });
    };

    // Initialize double buffers
    this.velocityFBO1 = createFBO();
    this.velocityFBO2 = createFBO();
    this.dyeFBO1 = createFBO();
    this.dyeFBO2 = createFBO();
    this.pressureFBO1 = createFBO();
    this.pressureFBO2 = createFBO();
    this.divergenceFBO = createFBO();
    this.curlFBO = createFBO();

    // Initialize materials with shaders
    this.advectionMaterial = new THREE.ShaderMaterial({
      uniforms: {
        velocity: { value: null },
        source: { value: null },
        dt: { value: this.params.dt },
        dissipation: { value: this.params.dyeDecay },
        texelSize: { value: this.texelSize }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D velocity;
        uniform sampler2D source;
        uniform float dt;
        uniform float dissipation;
        uniform vec2 texelSize;
        varying vec2 vUv;
        void main() {
          vec2 pos = vUv - dt * texture2D(velocity, vUv).xy * texelSize;
          gl_FragColor = dissipation * texture2D(source, pos);
        }
      `
    });

    this.splatMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTarget: { value: null },
        aspectRatio: { value: width / height },
        point: { value: new THREE.Vector2() },
        color: { value: new THREE.Vector3() },
        radius: { value: 0.025 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec2 point;
        uniform vec3 color;
        uniform float radius;
        varying vec2 vUv;
        void main() {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          float splat = exp(-dot(p, p) / radius);
          vec3 base = texture2D(uTarget, vUv).xyz;
          gl_FragColor = vec4(base + splat * color, 1.0);
        }
      `
    });

    // Clear all FBOs
    this.clear(this.velocityFBO1);
    this.clear(this.velocityFBO2);
    this.clear(this.dyeFBO1);
    this.clear(this.dyeFBO2);
    this.clear(this.pressureFBO1);
    this.clear(this.pressureFBO2);
    this.clear(this.divergenceFBO);
    this.clear(this.curlFBO);
  }

  private clear(target: THREE.WebGLRenderTarget) {
    const currentRT = this.gl.getRenderTarget();
    this.gl.setRenderTarget(target);
    this.gl.clear();
    this.gl.setRenderTarget(currentRT);
  }

  step(dt: number) {
    // Save current render target
    const currentRT = this.gl.getRenderTarget();

    // Advect velocity
    this.advectionMaterial.uniforms.velocity.value = this.velocityFBO1.texture;
    this.advectionMaterial.uniforms.source.value = this.velocityFBO1.texture;
    this.advectionMaterial.uniforms.dt.value = dt;
    this.quad.material = this.advectionMaterial;
    this.gl.setRenderTarget(this.velocityFBO2);
    this.gl.render(this.scene, this.camera);

    // Swap velocity buffers
    [this.velocityFBO1, this.velocityFBO2] = [this.velocityFBO2, this.velocityFBO1];

    // Advect dye
    this.advectionMaterial.uniforms.velocity.value = this.velocityFBO1.texture;
    this.advectionMaterial.uniforms.source.value = this.dyeFBO1.texture;
    this.advectionMaterial.uniforms.dissipation.value = this.params.dyeDecay;
    this.gl.setRenderTarget(this.dyeFBO2);
    this.gl.render(this.scene, this.camera);

    // Swap dye buffers
    [this.dyeFBO1, this.dyeFBO2] = [this.dyeFBO2, this.dyeFBO1];

    // Restore render target
    this.gl.setRenderTarget(currentRT);
  }

  splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
    const currentRT = this.gl.getRenderTarget();

    // Add velocity
    this.splatMaterial.uniforms.uTarget.value = this.velocityFBO1.texture;
    this.splatMaterial.uniforms.point.value.set(x, y);
    this.splatMaterial.uniforms.color.value.set(dx * 10, dy * 10, 0);
    this.quad.material = this.splatMaterial;
    this.gl.setRenderTarget(this.velocityFBO2);
    this.gl.render(this.scene, this.camera);
    [this.velocityFBO1, this.velocityFBO2] = [this.velocityFBO2, this.velocityFBO1];

    // Add dye
    this.splatMaterial.uniforms.uTarget.value = this.dyeFBO1.texture;
    this.splatMaterial.uniforms.color.value.set(color[0], color[1], color[2]);
    this.gl.setRenderTarget(this.dyeFBO2);
    this.gl.render(this.scene, this.camera);
    [this.dyeFBO1, this.dyeFBO2] = [this.dyeFBO2, this.dyeFBO1];

    this.gl.setRenderTarget(currentRT);
  }

  getDyeTexture(): THREE.Texture {
    return this.dyeFBO1.texture;
  }

  dispose() {
    this.velocityFBO1.dispose();
    this.velocityFBO2.dispose();
    this.dyeFBO1.dispose();
    this.dyeFBO2.dispose();
    this.pressureFBO1.dispose();
    this.pressureFBO2.dispose();
    this.divergenceFBO.dispose();
    this.curlFBO.dispose();

    this.quad.geometry.dispose();
    this.advectionMaterial.dispose();
    this.splatMaterial.dispose();
  }
}