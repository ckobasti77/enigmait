"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";
import type { Group, Mesh } from "three";

const LOGO_MODEL_PATH = "/assets/models/logo2.gltf";

function LogoScene() {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(LOGO_MODEL_PATH);
  const scale = useMemo(() => 0.8, []);

  const { centeredScene, centerY } = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.updateMatrixWorld(true);

    const worldBox = new Box3();
    const tempBox = new Box3();

    cloned.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        const geometry = mesh.geometry;
        if (!geometry.boundingBox) {
          geometry.computeBoundingBox();
        }
        const geomBox = geometry.boundingBox;
        if (!geomBox) return;
        tempBox.copy(geomBox).applyMatrix4(mesh.matrixWorld);
        worldBox.union(tempBox);
      }
    });

    const center = worldBox.isEmpty()
      ? new Vector3()
      : worldBox.getCenter(new Vector3());
    cloned.position.sub(center);

    return { centeredScene: cloned, centerY: center.y };
  }, [scene]);

  const groupPosition = useMemo<[number, number, number]>(() => {
    const verticalOffset = 0.2; // nudges the logo upward so it aligns with the text
    return [0, -1 + centerY + verticalOffset, 0];
  }, [centerY]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 1;
  });

  return (
    <group ref={groupRef} scale={scale} position={groupPosition}>
      <primitive object={centeredScene} />
    </group>
  );
}

const LogoMark3D = () => {
  return (
    <div className="relative h-12 w-12 shrink-0">
      <Suspense
        fallback={
          <div className="h-full w-full animate-pulse rounded-full bg-white/10" />
        }
      >
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 6], fov: 35 }}
          className="h-full w-full"
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 3, 4]} intensity={1.2} />
          <LogoScene />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default LogoMark3D;

useGLTF.preload(LOGO_MODEL_PATH);
