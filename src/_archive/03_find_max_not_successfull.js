
import * as twgl from 'twgl.js';

// Test import of styles
import '@/styles/index.scss';

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

    out vec4 outColor;
    
    void main() {
      vec4 tex_color = texture(u_texture, v_texcoord);
      outColor = tex_color;
    }
  `;

  const canvas = document.getElementById('canvasgl');
  const gl = canvas.getContext('webgl2');

  const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  const texture = twgl.createTexture(gl, {
    src: '/assets/4405.png',
    target: gl.TEXTURE_2D,
    mag: gl.NEAREST,
    min: gl.NEAREST,
    format: gl.RGBA,
    level: 0,
  });


  const arrays = {
    a_position: {
      numComponents: 2,
      data: [
        -1.0, 1.0,
        1.0, 1.0,
        -1.0, -1.0,

        1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0,
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
  };

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  const render = (time) => {
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
  };

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


    out vec4 outColor;
    
    void main() {
      vec4 tex_color = texture(u_texture, v_texcoord);
      float h = unpack(tex_color);
      outColor.r = h;
    }
  `;

  // max 171.4453125
  const W = 3;
  const H = 3;

  // // max 186.3125
  // const W = 512;
  // const H = 512;

  const canvas = document.getElementById('canvasbufer');
  const gl = canvas.getContext('webgl2');
  gl.getExtension('EXT_color_buffer_float');
  gl.getExtension('EXT_float_blend');
  gl.getExtension('EXT_blend_minmax');

  const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  const texture = twgl.createTexture(gl, {
    src: '/assets/4405.png',
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
  };

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
    format        : gl.RED,
    internalFormat: gl.R32F,
    type          : gl.FLOAT,
    // format        : WebGL2RenderingContext.RED,
    // internalFormat: WebGL2RenderingContext.R32F,
    // type          : gl.FLOAT,
    level         : 0,
    width         : W,
    height        : H,
    src           : null, //new Float32Array(new Array(W * H * 4).fill(0)),
  };

  const stack_y_norm_texture = twgl.createTexture(gl, tex_options);

  const attachments = [
    {
      //@ts-ignore
      attach    : gl.COLOR_ATTACHMENT0,
      attachment: stack_y_norm_texture,
      target    : gl.TEXTURE_2D,
    },
  ];

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  const render = (time)  => {
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

    const dst = new Float32Array(W * H * 4);
    gl.readPixels(0, 0, W, H, gl.RGBA, gl.FLOAT, dst);

    twgl.bindFramebufferInfo(gl, null);

    console.log(dst);

    const max = dst.reduce((max, item) => {
      if (max < item) {
        return item;
      }
      return max;
    }, 0);

    console.log('max', max);
  };

  setTimeout(() => {

    requestAnimationFrame(render);
  }, 1000);

}
