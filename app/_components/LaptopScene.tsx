"use client";

import { Bounds, useGLTF, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { useTheme } from "./ThemeProvider";
import { useMood } from "./MoodProvider";
import { MOOD_CAMERA } from "@/constants/moodConfig";

type AxisKey = "x" | "y" | "z";
type ThemeMode = "light" | "dark";

const LAPTOP_COLOR_PRESETS: Record<ThemeMode, { chassis: string; bezel: string; glow: string }> = {
  light: {
    chassis: "#dbe6f8",
    bezel: "#1f2c3d",
    glow: "#58c4ff",
  },
  dark: {
    chassis: "#132238",
    bezel: "#58c4ff",
    glow: "#58c4ff",
  },
};

function Laptop({ progressRef }: { progressRef?: React.MutableRefObject<number> }) {
  const { scene } = useGLTF("/assets/models/laptop/laptop.glb");
  const tiltRef = useRef<THREE.Group>(null);
  const { theme } = useTheme();
  const palette = useMemo(() => LAPTOP_COLOR_PRESETS[theme], [theme]);

  const sourceScreenTexture = useTexture("/assets/images/screen-saver2.avif");
  const screenTexture = useMemo(() => {
    const texture = sourceScreenTexture.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.center.set(0.5, 0.5);
    texture.anisotropy = Math.min(8, texture.anisotropy ?? 0);
    texture.needsUpdate = true;
    return texture;
  }, [sourceScreenTexture]);

  useEffect(() => {
    return () => {
      screenTexture.dispose();
    };
  }, [screenTexture]);

  const screenMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: screenTexture,
        toneMapped: false,
        transparent: false,
        side: THREE.FrontSide,
      }),
    [screenTexture]
  );

  useEffect(() => {
    return () => {
      screenMaterial.dispose();
    };
  }, [screenMaterial]);

  const frameMaterial = useMemo(() => {
    const base = new THREE.Color(palette.bezel);
    const highlight = new THREE.Color(palette.glow);
    const emissive = highlight.clone().lerp(base, 0.55).multiplyScalar(theme === "light" ? 0.22 : 0.42);

    return new THREE.MeshStandardMaterial({
      color: base,
      metalness: 0.35,
      roughness: 0.32,
      envMapIntensity: 0.6,
      emissive,
      emissiveIntensity: 0.75,
      toneMapped: true,
      side: THREE.FrontSide,
    });
  }, [palette, theme]);

  useEffect(() => {
    return () => {
      frameMaterial.dispose();
    };
  }, [frameMaterial]);

  const chassisMaterial = useMemo(() => {
    const color = new THREE.Color(palette.chassis);
    const glow = new THREE.Color(palette.glow);
    const emissive = glow.clone().lerp(color, 0.7).multiplyScalar(theme === "light" ? 0.12 : 0.28);

    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.25,
      roughness: 0.68,
      envMapIntensity: 0.55,
      emissive,
      emissiveIntensity: 0.65,
      toneMapped: true,
    });

    return material;
  }, [palette, theme]);

  useEffect(() => {
    return () => {
      chassisMaterial.dispose();
    };
  }, [chassisMaterial]);

  useEffect(() => {
    if (!scene) return;

    const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const meshName = child.name.toLowerCase();
      if (!meshName.includes("keyboard")) return;

      if (!originalMaterials.has(child)) {
        originalMaterials.set(child, child.material);
      }

      child.material = chassisMaterial;
    });

    return () => {
      originalMaterials.forEach((material, mesh) => {
        mesh.material = material;
      });
    };
  }, [scene, chassisMaterial]);

  useEffect(() => {
    if (!scene) return;

    type Candidate = { mesh: THREE.Mesh; bbox: THREE.Box3; size: THREE.Vector3 };
    const candidates: Candidate[] = [];

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      if (!child.name.toLowerCase().includes("screen")) return;

      const geometry = child.geometry as THREE.BufferGeometry;
      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox?.clone();
      if (!bbox) return;

      const size = new THREE.Vector3();
      bbox.getSize(size);

      candidates.push({ mesh: child, bbox, size });
    });

    if (!candidates.length) return;

    const faceArea = (size: THREE.Vector3) => {
      const dims = [size.x, size.y, size.z].sort((a, b) => b - a);
      return dims[0] * dims[1];
    };

    const primary = candidates.reduce((smallest, candidate) =>
      faceArea(candidate.size) < faceArea(smallest.size) ? candidate : smallest
    );

    const originalMaterials: Array<{
      mesh: THREE.Mesh;
      material: THREE.Material | THREE.Material[];
    }> = [];

    candidates.forEach(({ mesh, bbox, size }) => {
      originalMaterials.push({ mesh, material: mesh.material });

      if (mesh === primary.mesh) {
        const axes = [
          { key: "x" as AxisKey, size: size.x, min: bbox.min.x, max: bbox.max.x },
          { key: "y" as AxisKey, size: size.y, min: bbox.min.y, max: bbox.max.y },
          { key: "z" as AxisKey, size: size.z, min: bbox.min.z, max: bbox.max.z },
        ].sort((a, b) => b.size - a.size);

        const widthAxis = axes[0];
        const heightAxis = axes[1];

        const geometry = mesh.geometry as THREE.BufferGeometry;
        const positionAttr = geometry.getAttribute("position") as THREE.BufferAttribute;

        let uvAttr = geometry.getAttribute("uv") as THREE.BufferAttribute | undefined;
        if (!uvAttr) {
          uvAttr = new THREE.Float32BufferAttribute(positionAttr.count * 2, 2);
          geometry.setAttribute("uv", uvAttr);
        }

        const widthRange = Math.max(widthAxis.size, 1e-6);
        const heightRange = Math.max(heightAxis.size, 1e-6);

        const getComponent = (index: number, axis: AxisKey) => {
          switch (axis) {
            case "x":
              return positionAttr.getX(index);
            case "y":
              return positionAttr.getY(index);
            default:
              return positionAttr.getZ(index);
          }
        };

        for (let i = 0; i < positionAttr.count; i++) {
          const widthVal = getComponent(i, widthAxis.key);
          const heightVal = getComponent(i, heightAxis.key);

          const u = (widthVal - widthAxis.min) / widthRange;
          const v = (heightVal - heightAxis.min) / heightRange;

          uvAttr.setXY(i, u, v);
        }

        uvAttr.needsUpdate = true;
        mesh.material = screenMaterial;
      } else {
        mesh.material = frameMaterial;
      }
    });

    return () => {
      originalMaterials.forEach(({ mesh, material }) => {
        mesh.material = material;
      });
    };
  }, [scene, screenMaterial, frameMaterial]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!tiltRef.current) return;
      const attenuation = 1 - (progressRef?.current ?? 0);
      const x = (event.clientX / window.innerWidth - 0.5) * 0.6 * attenuation;
      const y = (event.clientY / window.innerHeight - 0.5) * 0.6 * attenuation;
      tiltRef.current.rotation.y = x;
      tiltRef.current.rotation.x = -y;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [progressRef]);

  return <primitive ref={tiltRef} object={scene} scale={4} />;
}

type SpinningIconProps = {
  modelPath: string;
  position: [number, number, number];
  spinSpeed?: number;
  targetSize?: number;
};

function SpinningIcon({ modelPath, position, spinSpeed = 0.5, targetSize = 0.5 }: SpinningIconProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

  const icon = useMemo(() => {
    if (!scene) return null;

    const root = scene.clone(true);
    const materialCache = new Map<THREE.Material, THREE.Material>();

    const cloneMaterial = (material: THREE.Material | null | undefined) => {
      if (!material) return material ?? null;
      if (materialCache.has(material)) return materialCache.get(material)!;
      const cloned = material.clone() as THREE.Material & { toneMapped?: boolean };
      if ("toneMapped" in cloned) {
        cloned.toneMapped = true;
      }
      materialCache.set(material, cloned);
      return cloned;
    };

    const stack: THREE.Object3D[] = [root];
    while (stack.length) {
      const current = stack.pop();
      if (!current) continue;

      if (current instanceof THREE.Light || current instanceof THREE.Camera) {
        current.parent?.remove(current);
        continue;
      }

      if (current instanceof THREE.Mesh) {
        if (Array.isArray(current.material)) {
          current.material = current.material.map((material) => cloneMaterial(material) ?? material);
        } else {
          current.material = cloneMaterial(current.material) ?? current.material;
        }

        current.castShadow = true;
        current.receiveShadow = true;
      }

      if (current.children && current.children.length) {
        stack.push(...current.children);
      }
    }

    root.updateMatrixWorld(true);

    const boundingBox = new THREE.Box3().setFromObject(root);
    const size = boundingBox.getSize(new THREE.Vector3());
    const center = boundingBox.getCenter(new THREE.Vector3());

    root.position.sub(center);

    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const scaleFactor = targetSize / maxDimension;
    root.scale.setScalar(scaleFactor);

    return root;
  }, [scene, targetSize]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += spinSpeed * delta;
  });

  if (!icon) return null;

  return <primitive ref={groupRef} object={icon} position={position} />;
}

type SocialIconProps = Omit<SpinningIconProps, "modelPath">;

const WHATSAPP_MODEL_PATH = "/assets/models/3d-icons/whatsapp.gltf";

function WhatsAppIcon(props: SocialIconProps) {
  return <SpinningIcon modelPath={WHATSAPP_MODEL_PATH} {...props} />;
}

const TIKTOK_MODEL_PATH = "/assets/models/3d-icons/tik-tok.gltf";

function TikTokIcon(props: SocialIconProps) {
  return <SpinningIcon modelPath={TIKTOK_MODEL_PATH} {...props} />;
}

const INSTAGRAM_MODEL_PATH = "/assets/models/3d-icons/instagram.gltf";

function InstagramIcon(props: SocialIconProps) {
  return <SpinningIcon modelPath={INSTAGRAM_MODEL_PATH} {...props} />;
}

function AmbientShapes({ progressRef }: { progressRef?: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current || !progressRef) return;
    const p = progressRef.current;
    const fade = 1 - p;
    groupRef.current.scale.setScalar(fade);
    groupRef.current.visible = fade > 0.01;
  });

  return (
    <group ref={groupRef}>
      <TikTokIcon
        position={[2, 0.95, -0.25]}
        spinSpeed={0.75}
        targetSize={0.55}
      />
      <WhatsAppIcon
        position={[-1.2, -0.05, 0.8]}
        spinSpeed={0.5}
        targetSize={0.5}
      />
      <InstagramIcon
        position={[2, -0.9, 0.5]}
        spinSpeed={0.85}
        targetSize={0.55}
      />
    </group>
  );
}

function CameraController({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const startPos = useMemo(() => new THREE.Vector3(...MOOD_CAMERA.start), []);
  const endPos = useMemo(() => new THREE.Vector3(...MOOD_CAMERA.end), []);
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const screenCenter = useMemo(() => new THREE.Vector3(0, 0.85, 0), []);

  useFrame(() => {
    const p = progressRef.current;
    if (p <= 0) return;

    targetPos.lerpVectors(startPos, endPos, p);
    camera.position.lerp(targetPos, 0.15);
    camera.lookAt(screenCenter);
  });

  return null;
}

export default function LaptopScene() {
  const { moodActive, progressRef } = useMood();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const originRect = useRef<DOMRect | null>(null);
  const rafId = useRef(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    if (moodActive) {
      // Snapshot the in-flow bounding rect before going fixed
      originRect.current = el.getBoundingClientRect();

      const r = originRect.current;
      const origCx = r.left + r.width / 2;
      const origCy = r.top + r.height / 2;

      const tick = () => {
        const p = progressRef.current;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Lerp center: laptop screen center → viewport center
        const cx = origCx + (vw / 2 - origCx) * p;
        const cy = origCy + (vh / 2 - origCy) * p;

        // Lerp size: original → full viewport
        const w = r.width + (vw - r.width) * p;
        const h = r.height + (vh - r.height) * p;

        el.style.position = "fixed";
        el.style.zIndex = "30";
        el.style.left = `${cx - w / 2}px`;
        el.style.top = `${cy - h / 2}px`;
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
        el.style.maxWidth = "none";
        el.style.aspectRatio = "unset";
        el.style.transform = "none";

        rafId.current = requestAnimationFrame(tick);
      };

      rafId.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId.current);
    } else {
      cancelAnimationFrame(rafId.current);
      el.style.position = "";
      el.style.zIndex = "";
      el.style.left = "";
      el.style.top = "";
      el.style.width = "";
      el.style.height = "";
      el.style.maxWidth = "";
      el.style.aspectRatio = "";
      el.style.transform = "";
      originRect.current = null;
    }
  }, [moodActive, progressRef]);

  return (
    <div ref={wrapperRef} className="aspect-[4/3] w-full translate-x-16 md:translate-x-0">
      <Canvas camera={{ position: [0, 1, 3], fov: 45 }} style={{ width: "100%", height: "100%" }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.1} castShadow />
        <Suspense fallback={null}>
          <Bounds fit={!moodActive} clip observe margin={1.2}>
            <Laptop progressRef={progressRef} />
          </Bounds>
          <AmbientShapes progressRef={progressRef} />
          {moodActive && <CameraController progressRef={progressRef} />}
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/assets/models/laptop/laptop.glb");
useGLTF.preload(WHATSAPP_MODEL_PATH);
useGLTF.preload(TIKTOK_MODEL_PATH);
useGLTF.preload(INSTAGRAM_MODEL_PATH);
