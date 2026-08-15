"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, useStore, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import {
  AddEquation,
  CustomBlending,
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  OneFactor,
  Quaternion,
  Vector3,
  ZeroFactor,
} from "three";
import type {
  BufferGeometry,
  Group,
  Material,
  Mesh,
  WebGLRenderer,
} from "three";

import type { Discipline } from "@/constants/disciplines";
import { registerModelScene, registerScreenTexture } from "./disciplinePrefetch";
import {
  acquirePointerRotation,
  samplePointerRotation,
} from "./pointerRotation";
import LensGrabHint from "./LensGrabHint";
import { useLensDrag, supportsLensDrag } from "./useLensDrag";
import {
  buildLensBackdropGeometry,
  lensBackdropTransform,
  BACKDROP_FILL_DEPTH,
  BACKDROP_FILL_SIZE,
} from "./lensBackdrop";
import {
  createLensMaterial,
  createScreenMaterial,
  getAccentMaterial,
  getBodyMaterial,
  lensTransmissionScale,
  prepareBackdropTexture,
  prepareScreenTexture,
  refineLensNormals,
  type DisciplineTheme,
} from "./materials";
import {
  AMBIENT_FLOAT_AMPLITUDE,
  AMBIENT_FLOAT_SPEED,
  MAX_FRAME_DELTA,
  MODEL_BASE_YAW,
  POINTER_LERP,
  POINTER_PITCH_MAX,
  POINTER_YAW_MAX,
  TWO_PI,
} from "./disciplinesTiming";

const CYLINDER_UP = new Vector3(0, 1, 0);
/** The accent is a disc, not a pin: half as tall as it is wide. */
const ACCENT_HEIGHT_RATIO = 0.5;

type DisciplineModelProps = {
  discipline: Discipline;
  theme: DisciplineTheme;
  /** Ambient rotation and float. Off when the section is parked or the tab is hidden. */
  animated: boolean;
};

/**
 * One model: GLB body + screen primitive + the emissive accent, which is instanced in code
 * and exists in no `.glb`. Three draw calls, and the third one is the reason the cyan can
 * be re-tuned without going back to Blender. `seo-geo` takes a fourth, because its second
 * primitive is a lens rather than a display and transmission cannot share a pass.
 */
export default function DisciplineModel({
  discipline,
  theme,
  animated,
}: DisciplineModelProps) {
  const { nodes, scene } = useGLTF(discipline.modelPath);
  const groupRef = useRef<Group>(null);
  const gl = useThree((state) => state.gl);

  /**
   * Hand the prefetcher the objects it will one day have to free. Drei's cache is keyed by
   * URL and hands every consumer the same scene, so this is idempotent, and it is a plain
   * registration rather than an effect because the eviction can happen long after this
   * component has unmounted - which is precisely when it is allowed to.
   */
  registerModelScene(discipline.modelPath, scene);

  const bodyGeometry = (nodes[discipline.meshName] as Mesh | undefined)
    ?.geometry;
  const screenGeometry = (nodes[discipline.screenMeshName] as Mesh | undefined)
    ?.geometry;

  const bodyMaterial = getBodyMaterial(theme, discipline.material);
  const accentMaterial = getAccentMaterial(theme);

  /**
   * The accents share one geometry, one material and one draw call. Their orientation is a
   * single quaternion taken from `accentAxis` rather than a per-instance rotation - they
   * are lights set into one face, so they all point the same way by construction. That
   * holds for the ring on `seo-geo` too: a ring of lights round a lens all face along the
   * lens normal, which is exactly what a ring light is.
   */
  const accentMesh = useMemo(() => {
    if (discipline.accents.length === 0) return null;

    const geometry = new CylinderGeometry(1, 1, 1, 12);
    const mesh = new InstancedMesh(
      geometry,
      accentMaterial,
      discipline.accents.length
    );
    const axis = new Vector3(...discipline.accentAxis).normalize();
    const quaternion = new Quaternion().setFromUnitVectors(CYLINDER_UP, axis);
    const scale = new Vector3(
      discipline.accentScale,
      discipline.accentScale * ACCENT_HEIGHT_RATIO,
      discipline.accentScale
    );
    const matrix = new Matrix4();
    const position = new Vector3();

    discipline.accents.forEach((accent, index) => {
      matrix.compose(position.set(...accent), quaternion, scale);
      mesh.setMatrixAt(index, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    return mesh;
  }, [accentMaterial, discipline]);

  // The material is shared and outlives the model; the geometry is built here, so it is
  // disposed here. Body and screen geometry belong to drei's GLTF cache and are left alone
  // so a remount still has something to draw.
  useEffect(() => {
    if (!accentMesh) return;
    return () => {
      accentMesh.geometry.dispose();
      accentMesh.dispose();
    };
  }, [accentMesh]);

  /**
   * Pointer tracking is SHARED by every model on the strip, not owned per model - see
   * `pointerRotation.ts`. This effect only keeps the section's one cursor listener alive while
   * a model is mounted (ref-counted, so the two models drawn during a slide still add it
   * once), handing it the canvas the pitch is measured against. That sharing is what stops the
   * incoming model snapping back to the rest pose on the frame a step begins: it reads the
   * cursor rotation the outgoing model already had.
   *
   * No `invalidate()` here: the Canvas runs `frameloop="always"` while the section is on
   * screen and `"never"` while it is parked, so a pointer move has no demand-driven frame to
   * ask for, and the lerp catches up on the first frame after the section comes back.
   */
  useEffect(() => acquirePointerRotation(gl.domElement), [gl]);

  /**
   * Only the magnifier is carried. It is the one model whose whole point is what is BEHIND it,
   * so moving it reveals something; dragging a phone or a billboard across a blank field would
   * be motion without meaning. `supportsLensDrag` then takes touch out - there the vertical
   * gesture belongs to the page and the horizontal one already changes discipline.
   */
  const draggable =
    discipline.screenKind === "lens" &&
    Boolean(discipline.backdropImage) &&
    supportsLensDrag();
  const dragRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  // Both already multiplied by `displayScale`, because the drag group sits OUTSIDE that scale
  // and works in world units.
  const lensOffset = useMemo(
    () =>
      new Vector3(...(discipline.lensCentre ?? [0, 0, 0])).multiplyScalar(
        discipline.displayScale
      ),
    [discipline]
  );
  const lensRadius = (discipline.lensAperture ?? 0) * discipline.displayScale;
  const drag = useLensDrag(draggable, dragRef, bodyRef, lensOffset, lensRadius);

  const floatPhaseRef = useRef(0);

  /**
   * ONE WRITER PER VALUE, AND THIS IS THE ONE FOR ROTATION.
   *
   *   rotation.y = MODEL_BASE_YAW + pointer yaw   (straight ahead at the window centre,
   *                                                -12 deg at the left edge, +12 at the right)
   *   rotation.x = pointer pitch                  (symmetric about the canvas centre)
   *   position.y = ambient float
   *
   * The terms are summed HERE, in one assignment, and nowhere else. The swap timeline owns
   * `scale`, `opacity` and `emissiveIntensity` and deliberately touches none of these - two
   * schedulers over one value is jitter that does not debug, and the reel's tween moves the
   * STRIP's `position.y`, which is the parent of this group, not this group's own.
   *
   * There is no ambient turn in the sum any more, and that is the point: the model is still
   * until the cursor moves it. A model that also turned on its own clock would spend half of
   * every cycle facing away from the cursor it is meant to be answering, and would hide the
   * screen - which is the content of this section, not decoration on it.
   *
   * The float still needs a clock, so its phase is accumulated and wrapped into [0, 2pi):
   * wrapping a sine by a full period is the identity, and it keeps the number small however
   * long the tab has been open instead of letting it grow and lose its low bits.
   */
  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const step = Math.min(delta, MAX_FRAME_DELTA);
    if (animated) {
      floatPhaseRef.current =
        (floatPhaseRef.current + step * AMBIENT_FLOAT_SPEED) % TWO_PI;
    }

    // The shared pointer, advanced once per frame however many models are on the strip. The
    // clock time is the same for every `useFrame` this frame, so the guard inside means both
    // models mid-slide read one identical value.
    const pointer = samplePointerRotation(state.clock.elapsedTime, POINTER_LERP);
    group.rotation.y = MODEL_BASE_YAW + pointer.x * POINTER_YAW_MAX;
    group.rotation.x = pointer.y * POINTER_PITCH_MAX;
    group.position.y = animated
      ? Math.sin(floatPhaseRef.current) * AMBIENT_FLOAT_AMPLITUDE
      : 0;
  });

  if (!bodyGeometry || !screenGeometry) return null;

  return (
    <>
      {/*
        The backdrop is a SIBLING of the model group, not a child, and that is the whole
        mechanism. `groupRef` turns with the cursor; this does not. The lens therefore travels
        across the cards and the magnified circle sweeps with it - which is what a magnifier
        held over a page does. Parented inside, the cards would turn in lockstep with the glass
        and read as a decal on it, however far behind they sat.
      */}
      {discipline.backdropImage ? (
        <LensBackdrop discipline={discipline} />
      ) : null}
      {/*
        The carry group. It wraps ONLY the model, never the backdrop - the cards are the page
        the glass is held over, so they must not travel with it. Its position is written by
        `useLensDrag` and by nothing else, which is what keeps it clear of the float and the
        rotation on the group inside it.
      */}
      <group ref={dragRef}>
        {/*
          Outside the rotating group, inside the carried one: the hand should travel with the
          magnifier but must not tip with it, or it stops pointing at the grip the moment the
          cursor turns the model.
        */}
        {draggable ? (
          <Suspense fallback={<group />}>
            <LensGrabHint
              displayScale={discipline.displayScale}
              visible={animated && !drag.dragged}
            />
          </Suspense>
        ) : null}
        <group ref={groupRef} scale={discipline.displayScale}>
          <mesh
            ref={bodyRef}
            geometry={bodyGeometry}
            material={bodyMaterial}
            onPointerDown={draggable ? drag.onPointerDown : undefined}
            onPointerMove={draggable ? drag.onPointerMove : undefined}
            onPointerOut={draggable ? drag.onPointerOut : undefined}
            dispose={null}
          />
          {discipline.screenKind === "lens" ? (
            <LensPrimitive
              geometry={screenGeometry}
              discipline={discipline}
              theme={theme}
            />
          ) : (
            <DisplayPrimitive
              geometry={screenGeometry}
              image={discipline.screenImage}
              theme={theme}
            />
          )}
          {accentMesh ? <primitive object={accentMesh} /> : null}
        </group>
      </group>
    </>
  );
}

/**
 * The three brand cards standing behind the glass, on `seo-geo` alone.
 *
 * Split into its own component for the same reason `DisplayPrimitive` is: `useTexture`
 * suspends, five of the six models have no backdrop to load, and a hook cannot be called
 * conditionally - so the condition has to be a component boundary.
 *
 * NO `useFrame`, DELIBERATELY. Nothing here animates, reads the pointer or floats. The section
 * has one writer for the model's rotation and this adds no second one; the cards are furniture
 * and the lens is what moves over them.
 *
 * `transparent: false` is load-bearing and is the one line that would silently break the whole
 * feature. three.js buckets objects into opaque / transparent / transmissive and renders ONLY
 * the opaque list into the transmission buffer the lens samples (`WebGLRenderLists.push`). A
 * blended quad would be excluded from that buffer and then drawn afterwards, ON TOP of the
 * lens - visible, un-magnified, and looking for all the world like the glass was ignoring it.
 * `alphaTest` gives the rounded corners a cutout instead, which the atlas is authored for.
 *
 * `toneMapped: false` for the same reason the accent material carries it: AgX would desaturate
 * four brand palettes at once.
 */
function LensBackdrop({ discipline }: { discipline: Discipline }) {
  const texture = useTexture(discipline.backdropImage!);
  const gl = useThree((state) => state.gl);

  registerScreenTexture(discipline.backdropImage!, texture);

  const geometry = useMemo(() => buildLensBackdropGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  /**
   * THE SAME CARDS, TWICE, AND NEITHER COPY IS REDUNDANT.
   *
   * Once the glass became genuinely see-through in the gaps, the cards started appearing
   * doubled - and correctly so. A transparent gap shows whatever is physically behind the
   * glass, and what is behind the glass is the cards themselves, at their own un-magnified
   * size. Two versions of one card, offset by exactly the magnification.
   *
   * So each copy is given one job and taken out of the other's pass:
   *
   *   `refracted` is OPAQUE, which is the only bucket the transmission pass draws, and is
   *   switched off on the canvas. It exists solely to be sampled by the lens - it is what the
   *   magnified image is made of, and it is never seen directly.
   *
   *   `direct` is TRANSPARENT, which puts it after the transmissive list in `renderScene`,
   *   i.e. after the lens has already written depth across its whole disc. Everything behind
   *   the glass therefore fails the depth test and is dropped, while the parts of the cards
   *   standing proud of the rim draw normally. That is the side-by-side comparison the layout
   *   is built around, and it now costs no doubling.
   *
   * The depth ordering is doing the work a stencil mask would otherwise have to, which is why
   * there is no mask here and no `stencil: true` on either Canvas.
   */
  const materials = useMemo(() => {
    // NOT `prepareScreenTexture`: that sets `flipY = false` for glTF's top-left UV origin,
    // and these quads are built here with the DOM convention the loader already applies.
    prepareBackdropTexture(texture, gl.capabilities.getMaxAnisotropy());

    const refracted = new MeshBasicMaterial({
      map: texture,
      transparent: false,
      alphaTest: 0.5,
      toneMapped: false,
    });
    refracted.name = "DISC_LENS_BACKDROP_REFRACTED";

    const direct = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      toneMapped: false,
    });
    direct.name = "DISC_LENS_BACKDROP_DIRECT";

    return { refracted, direct };
  }, [gl, texture]);

  useEffect(
    () => () => {
      materials.refracted.dispose();
      materials.direct.dispose();
    },
    [materials]
  );

  const refractedOnly = useMemo(
    () => createFillVisibilitySwitch(materials.refracted),
    [materials]
  );

  const transform = useMemo(() => lensBackdropTransform(discipline), [discipline]);
  if (!transform) return null;

  return (
    <group
      position={transform.position}
      rotation={[0, transform.rotationY, 0]}
      scale={discipline.displayScale}
    >
      <LensBackdropFill />
      <mesh
        geometry={geometry}
        material={materials.refracted}
        onBeforeRender={refractedOnly}
        dispose={null}
      />
      <mesh geometry={geometry} material={materials.direct} dispose={null} />
    </group>
  );
}

/**
 * NOTHING, standing behind the cards - and that is the point. It exists to make the space
 * around the logos genuinely empty rather than filled with a colour of ours.
 *
 * The problem it solves: three.js renders the transmission buffer with its own clear, and when
 * the canvas is transparent it FORCES that clear to white at half alpha -
 * `if ( _currentClearAlpha < 1 ) _this.setClearColor( 0xffffff, 0.5 )` in `renderTransmissionPass`.
 * So anywhere the lens looks and finds no geometry it does not find the page behind the canvas,
 * it finds white. The gaps between the cards came out pale while the identical gaps a centimetre
 * away, outside the rim, showed the real background.
 *
 * Painting those gaps with the page's own colour was the obvious answer and it was the wrong
 * one: it only impersonates the background, so it goes stale against a palette change and it
 * flattens the animated dot field to a single value. This quad instead resets the ALPHA the
 * clear left behind, which hands the region back to the page rather than repainting it. The
 * background there is not matched, it is simply not covered.
 *
 * It must not be drawn to the screen, though - on the canvas an alpha-0 write would punch a
 * hole through whatever the model is standing in front of. Hence the `onBeforeRender` switch:
 * `renderer.getRenderTarget()` is the transmission target during that pass and null when drawing
 * to the canvas, so the quad writes in the first and neither colour nor depth in the second. It
 * is present in both passes and paints in only one.
 */
/**
 * Built at module scope, not inside the component, and that is not style - it is the only place
 * the write is allowed. The React Compiler refuses to let a component mutate a value it passed
 * to a hook, and this handler exists precisely to flip two flags on a memoised material every
 * frame. Same laundering as `prepareScreenTexture`: the mutation lives in a plain function the
 * compiler does not look inside.
 */
function createFillVisibilitySwitch(material: MeshBasicMaterial) {
  return (renderer: WebGLRenderer) => {
    const offscreen = renderer.getRenderTarget() !== null;
    material.colorWrite = offscreen;
    material.depthWrite = offscreen;
  };
}

function LensBackdropFill() {
  const material = useMemo(() => {
    /**
     * `opacity: 0` WITH `transparent: false`, and that pairing is the whole trick.
     *
     * `transparent: false` keeps the quad in the OPAQUE bucket, which is the only list the
     * transmission pass draws (`WebGLRenderLists.push`) - a blended quad would never reach the
     * buffer at all. But the fragment still writes `gl_FragColor.a = opacity`, and with
     * `NoBlending` that alpha lands in the target verbatim. So this quad stamps alpha 0 over
     * the forced clear.
     *
     * That is what the lens then reads. Its own alpha is
     * `1 - (1 - sampled.a) * transmittanceFactor`, and the glass is colourless so the factor is
     * 1 - meaning a sampled alpha of 0 makes the lens FULLY TRANSPARENT there. No colour of
     * ours is composited at all; the page's own background shows through the glass exactly as
     * it does beside it.
     *
     * The RGB is deliberately irrelevant - nothing is ever blended at alpha 0 - so there is no
     * theme colour to read and nothing here to go stale when the palette changes.
     */
    const created = new MeshBasicMaterial({
      color: 0x000000,
      toneMapped: false,
      /**
       * The alpha is forced by BLEND FACTORS, not by `opacity`. `opacity: 0` alone does not
       * survive to the buffer, and `transparent: true` would move the quad out of the opaque
       * list - the only list the transmission pass draws - so it would never be there at all.
       *
       * `CustomBlending` threads that needle: the bucketing in `WebGLRenderLists.push` keys on
       * `material.transparent`, which stays false, while `WebGLState.setMaterial` only skips
       * blending when the mode is `NormalBlending`. So the quad remains opaque as far as the
       * render lists are concerned and still gets its blend equation honoured.
       *
       * Colour is written straight through (`One`/`Zero`); alpha is multiplied to nothing from
       * both sides (`Zero`/`Zero`), stamping 0 over the forced white clear.
       */
      blending: CustomBlending,
      blendSrc: OneFactor,
      blendDst: ZeroFactor,
      blendEquation: AddEquation,
      blendSrcAlpha: ZeroFactor,
      blendDstAlpha: ZeroFactor,
      blendEquationAlpha: AddEquation,
    });
    created.name = "DISC_LENS_CLEAR";
    return created;
  }, []);

  useEffect(() => () => material.dispose(), [material]);

  const onBeforeRender = useMemo(
    () => createFillVisibilitySwitch(material),
    [material]
  );

  return (
    <mesh
      material={material}
      position={[0, 0, BACKDROP_FILL_DEPTH]}
      onBeforeRender={onBeforeRender}
      dispose={null}
    >
      <planeGeometry args={[BACKDROP_FILL_SIZE, BACKDROP_FILL_SIZE]} />
    </mesh>
  );
}

/**
 * The screen, on the five models that have one.
 *
 * Split out of `DisciplineModel` for one reason: `useTexture` suspends, and `seo-geo` has no
 * image to load. A hook cannot be called conditionally, so the condition has to be a
 * component boundary - which also means the magnifier never requests a texture it would not
 * sample, and its slot in the prefetch budget goes to a neighbour that will.
 */
function DisplayPrimitive({
  geometry,
  image,
  theme,
}: {
  geometry: BufferGeometry;
  image: string;
  theme: DisciplineTheme;
}) {
  const texture = useTexture(image);
  const gl = useThree((state) => state.gl);

  // Same debt as the GLB: drei's cache holds the only handle once this unmounts, and a
  // `Texture` keeps its upload until something disposes it. See `disciplinePrefetch.ts`.
  registerScreenTexture(image, texture);

  const material = useMemo(() => {
    prepareScreenTexture(texture, gl.capabilities.getMaxAnisotropy());
    return createScreenMaterial(theme, texture);
  }, [gl, texture, theme]);

  useEffect(() => () => material.dispose(), [material]);

  return <mesh geometry={geometry} material={material} dispose={null} />;
}

/**
 * The magnifier's lens, and the only transmission element on the section.
 *
 * Built once per theme and per device class, not per frame: `createLensMaterial` reads the
 * 768px media query itself and hands back opaque steel below it, so the phone silently drops
 * back to three draw calls without a branch here.
 */
function LensPrimitive({
  geometry,
  discipline,
  theme,
}: {
  geometry: BufferGeometry;
  discipline: Discipline;
  theme: DisciplineTheme;
}) {
  const material: Material = useMemo(() => createLensMaterial(theme), [theme]);

  /**
   * The glass gets its exact normals back before anything refracts through it - see
   * `refineLensNormals`. Done here rather than in the loader because it is a property of THIS
   * material's thickness that the compressed ones are not good enough, and it is idempotent and
   * self-guarding, so running it during render is safe and a remount after eviction re-applies
   * it to the freshly loaded copy.
   */
  const { lensCentre, accentAxis, lensAperture, lensCurvature } = discipline;
  if (lensCentre && lensAperture && lensCurvature) {
    refineLensNormals(
      geometry,
      lensCentre,
      accentAxis,
      lensAperture,
      lensCurvature
    );
  }
  // The store rather than `useThree(state => state.gl)`, because the effect below writes to
  // the renderer, and the React Compiler will not let a component mutate a value a hook
  // returned to it. Reading it out of the store inside the effect says the same thing about
  // ownership that the rule is protecting: the renderer belongs to the Canvas, this is a
  // deliberate reach into it, and it is put back on the way out.
  const store = useStore();
  const size = useThree((state) => state.size);

  useEffect(() => () => material.dispose(), [material]);

  /**
   * The transmission budget, actually spent.
   *
   * `lensTransmissionScale()` already answers in the unit three.js wants - a FRACTION of the
   * drawing buffer (`transmissionResolutionScale`, `WebGLRenderer.js`). It used to be a pixel
   * height converted here against the live buffer; that indirection went when the lens started
   * magnifying, because what matters now is not "how many pixels" but "what share of native
   * detail survives being enlarged", and the share is what the renderer takes.
   *
   * Still keyed on `size`, so a resize across the 768px line re-answers rather than keeping a
   * phone-sized budget on a window that has since been maximised.
   *
   * Set on the renderer rather than on the material because that is where three.js keeps it,
   * and restored on unmount because the renderer outlives this model - leaving a low scale
   * behind would quietly degrade any transmission a later section asks for.
   */
  useEffect(() => {
    const renderer = store.getState().gl;
    const previous = renderer.transmissionResolutionScale;
    renderer.transmissionResolutionScale = lensTransmissionScale();
    return () => {
      renderer.transmissionResolutionScale = previous;
    };
  }, [store, size]);

  return <mesh geometry={geometry} material={material} dispose={null} />;
}
