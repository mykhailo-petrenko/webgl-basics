import '@/styles/index.scss';

import * as twgl from 'twgl.js';
import {mat4, vec3} from 'gl-matrix';
import { Render } from './Render';
import { SolarSystem, Sun, Earth, Moon, DebugCube, EarthSystem } from './SolarScene';
import { Camera } from './Camera';


const canvas = document.getElementById('canvasLeft') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2');

if (!gl) {
  throw new Error('Gl context not found ;o(');
}

const vertexShader = `#version 300 es

in vec4 position;
in vec2 texcoord;

uniform mat4 u_world;

out vec2 uv;

void main() {
  gl_Position = u_world * position;

  uv = texcoord;
}
`;

const fragmentShader = `#version 300 es
precision highp float;

in vec2 uv;
uniform sampler2D u_texture;

out vec4 outColor;
void main() {
  outColor = texture(u_texture, uv);
}

`;

const earthTeture = twgl.createTexture(gl, {
  width: 512,
  height: 512,
  src: '/assets/earth.jpeg',
});

const moonTexture = twgl.createTexture(gl, {
  width: 512,
  height: 512,
  src: '/assets/moon.jpeg',
});

const sunTexture = twgl.createTexture(gl, {
  width: 1024,
  height: 1024,
  src: '/assets/sun.jpeg',
});

const programInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader]);

const camera = new Camera();
camera.setAspect(gl.canvas.width / gl.canvas.height);

const render = new Render(gl);
render.setCamera(camera);
render.start();

const solarSystem = new SolarSystem();
const world = mat4.create();

mat4.copy(solarSystem.localMatrix, world);
solarSystem.updateWorldMatrix();

const earthSystem = new EarthSystem();

const sun = new Sun();
sun.initBufferInfo(gl);
sun.programInfo = programInfo;
sun.uniforms.u_texture = sunTexture;

const earth = new Earth();
earth.initBufferInfo(gl);
earth.programInfo = programInfo;
earth.uniforms.u_texture = earthTeture;

const moon = new Moon();
moon.initBufferInfo(gl);
moon.programInfo = programInfo;
moon.uniforms.u_texture = moonTexture;

solarSystem.addChild(sun);
solarSystem.addChild(earthSystem);
earthSystem.addChild(earth);
earthSystem.addChild(moon);


render.addNode(moon);
render.addNode(earth);
render.addNode(sun);

// const cube = new DebugCube(2);
// cube.initBufferInfo(gl);
// cube.programInfo = programInfo;
// cube.uniforms.u_texture = texture;

// render.addNode(cube);
// solarSystem.addChild(cube);


// const grid = new SceneNode();
// {
//   const translations: vec3[] = [];

//   const step = 10;
//   const r = 3;
//   const limit = step*r;
//   for (let x = -limit; x <= limit; x+=step) {
//     for (let z = -limit; z <= limit; z+=step) {
//       translations.push(
//         vec3.fromValues(x, 0, z)
//       );
//     }
//   }

//   for (const t of translations) {
//     const cube = new DebugCube(1);
//     cube.initBufferInfo(gl);
//     cube.programInfo = programInfo;
//     cube.uniforms.u_texture = texture;

//     cube.translate(t);
//     grid.addChild(cube);
//     render.addNode(cube);
//   }
// }

camera.setPosition(vec3.fromValues(0, 50, 50));

let time;

function tick() {
  time = performance.now() * 0.001;
  solarSystem.update();
  earthSystem.update();
  sun.update();
  earth.update();
  moon.update();

  // grid.translate(vec3.fromValues(0, 2*Math.sin(time * 0.001), 0));
  // const goal = vec3.fromValues(0, 0, 0);
  // camera.lookAt(vec3.transformMat4(goal, vec3.fromValues(0, 0, 0), sun.worldMatrix));
}
declare var window: any
window._tick = tick;
tick();
window.setInterval(tick, 50);
