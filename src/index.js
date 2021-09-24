// Test import of a JavaScript module
import { example } from "@/js/example";

import * as twgl from "twgl.js";

// Test import of styles
import "@/styles/index.scss";

{
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

    uniform float time;

    uniform sampler2D u_texture;

    varying vec2 v_texcoord;

    float unpack(vec4 h) {
      // unpack data to range [-32768, 32768], the range in the raw data
      // "* 255." is necessary because each the GPU reads each channel as a range from 0 - 1
      // and we want it in a range from 0-255, as it was encoded in the raster image
      return (h.r * 256. + h.g + h.b / 256.) * 255. - 32768.;
    }

    void main() {
      vec4 tex_color = texture2D(u_texture, v_texcoord);
      gl_FragColor = tex_color;

      // float h = unpack(tex_color);
      // float gray = h / 500.0;

      // gl_FragColor = vec4(gray, gray, gray, 1.0);
      // // gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0);
    }
  `;

  const canvas = document.getElementById("canvasgl");
  const gl = canvas.getContext("webgl2");

  const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  const texture = twgl.createTexture(gl, {
    src: '/assets/438.png',
    target: gl.TEXTURE_2D,
    mag: gl.NEAREST,
    min: gl.NEAREST,
    format: gl.RGBA,
    level: 0,
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
      u_texture: texture,
    };

    gl.useProgram(programInfo.program);

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniformsAndBindTextures(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo); //, gl.POINTS

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

{
  const vs = `#version 300 es
    precision mediump float;
    in vec4 a_position;
    in vec2 a_texcoord;

    out vec2 v_texcoord;

    void main() {
      gl_Position = a_position;

      v_texcoord = a_texcoord;
    }
  `;

  const fs = `#version 300 es
    precision mediump float;

    uniform float time;

    uniform sampler2D u_texture;

    in vec2 v_texcoord;

    float unpack(vec4 h) {
      // unpack data to range [-32768, 32768], the range in the raw data
      // "* 255." is necessary because each the GPU reads each channel as a range from 0 - 1
      // and we want it in a range from 0-255, as it was encoded in the raster image
      return (h.r * 256. + h.g + h.b / 256.) * 255. - 32768.;
    }


    out mediump vec4 outColor;
    
    void main() {
      vec4 tex_color = texture(u_texture, v_texcoord);
      outColor.g = tex_color.g;
      outColor.a = 1.0;

      //gl_FragColor = vec4(0.5, 1.0, 0.0, 1.0);

  
      //gl_FragColor = tex_color;

      // float h = unpack(tex_color);
      // float gray = h / 500.0;

      // gl_FragColor = vec4(gray, gray, gray, 1.0);
      // // gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0);
    }
  `;
  const W = 512;
  const H = 512;

  const canvas = document.getElementById('canvasbufer');
  const gl = canvas.getContext("webgl2");

  const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  const texture = twgl.createTexture(gl, {
    src: '/assets/438.png',
    target: gl.TEXTURE_2D,
    mag: gl.NEAREST,
    min: gl.NEAREST,
    format: gl.RGBA,
    level: 0,
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

  const tex_options =     {
    /**
     * empty textrure of Width x Protococols
     * will be rendered with protolol colors per row
     * and anomalyes colored by type color
     */
    target        : WebGL2RenderingContext.TEXTURE_2D,
    wrap          : WebGL2RenderingContext.CLAMP_TO_EDGE,
    mag           : WebGL2RenderingContext.NEAREST,
    min           : WebGL2RenderingContext.NEAREST,
    format        : gl.RGBA,
    internalFormat: gl.RGBA,
    type          : gl.UNSIGNED_BYTE,
    // format        : WebGL2RenderingContext.RED,
    // internalFormat: WebGL2RenderingContext.R32F,
    // type          : gl.FLOAT,
    level         : 0,
    width         : W,
    height        : H,
    src           : null, //new Float32Array(new Array(W * H * 4).fill(0)),
  };

  const stack_y_norm_texture = twgl.createTexture(gl, tex_options);

  // twgl.setTextureFromArray(
  //   gl, 
  //   stack_y_norm_texture, 
  //   new Float32Array(new Array(W * H).fill(0)), 
  //   tex_options
  // );

  const attachments = [
    {
        //@ts-ignore
        attach    : gl.COLOR_ATTACHMENT0,
        attachment: stack_y_norm_texture,
        target    : gl.TEXTURE_2D,
    },
  ];

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  function render(time) {
    gl.viewport(0, 0, W, H);
    gl.scissor(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.MAX);
    gl.blendFunc(gl.ONE, gl.ONE);

    const uniforms = {
      time: time * 0.1,
      u_texture: texture,
    };

    const frameBuffer = twgl.createFramebufferInfo(gl, attachments, W, H);

    gl.useProgram(programInfo.program);

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniformsAndBindTextures(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES, undefined, undefined); //, gl.POINTS

    // requestAnimationFrame(render);

    //const dst = new Float32Array(W * H * 4);
    // gl.readPixels(0, 0, W, H, gl.RGBA, gl.FLOAT, dst);

    const dst = new Uint8Array(W * H * 4);
    gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, dst);

    twgl.bindFramebufferInfo(gl, null);
    
    console.log(dst);

    
    
  }

  setTimeout(() => {

    requestAnimationFrame(render);
  }, 1000);
  
}