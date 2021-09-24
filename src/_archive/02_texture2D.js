// Test import of a JavaScript module
import { example } from "@/js/example";

import * as twgl from "twgl.js";

// Test import of styles
import "@/styles/index.scss";

const vs = `
  attribute vec4 a_position;
  attribute vec2 a_texcoord;

  varying vec2 v_texcoord;

  void main() {
    gl_Position = a_position;

    v_texcoord = a_texcoord;
  }
`;

const fs = `
  precision highp float;

  uniform vec2 resolution;
  uniform float time;

  uniform sampler2D u_texture;

  varying vec2 v_texcoord;

  void main() {
    gl_FragColor = texture2D(u_texture, v_texcoord);
  }
`;

const canvas = document.getElementById("canvasgl");
const gl = canvas.getContext("webgl2");

const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

const texture = twgl.createTexture(gl, {
  width: 512,
  height: 512,
  src: '/assets/438.png',
});


const arrays = {
  a_position: {
    numComponents: 3,
    data: [
      -1.0, 1.0, 0, 
      1.0, 1.0, 0,
      -1.0, -1.0, 0,

      1.0, 1.0, 0.0,
      1.0, -1.0, 0, 
      -1.0, -1.0, 0,
    ]
  },
  a_texcoord: {
    numComponents: 2,
    data: [
      0, 0,
      1, 0,
      0, 1,

      1, 0,
      1, 1,
      0, 1,
    ]
  },
}

const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);


function render(time) {
  // twgl.resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.MAX);
  gl.blendFunc(gl.ONE, gl.ONE);

  const uniforms = {
    time: time * 0.1,
    resolution: [gl.canvas.width, gl.canvas.height],
    u_texture: texture,
  };

  gl.useProgram(programInfo.program);

  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniformsAndBindTextures(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);

console.log(gl, programInfo);
