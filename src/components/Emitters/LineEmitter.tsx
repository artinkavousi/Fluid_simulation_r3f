import * as THREE from 'three';
import { BaseEmitter } from './BaseEmitter';
import { EmitterProps } from '../../store/useStore';

export class LineEmitter extends BaseEmitter {
  private line?: THREE.Line;

  constructor(id: string, props: EmitterProps) {
    super(id, props);
    this.initMesh();
  }

  private initMesh(): void {
    if (!this.props.start || !this.props.end) return;

    const points = [
      new THREE.Vector3(this.props.start[0], this.props.start[1], 0),
      new THREE.Vector3(this.props.end[0], this.props.end[1], 0)
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(
        ...(this.props.color || [1, 1, 1] as [number, number, number])
      ),
      linewidth: 2,
    });

    this.line = new THREE.Line(geometry, material);
    this.mesh = new THREE.Mesh(); // Placeholder for base class
  }

  public update(time: number): void {
    if (this.line && this.props.start && this.props.end) {
      const points = [
        new THREE.Vector3(this.props.start[0], this.props.start[1], 0),
        new THREE.Vector3(this.props.end[0], this.props.end[1], 0)
      ];
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      this.line.geometry.dispose();
      this.line.geometry = geometry;
    }
  }

  public getMesh(): THREE.Mesh | undefined {
    return this.mesh;
  }

  public getLine(): THREE.Line | undefined {
    return this.line;
  }

  public override dispose(): void {
    super.dispose();
    if (this.line) {
      if (this.line.geometry) this.line.geometry.dispose();
      if (this.line.material instanceof THREE.Material) {
        this.line.material.dispose();
      }
    }
  }
} 