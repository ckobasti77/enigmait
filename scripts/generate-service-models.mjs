#!/usr/bin/env node

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const OUTPUT_DIR = resolve("public", "models");

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function normalize(v) {
  const length = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
}

function buildGeometry(vertices, faces) {
  const positions = [];
  const normals = [];
  const indices = [];
  let cursor = 0;

  for (const face of faces) {
    const [ia, ib, ic] = face;
    const a = vertices[ia];
    const b = vertices[ib];
    const c = vertices[ic];
    const normal = normalize(cross(subtract(b, a), subtract(c, a)));

    positions.push(...a, ...b, ...c);
    normals.push(...normal, ...normal, ...normal);
    indices.push(cursor, cursor + 1, cursor + 2);
    cursor += 3;
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
  };
}

function minMax(array, stride) {
  const min = Array(stride).fill(Number.POSITIVE_INFINITY);
  const max = Array(stride).fill(Number.NEGATIVE_INFINITY);
  const count = array.length / stride;

  for (let i = 0; i < count; i++) {
    for (let j = 0; j < stride; j++) {
      const value = array[i * stride + j];
      if (value < min[j]) min[j] = value;
      if (value > max[j]) max[j] = value;
    }
  }

  return { min, max };
}

function writeBuffers(buffers, typedArray) {
  const nodeBuffer = Buffer.from(
    typedArray.buffer,
    typedArray.byteOffset,
    typedArray.byteLength
  );
  const offset = buffers.byteLength;
  buffers.parts.push(nodeBuffer);
  buffers.byteLength += nodeBuffer.byteLength;

  const remainder = buffers.byteLength % 4;
  if (remainder !== 0) {
    const padding = 4 - remainder;
    buffers.parts.push(Buffer.alloc(padding));
    buffers.byteLength += padding;
  }

  return { byteOffset: offset, byteLength: nodeBuffer.byteLength };
}

function saveShape({ name, vertices, faces, color, scale = 1 }) {
  const scaledVertices = vertices.map(([x, y, z]) => [x * scale, y * scale, z * scale]);

  const { positions, normals, indices } = buildGeometry(scaledVertices, faces);

  const positionStats = minMax(positions, 3);
  const normalStats = minMax(normals, 3);
  const indexStats = { min: [0], max: [indices.length - 1] };

  const bufferBuilder = { parts: [], byteLength: 0 };

  const indexView = writeBuffers(bufferBuilder, indices);
  const positionView = writeBuffers(bufferBuilder, positions);
  const normalView = writeBuffers(bufferBuilder, normals);

  const bufferData = Buffer.concat(bufferBuilder.parts);

  const gltf = {
    asset: {
      version: "2.0",
      generator: "ServiceShapeGenerator",
    },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name }],
    meshes: [
      {
        name: `${name}-mesh`,
        primitives: [
          {
            attributes: {
              POSITION: 1,
              NORMAL: 2,
            },
            indices: 0,
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        name: `${name}-material`,
        doubleSided: true,
        pbrMetallicRoughness: {
          baseColorFactor: [...color, 1],
          metallicFactor: 0.05,
          roughnessFactor: 0.45,
        },
      },
    ],
    buffers: [
      {
        uri: `${name}.bin`,
        byteLength: bufferData.byteLength,
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: indexView.byteOffset,
        byteLength: indexView.byteLength,
        target: 34963,
      },
      {
        buffer: 0,
        byteOffset: positionView.byteOffset,
        byteLength: positionView.byteLength,
        target: 34962,
      },
      {
        buffer: 0,
        byteOffset: normalView.byteOffset,
        byteLength: normalView.byteLength,
        target: 34962,
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5123,
        count: indices.length,
        type: "SCALAR",
        min: indexStats.min,
        max: indexStats.max,
      },
      {
        bufferView: 1,
        componentType: 5126,
        count: positions.length / 3,
        type: "VEC3",
        min: positionStats.min,
        max: positionStats.max,
      },
      {
        bufferView: 2,
        componentType: 5126,
        count: normals.length / 3,
        type: "VEC3",
        min: normalStats.min,
        max: normalStats.max,
      },
    ],
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(resolve(OUTPUT_DIR, `${name}.gltf`), JSON.stringify(gltf, null, 2), "utf8");
  writeFileSync(resolve(OUTPUT_DIR, `${name}.bin`), bufferData);
}

const shapes = [
  {
    name: "service-default",
    color: [0.32, 0.82, 0.98],
    scale: 1.1,
    vertices: [
      [0, 1.1, 0],
      [0.9, 0, 0.6],
      [-0.9, 0, 0.6],
      [0.9, 0, -0.6],
      [-0.9, 0, -0.6],
      [0, -1.1, 0],
    ],
    faces: [
      [0, 1, 2],
      [0, 3, 1],
      [0, 4, 3],
      [0, 2, 4],
      [5, 1, 3],
      [5, 3, 4],
      [5, 4, 2],
      [5, 2, 1],
    ],
  },
  {
    name: "service-web",
    color: [0.25, 0.76, 1],
    vertices: [
      [0, 1.2, 0],
      [1.1, -0.2, 0.3],
      [0.6, -0.2, 1],
      [-0.6, -0.2, 1],
      [-1.1, -0.2, 0.3],
      [-0.7, -0.2, -1],
      [0.7, -0.2, -1],
      [1.1, -0.2, -0.3],
      [0, -1.2, 0],
    ],
    faces: [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 4],
      [0, 4, 5],
      [0, 5, 6],
      [0, 6, 7],
      [0, 7, 1],
      [8, 2, 1],
      [8, 3, 2],
      [8, 4, 3],
      [8, 5, 4],
      [8, 6, 5],
      [8, 7, 6],
      [8, 1, 7],
    ],
  },
  {
    name: "service-uiux",
    color: [0.95, 0.38, 0.78],
    vertices: [
      [0, 1.35, 0],
      [-1.1, -0.1, 0.5],
      [1.1, -0.1, 0.5],
      [0, -1.35, 0],
      [0, -0.1, -1.2],
    ],
    faces: [
      [0, 1, 2],
      [0, 2, 4],
      [0, 4, 1],
      [3, 2, 1],
      [3, 4, 2],
      [3, 1, 4],
    ],
  },
  {
    name: "service-mobile",
    color: [0.26, 0.98, 0.76],
    vertices: [
      [0, 1.4, 0],
      [0.8, 0.4, 0.9],
      [-0.8, 0.4, 0.9],
      [1.2, -0.4, -0.8],
      [-1.2, -0.4, -0.8],
      [0, -1.4, 0],
    ],
    faces: [
      [0, 1, 2],
      [0, 3, 1],
      [0, 4, 3],
      [0, 2, 4],
      [5, 2, 1],
      [5, 1, 3],
      [5, 3, 4],
      [5, 4, 2],
    ],
  },
  {
    name: "service-seo",
    color: [0.42, 0.98, 0.6],
    vertices: [
      [0, 1.25, 0],
      [1, 0.3, 0.3],
      [0.5, 0.3, 1],
      [-0.5, 0.3, 1],
      [-1, 0.3, 0.3],
      [-0.6, 0.3, -1],
      [0.6, 0.3, -1],
      [1, 0.3, -0.3],
      [0, -1.25, 0],
    ],
    faces: [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 4],
      [0, 4, 5],
      [0, 5, 6],
      [0, 6, 7],
      [0, 7, 1],
      [8, 2, 1],
      [8, 3, 2],
      [8, 4, 3],
      [8, 5, 4],
      [8, 6, 5],
      [8, 7, 6],
      [8, 1, 7],
    ],
  },
  {
    name: "service-branding",
    color: [1, 0.8, 0.32],
    vertices: [
      [0, 1.3, 0],
      [0.9, 0, 0],
      [0, 0, 1.1],
      [-0.9, 0, 0],
      [0, 0, -1.1],
      [0, -1.3, 0],
    ],
    faces: [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 4],
      [0, 4, 1],
      [5, 2, 1],
      [5, 3, 2],
      [5, 4, 3],
      [5, 1, 4],
    ],
  },
  {
    name: "service-social",
    color: [0.92, 0.4, 1],
    vertices: [
      [0, 1.3, 0],
      [0.35, 0.2, 1.1],
      [1.1, 0.2, 0.35],
      [0.75, 0.2, -1],
      [-0.75, 0.2, -1],
      [-1.1, 0.2, 0.35],
      [-0.35, 0.2, 1.1],
      [0, -1.3, 0],
    ],
    faces: [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 4],
      [0, 4, 5],
      [0, 5, 6],
      [0, 6, 1],
      [7, 2, 1],
      [7, 3, 2],
      [7, 4, 3],
      [7, 5, 4],
      [7, 6, 5],
      [7, 1, 6],
    ],
  },
];

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const shape of shapes) {
  saveShape(shape);
}

console.log(`Generated ${shapes.length} service model assets in ${OUTPUT_DIR}`);

