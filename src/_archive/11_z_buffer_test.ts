import * as twgl from "twgl.js";

// Test import of styles
import "@/styles/index.scss";

const vs = `#version 300 es
  in vec4 a_position;
  in vec4 a_color;

  out vec4 v_color;
  out float depth;

  void main() {
    gl_Position = a_position;
    v_color = a_color;
    depth = (a_position.z + 1.) / 2.;
  }
`;

const fs = `#version 300 es
  precision highp float;

  in vec4 v_color;
  in float depth;
  out vec4 FragColor;

  uniform float time;

  void main() {
    FragColor = v_color;
    gl_FragDepth = depth;
  }
`;

const canvas = document.getElementById("canvasLeft") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2");

const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

const arrays = {
  a_position: {
    data: [
      -1, 1, 1,
      1, 0, -0.5,
      -1, -1, -1,

      1, 1, 0.5,
      1, -1, 0,
      -1, 0, -1,
    ],
    numComponents: 3,
  },
  a_color: {
    data: [
      1, 0, 0, 1,
      1, 0, 0, 1,
      1, 0, 0, 1,

      0, 1, 0, 1,
      0, 1, 0, 1,
      0, 1, 0, 1,
    ],
    numComponents: 4,
  }
}

const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

function render(time) {
    twgl.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LESS);
  
    const uniforms = {
      time: time * 0.1,
    };
  
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  
    twgl.setUniforms(programInfo, uniforms);
  
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES);
  
  
    requestAnimationFrame(render);
  }
  
  requestAnimationFrame(render);