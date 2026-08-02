"""Sest WebP still-ova - fallback za klijent bez WebGL-a (SECTION_SPEC, Faza F).

    exec(open(r"<repo>\\blender\\scripts\\bootstrap.py").read())
    import ops.render_stills as S
    S.render_all(r"<repo>\\...\\disciplines.json")

ZASTO SE UVOZI .glb A NE RENDERUJE SCENA
----------------------------------------
Still mora da pokazuje ono sto WebGL kolona pokazuje, a to nije scena u Blenderu
nego **izvezeni .glb**: normalizovan bbox, primenjena 3/4 poza, `COLOR_0` sa
zapecenim AO. Scena je izvor tih fajlova, ali izmedju nje i sajta stoji ceo
export ugovor iz Faze B. Uvozom se ta razlika zatvara po konstrukciji - render i
browser gledaju u isti bajt.

Zato ova skripta i **ne trazi da svih sest bude otvoreno u sceni**. Uvozi, renderuje,
brise za sobom, i vraca zateceno stanje.

MATERIJALI SU PREPIS `materials.ts`, NE INTERPRETACIJA
------------------------------------------------------
Svaka vrednost dole ima par u `components/sections/disciplines/materials.ts` i
komentar koji kaze koji. Ako se tamo promeni boja anodizovanog metala, ovde se
menja jedan broj - a ako se ne promeni, still i canvas se raziđu, sto je tacno
ona vrsta greske koju niko ne primeti dok neko ne ugasi WebGL.

Renderuje se DARK koza, jer je dark default tema sajta (`ThemeProvider`). Film je
providan, pa still nosi alfu i legne na pozadinu sekcije u obe teme - nikad
sopstvenu pozadinu, nikad crn pravougaonik.
"""

import bpy
import json
import os

from mathutils import Vector

import ops.qa_rig as Q


# ------------------------------------------------------------------ materials.ts, dark koza

#: BODY_SPECS.dark - `materials.ts`
BODY = {
    "anodized": {"color": "#59616e", "metallic": 0.82, "roughness": 0.34},
    "steel": {"color": "#8d97a4", "metallic": 0.90, "roughness": 0.18},
}

#: EMISSIVE_SPECS.dark.
#:
#: `toneMapped: false` u three.js nema Blender ekvivalent, i to je ovde JEDINI
#: problem - AgX desaturise svetle vrednosti na putu ka beloj, pa se cyan brani
#: SNIZAVANJEM emisije, ne dizanjem. Prvi pokusaj na 6.0 dao je bele tacke:
#: dovoljno jako da AgX pojede boju. 1.8 je vrednost na kojoj akcent i dalje
#: cita kao svetlo a zadrzi hue - jedina boja na sekciji koja je brend vrednost.
ACCENT = {"color": "#58c4ff", "strength": 1.8, "base": "#0a0e14"}

#: SCREEN_SPECS.dark + SCREEN_ROUGHNESS / SCREEN_CLEARCOAT / _ROUGHNESS.
#: "Coat Weight" je Blender 5.x ime za clearcoat (blender/CLAUDE.md) - bez njega
#: slika izgleda odstampana na kucistu, sto je izricito zabranjeno u Fazi E.
SCREEN = {
    "roughness": 0.15,
    "coat_weight": 1.0,
    "coat_roughness": 0.05,
    "emission_strength": 0.62,
}

#: LENS_SPECS.dark - jedini transmission element na sekciji.
LENS = {"color": "#dce6f0", "ior": 1.5, "roughness": 0.04}

#: `ACCENT_HEIGHT_RATIO` iz `DisciplineModel.tsx`: akcent je disk, ne cioda.
ACCENT_HEIGHT_RATIO = 0.5

STILL_MAT_PREFIX = "STILL_"


def _hex(h):
    return Q.hexcol(h)


def gltf_to_blender(v):
    """glTF je Y-up, Blender Z-up: (x, y, z) -> (x, -z, y).

    Isti prevod koji `import_scene.gltf` radi nad geometrijom. Pozicije akcenata
    u ugovoru podataka su u glTF prostoru modela, pa moraju kroz njega rucno.
    """
    return (v[0], -v[2], v[1])


# ------------------------------------------------------------------ materijali

def _new_material(name):
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    out.location = (600, 0)
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (250, 0)
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat, nt, bsdf


def body_material(kind):
    """Metal + `COLOR_0`.

    Vertex boja se MNOZI u Base Color, ne zamenjuje je - to je `vertexColors: true`
    na `MeshStandardMaterial`, koje three.js takodje mnozi. I to je ceo razlog
    zbog koga `metalness` nije 1.0: na punom metalu nema difuzne komponente koju
    bi AO mnozio i ceo rad iz Faze A bi nestao.
    """
    spec = BODY[kind]
    mat, nt, bsdf = _new_material(STILL_MAT_PREFIX + kind)

    attr = nt.nodes.new("ShaderNodeAttribute")
    attr.location = (-350, 100)
    attr.attribute_type = 'GEOMETRY'
    attr.attribute_name = "Color"

    tint = nt.nodes.new("ShaderNodeRGB")
    tint.location = (-350, -120)
    tint.outputs[0].default_value = _hex(spec["color"])

    mix = nt.nodes.new("ShaderNodeMix")
    mix.location = (-50, 0)
    mix.data_type = 'RGBA'
    mix.blend_type = 'MULTIPLY'
    mix.inputs["Factor"].default_value = 1.0

    nt.links.new(tint.outputs[0], mix.inputs[6])
    nt.links.new(attr.outputs["Color"], mix.inputs[7])
    nt.links.new(mix.outputs[2], bsdf.inputs["Base Color"])

    bsdf.inputs["Metallic"].default_value = spec["metallic"]
    bsdf.inputs["Roughness"].default_value = spec["roughness"]
    return mat


def screen_material(key, image_path):
    """Slika iza stakla: map + emissiveMap na niskom intenzitetu + coat sloj."""
    mat, nt, bsdf = _new_material(STILL_MAT_PREFIX + "screen_" + key)

    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.location = (-350, 0)
    img = bpy.data.images.load(image_path, check_existing=True)
    img.colorspace_settings.name = 'sRGB'
    tex.image = img

    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    # Displej se sam svetli - bez ovoga je to nalepnica koja ceka da je neko osvetli.
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = SCREEN["emission_strength"]
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = SCREEN["roughness"]
    bsdf.inputs["Coat Weight"].default_value = SCREEN["coat_weight"]
    bsdf.inputs["Coat Roughness"].default_value = SCREEN["coat_roughness"]
    return mat


def lens_material():
    mat, nt, bsdf = _new_material(STILL_MAT_PREFIX + "lens")
    bsdf.inputs["Base Color"].default_value = _hex(LENS["color"])
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = LENS["roughness"]
    bsdf.inputs["Transmission Weight"].default_value = 1.0
    bsdf.inputs["IOR"].default_value = LENS["ior"]
    return mat


def accent_material():
    mat, nt, bsdf = _new_material(STILL_MAT_PREFIX + "accent")
    bsdf.inputs["Base Color"].default_value = _hex(ACCENT["base"])
    bsdf.inputs["Emission Color"].default_value = _hex(ACCENT["color"])
    bsdf.inputs["Emission Strength"].default_value = ACCENT["strength"]
    bsdf.inputs["Metallic"].default_value = 0.1
    bsdf.inputs["Roughness"].default_value = 0.25
    return mat


# ------------------------------------------------------------------ akcenti

def build_accents(name, positions, axis, accent_scale):
    """Jedan mesh sa svim instancama akcenta, kao `InstancedMesh` u kodu.

    Jedna orijentacija za sve, iz `accentAxis` - to su svetla usadjena u JEDNU
    povrsinu, pa gledaju na istu stranu po konstrukciji. Isti kvaternion koji
    `DisciplineModel.tsx` racuna preko `setFromUnitVectors(CYLINDER_UP, axis)`.

    Velicina se PECE U TEMENA, ne postavlja kao `obj.scale`: pozicije instanci su
    u prostoru modela i skala akcenta ne sme da ih dodirne. U kodu to razdvaja
    `matrix.compose(position, quaternion, scale)`; ovde se dobija istim redom -
    cilindar se napravi u konacnoj velicini, rotira, pa prevede.

    Disk, ne cioda: precnik `accentScale`, visina pola toga (ACCENT_HEIGHT_RATIO),
    tacno kao `CylinderGeometry(1, 1, 1, 12)` skaliran sa (s, s/2, s).
    """
    if not positions:
        return None

    import bmesh

    up = Vector((0.0, 1.0, 0.0))                    # CYLINDER_UP, glTF prostor
    target = Vector(axis).normalized()
    rot = up.rotation_difference(target)            # == setFromUnitVectors

    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    for p in positions:
        tmp = bmesh.new()
        bmesh.ops.create_cone(
            tmp, cap_ends=True, cap_tris=False, segments=12,
            radius1=accent_scale, radius2=accent_scale,
            depth=accent_scale * ACCENT_HEIGHT_RATIO,
        )
        # Cilindar iz create_cone stoji po Z; akcent u kodu stoji po Y (CYLINDER_UP),
        # pa se prvo uspravi u glTF osnovu, pa rotira, pa prevede u Blender.
        for v in tmp.verts:
            local = Vector((v.co.x, v.co.z, -v.co.y))   # Z-up cilindar -> Y-up
            local = rot @ local
            v.co = Vector(gltf_to_blender(
                (local.x + p[0], local.y + p[1], local.z + p[2])))

        tmp_mesh = bpy.data.meshes.new(name + "_tmp")
        tmp.to_mesh(tmp_mesh)
        tmp.free()
        bm.from_mesh(tmp_mesh)
        bpy.data.meshes.remove(tmp_mesh)

    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


# ------------------------------------------------------------------ jedan model

def _import_glb(path):
    """Uvezi .glb i vrati SAMO objekte koje je taj uvoz napravio."""
    before = set(bpy.data.objects.keys())
    bpy.ops.import_scene.gltf(filepath=path)
    return [bpy.data.objects[n] for n in bpy.data.objects.keys() if n not in before]


def render_one(key, spec, repo_root, out_dir):
    """Uvezi jedan .glb, obuci ga, renderuj still, pocisti."""
    # `blender/exports/<key>.glb`, NE onaj iz `public/`.
    #
    # Isti export, jedan korak ranije: `public/` nosi meshopt varijantu, a Blenderov
    # glTF uvoznik odbija `EXT_meshopt_compression`. Sirov fajl je izlaz iste
    # `export_discipline.py` skripte - ista geometrija, isti normalizovan bbox, ista
    # poza - pa still i dalje gleda u ono sto browser dobije, samo pre kompresije.
    glb = os.path.join(Q.BLENDER_ROOT, "exports", key + ".glb")
    if not os.path.exists(glb):
        glb = os.path.join(repo_root, "public", "assets", "models", "disciplines",
                           key + ".glb")
    if not os.path.exists(glb):
        return {"key": key, "error": "missing glb: " + glb}

    created = _import_glb(glb)
    meshes = [o for o in created if o.type == 'MESH']
    # Ime u fajlu je `<key>` / `<key>_screen`, ali uvoz u scenu koja vec ima taj
    # naziv dobija sufiks `.001`. Ekran se zato prepoznaje po tome sto IMA UV-ove -
    # sto je i export ugovor iz Faze B ("telo nema uv, ekran ima").
    body = [o for o in meshes if not o.data.uv_layers]
    screen = [o for o in meshes if o.data.uv_layers]
    # seo-geo: soc(iv)o nema UV-ove, pa ga ime razdvaja od tela.
    if spec.get("screenKind") == "lens":
        lens = [o for o in body if "_screen" in o.name]
        body = [o for o in body if "_screen" not in o.name]
        screen = lens

    body_mat = body_material(spec["material"])
    for o in body:
        o.data.materials.clear()
        o.data.materials.append(body_mat)

    if spec.get("screenKind") == "lens":
        screen_mat = lens_material()
    else:
        image = os.path.join(repo_root, "public",
                             spec["screenImage"].lstrip("/").replace("/", os.sep))
        screen_mat = screen_material(key, image)
    for o in screen:
        o.data.materials.clear()
        o.data.materials.append(screen_mat)

    accents = build_accents(
        "STILL_ACCENT_" + key,
        spec["accents"], spec["accentAxis"], spec["accentScale"],
    )
    if accents:
        accents.data.materials.append(accent_material())
        created.append(accents)

    # `displayScale` iz ugovora podataka, na sve delove zajedno - u kodu je to
    # `scale` na grupi koja nosi telo, ekran i akcent.
    scale = spec["displayScale"]
    for o in meshes + ([accents] if accents else []):
        o.scale = tuple(c * scale for c in o.scale)
    bpy.context.view_layer.update()

    only = [o.name for o in created if o.type == 'MESH']
    out = os.path.join(out_dir, key + ".webp")
    try:
        info = Q.render_still(out, only=only)
    finally:
        for o in list(created):
            try:
                bpy.data.objects.remove(o, do_unlink=True)
            except Exception:
                pass

    info["key"] = key
    info["kb"] = round(info.get("bytes", 0) / 1024.0, 1)
    return info


# ------------------------------------------------------------------ svih sest

def render_all(data_json, repo_root=None, out_dir=None):
    """Sest still-ova iz istog kadra. `data_json` je izvod iz `constants/disciplines.ts`."""
    with open(data_json, "r", encoding="utf-8") as fh:
        data = json.load(fh)

    repo_root = repo_root or os.path.dirname(Q.BLENDER_ROOT)
    out_dir = out_dir or os.path.join(
        repo_root, "public", "assets", "stills", "disciplines")
    os.makedirs(out_dir, exist_ok=True)

    Q.setup()

    results = []
    for key in data["order"]:
        results.append(render_one(key, data["disciplines"][key], repo_root, out_dir))
    return {"out_dir": out_dir, "results": results}
