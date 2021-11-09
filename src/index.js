
import * as twgl from 'twgl.js';

// Test import of styles
import '@/styles/index.scss';

{
  const vs = `#version 300 es
	  precision highp float;
    in vec4 a_position;

    void main() {
      gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
    }
  `;

  const fs = `#version 300 es
    precision highp float;

    out vec4 outColor;
    
    void main() {
      outColor = vec4(0.0, 1.0, 0.0, 1.0);
    }
  `;

  const canvas = document.getElementById('canvasLeft');
  const gl = canvas.getContext('webgl2');
  
  

  const render = (time) => {

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // ... Code Here

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
}
