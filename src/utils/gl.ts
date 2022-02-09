
export function create(elementId: string): WebGL2RenderingContext {
  const canvas = document.getElementById('canvasLeft') as HTMLCanvasElement;
  const gl = canvas.getContext('webgl2');

  if (!gl) {
    throw new Error('Gl context not found ;o(');
  }

  return gl;
}

export function init(gl: WebGL2RenderingContext): void {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
