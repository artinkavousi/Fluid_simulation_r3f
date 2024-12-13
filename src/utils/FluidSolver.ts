import * as THREE from 'three';

interface FluidParams {
  dt: number;
  dyeDecay: number;
  pressureIterations: number;
  curlStrength: number;
  viscosity: number;
  temperature: number;
  buoyancy: number;
  density: number;
  diffusion: number;
  velocityDissipation: number;
  temperatureDissipation: number;
  pressureDissipation: number;
  colorDiffusion: number;
  audioReactivity: number;
  vorticityScale: number;
  colorIntensity: number;
  colorMixing: number;
  rainbowEffect: number;
  bloomStrength: number;
  chromaticAberration: number;
  motionBlurStrength: number;
  kaleidoscopeSegments: number;
  kaleidoscopeRotation: number;
  distortionStrength: number;
  noiseScale: number;
  pulseSpeed: number;
  waveAmplitude: number;
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
  private temperatureFBO1: THREE.WebGLRenderTarget;
  private temperatureFBO2: THREE.WebGLRenderTarget;

  // Materials
  private advectionMaterial: THREE.ShaderMaterial;
  private divergenceMaterial: THREE.ShaderMaterial;
  private pressureMaterial: THREE.ShaderMaterial;
  private gradientSubtractMaterial: THREE.ShaderMaterial;
  private curlMaterial: THREE.ShaderMaterial;
  private vorticityMaterial: THREE.ShaderMaterial;
  private splatMaterial: THREE.ShaderMaterial;
  private buoyancyMaterial: THREE.ShaderMaterial;
  private diffusionMaterial: THREE.ShaderMaterial;
  private colorMixMaterial: THREE.ShaderMaterial;
  private bloomMaterial: THREE.ShaderMaterial;

  private audioData: Uint8Array | null = null;
  private time: number = 0;

  private chromaticAberrationMaterial: THREE.ShaderMaterial;
  private motionBlurMaterial: THREE.ShaderMaterial;
  private kaleidoscopeMaterial: THREE.ShaderMaterial;
  private distortionMaterial: THREE.ShaderMaterial;

  constructor(gl: THREE.WebGLRenderer, width: number, height: number) {
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.params = {
      dt: 0.016,
      dyeDecay: 0.98,
      pressureIterations: 20,
      curlStrength: 30,
      viscosity: 0.5,
      temperature: 0.3,
      buoyancy: 1.0,
      density: 0.98,
      diffusion: 0.1,
      velocityDissipation: 0.98,
      temperatureDissipation: 0.95,
      pressureDissipation: 0.95,
      colorDiffusion: 0.995,
      audioReactivity: 0.5,
      vorticityScale: 1.0,
      colorIntensity: 1.0,
      colorMixing: 0.2,
      rainbowEffect: 0.0,
      bloomStrength: 0.5,
      chromaticAberration: 0.0,
      motionBlurStrength: 0.0,
      kaleidoscopeSegments: 6,
      kaleidoscopeRotation: 0.0,
      distortionStrength: 0.0,
      noiseScale: 1.0,
      pulseSpeed: 1.0,
      waveAmplitude: 0.0
    };

    // Save current WebGL state
    const currentRenderTarget = this.gl.getRenderTarget();
    
    // Initialize scene and camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Create quad geometry
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geometry);
    this.scene.add(this.quad);

    this.texelSize = new THREE.Vector2(1.0 / width, 1.0 / height);

    // Create FBOs with proper settings
    const createFBO = () => {
      return new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        depthBuffer: false,
        stencilBuffer: false
      });
    };

    // Initialize all FBOs
    this.velocityFBO1 = createFBO();
    this.velocityFBO2 = createFBO();
    this.dyeFBO1 = createFBO();
    this.dyeFBO2 = createFBO();
    this.pressureFBO1 = createFBO();
    this.pressureFBO2 = createFBO();
    this.divergenceFBO = createFBO();
    this.curlFBO = createFBO();
    this.temperatureFBO1 = createFBO();
    this.temperatureFBO2 = createFBO();

    // Initialize materials with shaders
    const baseVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    this.advectionMaterial = new THREE.ShaderMaterial({
      uniforms: {
        velocity: { value: null },
        source: { value: null },
        dt: { value: this.params.dt },
        dissipation: { value: this.params.velocityDissipation },
        texelSize: { value: this.texelSize }
      },
      vertexShader: baseVertexShader,
      fragmentShader: `
        uniform sampler2D velocity;
        uniform sampler2D source;
        uniform float dt;
        uniform float dissipation;
        uniform vec2 texelSize;
        varying vec2 vUv;
        
        vec4 bilerp(sampler2D sam, vec2 uv) {
          vec2 st = uv / texelSize - 0.5;
          vec2 iuv = floor(st);
          vec2 fuv = fract(st);
          vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * texelSize);
          vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * texelSize);
          vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * texelSize);
          vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * texelSize);
          return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }
        
        void main() {
          vec2 pos = vUv - dt * texture2D(velocity, vUv).xy * texelSize;
          gl_FragColor = dissipation * bilerp(source, pos);
        }
      `
    });

    this.divergenceMaterial = new THREE.ShaderMaterial({
      uniforms: {
        velocity: { value: null },
        texelSize: { value: this.texelSize }
      },
      vertexShader: baseVertexShader,
      fragmentShader: `
        uniform sampler2D velocity;
        uniform vec2 texelSize;
        varying vec2 vUv;
        void main() {
          float L = texture2D(velocity, vUv - vec2(texelSize.x, 0.0)).x;
          float R = texture2D(velocity, vUv + vec2(texelSize.x, 0.0)).x;
          float T = texture2D(velocity, vUv + vec2(0.0, texelSize.y)).y;
          float B = texture2D(velocity, vUv - vec2(0.0, texelSize.y)).y;
          float div = 0.5 * (R - L + T - B);
          gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `
    });

    this.pressureMaterial = new THREE.ShaderMaterial({
      uniforms: {
        pressure: { value: null },
        divergence: { value: null },
        texelSize: { value: this.texelSize }
      },
      vertexShader: baseVertexShader,
      fragmentShader: `
        uniform sampler2D pressure;
        uniform sampler2D divergence;
        uniform vec2 texelSize;
        varying vec2 vUv;
        void main() {
          float L = texture2D(pressure, vUv - vec2(texelSize.x, 0.0)).x;
          float R = texture2D(pressure, vUv + vec2(texelSize.x, 0.0)).x;
          float T = texture2D(pressure, vUv + vec2(0.0, texelSize.y)).x;
          float B = texture2D(pressure, vUv - vec2(0.0, texelSize.y)).x;
          float div = texture2D(divergence, vUv).x;
          gl_FragColor = vec4((L + R + T + B - div) * 0.25, 0.0, 0.0, 1.0);
        }
      `
    });

    this.gradientSubtractMaterial = new THREE.ShaderMaterial({
      uniforms: {
        pressure: { value: null },
        velocity: { value: null },
        texelSize: { value: this.texelSize }
      },
      vertexShader: baseVertexShader,
      fragmentShader: `
        uniform sampler2D pressure;
        uniform sampler2D velocity;
        uniform vec2 texelSize;
        varying vec2 vUv;
        void main() {
          float L = texture2D(pressure, vUv - vec2(texelSize.x, 0.0)).x;
          float R = texture2D(pressure, vUv + vec2(texelSize.x, 0.0)).x;
          float T = texture2D(pressure, vUv + vec2(0.0, texelSize.y)).x;
          float B = texture2D(pressure, vUv - vec2(0.0, texelSize.y)).x;
          vec2 vel = texture2D(velocity, vUv).xy;
          gl_FragColor = vec4(vel - vec2(R - L, T - B) * 0.5, 0.0, 1.0);
        }
      `
    });

    this.curlMaterial = new THREE.ShaderMaterial({
      uniforms: {
        velocity: { value: null },
        texelSize: { value: this.texelSize }
      },
      vertexShader: baseVertexShader,
      fragmentShader: `
        uniform sampler2D velocity;
        uniform vec2 texelSize;
        varying vec2 vUv;
        void main() {
          float L = texture2D(velocity, vUv - vec2(texelSize.x, 0.0)).y;
          float R = texture2D(velocity, vUv + vec2(texelSize.x, 0.0)).y;
          float T = texture2D(velocity, vUv + vec2(0.0, texelSize.y)).x;
          float B = texture2D(velocity, vUv - vec2(0.0, texelSize.y)).x;
          float curl = R - L - (T - B);
          gl_FragColor = vec4(curl, 0.0, 0.0, 1.0);
        }
      `
    });

    this.vorticityMaterial = new THREE.ShaderMaterial({
      uniforms: {
        velocity: { value: null },
        curl: { value: null },
        curlStrength: { value: this.params.curlStrength },
        texelSize: { value: this.texelSize },
        audioInfluence: { value: 0.0 },
        vorticityScale: { value: this.params.vorticityScale }
      },
      vertexShader: baseVertexShader,
      fragmentShader: `
        uniform sampler2D velocity;
        uniform sampler2D curl;
        uniform float curlStrength;
        uniform float audioInfluence;
        uniform float vorticityScale;
        uniform vec2 texelSize;
        varying vec2 vUv;
        void main() {
          float c = texture2D(curl, vUv).x;
          float audioScale = 1.0 + audioInfluence;
          vec2 force = vec2(c * curlStrength * audioScale, -c * curlStrength * audioScale) * vorticityScale;
          vec2 vel = texture2D(velocity, vUv).xy;
          gl_FragColor = vec4(vel + force * texelSize, 0.0, 1.0);
        }
      `
    });

    this.splatMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTarget: { value: null },
        aspectRatio: { value: this.width / this.height },
        point: { value: new THREE.Vector2() },
        color: { value: new THREE.Vector3() },
        radius: { value: 0.0075 },
        strength: { value: 1.0 }
      },
      vertexShader: baseVertexShader,
      fragmentShader: `
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec2 point;
        uniform vec3 color;
        uniform float radius;
        uniform float strength;
        varying vec2 vUv;
        void main() {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          float splat = exp(-dot(p, p) / (radius * 0.5)) * strength;
          vec3 base = texture2D(uTarget, vUv).xyz;
          gl_FragColor = vec4(base + splat * color, 1.0);
        }
      `
    });

    this.buoyancyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        velocity: { value: null },
        temperature: { value: null },
        density: { value: this.params.density },
        buoyancy: { value: this.params.buoyancy }
      },
      vertexShader: baseVertexShader,
      fragmentShader: `
        uniform sampler2D velocity;
        uniform sampler2D temperature;
        uniform float density;
        uniform float buoyancy;
        varying vec2 vUv;
        void main() {
          float temp = texture2D(temperature, vUv).r;
          vec2 vel = texture2D(velocity, vUv).xy;
          vec2 buoyancyForce = vec2(0.0, buoyancy * (temp - density));
          gl_FragColor = vec4(vel + buoyancyForce, 0.0, 1.0);
        }
      `
    });

    this.diffusionMaterial = new THREE.ShaderMaterial({
      uniforms: {
        source: { value: null },
        diffusion: { value: this.params.diffusion },
        texelSize: { value: this.texelSize }
      },
      vertexShader: baseVertexShader,
      fragmentShader: `
        uniform sampler2D source;
        uniform float diffusion;
        uniform vec2 texelSize;
        varying vec2 vUv;
        void main() {
          vec4 center = texture2D(source, vUv);
          vec4 left = texture2D(source, vUv - vec2(texelSize.x, 0.0));
          vec4 right = texture2D(source, vUv + vec2(texelSize.x, 0.0));
          vec4 top = texture2D(source, vUv + vec2(0.0, texelSize.y));
          vec4 bottom = texture2D(source, vUv - vec2(0.0, texelSize.y));
          gl_FragColor = mix(center, (left + right + top + bottom) * 0.25, diffusion);
        }
      `
    });

    // Color mixing material
    this.colorMixMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dye: { value: null },
        time: { value: 0.0 },
        mixStrength: { value: this.params.colorMixing },
        rainbowEffect: { value: this.params.rainbowEffect },
        colorIntensity: { value: this.params.colorIntensity }
      },
      vertexShader: baseVertexShader,
      fragmentShader: `
        uniform sampler2D dye;
        uniform float time;
        uniform float mixStrength;
        uniform float rainbowEffect;
        uniform float colorIntensity;
        varying vec2 vUv;
        
        vec3 rgb2hsv(vec3 c) {
          vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
          vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
          vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
          float d = q.x - min(q.w, q.y);
          float e = 1.0e-10;
          return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }
        
        vec3 hsv2rgb(vec3 c) {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }
        
        vec3 rainbow(float t) {
          vec3 c = 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
          return c * c;
        }
        
        void main() {
          vec3 color = texture2D(dye, vUv).rgb;
          vec3 hsv = rgb2hsv(color);
          
          // Enhanced color mixing
          float hueShift = mixStrength * length(color) * 0.5;
          hsv.x = mod(hsv.x + hueShift + time * 0.1, 1.0);
          
          // Rainbow effect
          vec3 rainbowColor = rainbow(vUv.x + time * 0.1);
          hsv.y = mix(hsv.y, 1.0, rainbowEffect);
          
          // Color intensity
          hsv.z *= colorIntensity;
          
          vec3 finalColor = mix(hsv2rgb(hsv), rainbowColor, rainbowEffect * length(color));
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });

    // Bloom material
    this.bloomMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        bloomStrength: { value: this.params.bloomStrength }
      },
      vertexShader: baseVertexShader,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float bloomStrength;
        varying vec2 vUv;
        
        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          vec3 luminance = vec3(0.2126, 0.7152, 0.0722);
          float brightness = dot(color.rgb, luminance);
          vec3 bloomColor = color.rgb * smoothstep(0.5, 1.0, brightness);
          gl_FragColor = vec4(mix(color.rgb, bloomColor, bloomStrength), 1.0);
        }
      `
    });

    // Chromatic aberration material
    this.chromaticAberrationMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        aberrationStrength: { value: this.params.chromaticAberration },
        time: { value: 0.0 }
      },
      vertexShader: baseVertexShader,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float aberrationStrength;
        uniform float time;
        varying vec2 vUv;
        
        void main() {
          vec2 center = vec2(0.5);
          vec2 coord = vUv;
          vec2 dir = normalize(coord - center);
          float dist = length(coord - center);
          
          float aberration = aberrationStrength * dist * (1.0 + sin(time) * 0.1);
          
          vec4 r = texture2D(tDiffuse, coord - dir * aberration);
          vec4 g = texture2D(tDiffuse, coord);
          vec4 b = texture2D(tDiffuse, coord + dir * aberration);
          
          gl_FragColor = vec4(r.r, g.g, b.b, 1.0);
        }
      `
    });

    // Motion blur material
    this.motionBlurMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        velocity: { value: null },
        blurStrength: { value: this.params.motionBlurStrength },
        texelSize: { value: this.texelSize }
      },
      vertexShader: baseVertexShader,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D velocity;
        uniform float blurStrength;
        uniform vec2 texelSize;
        varying vec2 vUv;
        
        void main() {
          vec2 vel = texture2D(velocity, vUv).xy;
          vec4 color = texture2D(tDiffuse, vUv);
          
          for(float i = 1.0; i <= 8.0; i++) {
            vec2 offset = vel * (i / 8.0) * blurStrength;
            color += texture2D(tDiffuse, vUv - offset);
          }
          
          gl_FragColor = color / 9.0;
        }
      `
    });

    // Kaleidoscope material
    this.kaleidoscopeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        segments: { value: this.params.kaleidoscopeSegments },
        rotation: { value: this.params.kaleidoscopeRotation },
        time: { value: 0.0 }
      },
      vertexShader: baseVertexShader,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float segments;
        uniform float rotation;
        uniform float time;
        varying vec2 vUv;
        
        void main() {
          vec2 center = vec2(0.5);
          vec2 coord = vUv - center;
          
          float angle = atan(coord.y, coord.x);
          float radius = length(coord);
          
          angle += rotation + time * 0.2;
          angle = mod(angle, 6.28318 / segments) - 3.14159 / segments;
          
          vec2 newCoord = vec2(cos(angle), sin(angle)) * radius + center;
          gl_FragColor = texture2D(tDiffuse, newCoord);
        }
      `
    });

    // Distortion material
    this.distortionMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        distortionStrength: { value: this.params.distortionStrength },
        noiseScale: { value: this.params.noiseScale },
        pulseSpeed: { value: this.params.pulseSpeed },
        waveAmplitude: { value: this.params.waveAmplitude },
        time: { value: 0.0 }
      },
      vertexShader: baseVertexShader,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float distortionStrength;
        uniform float noiseScale;
        uniform float pulseSpeed;
        uniform float waveAmplitude;
        uniform float time;
        varying vec2 vUv;
        
        // Simplex noise function
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                             -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
            dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }
        
        void main() {
          vec2 coord = vUv;
          
          // Add noise distortion
          float noise = snoise(coord * noiseScale + time * 0.5) * distortionStrength;
          
          // Add pulsing effect
          float pulse = sin(time * pulseSpeed) * 0.5 + 0.5;
          
          // Add wave distortion
          float wave = sin(coord.y * 10.0 + time) * waveAmplitude;
          
          coord += vec2(noise + wave, noise) * pulse;
          
          gl_FragColor = texture2D(tDiffuse, coord);
        }
      `
    });

    // Clear all FBOs
    const clearColor = new THREE.Color(0, 0, 0);
    this.gl.setClearColor(clearColor, 1.0);
    
    [
      this.velocityFBO1, this.velocityFBO2,
      this.dyeFBO1, this.dyeFBO2,
      this.pressureFBO1, this.pressureFBO2,
      this.divergenceFBO, this.curlFBO,
      this.temperatureFBO1, this.temperatureFBO2
    ].forEach(fbo => {
      this.gl.setRenderTarget(fbo);
      this.gl.clear();
    });

    // Restore WebGL state
    this.gl.setRenderTarget(currentRenderTarget);

    // Add debug check after initialization
    console.log('FluidSolver initialized:', {
      hasVelocityFBO: !!this.velocityFBO1,
      hasDyeFBO: !!this.dyeFBO1,
      hasPressureFBO: !!this.pressureFBO1,
      hasAdvectionMaterial: !!this.advectionMaterial,
      hasSplatMaterial: !!this.splatMaterial,
      width: this.width,
      height: this.height,
      texelSize: this.texelSize
    });
  }

  dispose() {
    // Dispose of all FBOs
    [
      this.velocityFBO1, this.velocityFBO2,
      this.dyeFBO1, this.dyeFBO2,
      this.pressureFBO1, this.pressureFBO2,
      this.divergenceFBO, this.curlFBO,
      this.temperatureFBO1, this.temperatureFBO2
    ].forEach(fbo => fbo?.dispose());

    // Dispose of all materials
    [
      this.advectionMaterial,
      this.divergenceMaterial,
      this.pressureMaterial,
      this.gradientSubtractMaterial,
      this.curlMaterial,
      this.vorticityMaterial,
      this.splatMaterial,
      this.buoyancyMaterial,
      this.diffusionMaterial,
      this.colorMixMaterial,
      this.bloomMaterial,
      this.chromaticAberrationMaterial,
      this.motionBlurMaterial,
      this.kaleidoscopeMaterial,
      this.distortionMaterial
    ].forEach(material => material?.dispose());

    // Dispose of geometries
    this.quad.geometry.dispose();
    
    // Remove from scene
    this.scene.remove(this.quad);
  }

  step(dt: number) {
    // Save current WebGL state
    const currentRenderTarget = this.gl.getRenderTarget();
    
    try {
      // Update dt in advection material
      this.advectionMaterial.uniforms.dt.value = dt;

      // Apply audio-reactive forces
      this.applyAudioReactiveForces();

      // Temperature step
      this.advectTemperature();
      this.diffuseTemperature();

      // Velocity step
      this.advectVelocity();
      this.diffuseVelocity();

      // Compute curl and apply vorticity confinement
      this.computeCurl();
      this.applyVorticity();

      // Pressure step
      this.computeDivergence();
      this.solvePressure();
      this.subtractGradient();

      // Enhanced dye advection with diffusion and color effects
      this.advectDye();
      this.diffuseDye();
      this.applyColorEffects();

      // Apply enhanced visual effects
      this.applyVisualEffects();
    } finally {
      // Restore WebGL state
      this.gl.setRenderTarget(currentRenderTarget);
    }
  }

  private advectVelocity() {
    this.advectionMaterial.uniforms.velocity.value = this.velocityFBO1.texture;
    this.advectionMaterial.uniforms.source.value = this.velocityFBO1.texture;
    this.advectionMaterial.uniforms.dissipation.value = this.params.velocityDissipation;
    this.quad.material = this.advectionMaterial;
    this.gl.setRenderTarget(this.velocityFBO2);
    this.gl.render(this.scene, this.camera);
    [this.velocityFBO1, this.velocityFBO2] = [this.velocityFBO2, this.velocityFBO1];
  }

  private computeCurl() {
    this.curlMaterial.uniforms.velocity.value = this.velocityFBO1.texture;
    this.quad.material = this.curlMaterial;
    this.gl.setRenderTarget(this.curlFBO);
    this.gl.render(this.scene, this.camera);
  }

  private applyVorticity() {
    if (this.audioData) {
      const audioSum = Array.from(this.audioData).reduce((sum, val) => sum + val, 0);
      const avgAudio = audioSum / this.audioData.length / 255.0;
      this.vorticityMaterial.uniforms.audioInfluence.value = avgAudio * this.params.audioReactivity;
    } else {
      this.vorticityMaterial.uniforms.audioInfluence.value = 0.0;
    }

    this.vorticityMaterial.uniforms.velocity.value = this.velocityFBO1.texture;
    this.vorticityMaterial.uniforms.curl.value = this.curlFBO.texture;
    this.vorticityMaterial.uniforms.curlStrength.value = this.params.curlStrength;
    this.vorticityMaterial.uniforms.vorticityScale.value = this.params.vorticityScale;
    this.quad.material = this.vorticityMaterial;
    this.gl.setRenderTarget(this.velocityFBO2);
    this.gl.render(this.scene, this.camera);
    [this.velocityFBO1, this.velocityFBO2] = [this.velocityFBO2, this.velocityFBO1];
  }

  private computeDivergence() {
    this.divergenceMaterial.uniforms.velocity.value = this.velocityFBO1.texture;
    this.quad.material = this.divergenceMaterial;
    this.gl.setRenderTarget(this.divergenceFBO);
    this.gl.render(this.scene, this.camera);
  }

  private solvePressure() {
    this.pressureMaterial.uniforms.divergence.value = this.divergenceFBO.texture;
    this.quad.material = this.pressureMaterial;

    for (let i = 0; i < this.params.pressureIterations; i++) {
      this.pressureMaterial.uniforms.pressure.value = this.pressureFBO1.texture;
      this.gl.setRenderTarget(this.pressureFBO2);
      this.gl.render(this.scene, this.camera);
      [this.pressureFBO1, this.pressureFBO2] = [this.pressureFBO2, this.pressureFBO1];
    }
  }

  private subtractGradient() {
    this.gradientSubtractMaterial.uniforms.pressure.value = this.pressureFBO1.texture;
    this.gradientSubtractMaterial.uniforms.velocity.value = this.velocityFBO1.texture;
    this.quad.material = this.gradientSubtractMaterial;
    this.gl.setRenderTarget(this.velocityFBO2);
    this.gl.render(this.scene, this.camera);
    [this.velocityFBO1, this.velocityFBO2] = [this.velocityFBO2, this.velocityFBO1];
  }

  private advectDye() {
    this.advectionMaterial.uniforms.velocity.value = this.velocityFBO1.texture;
    this.advectionMaterial.uniforms.source.value = this.dyeFBO1.texture;
    this.advectionMaterial.uniforms.dissipation.value = this.params.colorDiffusion;
    this.quad.material = this.advectionMaterial;
    this.gl.setRenderTarget(this.dyeFBO2);
    this.gl.render(this.scene, this.camera);
    [this.dyeFBO1, this.dyeFBO2] = [this.dyeFBO2, this.dyeFBO1];
  }

  private diffuseDye() {
    this.diffusionMaterial.uniforms.source.value = this.dyeFBO1.texture;
    this.diffusionMaterial.uniforms.diffusion.value = this.params.diffusion;
    this.quad.material = this.diffusionMaterial;
    this.gl.setRenderTarget(this.dyeFBO2);
    this.gl.render(this.scene, this.camera);
    [this.dyeFBO1, this.dyeFBO2] = [this.dyeFBO2, this.dyeFBO1];
  }

  private applyColorEffects() {
    // Update time for animated effects
    this.time += this.params.dt * 0.5;
    this.colorMixMaterial.uniforms.time.value = this.time;
    this.colorMixMaterial.uniforms.mixStrength.value = this.params.colorMixing;
    this.colorMixMaterial.uniforms.rainbowEffect.value = this.params.rainbowEffect;
    this.colorMixMaterial.uniforms.colorIntensity.value = this.params.colorIntensity;

    // Apply color mixing
    this.colorMixMaterial.uniforms.dye.value = this.dyeFBO1.texture;
    this.quad.material = this.colorMixMaterial;
    this.gl.setRenderTarget(this.dyeFBO2);
    this.gl.render(this.scene, this.camera);
    [this.dyeFBO1, this.dyeFBO2] = [this.dyeFBO2, this.dyeFBO1];

    // Apply bloom effect
    this.bloomMaterial.uniforms.tDiffuse.value = this.dyeFBO1.texture;
    this.bloomMaterial.uniforms.bloomStrength.value = this.params.bloomStrength;
    this.quad.material = this.bloomMaterial;
    this.gl.setRenderTarget(this.dyeFBO2);
    this.gl.render(this.scene, this.camera);
    [this.dyeFBO1, this.dyeFBO2] = [this.dyeFBO2, this.dyeFBO1];
  }

  private applyVisualEffects() {
    // Update time uniforms
    const currentTime = this.time;
    this.chromaticAberrationMaterial.uniforms.time.value = currentTime;
    this.kaleidoscopeMaterial.uniforms.time.value = currentTime;
    this.distortionMaterial.uniforms.time.value = currentTime;

    // Apply chromatic aberration
    this.chromaticAberrationMaterial.uniforms.tDiffuse.value = this.dyeFBO1.texture;
    this.quad.material = this.chromaticAberrationMaterial;
    this.gl.setRenderTarget(this.dyeFBO2);
    this.gl.render(this.scene, this.camera);
    [this.dyeFBO1, this.dyeFBO2] = [this.dyeFBO2, this.dyeFBO1];

    // Apply motion blur
    this.motionBlurMaterial.uniforms.tDiffuse.value = this.dyeFBO1.texture;
    this.motionBlurMaterial.uniforms.velocity.value = this.velocityFBO1.texture;
    this.quad.material = this.motionBlurMaterial;
    this.gl.setRenderTarget(this.dyeFBO2);
    this.gl.render(this.scene, this.camera);
    [this.dyeFBO1, this.dyeFBO2] = [this.dyeFBO2, this.dyeFBO1];

    // Apply kaleidoscope effect
    if (this.params.kaleidoscopeSegments > 0) {
      this.kaleidoscopeMaterial.uniforms.tDiffuse.value = this.dyeFBO1.texture;
      this.quad.material = this.kaleidoscopeMaterial;
      this.gl.setRenderTarget(this.dyeFBO2);
      this.gl.render(this.scene, this.camera);
      [this.dyeFBO1, this.dyeFBO2] = [this.dyeFBO2, this.dyeFBO1];
    }

    // Apply distortion effects
    this.distortionMaterial.uniforms.tDiffuse.value = this.dyeFBO1.texture;
    this.quad.material = this.distortionMaterial;
    this.gl.setRenderTarget(this.dyeFBO2);
    this.gl.render(this.scene, this.camera);
    [this.dyeFBO1, this.dyeFBO2] = [this.dyeFBO2, this.dyeFBO1];
  }

  private advectTemperature() {
    this.advectionMaterial.uniforms.velocity.value = this.velocityFBO1.texture;
    this.advectionMaterial.uniforms.source.value = this.temperatureFBO1.texture;
    this.advectionMaterial.uniforms.dissipation.value = this.params.temperatureDissipation;
    this.quad.material = this.advectionMaterial;
    this.gl.setRenderTarget(this.temperatureFBO2);
    this.gl.render(this.scene, this.camera);
    [this.temperatureFBO1, this.temperatureFBO2] = [this.temperatureFBO2, this.temperatureFBO1];
  }

  private diffuseTemperature() {
    this.diffusionMaterial.uniforms.source.value = this.temperatureFBO1.texture;
    this.diffusionMaterial.uniforms.diffusion.value = this.params.diffusion;
    this.quad.material = this.diffusionMaterial;
    this.gl.setRenderTarget(this.temperatureFBO2);
    this.gl.render(this.scene, this.camera);
    [this.temperatureFBO1, this.temperatureFBO2] = [this.temperatureFBO2, this.temperatureFBO1];
  }

  private diffuseVelocity() {
    this.diffusionMaterial.uniforms.source.value = this.velocityFBO1.texture;
    this.diffusionMaterial.uniforms.diffusion.value = this.params.viscosity;
    this.quad.material = this.diffusionMaterial;
    this.gl.setRenderTarget(this.velocityFBO2);
    this.gl.render(this.scene, this.camera);
    [this.velocityFBO1, this.velocityFBO2] = [this.velocityFBO2, this.velocityFBO1];
  }

  private applyBuoyancy() {
    this.buoyancyMaterial.uniforms.velocity.value = this.velocityFBO1.texture;
    this.buoyancyMaterial.uniforms.temperature.value = this.temperatureFBO1.texture;
    this.quad.material = this.buoyancyMaterial;
    this.gl.setRenderTarget(this.velocityFBO2);
    this.gl.render(this.scene, this.camera);
    [this.velocityFBO1, this.velocityFBO2] = [this.velocityFBO2, this.velocityFBO1];
  }

  splat(x: number, y: number, dx: number, dy: number, color: [number, number, number], temperature: number = 1.0) {
    const currentRT = this.gl.getRenderTarget();
    const velocity = Math.sqrt(dx * dx + dy * dy);

    // Add velocity
    this.splatMaterial.uniforms.uTarget.value = this.velocityFBO1.texture;
    this.splatMaterial.uniforms.point.value.set(x, y);
    this.splatMaterial.uniforms.color.value.set(dx * 10, dy * 10, 0);
    this.splatMaterial.uniforms.radius.value = 0.0075;
    this.splatMaterial.uniforms.strength.value = velocity;
    this.quad.material = this.splatMaterial;
    this.gl.setRenderTarget(this.velocityFBO2);
    this.gl.render(this.scene, this.camera);
    [this.velocityFBO1, this.velocityFBO2] = [this.velocityFBO2, this.velocityFBO1];

    // Add dye
    this.splatMaterial.uniforms.uTarget.value = this.dyeFBO1.texture;
    this.splatMaterial.uniforms.color.value.set(color[0], color[1], color[2]);
    this.splatMaterial.uniforms.radius.value = 0.0075;
    this.splatMaterial.uniforms.strength.value = 1.0;
    this.gl.setRenderTarget(this.dyeFBO2);
    this.gl.render(this.scene, this.camera);
    [this.dyeFBO1, this.dyeFBO2] = [this.dyeFBO2, this.dyeFBO1];

    // Add temperature
    this.splatMaterial.uniforms.uTarget.value = this.temperatureFBO1.texture;
    this.splatMaterial.uniforms.color.value.set(temperature, 0, 0);
    this.splatMaterial.uniforms.radius.value = 0.0075;
    this.splatMaterial.uniforms.strength.value = velocity;
    this.gl.setRenderTarget(this.temperatureFBO2);
    this.gl.render(this.scene, this.camera);
    [this.temperatureFBO1, this.temperatureFBO2] = [this.temperatureFBO2, this.temperatureFBO1];

    this.gl.setRenderTarget(currentRT);
  }

  getDyeTexture(): THREE.Texture {
    return this.dyeFBO1.texture;
  }

  getVelocityTexture(): THREE.Texture {
    return this.velocityFBO1.texture;
  }

  getPressureTexture(): THREE.Texture {
    return this.pressureFBO1.texture;
  }

  getTemperatureTexture(): THREE.Texture {
    return this.temperatureFBO1.texture;
  }

  updateParams(params: Partial<FluidParams>) {
    this.params = { ...this.params, ...params };
    
    // Update material uniforms
    this.advectionMaterial.uniforms.dt.value = this.params.dt;
    this.vorticityMaterial.uniforms.curlStrength.value = this.params.curlStrength;
    this.vorticityMaterial.uniforms.vorticityScale.value = this.params.vorticityScale;
    this.diffusionMaterial.uniforms.diffusion.value = this.params.diffusion;
    this.colorMixMaterial.uniforms.mixStrength.value = this.params.colorMixing;
    this.colorMixMaterial.uniforms.rainbowEffect.value = this.params.rainbowEffect;
    this.colorMixMaterial.uniforms.colorIntensity.value = this.params.colorIntensity;
    this.bloomMaterial.uniforms.bloomStrength.value = this.params.bloomStrength;
    this.chromaticAberrationMaterial.uniforms.aberrationStrength.value = this.params.chromaticAberration;
    this.motionBlurMaterial.uniforms.blurStrength.value = this.params.motionBlurStrength;
    this.kaleidoscopeMaterial.uniforms.segments.value = this.params.kaleidoscopeSegments;
    this.kaleidoscopeMaterial.uniforms.rotation.value = this.params.kaleidoscopeRotation;
    this.distortionMaterial.uniforms.distortionStrength.value = this.params.distortionStrength;
    this.distortionMaterial.uniforms.noiseScale.value = this.params.noiseScale;
    this.distortionMaterial.uniforms.pulseSpeed.value = this.params.pulseSpeed;
    this.distortionMaterial.uniforms.waveAmplitude.value = this.params.waveAmplitude;
  }

  setAudioData(data: Uint8Array | null) {
    this.audioData = data;
  }

  private applyAudioReactiveForces() {
    if (!this.audioData) return;
    
    const audioSum = Array.from(this.audioData).reduce((sum, val) => sum + val, 0);
    const avgAudio = audioSum / this.audioData.length / 255.0;
    
    // Add audio-reactive temperature variations
    const audioTemp = avgAudio * this.params.temperature;
    this.splatMaterial.uniforms.uTarget.value = this.temperatureFBO1.texture;
    this.splatMaterial.uniforms.color.value.set(audioTemp, 0, 0);
    this.quad.material = this.splatMaterial;
    this.gl.setRenderTarget(this.temperatureFBO2);
    this.gl.render(this.scene, this.camera);
    [this.temperatureFBO1, this.temperatureFBO2] = [this.temperatureFBO2, this.temperatureFBO1];
  }

  private clear(target: THREE.WebGLRenderTarget) {
    const currentRT = this.gl.getRenderTarget();
    this.gl.setRenderTarget(target);
    this.gl.clear();
    this.gl.setRenderTarget(currentRT);
  }
}