/**
 * https://webgl2fundamentals.org/webgl/lessons/webgl-cube-maps.html
 */

import * as twgl from 'twgl.js';
import {mat4, vec3} from 'gl-matrix';
import { create, init } from "./utils/gl";
import {degToRad} from './utils/transformation';

{
  const gl = create('canvasRight');
  init(gl);

  const vs = `#version 300 es
  
  in vec4 position;
  in vec4 normal;
  
  uniform mat4 u_matrix;
  uniform mat4 u_view;
  uniform mat4 u_projection;
  uniform float u_time;
  
  out vec3 v_normal;
  
  void main() {
    // Multiply the position by the matrix.
    gl_Position = u_matrix * position;
  
    // Pass a normal. Since the positions are
    // centered around the origin we can just
    // pass the position
    v_normal = normalize(position.xyz);
  }`;


  const fs = `#version 300 es
  precision highp float;

  // Passed in from the vertex shader.
  in vec3 v_normal;

  // The texture.
  uniform samplerCube u_texture;

  // we need to declare an output for the fragment shader
  out vec4 outColor;

  void main() {
    outColor = texture(u_texture, normalize(v_normal));
  }
  `;


  const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  const bufferInfo = twgl.primitives.createCubeBufferInfo(gl, 1);

  const texture = createCubemapTexture(gl);

  let u_matrix = mat4.create();
  let viewMatrix = mat4.create();
  let projectionMatrix = mat4.create();

  let eye = vec3.fromValues(1, 1, -2);
  let center = vec3.fromValues(0, 0, 0);
  let up = vec3.fromValues(0, 1, 0);
  let fov = degToRad(60);
  let apect = gl.canvas.width / gl.canvas.height;

  let uniforms = {
    u_matrix,
    u_view: viewMatrix,
    u_projection: projectionMatrix,
    u_time: 0,
    u_texture: texture,
  };


  function render(time: number) {
    const t = time * 0.0003;

    apect = gl.canvas.width / gl.canvas.height;

    init(gl);

    gl.useProgram(programInfo.program);

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);


    mat4.lookAt(viewMatrix, eye, center, up);
    mat4.perspective(projectionMatrix, fov, apect, 1, 50);

    mat4.identity(u_matrix);
    // mat4.scale(u_matrix, u_matrix, vec3.fromValues((Math.sin(t * 5) + 2) / 2, 1, 1))
    mat4.rotateY(u_matrix, u_matrix, Math.cos(t) * Math.PI);
    mat4.rotateX(u_matrix, u_matrix, Math.sin(t) * Math.PI);

    mat4.multiply(u_matrix, viewMatrix, u_matrix);
    mat4.multiply(u_matrix, projectionMatrix, u_matrix);

    uniforms.u_time = t;
    uniforms.u_matrix = u_matrix;
    uniforms.u_view = viewMatrix;
    uniforms.u_projection = projectionMatrix;

    twgl.setUniforms(programInfo, uniforms);

    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES);
  }

  function tick(time: number) {
    render(time);

    requestAnimationFrame(tick);
  }
  
  tick(performance.now());
}


function createCubemapTexture(gl: WebGL2RenderingContext): WebGLTexture {

  const canvas2d:HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
  const ctx2d = canvas2d.getContext('2d') as CanvasRenderingContext2D;

  if (ctx2d !== null) {
    ctx2d.canvas.width = 64;
    ctx2d.canvas.height = 64;
  }

  const faceInfos = [
    { faceColor: '#F00', textColor: '#0FF', text: '+X', target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, },
    { faceColor: '#FF0', textColor: '#00F', text: '-X', target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, },
    { faceColor: '#0F0', textColor: '#F0F', text: '+Y', target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, },
    { faceColor: '#0FF', textColor: '#F00', text: '-Y', target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, },
    { faceColor: '#00F', textColor: '#FF0', text: '+Z', target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, },
    { faceColor: '#F0F', textColor: '#0F0', text: '-Z', target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, },
  ];

  // Texture init
  const cubeTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);

  if(canvas2d) {
    for (let faceInfo of faceInfos) {
      const {faceColor, textColor, text} = faceInfo;
      generateFace(ctx2d, faceColor, textColor, text);
    

      gl.texImage2D(faceInfo.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx2d.canvas);
      // show the result
      ctx2d.canvas.toBlob((blob) => {
        if (!blob) {return;}

        const img = new Image();
        img.src = URL.createObjectURL(blob);

        img.onload = () => {
          document.body.appendChild(img);
        }; 
        
      });
    }

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  }

  return cubeTexture;
}

function generateFace(ctx: CanvasRenderingContext2D, faceColor: string, textColor: string, text: string) {
  const {width, height} = ctx.canvas;
  ctx.fillStyle = faceColor;
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${width * 0.7}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textColor;
  ctx.fillText(text, width / 2, height / 2);
}
