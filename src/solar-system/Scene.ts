import { createSphereVertices } from "@/helers/primitivesFactory";
import { mat4, vec3} from "gl-matrix";
import * as twgl from "twgl.js";

export class Node {
  parent: Node | null = null;
  child: Node[] = [];
  
  public setParent(parent: Node): void {
    if (this.parent) {
      this.parent.removeChild(this);
    }

    this.parent = parent;
  }

  public removeChild(child: Node): void {
    const i = this.child.findIndex((child) => child === this);
    this.child.splice(i, 1);
  }

  public addChild(child: Node): void {
    this.child.push(child);
    child.setParent(this);
  }
}

export class SceneNode extends Node {
  parent: SceneNode | null = null;
  child: SceneNode[] = [];

  localMatrix: mat4;
  worldMatrix: mat4;

  tranlation: vec3;
  rotation: vec3;

  public isDirty: boolean;

  public programInfo: twgl.ProgramInfo;
  public bufferInfo: twgl.BufferInfo;
  public uniforms: {[key: string]: any} = {};

  constructor() {
    super();

    this.isDirty = false;

    this.localMatrix = mat4.create();
    this.worldMatrix = mat4.create();

    this.tranlation = vec3.fromValues(0, 0, 0);
    this.rotation = vec3.fromValues(0, 0, 0);
  }

  public updateWorldMatrix(): void {

    if (this.parent) {
      mat4.mul(this.worldMatrix, this.parent.worldMatrix, this.localMatrix);
    } else {
      mat4.copy(this.worldMatrix, this.localMatrix);
    }

    this.uniforms.u_world = this.worldMatrix;

    for (const child of this.child) {
      child.updateWorldMatrix();
    }
  }

  public translate(translation: vec3): void {
    this.tranlation = translation;
   
    this.updateLocalMatrix();
  }

  private updateLocalMatrix(): void {
    mat4.translate(this.localMatrix, mat4.create(), this.tranlation);
    this.updateWorldMatrix();
  }
}