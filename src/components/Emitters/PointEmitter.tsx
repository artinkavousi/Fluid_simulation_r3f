import * as THREE from 'three';
import { BaseEmitter } from './BaseEmitter';
import { EmitterProps } from '../../store/useStore';

export class PointEmitter extends BaseEmitter {
  constructor(id: string, props: EmitterProps) {
    super(id, props);
    this.initMesh();
  }

  private initMesh(): void {
    const geometry = new THREE.SphereGeometry(this.props.radius || 0.1, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        ...(this.props.color || [1, 1, 1] as [number, number, number])
      ),
      transparent: true,
      opacity: 0.5,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    if (this.props.position) {
      this.mesh.position.set(this.props.position[0], this.props.position[1], 0);
    }
  }

  public update(time: number): void {
    // Use time to create pulsating effect
    const scale = 1 + Math.sin(time * 3) * 0.2;
    if (this.mesh) {
      this.mesh.scale.set(scale, scale, 1);
    }
  }

  public getMesh(): THREE.Mesh | undefined {
    return this.mesh;
  }
} 