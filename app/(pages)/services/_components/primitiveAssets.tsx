import type { ReactElement } from "react";

const PRIMARY = "#58C4FF";
const PRIMARY_EMISSIVE = "#1FA4E8";
const PRIMARY_GLASS = "#D7F3FF";
const SHADOW_COLOR = "#193756";

export type PrimitiveAssetKey =
  | "default-orb"
  | "default-ring"
  | "default-pill"
  | "web-monitor"
  | "web-code"
  | "web-server"
  | "uiux-wireframe"
  | "uiux-stack"
  | "uiux-palette"
  | "mobile-phone"
  | "mobile-map"
  | "mobile-notification"
  | "seo-magnifier"
  | "seo-graph"
  | "seo-globe"
  | "branding-badge"
  | "branding-grid"
  | "branding-pack"
  | "social-chat"
  | "social-network"
  | "social-spark";

type PrimitiveAssetFactory = () => ReactElement;

const solidMaterial = (emissiveIntensity = 0.35) => (
  <meshStandardMaterial
    color={PRIMARY}
    emissive={PRIMARY_EMISSIVE}
    emissiveIntensity={emissiveIntensity}
    metalness={0.45}
    roughness={0.32}
  />
);

const glassMaterial = (opacity = 0.22) => (
  <meshStandardMaterial
    color={PRIMARY_GLASS}
    transparent
    opacity={opacity}
    emissive={PRIMARY_EMISSIVE}
    emissiveIntensity={0.1}
    roughness={0.12}
    metalness={0.05}
  />
);

const shadowMaterial = () => (
  <meshStandardMaterial color={SHADOW_COLOR} metalness={0.15} roughness={0.6} />
);

const DefaultOrb: PrimitiveAssetFactory = () => (
  <group>
    <mesh>
      <sphereGeometry args={[1.15, 32, 32]} />
      {solidMaterial()}
    </mesh>
    <mesh scale={1.45}>
      <sphereGeometry args={[0.85, 32, 32]} />
      {glassMaterial()}
    </mesh>
  </group>
);

const DefaultRing: PrimitiveAssetFactory = () => (
  <group rotation={[Math.PI / 4, Math.PI / 5, 0]}>
    <mesh>
      <torusGeometry args={[1.4, 0.2, 28, 72]} />
      {solidMaterial()}
    </mesh>
    <mesh rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[1.1, 0.08, 24, 72]} />
      {glassMaterial(0.16)}
    </mesh>
  </group>
);

const DefaultPill: PrimitiveAssetFactory = () => (
  <group rotation={[0.35, 0.15, -0.25]}>
    <mesh>
      <cylinderGeometry args={[0.55, 0.55, 2.8, 48]} />
      {solidMaterial()}
    </mesh>
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.35, 0.35, 3.1, 48]} />
      {glassMaterial(0.18)}
    </mesh>
    <mesh position={[0, 1.5, 0]}>
      <sphereGeometry args={[0.55, 32, 32]} />
      {solidMaterial()}
    </mesh>
    <mesh position={[0, -1.5, 0]}>
      <sphereGeometry args={[0.55, 32, 32]} />
      {solidMaterial()}
    </mesh>
  </group>
);

const WebMonitor: PrimitiveAssetFactory = () => (
  <group rotation={[0.2, 0.1, -0.15]}>
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[3, 2, 0.18]} />
      {shadowMaterial()}
    </mesh>
    <mesh position={[0, 0, 0.14]}>
      <planeGeometry args={[2.6, 1.6]} />
      {glassMaterial(0.14)}
    </mesh>
    <mesh position={[0, -1.25, -0.3]} rotation={[Math.PI / 10, 0, 0]}>
      <boxGeometry args={[2.2, 0.22, 0.6]} />
      {solidMaterial(0.25)}
    </mesh>
  </group>
);

const WebCode: PrimitiveAssetFactory = () => (
  <group rotation={[0.18, 0.42, -0.2]}>
    <mesh position={[-0.7, 0, 0.12]}>
      <boxGeometry args={[0.6, 2.1, 0.2]} />
      {solidMaterial()}
    </mesh>
    <mesh position={[0.1, 0, 0]}>
      <boxGeometry args={[0.6, 1.5, 0.18]} />
      {solidMaterial(0.25)}
    </mesh>
    <mesh position={[0.9, 0.2, -0.05]}>
      <boxGeometry args={[0.6, 1.1, 0.16]} />
      {solidMaterial(0.2)}
    </mesh>
    <mesh position={[0, 0, -0.2]}>
      <planeGeometry args={[2.4, 2.4]} />
      {glassMaterial(0.12)}
    </mesh>
  </group>
);

const WebServer: PrimitiveAssetFactory = () => (
  <group rotation={[0.28, 0.12, 0.18]}>
    <mesh>
      <boxGeometry args={[1.6, 2.4, 1.2]} />
      {shadowMaterial()}
    </mesh>
    {[0.65, 0, -0.65].map((y) => (
      <mesh key={y} position={[0, y, 0.66]}>
        <boxGeometry args={[1.2, 0.32, 0.22]} />
        {solidMaterial()}
      </mesh>
    ))}
  </group>
);

const UiuxWireframe: PrimitiveAssetFactory = () => (
  <group rotation={[0.2, 0.15, -0.12]}>
    <mesh>
      <planeGeometry args={[3.2, 2.2]} />
      {glassMaterial(0.14)}
    </mesh>
    {[0.6, 0, -0.6].map((y) => (
      <mesh key={y} position={[0, y, 0.16]}>
        <boxGeometry args={[3.2, 0.08, 0.12]} />
        {solidMaterial(0.22)}
      </mesh>
    ))}
    {[-0.9, 0, 0.9].map((x) => (
      <mesh key={x} position={[Number(x), 0, 0.16]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[2.2, 0.08, 0.12]} />
        {solidMaterial(0.22)}
      </mesh>
    ))}
  </group>
);

const UiuxStack: PrimitiveAssetFactory = () => (
  <group rotation={[0.25, 0.28, -0.18]}>
    {[0.4, 0, -0.4].map((z, index) => (
      <mesh key={z} position={[index * 0.15, index * -0.18, z]}>
        <boxGeometry args={[2.4 - index * 0.25, 1.6 - index * 0.2, 0.16]} />
        {solidMaterial(0.28 - index * 0.04)}
      </mesh>
    ))}
  </group>
);

const UiuxPalette: PrimitiveAssetFactory = () => (
  <group rotation={[0.2, -0.18, 0.1]}>
    <mesh>
      <torusGeometry args={[1.05, 0.16, 24, 64]} />
      {glassMaterial(0.16)}
    </mesh>
    {[0, Math.PI * 0.66, Math.PI * 1.32].map((angle) => (
      <mesh key={angle} rotation={[0, 0, angle]} position={[Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, 0.12]}>
        <cylinderGeometry args={[0.22, 0.22, 0.32, 32]} />
        {solidMaterial()}
      </mesh>
    ))}
  </group>
);

const MobilePhone: PrimitiveAssetFactory = () => (
  <group rotation={[0.18, 0.12, -0.2]}>
    <mesh>
      <boxGeometry args={[1.4, 2.8, 0.24]} />
      {solidMaterial()}
    </mesh>
    <mesh position={[0, 0, 0.16]}>
      <planeGeometry args={[1.2, 2.4]} />
      {glassMaterial(0.14)}
    </mesh>
    <mesh position={[0.45, -1, 0.22]}>
      <circleGeometry args={[0.14, 32]} />
      {solidMaterial(0.4)}
    </mesh>
  </group>
);

const MobileMap: PrimitiveAssetFactory = () => (
  <group rotation={[0.28, -0.2, 0.16]}>
    <mesh>
      <planeGeometry args={[2.4, 2.4]} />
      {glassMaterial(0.18)}
    </mesh>
    <mesh position={[0, 0, 0.18]}>
      <ringGeometry args={[0.4, 0.9, 48]} />
      {solidMaterial()}
    </mesh>
    <mesh position={[0.6, 0.4, 0.2]} rotation={[0, 0, Math.PI / 4]}>
      <boxGeometry args={[0.9, 0.18, 0.16]} />
      {solidMaterial(0.28)}
    </mesh>
  </group>
);

const MobileNotification: PrimitiveAssetFactory = () => (
  <group rotation={[0.24, 0.1, 0.18]}>
    <mesh>
      <boxGeometry args={[2.1, 1.2, 0.18]} />
      {solidMaterial()}
    </mesh>
    <mesh position={[0, 0.24, 0.16]}>
      <boxGeometry args={[1.2, 0.4, 0.14]} />
      {glassMaterial(0.18)}
    </mesh>
    <mesh position={[-0.7, -0.1, 0.2]}>
      <sphereGeometry args={[0.22, 24, 24]} />
      {solidMaterial(0.45)}
    </mesh>
  </group>
);

const SeoMagnifier: PrimitiveAssetFactory = () => (
  <group rotation={[Math.PI / 4, 0.12, -Math.PI / 12]}>
    <mesh>
      <torusGeometry args={[1, 0.16, 28, 72]} />
      {solidMaterial()}
    </mesh>
    <mesh>
      <circleGeometry args={[0.86, 48]} />
      {glassMaterial(0.2)}
    </mesh>
    <mesh position={[0.8, -0.9, 0]} rotation={[Math.PI / 4, 0, 0]}>
      <cylinderGeometry args={[0.18, 0.18, 1.8, 32]} />
      {solidMaterial()}
    </mesh>
  </group>
);

const SeoGraph: PrimitiveAssetFactory = () => (
  <group rotation={[0.24, 0.14, -0.12]}>
    <mesh>
      <planeGeometry args={[2.6, 1.6]} />
      {glassMaterial(0.12)}
    </mesh>
    {[0.8, 0, -0.8].map((x, index) => (
      <mesh key={x} position={[x, -0.5 + index * 0.4, 0.18]}>
        <boxGeometry args={[0.38, 1 + index * 0.35, 0.16]} />
        {solidMaterial(0.3 - index * 0.06)}
      </mesh>
    ))}
    <mesh position={[0, 0.36, 0.2]}>
      <boxGeometry args={[1.8, 0.14, 0.18]} />
      {solidMaterial(0.4)}
    </mesh>
  </group>
);

const SeoGlobe: PrimitiveAssetFactory = () => (
  <group>
    <mesh>
      <sphereGeometry args={[1.05, 32, 32]} />
      {glassMaterial(0.2)}
    </mesh>
    {[0, Math.PI / 4, Math.PI / 2].map((rot) => (
      <mesh key={rot} rotation={[rot, 0, 0]}>
        <torusGeometry args={[1.05, 0.06, 24, 64]} />
        {solidMaterial(0.32)}
      </mesh>
    ))}
    <mesh rotation={[0, Math.PI / 2, 0]}>
      <torusGeometry args={[1.05, 0.06, 24, 64]} />
      {solidMaterial(0.32)}
    </mesh>
  </group>
);

const BrandingBadge: PrimitiveAssetFactory = () => (
  <group rotation={[0.18, 0.12, -0.08]}>
    <mesh>
      <circleGeometry args={[1.2, 48]} />
      {solidMaterial()}
    </mesh>
    <mesh position={[0, 0, 0.18]}>
      <circleGeometry args={[0.8, 48]} />
      {glassMaterial(0.18)}
    </mesh>
    <mesh position={[0, 0, 0.28]}>
      <circleGeometry args={[0.4, 48]} />
      {solidMaterial(0.45)}
    </mesh>
  </group>
);

const BrandingGrid: PrimitiveAssetFactory = () => (
  <group rotation={[0.24, -0.18, 0.16]}>
    {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([x, y], index) => (
      <mesh key={index} position={[x * 0.7, y * 0.7, index * 0.06]}>
        <boxGeometry args={[0.9, 0.9, 0.18]} />
        {solidMaterial(0.28)}
      </mesh>
    ))}
    <mesh position={[0, 0, -0.4]}>
      <planeGeometry args={[2.2, 2.2]} />
      {glassMaterial(0.12)}
    </mesh>
  </group>
);

const BrandingPack: PrimitiveAssetFactory = () => (
  <group rotation={[0.18, 0.24, -0.1]}>
    <mesh>
      <boxGeometry args={[2.1, 1.2, 0.4]} />
      {solidMaterial()}
    </mesh>
    <mesh position={[0.1, 0.18, 0.28]}>
      <boxGeometry args={[1.4, 0.8, 0.22]} />
      {glassMaterial(0.2)}
    </mesh>
    <mesh position={[0.9, -0.28, 0.22]} rotation={[0, 0, Math.PI / 6]}>
      <boxGeometry args={[0.5, 1.2, 0.14]} />
      {solidMaterial(0.4)}
    </mesh>
  </group>
);

const SocialChat: PrimitiveAssetFactory = () => (
  <group rotation={[0.28, -0.2, 0.12]}>
    <mesh>
      <boxGeometry args={[2.4, 1.6, 0.22]} />
      {solidMaterial()}
    </mesh>
    <mesh position={[0.9, -0.9, 0.12]} rotation={[0, 0, Math.PI / 4]}>
      <boxGeometry args={[0.7, 0.4, 0.14]} />
      {solidMaterial(0.38)}
    </mesh>
    <mesh position={[0, 0, 0.18]}>
      <planeGeometry args={[1.8, 1]} />
      {glassMaterial(0.16)}
    </mesh>
  </group>
);

const SocialNetwork: PrimitiveAssetFactory = () => (
  <group>
    {[[-1, 0.6, 0], [1.1, 0.4, 0], [0.1, -0.9, 0]].map(([x, y, z], index) => (
      <mesh key={index} position={[x, y, z]}>
        <sphereGeometry args={[0.42, 24, 24]} />
        {solidMaterial()}
      </mesh>
    ))}
    {[[-1, 0.6, 1.1, 0.4], [-1, 0.6, 0.1, -0.9], [1.1, 0.4, 0.1, -0.9]].map(([x1, y1, x2, y2], index) => {
      const dx = Number(x2) - Number(x1);
      const dy = Number(y2) - Number(y1);
      const length = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      return (
        <mesh key={index} position={[(Number(x1) + Number(x2)) / 2, (Number(y1) + Number(y2)) / 2, 0]} rotation={[0, 0, angle]}>
          <boxGeometry args={[length, 0.12, 0.12]} />
          {glassMaterial(0.2)}
        </mesh>
      );
    })}
  </group>
);

const SocialSpark: PrimitiveAssetFactory = () => (
  <group rotation={[0.4, 0.2, 0]}>
    <mesh>
      <octahedronGeometry args={[1, 0]} />
      {solidMaterial()}
    </mesh>
    <mesh scale={[1.2, 0.2, 1.2]}>
      <boxGeometry args={[1, 0.2, 1]} />
      {glassMaterial(0.2)}
    </mesh>
    <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]} scale={0.6}>
      <octahedronGeometry args={[1, 0]} />
      {solidMaterial(0.4)}
    </mesh>
  </group>
);

export const primitiveAssetFactories: Record<PrimitiveAssetKey, PrimitiveAssetFactory> = {
  "default-orb": DefaultOrb,
  "default-ring": DefaultRing,
  "default-pill": DefaultPill,
  "web-monitor": WebMonitor,
  "web-code": WebCode,
  "web-server": WebServer,
  "uiux-wireframe": UiuxWireframe,
  "uiux-stack": UiuxStack,
  "uiux-palette": UiuxPalette,
  "mobile-phone": MobilePhone,
  "mobile-map": MobileMap,
  "mobile-notification": MobileNotification,
  "seo-magnifier": SeoMagnifier,
  "seo-graph": SeoGraph,
  "seo-globe": SeoGlobe,
  "branding-badge": BrandingBadge,
  "branding-grid": BrandingGrid,
  "branding-pack": BrandingPack,
  "social-chat": SocialChat,
  "social-network": SocialNetwork,
  "social-spark": SocialSpark,
};
