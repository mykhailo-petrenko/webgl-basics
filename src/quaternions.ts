import * as glHelper from '@/utils/gl';
import * as twgl from 'twgl.js';
import { mat4, quat, vec3, vec4 } from 'gl-matrix';
import { degToRad } from '@/utils/transformation';

const gl = glHelper.create('canvasLeft');
glHelper.init(gl);

gl.cullFace(gl.BACK);

const earthTexture = twgl.createTexture(gl, {
  width: 512,
  height: 512,
  src: '/assets/earth.jpeg',
});

interface RenderItem {
  uniforms?: {[key: string]: any};
  bufferInfo: twgl.BufferInfo;
  programInfo: twgl.ProgramInfo;
  type: GLenum;
}

const items: RenderItem[] = [];

{ // PLANE

  const vs = `#version 300 es
  in vec4 position;
  in vec2 texcoord;
  
  uniform mat4 view;
  uniform mat4 projection;
  uniform mat4 u_model;
  
  out vec2 uv;
  
  void main() {
    gl_Position = projection * view * u_model * position;
    
    uv = texcoord;
  }
  `;

  const fs = `#version 300 es
  precision highp float;
  
  in vec2 uv;
  out vec4 outColor;
  
  void main() {
    outColor = vec4(0., 1., 0., 1.);
  } 
  `;

  const model = mat4.create();
  mat4.translate(model, model, vec3.fromValues(0, -10, 0))

  items.push({
    bufferInfo: twgl.primitives.createPlaneBufferInfo(gl, 100, 100, 100, 100),
    programInfo: twgl.createProgramInfo(gl, [vs, fs]),
    type: gl.LINES,
    uniforms: {
      u_model: model
    }
  } as RenderItem);
}

{
  const vs = `#version 300 es
  in vec4 position;
  in vec2 texcoord;
  
  uniform mat4 view;
  uniform mat4 projection;
  uniform mat4 u_model;
  
  out vec2 uv;
  
  void main() {
    gl_Position = projection * view * u_model * position;
    
    uv = texcoord;
  }
  `;

  const fs = `#version 300 es
  precision highp float;
  
  in vec2 uv;
  
  uniform sampler2D earthTexture;
  
  out vec4 outColor;
  
  void main() {
    outColor = texture(earthTexture, uv);
  } 
  `;


  const slice = degToRad(30) / 2;
  const E = 0 + slice;
  const W = Math.PI * 2 - slice;

  const sphere = twgl.primitives.createSphereBufferInfo(
    gl,
    10,
    12,
    24,
    undefined,
    undefined,
    E,
    W
  );
  // const sphere = twgl.primitives.createSphereBufferInfo(gl, 10, 4, 8, undefined, undefined, 0, 3);

  const model = mat4.create();

  items.push({
    bufferInfo: sphere,
    programInfo: twgl.createProgramInfo(gl, [vs, fs]),
    type: gl.TRIANGLES,
    uniforms: {
      u_model: model
    }
  } as RenderItem);
}

const matrices = {
  view: mat4.create(),
  projection: mat4.create(),
};

mat4.lookAt(
  matrices.view,
  vec3.fromValues(20, 20, 20),
  vec3.fromValues(0, 0, 0),
  vec3.fromValues(0, 1, 0)
);

mat4.perspective(
  matrices.projection,
  degToRad(60),
  gl.canvas.width / gl.canvas.height,
  1, 1000
);


const uniforms = {};
const ry = quat.create();
const rx = quat.create();
const ryDir = quat.create();
const rxDir = quat.create();
const tmp = quat.create();
quat.fromEuler(ryDir, 0, 1, 0);
quat.fromEuler(rxDir, 1, 0, 0);

let prevTick = 0;
const delta = 20;


function tick(time: number) {
  if (time < prevTick + delta) {
    return;
  }
  quat.multiply(ry, ry, ryDir);
  quat.multiply(rx, rx, rxDir);
  quat.multiply(tmp, ry, rx);
  // quat.multiply(tmp, rx, ry);


  if (items[1]?.uniforms?.u_model) {
    mat4.fromQuat(items[1].uniforms.u_model, tmp);
  }

  prevTick = time;
}

function render(time?: number) {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);


  for (const item of items) {
    gl.useProgram(item.programInfo.program);
    twgl.setBuffersAndAttributes(gl, item.programInfo, item.bufferInfo);

    let uniforms = {
      ...matrices,
      earthTexture,
    };

    if (item.uniforms) {
      uniforms = {
        ...uniforms,
        ...item.uniforms,
      };
    }

    twgl.setUniforms(item.programInfo, uniforms);

    twgl.drawBufferInfo(gl, item.bufferInfo, item.type);
  }

}

function renderLoop(time: number) {
  render(time);
  requestAnimationFrame(renderLoop);
}

requestAnimationFrame(renderLoop);


function tickLoop() {
  tick(performance.now());
  setTimeout(tickLoop, 0);
}

setTimeout(tickLoop, 0);
