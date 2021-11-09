
import * as twgl from 'twgl.js';

// Test import of styles
import '@/styles/index.scss';

{
  const vs = `#version 300 es
	  precision highp float;
    
    in vec4 a_position;

    uniform float numInstances;

    out float v_id;

    void main() {
      
      gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
      gl_Position.x = (float(gl_InstanceID % 512) / 256.0) - 1.0;
      gl_Position.y = ((float(gl_InstanceID) / (512.0)) / 256.0) - 1.0;
      gl_PointSize = 1.0;
      
      v_id = float(gl_InstanceID) / numInstances;
    }
  `;

  const fs = `#version 300 es
    precision highp float;

    uniform float time;
    
    in float v_id;

    out vec4 outColor;
    
    void main() {
      //outColor = vec4(1.0, 0.0, 0.0, 1.0);
      outColor = vec4(v_id, 1.0 - v_id, 0.0, 1.0);
    }
  `;

  const canvas = document.getElementById('canvasgl');
  const gl = canvas.getContext('webgl2');
  gl.getExtension('ANGLE_instanced_arrays');

  const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  const numInstances = 512*512;

  const arrays = {
    a_position: {
      numComponents: 2,
      data: [
        0.0, 0.0,
      ]
    },
  };

  const uniforms = {
    time: 0,
    numInstances: numInstances,
  };


  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
  const vertexArrayInfo = twgl.createVertexArrayInfo(gl, programInfo, bufferInfo);

  const render = (time) => {

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    uniforms.time = time * 0.1;

    gl.useProgram(programInfo.program);

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);

    twgl.drawBufferInfo(gl, vertexArrayInfo, gl.POINTS, vertexArrayInfo.numElements, 0, numInstances);

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
}


{
  const vs = `#version 300 es
	  precision highp float;
    
    in vec4 a_position;

    uniform sampler2D u_texture;
    uniform float tilePixels;
    uniform float numRows;

    out float height;
    
    float unpack(vec4 h) {
      // unpack data to range [-32768, 32768], the range in the raw data
      // "* 255." is necessary because each the GPU reads each channel as a range from 0 - 1
      // and we want it in a range from 0-255, as it was encoded in the raster image
      return (h.r * 256. + h.g + h.b / 256.) * 255. - 32768.;
    }

    void main() {
      float id = float(gl_InstanceID);
      float Y = (2.0 * id / numRows) - 1.0;
      
      gl_Position = vec4(0.0, Y, 0.0, 1.0);
      gl_PointSize = 1.0;
      
      //vec2 uv = vec2(0.0, Y * 0.5 + 0.5);
      //vec4 color = texture(u_texture, uv);
      
      float heightMax = 0.0;
      int N = int(tilePixels);
      
      for (int x = 0; x < N; x++) { 
        vec4 color = texelFetch(u_texture, ivec2(x, gl_InstanceID), 0);
        heightMax = max(heightMax, unpack(color));
      }
      height = heightMax;
    }
  `;

  const fs = `#version 300 es
    precision mediump float;

    in float height;

    out vec4 outColor;

    void main() {
      outColor.r = height;
    }
  `;


  const W = 1;
  const H = 512;

  const uniforms = {
    tilePixels: 512,
    numRows: 512,
  };

  const canvas = document.getElementById('canvasbufer');
  const gl = canvas.getContext('webgl2');
  gl.getExtension('EXT_color_buffer_float');
  gl.getExtension('EXT_float_blend');
  gl.getExtension('EXT_blend_minmax');

  const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  let texture;
  // = twgl.createTexture(gl, {
  //   src: '/assets/4405.png',
  //   target: gl.TEXTURE_2D,
  //   mag: gl.NEAREST,
  //   min: gl.NEAREST,
  //   format: gl.RGBA,
  //   level: 0,
  // });

  const textureImage = new Image();
  textureImage.src = '/assets/4405.png';

  textureImage.onload = () => {
    console.log('Hello I loaded');
  };

  const arrays = {
    a_position: {
      numComponents: 3,
      data: [
        0.0, 0.0, 0,
      ]
    },
  };

  const tex_options = {
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
      attachmentPoint: gl.COLOR_ATTACHMENT0,
      attachment: stack_y_norm_texture,
      target: gl.TEXTURE_2D,
    },
  ];

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
  const vertexArrayInfo = twgl.createVertexArrayInfo(gl, programInfo, bufferInfo);

  const render = (time)  => {
    gl.viewport(0, 0, W, H);
    gl.scissor(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    uniforms.time = time * 0.1;
    uniforms.u_texture = texture;

    const frameBuffer = twgl.createFramebufferInfo(gl, attachments, W, H);

    gl.useProgram(programInfo.program);

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniformsAndBindTextures(programInfo, uniforms);

    twgl.drawBufferInfo(gl, vertexArrayInfo, gl.POINTS, vertexArrayInfo.numElements, 0, uniforms.numRows);

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

  textureImage.decode()
    .then(() => {
      texture = twgl.createTexture(gl, {
        src: textureImage,
        target: gl.TEXTURE_2D,
        mag: gl.NEAREST,
        min: gl.NEAREST,
        format: gl.RGBA,
        level: 0,
      });
      requestAnimationFrame(render);
    });

}
