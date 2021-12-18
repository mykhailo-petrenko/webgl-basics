import { mat4 } from "gl-matrix";

/**
 * Scene Graph POC
 * 
 * useful links:
 * - https://learnopengl.com/Guest-Articles/2021/Scene/Scene-Graph
 * - https://webglfundamentals.org/webgl/lessons/webgl-scene-graph.html
 * - https://walterkuppens.com/post/wtf-is-a-scene-graph/
 */



class Node {
  parent: Node | null = null;
  child: Node[] = [];
  
  public setParent(parent: Node): void {
    if (this.parent) {
      this.parent.removeChild(this);
    }
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

class SceneNode extends Node {
  parent: SceneNode | null = null;
  child: SceneNode[] = [];

  localMatrix: mat4;
  worldMatrix: mat4;

  constructor() {
    super();

    this.localMatrix = mat4.create();
    this.worldMatrix = mat4.create();
  }

  public updateWorldMatrix(): void {
    if (this.parent) {
      mat4.mul(this.worldMatrix, this.localMatrix, this.parent.worldMatrix);
    } else {
      mat4.copy(this.worldMatrix, this.localMatrix);
    }

    for (const child of this.child) {
      child.updateWorldMatrix();
    }
  }
}

console.log('hello dolly');