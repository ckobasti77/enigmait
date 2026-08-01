"""FAZA A: sagradi kandidate, postavi izo kameru, pripremi thumbnail renderе.

Idempotentno: brise svoje CAND_* kolekcije/objekte/mesheve pa ih pravi iznova.
Ne dira Camera i Light iz zatecene scene.
"""

import bpy
import os
import math

ROOT = r"C:\Users\admin\Desktop\Web Dev Projects\enigma-digital\blender"
PREFIX = "CAND_"
RIG_CAM = "PreviewCam"
MAT_NAME = "PreviewGradient"


# ---------------------------------------------------------------- boje

def srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hexcol(h, a=1.0):
    h = h.lstrip("#")
    return (srgb_to_linear(int(h[0:2], 16)),
            srgb_to_linear(int(h[2:4], 16)),
            srgb_to_linear(int(h[4:6], 16)), a)


# priblizno sa loga; tacne hex vrednosti dolaze u Fazi C, u GLB ne ulaze
RAMP = [(0.00, "#1EC8F0"), (0.50, "#3B5BF5"), (1.00, "#9B30F0")]


# ---------------------------------------------------------------- ciscenje

def purge():
    removed = {"objects": 0, "meshes": 0, "collections": 0}
    for obj in [o for o in bpy.data.objects if o.name.startswith(PREFIX)]:
        bpy.data.objects.remove(obj, do_unlink=True)
        removed["objects"] += 1
    for me in [m for m in bpy.data.meshes if m.name.startswith(PREFIX)]:
        bpy.data.meshes.remove(me)
        removed["meshes"] += 1
    for col in [c for c in bpy.data.collections if c.name.startswith(PREFIX)]:
        bpy.data.collections.remove(col)
        removed["collections"] += 1
    return removed


# ---------------------------------------------------------------- mesh

def mesh_from_sweep(name, data):
    me = bpy.data.meshes.new(name)
    me.from_pydata(data["verts"], [], data["faces"])
    me.update()

    # glatko po duzini; ostrina se kontrolise preko use_edge_sharp
    try:
        for p in me.polygons:
            p.use_smooth = True
    except AttributeError:
        attr = me.attributes.get("sharp_face") or \
            me.attributes.new("sharp_face", 'BOOLEAN', 'FACE')
        for d in attr.data:
            d.value = False

    # UV sloj nosi t u .x  ->  u three.js je to geometry.attributes.uv
    uv = me.uv_layers.new(name="UVMap")
    t = data["t"]
    for li, loop in enumerate(me.loops):
        uv.data[li].uv = (t[loop.vertex_index], 0.0)

    # ostre ivice: uzduzne + prstenovi u cospovima
    want = {tuple(sorted(e)) for e in data["sharp"]}
    n_sharp = 0
    for e in me.edges:
        if tuple(sorted(e.vertices)) in want:
            e.use_edge_sharp = True
            n_sharp += 1
    me.update()
    return me, n_sharp


# ---------------------------------------------------------------- materijal

def ensure_material():
    mat = bpy.data.materials.get(MAT_NAME)
    if mat is None:
        mat = bpy.data.materials.new(MAT_NAME)
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
        e = el.new(pos)
        e.color = hexcol(h)

    nt.links.new(uvn.outputs["UV"], sep.inputs["Vector"])
    nt.links.new(sep.outputs["X"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Emission Color"])
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    bsdf.inputs["Metallic"].default_value = 0.35
    bsdf.inputs["Roughness"].default_value = 0.22
    bsdf.inputs["Emission Strength"].default_value = 0.55
    return mat


# ---------------------------------------------------------------- kamera

def ensure_camera(ortho_scale=3.9, dist=10.0):
    cam = bpy.data.objects.get(RIG_CAM)
    if cam is None:
        cd = bpy.data.cameras.new(RIG_CAM)
        cam = bpy.data.objects.new(RIG_CAM, cd)
        bpy.context.scene.collection.objects.link(cam)
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = ortho_scale
    # standardni izometrijski ugao, gleda u prednje-levi cosak kao na logu
    cam.location = (dist, -dist, dist)
    cam.rotation_euler = (math.radians(54.7356), 0.0, math.radians(45.0))
    return cam


def ensure_world():
    scn = bpy.context.scene
    w = scn.world or bpy.data.worlds.new("World")
    scn.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.011, 0.013, 0.02, 1.0)
        bg.inputs["Strength"].default_value = 1.0


# ---------------------------------------------------------------- build

def build_all(names=("H1a", "H1b", "H2a", "H2b")):
    import lib.paths as P
    import lib.sweep as S
    import lib.pathcheck as C

    purge()
    mat = ensure_material()
    ensure_camera()
    ensure_world()

    report = {}
    for name in names:
        spec = P.CANDIDATES[name]
        path = P.get(name)
        chk = C.check_all(path, name=name,
                          expected_segments=spec["segments"],
                          width=P.BEAM_WIDTH)
        data = S.sweep(path, width=P.BEAM_WIDTH)
        tver = S.verify_t(data)

        me, n_sharp = mesh_from_sweep(PREFIX + name, data)
        obj = bpy.data.objects.new(PREFIX + name, me)
        obj.data.materials.append(mat)

        col = bpy.data.collections.new(PREFIX + name)
        bpy.context.scene.collection.children.link(col)
        col.objects.link(obj)

        me.calc_loop_triangles()
        report[name] = {
            "segments": chk["segments"],
            "closed": chk["closed"],
            "odd_deg": chk["odd_degree_vertices"],
            "euler_circuit": chk["euler_circuit"],
            "dup_segments": chk["duplicate_segments"],
            "interpenetrations": chk["interpenetrations"],
            "min_gap": chk["min_parallel_gap"],
            "lengths": chk["length_histogram"],
            "proj_gap": chk["checks"]["6_projections_have_gap"],
            "checks_all_pass": chk["all_pass"],
            "verts": len(me.vertices),
            "tris": len(me.loop_triangles),
            "sharp_edges": n_sharp,
            "twist_defect_deg": data["twist_defect_deg"],
            "t_all_pass": tver["all_pass"],
            "t_seam_dist": tver["seam_max_distance"],
        }
    return report


def show_only(name):
    """Ostavi vidljivim samo jednog kandidata (za render)."""
    for col in bpy.data.collections:
        if col.name.startswith(PREFIX):
            col.hide_render = (col.name != PREFIX + name)
            col.hide_viewport = (col.name != PREFIX + name)
    bpy.context.scene.camera = bpy.data.objects[RIG_CAM]
    return name
