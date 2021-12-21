

/**
 * creates a typed array with a `push` function attached
 * so that you can easily *push* values.
 *
 * `push` can take multiple arguments. If an argument is an array each element
 * of the array will be added to the typed array.
 *
 * Example:
 *
 *     let array = createAugmentedTypedArray(3, 2);  // creates a Float32Array with 6 values
 *     array.push(1, 2, 3);
 *     array.push([4, 5, 6]);
 *     // array now contains [1, 2, 3, 4, 5, 6]
 *
 * Also has `numComponents` and `numElements` properties.
 *
 * @param {number} numComponents number of components
 * @param {number} numElements number of elements. The total size of the array will be `numComponents * numElements`.
 * @param {constructor} opt_type A constructor for the type. Default = `Float32Array`.
 * @return {ArrayBuffer} A typed array.
 * @memberOf module:webgl-utils
 */
function createAugmentedTypedArray(numComponents: number, numElements: number, opt_type?: any) {
  const Type = opt_type || Float32Array;
  return augmentTypedArray(new Type(numComponents * numElements), numComponents);
}

// Add `push` to a typed array. It just keeps a 'cursor'
// and allows use to `push` values into the array so we
// don't have to manually compute offsets
function augmentTypedArray(typedArray: any, numComponents: number) {
  let cursor = 0;
  typedArray.push = function() {
    for (let ii = 0; ii < arguments.length; ++ii) {
      const value = arguments[ii];
      if (value instanceof Array || (value.buffer && value.buffer instanceof ArrayBuffer)) {
        for (let jj = 0; jj < value.length; ++jj) {
          typedArray[cursor++] = value[jj];
        }
      } else {
        typedArray[cursor++] = value;
      }
    }
  };
  typedArray.reset = function(opt_index: number) {
    cursor = opt_index || 0;
  };
  typedArray.numComponents = numComponents;
  Object.defineProperty(typedArray, 'numElements', {
    get: function() {
      return this.length / this.numComponents | 0;
    },
  });
  return typedArray;
}


/**
 * Creates sphere vertices.
 * The created sphere has position, normal and uv streams.
 *
 * @param {number} radius radius of the sphere.
 * @param {number} subdivisionsAxis number of steps around the sphere.
 * @param {number} subdivisionsHeight number of vertically on the sphere.
 * @param {number} [opt_startLatitudeInRadians] where to start the
 *     top of the sphere. Default = 0.
 * @param {number} [opt_endLatitudeInRadians] Where to end the
 *     bottom of the sphere. Default = Math.PI.
 * @param {number} [opt_startLongitudeInRadians] where to start
 *     wrapping the sphere. Default = 0.
 * @param {number} [opt_endLongitudeInRadians] where to end
 *     wrapping the sphere. Default = 2 * Math.PI.
 * @return {Object.<string, TypedArray>} The
 *         created plane vertices.
 * @memberOf module:primitives
 */
export function createSphereVertices(
  radius: number,
  subdivisionsAxis: number,
  subdivisionsHeight: number,
  opt_startLatitudeInRadians = 0,
  opt_endLatitudeInRadians = Math.PI,
  opt_startLongitudeInRadians = 0,
  opt_endLongitudeInRadians = Math.PI * 2
) {
  if (subdivisionsAxis <= 0 || subdivisionsHeight <= 0) {
    throw Error('subdivisionAxis and subdivisionHeight must be > 0');
  }

  opt_startLatitudeInRadians = opt_startLatitudeInRadians || 0;
  opt_endLatitudeInRadians = opt_endLatitudeInRadians || Math.PI;
  opt_startLongitudeInRadians = opt_startLongitudeInRadians || 0;
  opt_endLongitudeInRadians = opt_endLongitudeInRadians || (Math.PI * 2);

  const latRange = opt_endLatitudeInRadians - opt_startLatitudeInRadians;
  const longRange = opt_endLongitudeInRadians - opt_startLongitudeInRadians;

  // We are going to generate our sphere by iterating through its
  // spherical coordinates and generating 2 triangles for each quad on a
  // ring of the sphere.
  const numVertices = (subdivisionsAxis + 1) * (subdivisionsHeight + 1);
  const positions = createAugmentedTypedArray(3, numVertices);
  const normals   = createAugmentedTypedArray(3, numVertices);
  const texCoords = createAugmentedTypedArray(2 , numVertices);

  // Generate the individual vertices in our vertex buffer.
  for (let y = 0; y <= subdivisionsHeight; y++) {
    for (let x = 0; x <= subdivisionsAxis; x++) {
      // Generate a vertex based on its spherical coordinates
      const u = x / subdivisionsAxis;
      const v = y / subdivisionsHeight;
      const theta = longRange * u + opt_startLongitudeInRadians;
      const phi = latRange * v + opt_startLatitudeInRadians;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      const ux = cosTheta * sinPhi;
      const uy = cosPhi;
      const uz = sinTheta * sinPhi;
      positions.push(radius * ux, radius * uy, radius * uz);
      normals.push(ux, uy, uz);
      texCoords.push(1 - u, v);
    }
  }

  const numVertsAround = subdivisionsAxis + 1;
  const indices = createAugmentedTypedArray(3, subdivisionsAxis * subdivisionsHeight * 2, Uint16Array);
  for (let x = 0; x < subdivisionsAxis; x++) {
    for (let y = 0; y < subdivisionsHeight; y++) {
      // Make triangle 1 of quad.
      indices.push(
          (y + 0) * numVertsAround + x,
          (y + 0) * numVertsAround + x + 1,
          (y + 1) * numVertsAround + x);

      // Make triangle 2 of quad.
      indices.push(
          (y + 1) * numVertsAround + x,
          (y + 0) * numVertsAround + x + 1,
          (y + 1) * numVertsAround + x + 1);
    }
  }

  return {
    position: positions,
    normal: normals,
    texcoord: texCoords,
    indices: indices,
  };
}



/**
 * Array of the indices of corners of each face of a cube.
 * @type {Array.<number[]>}
 */
  const CUBE_FACE_INDICES = [
  [3, 7, 5, 1], // right
  [6, 2, 0, 4], // left
  [6, 7, 3, 2], // ??
  [0, 1, 5, 4], // ??
  [7, 6, 4, 5], // front
  [2, 3, 1, 0], // back
];

/**
 * Creates the vertices and indices for a cube. The
 * cube will be created around the origin. (-size / 2, size / 2)
 *
 * @param {number} size Width, height and depth of the cube.
 * @return {Object.<string, TypedArray>} The
 *         created plane vertices.
 * @memberOf module:primitives
 */
export function createCubeVertices(size: number) {
  const k = size / 2;

  const cornerVertices = [
    [-k, -k, -k],
    [+k, -k, -k],
    [-k, +k, -k],
    [+k, +k, -k],
    [-k, -k, +k],
    [+k, -k, +k],
    [-k, +k, +k],
    [+k, +k, +k],
  ];

  const faceNormals = [
    [+1, +0, +0],
    [-1, +0, +0],
    [+0, +1, +0],
    [+0, -1, +0],
    [+0, +0, +1],
    [+0, +0, -1],
  ];

  const uvCoords = [
    [1, 0],
    [0, 0],
    [0, 1],
    [1, 1],
  ];

  const numVertices = 6 * 4;
  const positions = createAugmentedTypedArray(3, numVertices);
  const normals   = createAugmentedTypedArray(3, numVertices);
  const texCoords = createAugmentedTypedArray(2 , numVertices);
  const indices   = createAugmentedTypedArray(3, 6 * 2, Uint16Array);

  for (let f = 0; f < 6; ++f) {
    const faceIndices = CUBE_FACE_INDICES[f];
    for (let v = 0; v < 4; ++v) {
      const position = cornerVertices[faceIndices[v]];
      const normal = faceNormals[f];
      const uv = uvCoords[v];

      // Each face needs all four vertices because the normals and texture
      // coordinates are not all the same.
      positions.push(position);
      normals.push(normal);
      texCoords.push(uv);

    }
    // Two triangles make a square face.
    const offset = 4 * f;
    indices.push(offset + 0, offset + 1, offset + 2);
    indices.push(offset + 0, offset + 2, offset + 3);
  }

  return {
    position: positions,
    normal: normals,
    texcoord: texCoords,
    indices: indices,
  };
}