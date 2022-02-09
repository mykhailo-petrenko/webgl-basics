import { mat4, vec3} from "gl-matrix";
import * as twgl from 'twgl.js'
import { Camera } from "./Camera";
import { SceneNode } from "./Scene";


export class Render {
  private animationFrameId: number | null = null;
  private isRunning = false;

  private camera: Camera;
  private nodes: SceneNode[] = [];

  constructor(
    private gl: WebGL2RenderingContext
  ) {

    this.gl.enable(gl.DEPTH_TEST);

    this.gl.enable(gl.CULL_FACE);
    this.gl.cullFace(gl.BACK);
  
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  
    // Clear the canvas
    this.gl.clearColor(0, 0, 0, 0.0);
    this.gl.clear(gl.COLOR_BUFFER_BIT);
  }

  public render(time: number): void {
    
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    for (const node of this.nodes) {
      node.updateWorldMatrix();
      
      // set program
      this.gl.useProgram(node.programInfo.program);

      // set buffer
      twgl.setBuffersAndAttributes(this.gl, node.programInfo, node.bufferInfo);

      // set uniforms
      const uniforms = node.uniforms;
      
      // @TODO: FIX matrices should not me overvritten. So sould be some buffer instead.
      mat4.multiply(uniforms.u_world, this.camera.getViewProjection(), uniforms.u_world);

      twgl.setUniforms(node.programInfo, uniforms);

      // draw
      twgl.drawBufferInfo(this.gl, node.bufferInfo, this.gl.TRIANGLES);
    }

  }

  public start() {
    this.isRunning = true;
    this.setupRenderLoop();
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  addNode(node: SceneNode) {
    this.nodes.push(node);
  }

  setCamera(camera: Camera): void {
    this.camera = camera;
  }

  setupRenderLoop() {
    this.animationFrameId = window.requestAnimationFrame((time) => this.renderLoop(time));
  }

  private renderLoop(time: number) {
    if (!this.isRunning) {
      return;
    }

    this.render(time);

    this.animationFrameId = window.requestAnimationFrame((time) => this.renderLoop(time));
  }

}