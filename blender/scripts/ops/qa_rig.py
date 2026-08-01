"""QA rig za discipline modele: clay prolaz + silueta prolaz.

Bez side-efekata na import - modul samo definise konstante i funkcije
(blender/CLAUDE.md, "scripts/ i reload"). Nista se ne menja u sceni dok se
neka funkcija ne pozove.

    exec(open(r"<repo>\\blender\\scripts\\bootstrap.py").read())
    import ops.qa_rig as Q
    Q.setup()
    Q.render_clay(Q.render_path("A1_clay.png"), only=["web-development", "web-development_screen"])
    Q.render_silhouette(Q.render_path("A1_silhouette.png"), only=[...])

ZASTO OVAKO
-----------
Prvi pilot je pao zato sto se na QA renderu nije mogla suditi forma. Tri
uzroka, sva tri su ovde zatvorena:

1. `render_thumbnail_to_path` renderuje MALO i LOW-QUALITY - bevel od par
   milimetara na 512px ne postoji ni kao piksel. Zato prolazi ovde zovu
   `bpy.ops.render.render` na punoj rezoluciji (RES = 1024), a ne thumbnail.
2. Ravna tamna pozadina nema vrednost prema kojoj bi se silueta odvojila.
   Zamenjena vertikalnim gradijentom (svetliji pojas ispod centra, tamno gore).
3. Svetlo bez raspona = clay bez forme. Tri svetla sa jasnom hijerarhijom
   (key : fill = 4 : 1) i rim koji sece siluetu odozdo-pozadi.

Kadar je fiksan za svih sest modela i NE menja se: kamera iz SECTION_SPEC-a,
sekcija 3. Menja se samo sta stoji ispred nje.
"""

import bpy
import math
import os

from mathutils import Vector

# ------------------------------------------------------------------ putanje

_OPS_DIR = os.path.dirname(os.path.abspath(__file__)) \
    if "__file__" in globals() else \
    r"C:\Users\admin\Desktop\Web Dev Projects\enigma-digital\blender\scripts\ops"
BLENDER_ROOT = os.path.dirname(os.path.dirname(_OPS_DIR))
RENDERS_DIR = os.path.join(BLENDER_ROOT, "renders")


def render_path(filename):
    """Apsolutna putanja u blender/renders/ (folder se pravi ako ne postoji)."""
    os.makedirs(RENDERS_DIR, exist_ok=True)
    return os.path.join(RENDERS_DIR, filename)


# ------------------------------------------------------------------ imena

CAM = "QA_CAM"
KEY = "QA_KEY"
FILL = "QA_FILL"
RIM = "QA_RIM"
CLAY = "QA_CLAY"
SIL_MAT = "QA_SIL_BLACK"
WORLD = "QA_WORLD"
SIL_WORLD = "QA_SIL_WORLD"
RIG_COLLECTION = "QA_RIG"

#: Kamera iz SECTION_SPEC sekcije 3, u Blender koordinatama (Z-up).
#: glTF je Y-up: (bx, by, bz) -> (bx, bz, -by), pa ovo izlazi kao
#: three.js camera.position.set(-3.2, 2.4, 6.4). Ne diraj.
CAM_POS = (-3.2, -6.4, 2.4)
CAM_TARGET = (0.0, 0.0, 0.0)
CAM_FOV_Y_DEG = 30.0

RES = 1024
SAMPLES = 96

#: Sferni ugao kamere - sva svetla se pozicioniraju RELATIVNO na njega, da bi
#: "gore-levo od kamere" ostalo tacno i ako se kadar ikad pomeri.
_CAM_R = math.sqrt(sum(c * c for c in CAM_POS))
CAM_AZ = math.degrees(math.atan2(CAM_POS[1], CAM_POS[0]))   # -116.565
CAM_EL = math.degrees(math.asin(CAM_POS[2] / _CAM_R))       #  +18.542

#: Ekranski LEVO = MANJI azimut pozicije svetla: right = cross(forward, +Z)
#: pokazuje ka vecem azimutu, pa se "levo od kamere" dobija oduzimanjem.
#: Rim zato ide na daz = -115 (iza I levo), ne na +145 - to bi bila druga
#: strana i grejalo bi bok koji se sa ovog kadra uopste ne vidi.
KEY_R = 4.6
KEY_E = 250.0
FILL_R = 8.0
RIM_R = 6.0

#: Fill je 1/4 key-a MERENO NA MODELU, ne po nominalnim vatima. Watt je snaga
#: izvora, a odnos koji se vidi je ozracenost ~ E/r^2, pa razlicito udaljena
#: svetla sa istim W nisu isto jaka. Odnos se zato izvodi, ne kuca.
FILL_E = KEY_E * (FILL_R / KEY_R) ** 2 / 4.0
RIM_E = KEY_E * (RIM_R / KEY_R) ** 2 * 0.9

KEY_SPEC = dict(daz=-45.0, el=45.0, r=KEY_R, size=1.5, energy=KEY_E,
                color=(1.0, 0.972, 0.935))
FILL_SPEC = dict(daz=+55.0, el=10.0, r=FILL_R, size=4.5, energy=FILL_E,
                 color=(0.70, 0.82, 1.0))
RIM_SPEC = dict(daz=-115.0, el=-22.0, r=RIM_R, size=1.6, energy=RIM_E,
                color=(0.86, 0.93, 1.0))

#: Vertikalni gradijent pozadine, po EKRANSKOJ Y osi (TexCoord.Window), ne po
#: pravcu pogleda. Window je vec normalizovan 0-1 preko kadra, pa gradijent
#: ostaje tacno vertikalan i ne mora da se preracunava ako se kamera pomeri.
BG_RAMP = [
    (0.00, "#10161F"),   # dno kadra
    (0.40, "#33445A"),   # najsvetliji pojas malo ispod centra - stopa se odvaja
    (1.00, "#05080E"),   # vrh kadra - najtamnije, panel se odvaja odozgo
]

CLAY_BASE = "#8A8F96"
CLAY_ROUGHNESS = 0.28     # dovoljno glatko da bevel dobije TANKU specular liniju
CLAY_SPECULAR = 0.62

CLAY_LOOKS = ("AgX - Medium High Contrast", "AgX - Punchy", "None")


# ------------------------------------------------------------------ boje

def _srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hexcol(h, a=1.0):
    h = h.lstrip("#")
    return (_srgb_to_linear(int(h[0:2], 16)),
            _srgb_to_linear(int(h[2:4], 16)),
            _srgb_to_linear(int(h[4:6], 16)), a)


# ------------------------------------------------------------------ geometrija rig-a

def _polar(az_deg, el_deg, r):
    az, el = math.radians(az_deg), math.radians(el_deg)
    return (r * math.cos(el) * math.cos(az),
            r * math.cos(el) * math.sin(az),
            r * math.sin(el))


def _aim(obj, target=CAM_TARGET):
    """Okreni objekat da mu -Z gleda u `target` (konvencija kamera i svetala)."""
    d = Vector(target) - obj.location
    obj.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def _rig_collection():
    col = bpy.data.collections.get(RIG_COLLECTION)
    if col is None:
        col = bpy.data.collections.new(RIG_COLLECTION)
        bpy.context.scene.collection.children.link(col)
    return col


def _ensure_object(name, data_factory):
    """Nadji objekat po imenu ili ga napravi i zakaci u QA_RIG kolekciju."""
    obj = bpy.data.objects.get(name)
    if obj is None:
        obj = bpy.data.objects.new(name, data_factory(name))
        _rig_collection().objects.link(obj)
    return obj


# ------------------------------------------------------------------ setup delovi

def ensure_camera():
    cam = _ensure_object(CAM, lambda n: bpy.data.cameras.new(n))
    c = cam.data
    c.type = 'PERSP'
    c.sensor_fit = 'VERTICAL'          # fov iz spec-a je VERTIKALNI, kao u three.js
    c.sensor_height = 24.0
    c.lens = (c.sensor_height / 2.0) / math.tan(math.radians(CAM_FOV_Y_DEG) / 2.0)
    c.clip_start = 0.05
    c.clip_end = 200.0
    cam.location = CAM_POS
    _aim(cam)
    bpy.context.scene.camera = cam
    return cam


def _ensure_area_light(name, spec):
    obj = _ensure_object(name, lambda n: bpy.data.lights.new(n, type='AREA'))
    L = obj.data
    L.type = 'AREA'
    L.shape = 'SQUARE'
    L.size = spec["size"]
    L.energy = spec["energy"]
    L.color = spec["color"]
    L.use_temperature = False
    obj.location = _polar(CAM_AZ + spec["daz"], spec["el"], spec["r"])
    _aim(obj)
    return obj


def ensure_lights():
    """Key gore-levo od kamere, hladan fill desno na 1/4, rim iza-levo-dole."""
    return {
        KEY: _ensure_area_light(KEY, KEY_SPEC),
        FILL: _ensure_area_light(FILL, FILL_SPEC),
        RIM: _ensure_area_light(RIM, RIM_SPEC),
    }


def ensure_world():
    """Vertikalni gradijent umesto ravne tamne boje.

    TexCoord.Window daje ekranske koordinate 0-1, pa je gradijent vertikalan po
    konstrukciji. Ranija verzija je isla preko Generated.Z (pravac pogleda) i
    trazila je rucno mapiranje na traku koju kamera zaista vidi - tacno, ali
    vezano za CAM_EL. Window ne zna za kameru, pa se ne raspada ako se kadar
    ikad pomeri.
    """
    w = bpy.data.worlds.get(WORLD) or bpy.data.worlds.new(WORLD)
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()

    out = nt.nodes.new("ShaderNodeOutputWorld")
    out.location = (600, 0)
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.location = (400, 0)
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.location = (150, 0)
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    sep.location = (-100, 0)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    tc.location = (-320, 0)

    el = ramp.color_ramp.elements
    while len(el) > 1:
        el.remove(el[-1])
    el[0].position, el[0].color = BG_RAMP[0][0], hexcol(BG_RAMP[0][1])
    for pos, h in BG_RAMP[1:]:
        el.new(pos).color = hexcol(h)

    bg.inputs["Strength"].default_value = 1.0

    nt.links.new(tc.outputs["Window"], sep.inputs["Vector"])
    nt.links.new(sep.outputs["Y"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    return w


def ensure_sil_world():
    """Ravna bela pozadina za siluetni prolaz."""
    w = bpy.data.worlds.get(SIL_WORLD) or bpy.data.worlds.new(SIL_WORLD)
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    out.location = (300, 0)
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.location = (0, 0)
    bg.inputs["Color"].default_value = (1.0, 1.0, 1.0, 1.0)
    bg.inputs["Strength"].default_value = 1.0
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    return w


def ensure_sil_material():
    """Cista crna EMISIJA - shader bez BSDF-a, pa ne moze da uhvati ni jedan
    foton iz bele pozadine. Principled sa crnom Base Color bi i dalje imao
    specular i model bi na belom okruzenju posiveo po ivicama."""
    mat = bpy.data.materials.get(SIL_MAT) or bpy.data.materials.new(SIL_MAT)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    out.location = (300, 0)
    em = nt.nodes.new("ShaderNodeEmission")
    em.location = (0, 0)
    em.inputs["Color"].default_value = (0.0, 0.0, 0.0, 1.0)
    em.inputs["Strength"].default_value = 1.0
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return mat


def ensure_clay():
    """Neutralan sivi clay. Metalness 0 - AO i forma se sude po difuznoj komponenti."""
    mat = bpy.data.materials.get(CLAY) or bpy.data.materials.new(CLAY)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    out.location = (300, 0)
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.location = (0, 0)
    b.inputs["Base Color"].default_value = hexcol(CLAY_BASE)
    b.inputs["Metallic"].default_value = 0.0
    b.inputs["Roughness"].default_value = CLAY_ROUGHNESS
    b.inputs["Specular IOR Level"].default_value = CLAY_SPECULAR
    nt.links.new(b.outputs["BSDF"], out.inputs["Surface"])
    return mat


def assign_clay(names):
    """Zakaci QA_CLAY na navedene mesh objekte (jedan slot, bez diranja UV-ova)."""
    mat = ensure_clay()
    done = []
    for n in names:
        o = bpy.data.objects.get(n)
        if not o or o.type != 'MESH':
            continue
        o.data.materials.clear()
        o.data.materials.append(mat)
        done.append(n)
    return done


def setup(res=RES, samples=SAMPLES):
    """Ceo rig: kamera, tri svetla, gradijent pozadine, clay, rezolucija.

    Idempotentno - postojeci QA_* objekti se ponovo podese, ne dupliraju.
    """
    scn = bpy.context.scene
    cam = ensure_camera()
    lights = ensure_lights()
    ensure_world()
    ensure_clay()

    r = scn.render
    r.resolution_x = res
    r.resolution_y = res
    r.resolution_percentage = 100
    r.film_transparent = False
    r.image_settings.file_format = 'PNG'
    r.image_settings.color_mode = 'RGB'
    r.image_settings.color_depth = '8'
    return {
        "camera": cam.name,
        "cam_pos_blender": list(CAM_POS),
        "cam_pos_gltf": [CAM_POS[0], CAM_POS[2], -CAM_POS[1]],
        "fov_y_deg": CAM_FOV_Y_DEG,
        "lens_mm": round(cam.data.lens, 4),
        "lights": {k: [round(v, 4) for v in o.location] for k, o in lights.items()},
        "resolution": [res, res],
        "samples": samples,
    }


# ------------------------------------------------------------------ stanje

def _pick(owner, prop, candidates):
    """Dodeli prvi kandidat koji RNA prihvati; enum-i su ovde dinamicki
    (blender/CLAUDE.md) pa introspekcija ne pomaze - proba je jedini test."""
    for c in candidates:
        try:
            setattr(owner, prop, c)
            return c
        except Exception:
            continue
    return getattr(owner, prop)


def _snapshot():
    scn = bpy.context.scene
    r, vs = scn.render, scn.view_settings
    return {
        "engine": r.engine, "filepath": r.filepath,
        "res": (r.resolution_x, r.resolution_y, r.resolution_percentage),
        "film_transparent": r.film_transparent,
        "color_mode": r.image_settings.color_mode,
        "view_transform": vs.view_transform, "look": vs.look,
        "eevee_samples": scn.eevee.taa_render_samples,
        "eevee_rt": scn.eevee.use_raytracing,
        "world": scn.world.name if scn.world else None,
        "hide_render": {o.name: o.hide_render for o in bpy.data.objects},
        "materials": {o.name: [ms.material.name if ms.material else None
                               for ms in o.material_slots]
                      for o in bpy.data.objects if o.type == 'MESH'},
        "active": bpy.context.view_layer.objects.active.name
                  if bpy.context.view_layer.objects.active else None,
        "selected": [o.name for o in bpy.context.selected_objects],
        "mode": bpy.context.mode,
    }


def _restore(s):
    scn = bpy.context.scene
    r, vs = scn.render, scn.view_settings
    r.engine = s["engine"]
    r.filepath = s["filepath"]
    r.resolution_x, r.resolution_y, r.resolution_percentage = s["res"]
    r.film_transparent = s["film_transparent"]
    r.image_settings.color_mode = s["color_mode"]
    vs.view_transform = s["view_transform"]
    vs.look = s["look"]
    scn.eevee.taa_render_samples = s["eevee_samples"]
    scn.eevee.use_raytracing = s["eevee_rt"]
    if s["world"]:
        scn.world = bpy.data.worlds.get(s["world"])
    for name, h in s["hide_render"].items():
        o = bpy.data.objects.get(name)
        if o:
            o.hide_render = h
    for name, mats in s["materials"].items():
        o = bpy.data.objects.get(name)
        if not o or o.type != 'MESH':
            continue
        me = o.data
        me.materials.clear()
        for mn in mats:
            me.materials.append(bpy.data.materials.get(mn) if mn else None)
    for o in bpy.context.selected_objects:
        o.select_set(False)
    for n in s["selected"]:
        o = bpy.data.objects.get(n)
        if o:
            o.select_set(True)
    a = bpy.data.objects.get(s["active"]) if s["active"] else None
    bpy.context.view_layer.objects.active = a


def _override_material(mat, names):
    """Prebaci sve slotove navedenih mesh objekata na `mat`.

    `view_layer.material_override` bi bio elegantniji, ali njegova podrska po
    engine-ima se menjala kroz verzije; zamena slotova radi svuda i vraca se
    kroz `_restore`, koji ionako pamti pun spisak materijala."""
    for n in names:
        o = bpy.data.objects.get(n)
        if not o or o.type != 'MESH':
            continue
        me = o.data
        if not me.materials:
            me.materials.append(mat)
        else:
            for i in range(len(me.materials)):
                me.materials[i] = mat


def _isolate(only):
    """hide_render = True na svemu sto nije u `only` (svetla i kamera ostaju)."""
    if not only:
        return
    keep = set(only)
    for o in bpy.data.objects:
        if o.type == 'MESH':
            o.hide_render = o.name not in keep


def _render_to(path):
    scn = bpy.context.scene
    os.makedirs(os.path.dirname(path), exist_ok=True)
    scn.render.filepath = path
    bpy.ops.render.render(write_still=True)
    return {"path": path,
            "bytes": os.path.getsize(path) if os.path.exists(path) else 0}


# ------------------------------------------------------------------ prolaz 1: clay

def render_clay(output_path, only=None, res=RES, samples=SAMPLES):
    """Sivi clay pod tri svetla, na gradijentu. Sudi se FORMA.

    Prijem: preko povrsina se vidi raspon vrednosti, a na svakoj zaobljenoj
    ivici tanka specular linija.
    """
    scn = bpy.context.scene
    state = _snapshot()
    try:
        scn.render.engine = 'BLENDER_EEVEE'
        scn.render.resolution_x = scn.render.resolution_y = res
        scn.render.resolution_percentage = 100
        scn.render.film_transparent = False
        scn.render.image_settings.color_mode = 'RGB'
        scn.eevee.taa_render_samples = samples
        scn.eevee.use_shadows = True
        try:
            scn.eevee.use_raytracing = True
            scn.eevee.ray_tracing_options.use_denoise = True
        except Exception:
            pass
        scn.view_settings.view_transform = 'AgX'
        look = _pick(scn.view_settings, "look", CLAY_LOOKS)
        _isolate(only)
        info = _render_to(output_path)
        info["pass"] = "clay"
        info["look"] = look
        info["samples"] = samples
        return info
    finally:
        _restore(state)


# ------------------------------------------------------------------ prolaz 2: silueta

def render_silhouette(output_path, only=None, res=RES, samples=32):
    """Model kao puna crna forma na beloj pozadini, bez svetla.

    EEVEE + bela emisiona pozadina + crn EMISSION materijal na modelu. Emisija
    nema BSDF, pa bela pozadina nema sta da osvetli - silueta izlazi kao ciste
    nule bez obzira na svetla, koja u ovom prolazu i ne ucestvuju.

    View transform je Standard: AgX bi cistu belu spustio na ~0.82 i cistu crnu
    podigao, pa "crno na belom" vise ne bi bilo ni crno ni belo.

    NE koristi se Workbench iako bi FLAT + SINGLE bilo ocigledno resenje:
    provereno u ovoj sceni, `bpy.ops.render.render` sa Workbench-om ignorise
    `display.shading.background_color` i vraca boju teme (0.247 sivo), bez
    obzira na `background_type='VIEWPORT'`. To je viewport postavka, ne render.

    KRITERIJUM PRIJEMA za svaki model: ako se iz ove slike ne prepozna o cemu
    je model, oblik je pao. Nema bevela koji to spasava.
    """
    scn = bpy.context.scene
    state = _snapshot()
    try:
        scn.render.engine = 'BLENDER_EEVEE'
        scn.render.resolution_x = scn.render.resolution_y = res
        scn.render.resolution_percentage = 100
        scn.render.film_transparent = False
        scn.render.image_settings.color_mode = 'RGB'
        scn.eevee.taa_render_samples = samples
        scn.world = ensure_sil_world()
        scn.view_settings.view_transform = _pick(
            scn.view_settings, "view_transform", ("Standard",))
        _pick(scn.view_settings, "look", ("None",))

        _isolate(only)
        targets = only or [o.name for o in bpy.data.objects
                           if o.type == 'MESH' and not o.hide_render]
        _override_material(ensure_sil_material(), targets)

        info = _render_to(output_path)
        info["pass"] = "silhouette"
        return info
    finally:
        _restore(state)


# ------------------------------------------------------------------ oba

def render_both(stem, only=None, res=RES, samples=SAMPLES):
    """Oba prolaza iz istog kadra: <stem>_clay.png i <stem>_silhouette.png."""
    return {
        "clay": render_clay(render_path(stem + "_clay.png"), only=only,
                            res=res, samples=samples),
        "silhouette": render_silhouette(render_path(stem + "_silhouette.png"),
                                        only=only, res=res),
    }


# ------------------------------------------------------------------ kadriranje

def frame_fraction(name):
    """Koliki deo SIRINE KADRA zauzima objekat iz aktivne kamere, 0-1.

    `world_to_camera_view` vraca normalizovane koordinate kadra, pa je ovo
    izmerena projekcija a ne procena preko `cos(ugao)` - perspektiva se ne
    ponasa linearno na 30 stepeni i procena promasi za par procenata.
    """
    from bpy_extras.object_utils import world_to_camera_view
    scn = bpy.context.scene
    o = bpy.data.objects[name]
    pts = [world_to_camera_view(scn, scn.camera, o.matrix_world @ v.co)
           for v in o.data.vertices]
    xs = [p.x for p in pts]
    ys = [p.y for p in pts]
    return {"width_frac": round(max(xs) - min(xs), 5),
            "height_frac": round(max(ys) - min(ys), 5),
            "x_range": [round(min(xs), 4), round(max(xs), 4)],
            "y_range": [round(min(ys), 4), round(max(ys), 4)]}


def set_display_scale(names, scale):
    """`displayScale` iz ugovora podataka, primenjen kao skala OBJEKTA.

    Mesh ostaje normalizovan na najduzu osu 2.0 - to je export ugovor iz Faze B
    i uslov da jedna kamera radi za svih sest. Skala zivi na objektu (a u kodu
    kao `displayScale`), pa QA render pokazuje ono sto ce se stvarno videti, a
    .glb i dalje izlazi normalizovan.
    """
    for n in names:
        bpy.data.objects[n].scale = (scale, scale, scale)
    bpy.context.view_layer.update()
    return scale


def fit_display_scale(names, target_name, target_frac, lo=0.5, hi=4.0, iters=40):
    """Nadji `displayScale` na kome `target_name` zauzima `target_frac` sirine kadra.

    Bisekcija, ne deljenje - objekat je centriran u koordinatnom pocetku a
    kamera je na konacnoj udaljenosti, pa dvostruka skala NE daje dvostruku
    projekciju.
    """
    for _ in range(iters):
        mid = (lo + hi) / 2.0
        set_display_scale(names, mid)
        if frame_fraction(target_name)["width_frac"] < target_frac:
            lo = mid
        else:
            hi = mid
    s = round((lo + hi) / 2.0, 4)
    set_display_scale(names, s)
    return s


# ------------------------------------------------------------------ mere

def measure(names):
    """Trouglovi i bbox nad zadatim objektima, zajedno i pojedinacno.

    Bbox se racuna nad SVIMA ZAJEDNO jer ih export normalizuje kao jedan
    objekat (SECTION_SPEC, Faza B) - odvojene brojke su samo informativne.
    """
    dg = bpy.context.evaluated_depsgraph_get()
    lo = [float("inf")] * 3
    hi = [float("-inf")] * 3
    per = {}
    total_tris = 0
    for n in names:
        o = bpy.data.objects.get(n)
        if not o or o.type != 'MESH':
            continue
        ev = o.evaluated_get(dg)
        me = ev.to_mesh()
        me.calc_loop_triangles()
        tris = len(me.loop_triangles)
        pts = [ev.matrix_world @ v.co for v in me.vertices]
        ev.to_mesh_clear()
        total_tris += tris
        olo = [min(p[i] for p in pts) for i in range(3)]
        ohi = [max(p[i] for p in pts) for i in range(3)]
        for i in range(3):
            lo[i] = min(lo[i], olo[i])
            hi[i] = max(hi[i], ohi[i])
        per[n] = {"tris": tris,
                  "dims": [round(ohi[i] - olo[i], 4) for i in range(3)],
                  "uv_layers": [u.name for u in o.data.uv_layers]}
    dims = [hi[i] - lo[i] for i in range(3)]
    center = [(hi[i] + lo[i]) / 2.0 for i in range(3)]
    return {
        "tris_total": total_tris,
        "bbox_dims_blender_xyz": [round(d, 4) for d in dims],
        "bbox_dims_gltf_xyz": [round(dims[0], 4), round(dims[2], 4), round(dims[1], 4)],
        "bbox_center": [round(c, 4) for c in center],
        "longest_axis": round(max(dims), 4),
        "per_object": per,
    }
