import * as THREE from 'three';

export class Pointer {
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;

  constructor(camera: THREE.Camera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  public getIntersections(x: number, y: number, objects: THREE.Object3D[]): THREE.Intersection[] {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.set(
      ((x - rect.left) / rect.width) * 2 - 1,
      -((y - rect.top) / rect.height) * 2 + 1
    );

    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObjects(objects, true);
  }

  public getWorldPosition(x: number, y: number, z: number = 0): THREE.Vector3 {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.set(
      ((x - rect.left) / rect.width) * 2 - 1,
      -((y - rect.top) / rect.height) * 2 + 1
    );

    const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, z);
    vector.unproject(this.camera);
    return vector;
  }
} 