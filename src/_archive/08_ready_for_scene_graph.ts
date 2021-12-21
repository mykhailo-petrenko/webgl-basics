import '@/styles/index.scss';

import { mat4, vec3} from "gl-matrix";
import * as twgl from 'twgl.js'

import { createSphereVertices, createCubeVertices } from '@/helers/primitivesFactory';

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


const vertexShader = `

attribute vec4 position;
attribute vec2 texcoord;

uniform mat4 u_world;

varying vec2 uv;

void main() {
  gl_Position = u_world * position;

  uv = texcoord;
}
`;

const fragmentShader = `
precision highp float;

varying vec2 uv;
uniform sampler2D u_texture;

void main() {
  gl_FragColor = texture2D(u_texture, uv);
}

`;

{
  const canvas = document.getElementById('canvasLeft') as HTMLCanvasElement;
  const gl = canvas.getContext('webgl2');

  if (!gl) {
    throw new Error('Gl context not found ;o(');
  }

  const texture = twgl.createTexture(gl, {
    width: 512,
    height: 512,
    src: '/assets/0@2x.jpeg',
  });

  gl.enable(gl.DEPTH_TEST);

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const programInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader]);

  const cube = createCubeVertices(20);
  const sphere = createSphereVertices(15, 32, 48);

  const bufferInfoCube = twgl.createBufferInfoFromArrays(gl, cube);
  const bufferInfoSphere = twgl.createBufferInfoFromArrays(gl, sphere);
 

  const viewMatrix = mat4.create();
  mat4.lookAt(
    viewMatrix, 
    vec3.fromValues(0, 0, -60), 
    vec3.fromValues(0,0,0), 
    vec3.fromValues(0,1,0)
  );

  const projectionMatrix = mat4.create();

  const perspective = {
    fov: degToRad(40),
    aspect: gl.canvas.width / gl.canvas.height,
    near: 0.5,
    far: 100,
  };

  mat4.perspective(projectionMatrix, perspective.fov, perspective.aspect, perspective.near, perspective.far);

  const world = mat4.create();

  mat4.multiply(world, world, projectionMatrix);
  mat4.multiply(world, world, viewMatrix);

  const uniforms = {
    u_texture: texture,
    u_world: world
  };

  const localCube = mat4.create();
  const localSphere = mat4.create();
  const rotation = mat4.create();

  gl.useProgram(programInfo.program);

  function render(time: number) {
    if (!gl) {
      return;
    }

    time = time * 0.001;

    mat4.rotateX(rotation, mat4.create(), time);
    mat4.rotateY(rotation, rotation, Math.sin(time));

    mat4.translate(localCube, mat4.create(), vec3.fromValues(-19, 0, 0));

    mat4.multiply(localCube, localCube, rotation);
    mat4.multiply(localCube, world, localCube);

    mat4.translate(localSphere, mat4.create(), vec3.fromValues(19, 0, 0));

    mat4.multiply(localSphere, localSphere, rotation);
    mat4.multiply(localSphere, world, localSphere);
    

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    uniforms.u_world = localSphere;
    draw(gl, bufferInfoSphere, uniforms);

    uniforms.u_world = localCube;
    draw(gl, bufferInfoCube, uniforms);

    window.requestAnimationFrame(render);
  }

  function draw(gl: WebGL2RenderingContext, bufferInfo: twgl.BufferInfo, uniforms: {[key: string]: any}): void {
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES);
  }

  window.requestAnimationFrame(render);
}

function degToRad(deg: number): number {
  return deg * Math.PI / 180;
}
