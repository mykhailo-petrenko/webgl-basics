import { mat4, vec3} from "gl-matrix";
import * as twgl from 'twgl.js'

import { createSphereVertices, createCubeVertices } from '@/helers/primitivesFactory';

import { SceneNode } from "./Scene";

export class SolarSystem extends SceneNode {
  constructor() {
    super();


  }

  init(): void { }

  update() {
    mat4.rotateY(this.localMatrix, this.localMatrix, 0.02);

    this.updateWorldMatrix();
  }
}

export class EarthSystem extends SceneNode {
  constructor() {
    super();

    this.tranlation[0] = 25;
    mat4.translate(this.localMatrix, this.localMatrix, this.tranlation);
  }

  init(): void { }

  update() {
    mat4.rotateY(this.localMatrix, this.localMatrix, -0.05);

    this.updateWorldMatrix();
  }
}

export class SphereGeometry extends SceneNode {
  public radius = 2;
  public detailsation = 8;

  constructor() {
    super();

  }

  public initBufferInfo(gl: WebGL2RenderingContext): void {
    const segments = this.detailsation * this.radius;
    const sphere = createSphereVertices(this.radius, segments, segments);

    this.bufferInfo = twgl.createBufferInfoFromArrays(gl, sphere);
  }
}

export class Sun extends SphereGeometry {
  constructor() {
    super();

    this.radius = 5;

    // this.tranlation[0] = 15;
    // mat4.translate(this.localMatrix, this.localMatrix, this.tranlation);
  }

  public update(): void {
    mat4.rotateY(this.localMatrix, this.localMatrix, -0.03);

    this.updateWorldMatrix();
  }

}

export class Earth extends SphereGeometry {
  constructor() {
    super();

    this.radius = 3;
  }

  public update(): void {
    // mat4.rotateY(this.localMatrix, this.localMatrix, -0.05);

    // this.updateWorldMatrix();
  }
}

export class Moon extends SphereGeometry {
  constructor() {
    super();

    this.radius = 1;
    this.detailsation = 32;

    this.tranlation[0] = 6;
    mat4.translate(this.localMatrix, this.localMatrix, this.tranlation);
  }

  public update(): void {
    mat4.rotateY(this.localMatrix, this.localMatrix, -0.01);

    this.updateWorldMatrix();
  }
}


export class DebugCube extends SceneNode {
  constructor(private size = 1) {
    super();
  }

  public initBufferInfo(gl: WebGL2RenderingContext): void {
    const cube = createCubeVertices(this.size);

    this.bufferInfo = twgl.createBufferInfoFromArrays(gl, cube);
  }
}