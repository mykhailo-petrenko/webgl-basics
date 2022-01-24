import { mat4, vec3 } from "gl-matrix";

export class Camera {
  public view: mat4;
  public position: vec3;
  public goal: vec3;
  public up: vec3;

  public projection: mat4;

  public viewProjection: mat4;

  public readonly perspective = {
    fov: degToRad(45),
    aspect: 1,
    near: 0.2,
    far: 100,
  };

  constructor() {
    this.view = mat4.create();
    this.projection = mat4.create();
    this.viewProjection = mat4.create();

    this.position = vec3.fromValues(0, 0, -30);
    this.up = vec3.fromValues(0, 1, 0);

    this.lookAt(vec3.fromValues(0, 0, 0));
    this.updatePerspective();
  }

  public setAspect(aspect: number): void {
    this.perspective.aspect = aspect;
    this.updatePerspective();
  }

  public setPosition(point: vec3): void {
    this.position = point;
    this.updateLookAt();
  }

  public lookAt(point: vec3): void {
    this.goal = point;
    this.updateLookAt();
  }

  private updateLookAt(): void {
    mat4.lookAt(
      this.view, 
      this.position, 
      this.goal, 
      this.up
    );

    this.updateViewProjection();
  }

  private updatePerspective(): void {
    mat4.perspective(
      this.projection, 
      this.perspective.fov, 
      this.perspective.aspect,
      this.perspective.near, 
      this.perspective.far
    );

    this.updateViewProjection();
  }

  private updateViewProjection() {
    mat4.multiply(this.viewProjection, this.projection, this.view);
  }

  public getViewProjection(): mat4 {
    return this.viewProjection;
  }
}

function degToRad(deg: number): number {
  return deg * Math.PI / 180;
}
