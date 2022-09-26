
import * as twgl from "twgl.js";

// Test import of styles
import "@/styles/index.scss";

const vs = `
  attribute vec4 a_position;

  void main() {
    gl_Position = a_position;
    gl_PointSize = 10.0;
  }
`;

const fs = `
  precision mediump float;

  uniform vec2 resolution;
  uniform float time;
  uniform float figure;  

  void main() {
    if (figure == 1.0) {
      gl_FragColor = vec4( 0.0, 0.0, 1.0, 1.0 );
      return;
    }

    if (figure == 3.0) {
      gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
      return;
    }

    // triangle
    gl_FragColor = vec4( 0.0, 1.0, 0.0, 0.2 );
  }
`;

const canvas = document.getElementById("canvasLeft") as HTMLCanvasElement;
const gl = canvas.getContext("webgl");

const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

const arrays = {
  a_position: {
    data: [
      0, 0,
      0.2, 1,
      0.2, 0,
      0.4, 0,
      0.4, 0,
      0.6, 1,
      0.6, 0,
      0.8, 0
    ],
    numComponents: 2,
  }
}

const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

function render(time) {
  twgl.resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clear(gl.COLOR_BUFFER_BIT);
  resetBlend(gl);

  const uniforms = {
    time: time * 0.1,
    resolution: [gl.canvas.width, gl.canvas.height],
    figure: 1
  };

  gl.useProgram(programInfo.program);

  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniforms(programInfo, uniforms);
  
  
  twgl.drawBufferInfo(gl, bufferInfo, gl.POINTS);


  uniforms.figure = 2;
  twgl.setUniforms(programInfo, uniforms);

  twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_STRIP);


  uniforms.figure = 3;
  twgl.setUniforms(programInfo, uniforms);
  
  twgl.drawBufferInfo(gl, bufferInfo, gl.LINE_STRIP);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);

function resetBlend(gl: WebGL2RenderingContext | WebGLRenderingContext) {
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

console.log(gl, programInfo);
