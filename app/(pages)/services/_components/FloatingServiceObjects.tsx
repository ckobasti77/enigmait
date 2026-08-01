"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { Group } from "three";
import clsx from "clsx";
import {
  serviceFloatingObjects,
  type FloatingModelConfig,
  type FloatingInstanceConfig,
  type ServiceFloatingKey,
  type Vec3,
} from "@/constants/serviceFloatingObjects";
import { primitiveAssetFactories } from "./primitiveAssets";

type FloatingServiceObjectsProps = {
  serviceKey?: ServiceFloatingKey;
  className?: string;
};

const AXIS_LOOKUP = {
  x: 0,
  y: 1,
  z: 2,
} as const;

const wrapValue = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) return min;
  const range = max - min;
  if (range <= 0) return min;
  const normalized = value - min;
  const wrapped = ((normalized % range) + range) % range;
  return wrapped + min;
};

function FloatingObject({ instance, children }: { instance: FloatingInstanceConfig; children: ReactNode }) {
  const groupRef = useRef<Group>(null);
  const driftPositionRef = useRef<number | null>(null);

  const basePosition = instance.position;
  const baseRotation = instance.rotation ?? [0, 0, 0];
  const rotationAmplitude = instance.float.rotationAmplitude ?? [0, 0, 0];
  const [baseX, baseY, baseZ] = basePosition;

  useEffect(() => {
    driftPositionRef.current = null;
  }, [instance.id, baseX, baseY, baseZ]);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const t = clock.getElapsedTime() * instance.float.speed + (instance.float.phase ?? 0);

    const position: Vec3 = [...basePosition];
    const drift = instance.drift;
    let driftAxisIndex: number | null = null;
    let driftPosition = 0;

    if (drift) {
      const axis = drift.axis ?? "x";
      driftAxisIndex = AXIS_LOOKUP[axis];
      const bounds = drift.bounds ?? [-16, 16];
      const current = driftPositionRef.current ?? basePosition[driftAxisIndex];
      const stepped = current + drift.speed * delta;
      driftPosition = wrapValue(stepped, bounds[0], bounds[1]);
      driftPositionRef.current = driftPosition;
      position[driftAxisIndex] = driftPosition;
    }

    const wobbleStrength = drift && driftAxisIndex !== null ? drift.wobble ?? 0.25 : 1;

    position[0] = (driftAxisIndex === 0 && drift ? driftPosition : basePosition[0]) +
      Math.sin(t) * instance.float.amplitude[0] * (driftAxisIndex === 0 && drift ? wobbleStrength : 1);
    position[1] = (driftAxisIndex === 1 && drift ? driftPosition : basePosition[1]) +
      Math.cos(t * 0.82) * instance.float.amplitude[1] * (driftAxisIndex === 1 && drift ? wobbleStrength : 1);
    position[2] = (driftAxisIndex === 2 && drift ? driftPosition : basePosition[2]) +
      Math.sin(t * 0.68) * instance.float.amplitude[2] * (driftAxisIndex === 2 && drift ? wobbleStrength : 1);

    group.position.set(position[0], position[1], position[2]);

    group.rotation.set(
      baseRotation[0] + Math.sin(t * 0.6) * rotationAmplitude[0],
      baseRotation[1] + Math.cos(t * 0.5) * rotationAmplitude[1],
      baseRotation[2] + Math.sin(t * 0.4) * rotationAmplitude[2]
    );
  });

  return (
    <group ref={groupRef} scale={instance.scale ?? 1} dispose={null}>
      {children}
    </group>
  );
}

function FloatingGLTFAsset({ config, instance }: { config: FloatingModelConfig; instance: FloatingInstanceConfig }) {
  if (!config.modelPath) {
    throw new Error("GLTF asset requested without a modelPath");
  }
  const { scene } = useGLTF(config.modelPath);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return (
    <FloatingObject instance={instance}>
      <primitive object={cloned} />
    </FloatingObject>
  );
}

function FloatingPrimitiveAsset({ instance }: { instance: FloatingInstanceConfig }) {
  const Asset = instance.assetKey ? primitiveAssetFactories[instance.assetKey] : undefined;
  return (
    <FloatingObject instance={instance}>
      {Asset ? (
        <Asset />
      ) : (
        <mesh>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.35} metalness={0.4} />
        </mesh>
      )}
    </FloatingObject>
  );
}

function FloatingScene({ config }: { config: FloatingModelConfig }) {
  const assetType = config.assetType ?? "gltf";
  const usePrimitiveAssets = assetType === "primitive";
  return (
    <>
      <ambientLight intensity={config.ambient ?? 0.7} />
      <directionalLight
        intensity={config.light?.intensity ?? 2.5}
        position={config.light?.position ?? [6, 10, 12]}
        color={config.light?.color ?? "#7DE4FF"}
      />
      {config.instances.map((instance) => (
        usePrimitiveAssets ? (
          <FloatingPrimitiveAsset key={instance.id} instance={instance} />
        ) : (
          <FloatingGLTFAsset key={instance.id} config={config} instance={instance} />
        )
      ))}
    </>
  );
}

const MODEL_PATHS = new Set(
  Object.values(serviceFloatingObjects)
    .filter((config) => (config.assetType ?? "gltf") === "gltf" && config.modelPath)
    .map((config) => config.modelPath as string)
);
MODEL_PATHS.forEach((path) => {
  useGLTF.preload(path);
});

export default function FloatingServiceObjects({ serviceKey = "default", className }: FloatingServiceObjectsProps) {
  const config = useMemo(() => {
    return serviceFloatingObjects[serviceKey] ?? serviceFloatingObjects.default;
  }, [serviceKey]);

  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-y-0 left-1/2 top-0 h-full w-screen -translate-x-1/2",
        className
      )}
    >
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0, 16], fov: 40 }}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#000000", 0);
        }}
        dpr={[1, 1.75]}
        style={{ mixBlendMode: "screen" }}
      >
        <Suspense fallback={null}>
          <FloatingScene config={config} />
        </Suspense>
      </Canvas>
    </div>
  );
}
