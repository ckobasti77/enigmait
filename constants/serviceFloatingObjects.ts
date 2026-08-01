import type { PrimitiveAssetKey } from "@/app/(pages)/services/_components/primitiveAssets";

export type Vec3 = [number, number, number];

export type FloatingDriftConfig = {
  axis?: "x" | "y" | "z";
  speed: number;
  bounds?: [number, number];
  wobble?: number;
};

export type FloatingInstanceConfig = {
  id: string;
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
  assetKey?: PrimitiveAssetKey;
  float: {
    amplitude: Vec3;
    rotationAmplitude?: Vec3;
    speed: number;
    phase?: number;
  };
  drift?: FloatingDriftConfig;
};

export type FloatingModelConfig = {
  assetType?: "gltf" | "primitive";
  modelPath?: string;
  ambient?: number;
  light?: {
    position: Vec3;
    intensity: number;
    color?: string;
  };
  instances: FloatingInstanceConfig[];
};

export type ServiceFloatingKey =
  | "default"
  | "web-development"
  | "ui-ux-design"
  | "mobile-app-development"
  | "seo-geo"
  | "branding"
  | "social-media";

const BASE_LEFT: Vec3 = [-4.2, 2.6, -9];
const BASE_RIGHT: Vec3 = [3.8, 0.4, -7.2];
const BASE_BOTTOM: Vec3 = [-0.2, -2.6, -10.8];

export const serviceFloatingObjects: Record<ServiceFloatingKey, FloatingModelConfig> = {
  default: {
    assetType: "primitive",
    ambient: 0.7,
    light: {
      position: [6, 10, 12],
      intensity: 2.6,
      color: "#7DE4FF",
    },
    instances: [
      {
        id: "default-a",
        position: BASE_LEFT,
        rotation: [0.2, 0.6, -0.12],
        scale: 1.6,
        assetKey: "default-orb",
        float: {
          amplitude: [1.8, 1.6, 1.3],
          rotationAmplitude: [0.24, 0.3, 0.18],
          speed: 0.4,
        },
        drift: {
          axis: "x",
          speed: 0.32,
          bounds: [-18, 18],
          wobble: 0.28,
        },
      },
      {
        id: "default-b",
        position: BASE_RIGHT,
        rotation: [-0.25, -0.4, 0.28],
        scale: 1.1,
        assetKey: "default-ring",
        float: {
          amplitude: [1.4, 1.3, 1],
          rotationAmplitude: [0.16, 0.22, 0.12],
          speed: 0.52,
          phase: 1.4,
        },
        drift: {
          axis: "x",
          speed: -0.28,
          bounds: [-18, 18],
          wobble: 0.26,
        },
      },
      {
        id: "default-c",
        position: BASE_BOTTOM,
        rotation: [0.34, 0.18, -0.2],
        scale: 1.3,
        assetKey: "default-pill",
        float: {
          amplitude: [1.1, 1.7, 0.9],
          rotationAmplitude: [0.12, 0.18, 0.12],
          speed: 0.36,
          phase: 2.6,
        },
        drift: {
          axis: "x",
          speed: 0.24,
          bounds: [-18, 18],
          wobble: 0.24,
        },
      },
    ],
  },
  "web-development": {
    assetType: "primitive",
    ambient: 0.74,
    light: {
      position: [-6, 10, 12],
      intensity: 2.8,
      color: "#56C8FF",
    },
    instances: [
      {
        id: "web-a",
        position: [-4.6, 2.8, -9.4],
        rotation: [0.25, -0.5, 0.3],
        scale: 1.7,
        assetKey: "web-monitor",
        float: {
          amplitude: [2.1, 1.8, 1.4],
          rotationAmplitude: [0.28, 0.32, 0.2],
          speed: 0.42,
        },
        drift: {
          axis: "x",
          speed: 0.36,
          bounds: [-18, 18],
          wobble: 0.3,
        },
      },
      {
        id: "web-b",
        position: [3.4, 0.6, -7.6],
        rotation: [-0.18, 0.48, -0.3],
        scale: 1.2,
        assetKey: "web-code",
        float: {
          amplitude: [1.5, 1.4, 1],
          rotationAmplitude: [0.18, 0.22, 0.16],
          speed: 0.5,
          phase: 1.6,
        },
        drift: {
          axis: "x",
          speed: -0.3,
          bounds: [-18, 18],
          wobble: 0.28,
        },
      },
      {
        id: "web-c",
        position: [-0.4, -2.6, -11.3],
        rotation: [0.32, -0.2, 0.22],
        scale: 1.4,
        assetKey: "web-server",
        float: {
          amplitude: [1.2, 1.8, 0.9],
          rotationAmplitude: [0.12, 0.2, 0.12],
          speed: 0.36,
          phase: 2.4,
        },
        drift: {
          axis: "x",
          speed: 0.26,
          bounds: [-18, 18],
          wobble: 0.26,
        },
      },
    ],
  },
  "ui-ux-design": {
    assetType: "primitive",
    ambient: 0.68,
    light: {
      position: [7, 9, 11],
      intensity: 2.5,
      color: "#F070CF",
    },
    instances: [
      {
        id: "uiux-a",
        position: [-3.6, 2.7, -8.8],
        rotation: [-0.3, 0.55, 0.2],
        scale: 1.8,
        assetKey: "uiux-wireframe",
        float: {
          amplitude: [1.9, 1.9, 1.2],
          rotationAmplitude: [0.26, 0.3, 0.18],
          speed: 0.38,
        },
        drift: {
          axis: "x",
          speed: 0.34,
          bounds: [-18, 18],
          wobble: 0.28,
        },
      },
      {
        id: "uiux-b",
        position: [4.2, 0.7, -7.2],
        rotation: [0.2, -0.34, -0.26],
        scale: 1.1,
        assetKey: "uiux-stack",
        float: {
          amplitude: [1.3, 1.4, 1],
          rotationAmplitude: [0.16, 0.2, 0.12],
          speed: 0.52,
          phase: 1.3,
        },
        drift: {
          axis: "x",
          speed: -0.29,
          bounds: [-18, 18],
          wobble: 0.26,
        },
      },
      {
        id: "uiux-c",
        position: [-0.6, -2.4, -10.9],
        rotation: [0.34, 0.3, -0.12],
        scale: 1.35,
        assetKey: "uiux-palette",
        float: {
          amplitude: [1.1, 1.7, 0.8],
          rotationAmplitude: [0.1, 0.18, 0.1],
          speed: 0.42,
          phase: 2.5,
        },
        drift: {
          axis: "x",
          speed: 0.22,
          bounds: [-18, 18],
          wobble: 0.24,
        },
      },
    ],
  },
  "mobile-app-development": {
    assetType: "primitive",
    ambient: 0.75,
    light: {
      position: [-5, 9, 11],
      intensity: 2.7,
      color: "#5FFBD3",
    },
    instances: [
      {
        id: "mobile-a",
        position: [-4.1, 2.4, -8.6],
        rotation: [0.3, -0.44, 0.24],
        scale: 1.65,
        assetKey: "mobile-phone",
        float: {
          amplitude: [1.8, 1.7, 1.3],
          rotationAmplitude: [0.24, 0.28, 0.16],
          speed: 0.4,
        },
        drift: {
          axis: "x",
          speed: 0.38,
          bounds: [-18, 18],
          wobble: 0.28,
        },
      },
      {
        id: "mobile-b",
        position: [3.6, 0.9, -7.4],
        rotation: [-0.24, 0.36, -0.24],
        scale: 1.15,
        assetKey: "mobile-map",
        float: {
          amplitude: [1.4, 1.5, 1.1],
          rotationAmplitude: [0.16, 0.2, 0.12],
          speed: 0.5,
          phase: 1.5,
        },
        drift: {
          axis: "x",
          speed: -0.33,
          bounds: [-18, 18],
          wobble: 0.26,
        },
      },
      {
        id: "mobile-c",
        position: [0, -2.6, -11.1],
        rotation: [0.28, -0.16, 0.32],
        scale: 1.32,
        assetKey: "mobile-notification",
        float: {
          amplitude: [1, 1.8, 0.9],
          rotationAmplitude: [0.12, 0.2, 0.12],
          speed: 0.38,
          phase: 2.7,
        },
        drift: {
          axis: "x",
          speed: 0.27,
          bounds: [-18, 18],
          wobble: 0.24,
        },
      },
    ],
  },
  "seo-geo": {
    assetType: "primitive",
    ambient: 0.72,
    light: {
      position: [6, 9, 11],
      intensity: 2.6,
      color: "#6BFFA1",
    },
    instances: [
      {
        id: "seo-a",
        position: [-4.3, 2.6, -8.9],
        rotation: [0.24, 0.6, -0.18],
        scale: 1.6,
        assetKey: "seo-magnifier",
        float: {
          amplitude: [1.9, 1.7, 1.3],
          rotationAmplitude: [0.22, 0.28, 0.16],
          speed: 0.38,
        },
        drift: {
          axis: "x",
          speed: 0.4,
          bounds: [-18, 18],
          wobble: 0.3,
        },
      },
      {
        id: "seo-b",
        position: [3.8, 0.8, -7.1],
        rotation: [-0.18, -0.4, 0.28],
        scale: 1.18,
        assetKey: "seo-graph",
        float: {
          amplitude: [1.3, 1.5, 1.1],
          rotationAmplitude: [0.14, 0.2, 0.14],
          speed: 0.48,
          phase: 1.7,
        },
        drift: {
          axis: "x",
          speed: -0.34,
          bounds: [-18, 18],
          wobble: 0.28,
        },
      },
      {
        id: "seo-c",
        position: [-0.3, -2.5, -10.8],
        rotation: [0.3, 0.22, -0.2],
        scale: 1.28,
        assetKey: "seo-globe",
        float: {
          amplitude: [1.1, 1.6, 0.9],
          rotationAmplitude: [0.1, 0.18, 0.1],
          speed: 0.4,
          phase: 2.4,
        },
        drift: {
          axis: "x",
          speed: 0.3,
          bounds: [-18, 18],
          wobble: 0.24,
        },
      },
    ],
  },
  branding: {
    assetType: "primitive",
    ambient: 0.7,
    light: {
      position: [-7, 10, 12],
      intensity: 2.8,
      color: "#FFD066",
    },
    instances: [
      {
        id: "branding-a",
        position: [-3.7, 2.8, -9.2],
        rotation: [0.36, -0.44, 0.24],
        scale: 1.7,
        assetKey: "branding-badge",
        float: {
          amplitude: [1.8, 1.8, 1.3],
          rotationAmplitude: [0.24, 0.3, 0.18],
          speed: 0.4,
        },
        drift: {
          axis: "x",
          speed: 0.35,
          bounds: [-18, 18],
          wobble: 0.28,
        },
      },
      {
        id: "branding-b",
        position: [3.9, 0.8, -7.4],
        rotation: [-0.22, 0.46, -0.28],
        scale: 1.08,
        assetKey: "branding-grid",
        float: {
          amplitude: [1.4, 1.4, 1.1],
          rotationAmplitude: [0.16, 0.22, 0.12],
          speed: 0.52,
          phase: 1.6,
        },
        drift: {
          axis: "x",
          speed: -0.31,
          bounds: [-18, 18],
          wobble: 0.26,
        },
      },
      {
        id: "branding-c",
        position: [0.1, -2.6, -11],
        rotation: [0.26, -0.18, 0.3],
        scale: 1.3,
        assetKey: "branding-pack",
        float: {
          amplitude: [1, 1.7, 0.9],
          rotationAmplitude: [0.12, 0.2, 0.12],
          speed: 0.37,
          phase: 2.8,
        },
        drift: {
          axis: "x",
          speed: 0.26,
          bounds: [-18, 18],
          wobble: 0.24,
        },
      },
    ],
  },
  "social-media": {
    assetType: "primitive",
    ambient: 0.74,
    light: {
      position: [6, 8, 12],
      intensity: 2.7,
      color: "#FF7BFF",
    },
    instances: [
      {
        id: "social-a",
        position: [-3.9, 2.6, -8.3],
        rotation: [0.32, 0.52, -0.24],
        scale: 1.6,
        assetKey: "social-chat",
        float: {
          amplitude: [1.8, 1.8, 1.4],
          rotationAmplitude: [0.24, 0.3, 0.2],
          speed: 0.44,
        },
        drift: {
          axis: "x",
          speed: 0.37,
          bounds: [-18, 18],
          wobble: 0.3,
        },
      },
      {
        id: "social-b",
        position: [3.6, 0.8, -7.1],
        rotation: [-0.24, -0.42, 0.26],
        scale: 1.18,
        assetKey: "social-network",
        float: {
          amplitude: [1.4, 1.6, 1.2],
          rotationAmplitude: [0.18, 0.24, 0.14],
          speed: 0.52,
          phase: 1.3,
        },
        drift: {
          axis: "x",
          speed: -0.32,
          bounds: [-18, 18],
          wobble: 0.28,
        },
      },
      {
        id: "social-c",
        position: [-0.2, -2.6, -10.6],
        rotation: [0.3, 0.24, -0.18],
        scale: 1.32,
        assetKey: "social-spark",
        float: {
          amplitude: [1.1, 1.7, 0.9],
          rotationAmplitude: [0.12, 0.2, 0.12],
          speed: 0.4,
          phase: 2.6,
        },
        drift: {
          axis: "x",
          speed: 0.28,
          bounds: [-18, 18],
          wobble: 0.24,
        },
      },
    ],
  },
};
