import * as THREE from 'three';
import { EmitterProps } from '../../store/useStore';

export abstract class BaseEmitter {
  protected id: string;
  protected props: EmitterProps;
  protected mesh?: THREE.Mesh;

  constructor(id: string, props: EmitterProps) {
    this.id = id;
    this.props = props;
  }

  abstract update(time: number): void;
  abstract getMesh(): THREE.Mesh | undefined;
  
  public getId(): string {
    return this.id;
  }

  public getProps(): EmitterProps {
    return this.props;
  }

  public updateProps(updates: Partial<EmitterProps>): void {
    this.props = { ...this.props, ...updates };
  }

  public dispose(): void {
    if (this.mesh) {
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      if (this.mesh.material instanceof THREE.Material) {
        this.mesh.material.dispose();
      }
    }
  }
} 