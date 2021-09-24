// Test import of a JavaScript module
import { example } from "@/js/example";

import * as twgl from "twgl.js";

// Test import of styles
import "@/styles/index.scss";

const vs = `
  attribute vec4 a_position;
  attribute vec4 a_color;

  varying vec4 v_color;

  void main() {
    gl_Position = a_position;

    v_color = a_color;
  }
`;

const fs = `
  precision mediump float;

  uniform vec2 resolution;
  uniform float time;

  varying vec4 v_color;

  void main() {
    // vec2 uv = gl_FragCoord.xy / resolution;
    //float color = sin( time / 10.0 ) * 0.5 + 0.5;

    //gl_FragColor = vec4( color, 1.0, 0.0, 1.0 );
    gl_FragColor = vec4(v_color);
    gl_FragColor.r = (sin( time / 50.0 ) + 1.0) / 2.0;
  }
`;

const canvas = document.getElementById("canvasgl");
const gl = canvas.getContext("webgl");

const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

const arrays = {
  a_position: [
    -0.5, -0.5, 0,
     0.5, -0.5, 0, 
     -1, 0.5, 0,
     0.0, 0.0, 0.0,
     0.8, 0.1, 0,
     0, 0.8, 0,
  ],
  a_color: [
    1, 0, 0, 1,
    0, 1, 0, 1,
    0, 0, 1, 1,
    1, 0, 0, 1,
    0, 1, 0, 1,
    0, 0, 1, 1,
  ],
}

const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

function render(time) {
  twgl.resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  const uniforms = {
    time: time * 0.1,
    resolution: [gl.canvas.width, gl.canvas.height],
  };

  gl.useProgram(programInfo.program);

  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);

console.log(gl, programInfo);
