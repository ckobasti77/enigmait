"""FAZA B: sagradi hero-kocku iz zakljucane putanje i exportuj GLB.

Idempotentno: brise svoje HERO_* objekte/mesheve/kolekcije pa ih pravi iznova.
Ne dira zatecenu Camera / Light / Sketchfab referencu.

Mesh gradi `lib.sweep` (mitered sweep pravougaonog profila). `t` ide u UV1.x,
sto je u glTF-u TEXCOORD_0, a u three.js `geometry.attributes.uv.x`.
"""

import bpy
import os
import math

import lib.path as P
import lib.sweep as S
import lib.pathcheck as C

PREFIX = "HERO_"
CAM = "HeroCam"
MAT = "HeroPreviewGradient"

REPO = r"C:\Users\admin\Desktop\Web Dev Projects\enigma-digital"
GLB_OUT = os.path.join(REPO, "public", "assets", "models", "hero-cube.glb")

#: izmereno sa public/logos/logo-emblem.png (najzasiceniji pikseli po hue-bandu)
RAMP = [
    (0.00, "#32CCFB"),
    (0.25, "#3E9EF1"),
    (0.50, "#8781F4"),
    (0.75, "#B756F8"),
    (1.00, "#D369FA"),
]


# ---------------------------------------------------------------- boje

def _srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hexcol(h, a=1.0):
    h = h.lstrip("#")
    return (_srgb_to_linear(int(h[0:2], 16)),
            _srgb_to_linear(int(h[2:4], 16)),
            _srgb_to_linear(int(h[4:6], 16)), a)


# ---------------------------------------------------------------- ciscenje

def purge():
    removed = {"objects": 0, "meshes": 0, "collections": 0}
    for o in [o for o in bpy.data.objects if o.name.startswith(PREFIX)]:
        bpy.data.objects.remove(o, do_unlink=True)
        removed["objects"] += 1
    for m in [m for m in bpy.data.meshes if m.name.startswith(PREFIX)]:
        bpy.data.meshes.remove(m)
        removed["meshes"] += 1
    for c in [c for c in bpy.data.collections if c.name.startswith(PREFIX)]:
        bpy.data.collections.remove(c)
        removed["collections"] += 1
    return removed


# ---------------------------------------------------------------- mesh

def mesh_from_sweep(name, data):
    me = bpy.data.meshes.new(name)
    me.from_pydata(data["verts"], [], data["faces"])
    me.update()

    for p in me.polygons:
        p.use_smooth = True

    uv = me.uv_layers.new(name="UVMap")
    t = data["t"]
    for li, loop in enumerate(me.loops):
        uv.data[li].uv = (t[loop.vertex_index], 0.0)

    want = {tuple(sorted(e)) for e in data["sharp"]}
    n_sharp = 0
    for e in me.edges:
        if tuple(sorted(e.vertices)) in want:
            e.use_edge_sharp = True
            n_sharp += 1
    me.update()
    return me, n_sharp


def build(inset=0.72, width=P.WIDTH_LOGO, square_holes=True,
          bevel_ratio=0.18, name="main", link=True):
    """Napravi jedan HERO_ objekat. Vraca (objekat, izvestaj).

    Z nivoi se izvode iz `lib.path.square_hole_z` tako da su sve sest rupa
    kvadrati i da gornji/donji ram naleze tacno na bocne. NE skalira se Z
    naknadno - to bi razvuklo rupe i pokvarilo kvadratnost.
    """
    path = P.build(inset, width=width, square_holes=square_holes)
    holes = P.hole_sizes(inset, width, square_holes=square_holes)
    chk = C.check_all(path, name=name, expected_segments=18, width=width)
    data = S.sweep(path, width=width, bevel_ratio=bevel_ratio)
    tver = S.verify_t(data)

    obj_name = PREFIX + name
    me, n_sharp = mesh_from_sweep(obj_name, data)
    obj = bpy.data.objects.new(obj_name, me)
    if link:
        col = bpy.data.collections.new(obj_name)
        bpy.context.scene.collection.children.link(col)
        col.objects.link(obj)
    me.calc_loop_triangles()

    report = {
        "inset": inset, "width": width, "holes": holes,
        "bbox": [round(max(p[i] for p in path) - min(p[i] for p in path), 3)
                 for i in range(3)],
        "segments": chk["segments"], "closed": chk["closed"],
        "euler_circuit": chk["euler_circuit"],
        "odd_deg": chk["odd_degree_vertices"],
        "lengths": chk["length_histogram"],
        "interpenetrations": chk["interpenetrations"],
        "dup_segments": chk["duplicate_segments"],
        "min_parallel_gap": chk["min_parallel_gap"],
        "clear_air_gap": round(P.gap(inset, width), 4),
        "proj_gap_all_axes": chk["checks"]["6_projections_have_gap"],
        "checks_all_pass": chk["all_pass"],
        "verts": len(me.vertices),
        "tris": len(me.loop_triangles),
        "sharp_edges": n_sharp,
        "twist_defect_deg": data["twist_defect_deg"],
        "t_all_pass": tver["all_pass"],
        "t_seam_dist": tver["seam_max_distance"],
        "t_min": tver["t_min"], "t_max": tver["t_max"],
        "t_monotonic": tver["monotonic"],
    }
    return obj, report


# ---------------------------------------------------------------- preview

def ensure_material():
    mat = bpy.data.materials.get(MAT) or bpy.data.materials.new(MAT)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()

    out = nt.nodes.new("ShaderNodeOutputMaterial")
    out.location = (600, 0)
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (300, 0)
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.location = (0, 0)
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    sep.location = (-200, 0)
    uvn = nt.nodes.new("ShaderNodeUVMap")
    uvn.location = (-400, 0)
    uvn.uv_map = "UVMap"

    el = ramp.color_ramp.elements
    while len(el) > 1:
        el.remove(el[-1])
    el[0].position, el[0].color = RAMP[0][0], hexcol(RAMP[0][1])
    for pos, h in RAMP[1:]:
        el.new(pos).color = hexcol(h)

    nt.links.new(uvn.outputs["UV"], sep.inputs["Vector"])
    nt.links.new(sep.outputs["X"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Metallic"].default_value = 0.3
    bsdf.inputs["Roughness"].default_value = 0.25
    bsdf.inputs["Emission Strength"].default_value = 0.45
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def ensure_camera(ortho_scale=3.0, dist=10.0):
    cam = bpy.data.objects.get(CAM)
    if cam is None:
        cam = bpy.data.objects.new(CAM, bpy.data.cameras.new(CAM))
        bpy.context.scene.collection.objects.link(cam)
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = ortho_scale
    cam.location = (dist, -dist, dist)
    cam.rotation_euler = (math.radians(54.7356), 0.0, math.radians(45.0))
    bpy.context.scene.camera = cam
    return cam


def ensure_world(color=(0.012, 0.014, 0.022, 1.0)):
    scn = bpy.context.scene
    w = scn.world or bpy.data.worlds.new("World")
    scn.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = color
        bg.inputs["Strength"].default_value = 1.0


def hide_non_hero(hide=True):
    """Skloni referencu i stare kandidate iz rendera."""
    n = 0
    for o in bpy.data.objects:
        if o.type != 'MESH':
            continue
        if o.name.startswith(PREFIX):
            o.hide_render = False
            o.hide_viewport = False
        else:
            o.hide_render = hide
            o.hide_viewport = hide
            n += 1
    return n


def show_only(name):
    for o in bpy.data.objects:
        if o.name.startswith(PREFIX):
            on = (o.name == PREFIX + name)
            o.hide_render = not on
            o.hide_viewport = not on
    return name


# ---------------------------------------------------------------- export

def export_glb(name, filepath=GLB_OUT, draco=True):
    """Exportuj SAMO taj mesh u GLB. Bez materijala, kamera, svetala, animacije.

    Materijal se pravi kasnije u React Three Fiber-u; `t` putuje kao TEXCOORD_0.x.
    """
    obj = bpy.data.objects[PREFIX + name]

    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    prev_active = bpy.context.view_layer.objects.active
    prev_sel = [o for o in bpy.data.objects if o.select_get()]
    hidden = {}
    for o in bpy.data.objects:
        hidden[o.name] = o.hide_viewport
        o.hide_viewport = False           # skriven objekat se ne moze selektovati
    for o in bpy.data.objects:
        o.select_set(False)
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    try:
        bpy.ops.export_scene.gltf(
            filepath=filepath,
            export_format='GLB',
            use_selection=True,
            export_materials='NONE',
            export_cameras=False,
            export_lights=False,
            export_animations=False,
            export_skins=False,
            export_morph=False,
            export_texcoords=True,          # OVO nosi t
            export_normals=True,
            export_tangents=False,
            export_extras=False,
            export_yup=True,
            export_apply=True,
            export_draco_mesh_compression_enable=draco,
            export_draco_mesh_compression_level=6,
            export_draco_position_quantization=14,
            export_draco_normal_quantization=10,
            export_draco_texcoord_quantization=14,
        )
    finally:
        for o in bpy.data.objects:
            o.select_set(False)
            if o.name in hidden:
                o.hide_viewport = hidden[o.name]
        for o in prev_sel:
            o.select_set(True)
        bpy.context.view_layer.objects.active = prev_active

    size = os.path.getsize(filepath)
    return {"filepath": filepath, "bytes": size, "kb": round(size / 1024.0, 2),
            "draco": draco}
