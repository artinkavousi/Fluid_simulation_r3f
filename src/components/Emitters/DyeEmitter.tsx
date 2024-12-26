import * as THREE from 'three';
import { BaseEmitter } from './BaseEmitter';
import { EmitterProps } from '../../store/useStore';

export class DyeEmitter extends BaseEmitter {
  private particles: THREE.Points;
  private particleCount: number = 1000;
  private particleSystem: THREE.BufferGeometry;

  constructor(id: string, props: EmitterProps) {
    super(id, props);
    this.particleSystem = new THREE.BufferGeometry();
    this.particles = this.initParticleSystem();
  }

  private initParticleSystem(): THREE.Points {
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 2;
      positions[i3 + 1] = (Math.random() - 0.5) * 2;
      positions[i3 + 2] = 0;

      const color = this.props.color || [1, 1, 1];
      colors[i3] = color[0];
      colors[i3 + 1] = color[1];
      colors[i3 + 2] = color[2];

      sizes[i] = 0.1;
    }

    this.particleSystem.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleSystem.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.particleSystem.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.6,
    });

    return new THREE.Points(this.particleSystem, material);
  }

  public update(time: number): void {
    const hue = (time * 0.1) % 1;
    const color = this.hslToRgb(hue, 1, 0.5);
    this.props.color = color;
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [r, g, b];
  }

  public getMesh(): THREE.Mesh | undefined {
    return undefined;
  }

  public getParticles(): THREE.Points {
    return this.particles;
  }

  public override dispose(): void {
    super.dispose();
    if (this.particleSystem) {
      this.particleSystem.dispose();
    }
    if (this.particles.material instanceof THREE.Material) {
      this.particles.material.dispose();
    }
  }
} 