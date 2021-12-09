import * as twgl from 'twgl.js';
import { mat4, vec3 } from 'gl-matrix';
import {guify} from 'guify';

var gui = new guify({
  title: 'Some Title',
  align: 'right',
  theme: 'dark'
});

// Test import of styles
import '@/styles/index.scss';

{
  const vs = `
    attribute vec4 a_position;
    attribute vec4 a_color;

    uniform mat4 u_projection_matrix;
    uniform mat4 u_view_matrix;

    varying vec4 v_color;

    void main() {
      gl_Position = u_projection_matrix * u_view_matrix * a_position;
      v_color = a_color;
    }
  `;

  const fs = `
    precision highp float;
    varying vec4 v_color;
    
    void main() {
      gl_FragColor = v_color;
    }
  `;

  const canvas = document.getElementById('canvasLeft');
  const gl = canvas.getContext('webgl2');
  gl.enable(gl.DEPTH_TEST);

  const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  const arrays = {
    a_position: {
      numComponents: 3,
      data: getCoords().map(v => v )
    },

    a_color: {
      numComponents: 4,
      data: getColors()
    },
  };

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
  const vertexArrayInfo = twgl.createVertexArrayInfo(gl, programInfo, bufferInfo);

  const cameraMatrix = mat4.create();
  mat4.translate(cameraMatrix, cameraMatrix, vec3.fromValues(0, 0, 30));
  // mat4.rotateY(cameraMatrix, cameraMatrix, 0.1);

  const viewMatrix = mat4.create();
  mat4.invert(viewMatrix, cameraMatrix);


  let projectionMatrix = mat4.create();
  // const SIZE = 15;
  // mat4.scale(matrix, matrix, vec3.fromValues(2/SIZE, -2/SIZE, 2/SIZE));
  // mat4.ortho(matrix, -SIZE, SIZE, -SIZE, SIZE, -SIZE, SIZE);
  mat4.perspective(projectionMatrix, 75*Math.PI/180, canvas.clientWidth / canvas.clientHeight, 1, 1000);

  // mat4.translate(matrix, matrix, vec3.fromValues(5, -5, -40))
  // mat4.rotateY(matrix, matrix, Math.PI + 0.2);

  const uniforms = {
    // @TODO: object movement matrix
    u_projection_matrix: projectionMatrix,
    u_view_matrix: viewMatrix
  };

  const params = {
    radius: 0,
    rotation: 0,
  };

  const rotateWorld = () => {
    const angle = params.rotation * Math.PI / 180;

    // World Tilt
    let localProjection = mat4.create();

    mat4.copy(localProjection, projectionMatrix);
    mat4.translate(localProjection, localProjection, vec3.fromValues(0, 0, params.radius));
    mat4.rotateY(localProjection, localProjection, angle);

    uniforms.u_projection_matrix = localProjection;
  };


  gui.Register({
    type: 'range',
    label: 'Radius',
    min: 0, max: 100,
    precision: 1,
    onChange: (data) => {
      params.radius = -data;
      rotateWorld();
    }
  });

  gui.Register({
    type: 'range',
    label: 'Radius',
    min: 0, max: 360,
    precision: 1,
    onChange: (data) => {
      params.rotation = data;
      rotateWorld();
    }
  });

  const render = () => {

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programInfo.program);

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo, vertexArrayInfo);
    twgl.setUniforms(programInfo, uniforms);

    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES);

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
}


function getCoords() {
  return [
    0, 0, 10,
    0, 10, 0,
    10, 0, 0,

    0, 0, 0,
    0, 10, 0,
    0, 0, 10,

    0, 0, 0,
    0, 0, 10,
    10, 0, 0
  ];
}

function getColors() {
  return [
    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,

    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1,

    0, 0, 1, 1,
    0, 0, 1, 1,
    0, 0, 1, 1,
  ];
}
