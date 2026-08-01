"""FAZA A (bevel + weighted normals + AO) i FAZA B (export) za JEDNU disciplinu.

    exec(open(r"<repo>\\blender\\scripts\\bootstrap.py").read())
    import ops.export_discipline as X
    X.run("web-development")

IDEMPOTENTNOST - zasto pocinje od blockinga
-------------------------------------------
Bevel i weighted normals su DESTRUKTIVNI: primenjuju se na mesh, pa bi drugo
pokretanje bevelovalo vec bevelovanu geometriju i dalo drugi izlaz. Zato `run()`
NE krece od zatecenog mesh-a nego ga svaki put ponovo izgradi iz builder modula
(`build_web_development.build()`), koji je cist `from_pydata` bez ijednog
operatora i zato deterministican. Posle toga je ceo lanac funkcija od ulaza:

    blocking -> bevel -> weighted normals -> normalizacija bbox-a -> AO -> .glb

Dva uzastopna pokretanja daju bajt-identican `.glb`. Jedini nedeterministicni
korak je Cycles AO bake, pa mu je seed zakljucan (`cycles.seed = 0`,
`use_animated_seed = False`) i denoise iskljucen - denoiser je jos jedan izvor
varijacije, a na 512 uzoraka po temenu nema sta da denoise-uje.

ZASTO SE AO PECE U DVA ATRIBUTA
-------------------------------
Bake ide u `AO_BAKE` (FLOAT_COLOR, linearno, bez kvantizacije), remap se racuna
nad tim vrednostima, a rezultat se upisuje u `Col` (BYTE_COLOR) koji jedini ide
u export. Da se peklo direktno u BYTE_COLOR, sirov AO bi prosao kroz u8 pre
remapa, pa bi se kvantizacija desila dvaput - jednom na sirovoj vrednosti i
jednom na remapovanoj. Ovako se desava tacno jednom, na kraju.

BYTE_COLOR je izbor, ne default: `COLOR_0` tako izlazi kao u8 (4 B/verteks);
FLOAT_COLOR bi dao u16 ili f32 i udvostrucio taj atribut ni za sta - AO je
jedan kanal glatkih vrednosti u opsegu 0.40-1.00, gde je 256 nivoa vise nego
sto oko moze da razlikuje na metalu.

REMAP `ao' = floor + gain * ao`
-------------------------------
Sirov AO ima prosek oko 0.68 i ulazi u nulu u udubljenjima. Na `metalness 0.82`
difuzna komponenta je vec skoro nikakva, pa bi mnozenje nulom napravilo crne
rupe umesto kontaktne senke. `floor = 0.40` podize dno, `gain = 0.60` cuva
raspon - potpuno otvorena povrsina ostaje na 1.0, pa AO nikad ne zatamnjuje
ono sto ne treba.

EXPORT UGOVOR (SECTION_SPEC, Faza A/B)
--------------------------------------
- telo:  `POSITION`, `NORMAL`, `COLOR_0`   - BEZ `TEXCOORD_0`
- ekran: `POSITION`, `NORMAL`, `TEXCOORD_0` - BEZ `COLOR_0`
- `doubleSided: false` na oba materijala (`use_backface_culling = True`)
- 0 tekstura, 0 kamera, 0 svetala, bez Draco-a, bez ekstenzija
- bbox nad OBA mesh-a zajedno: centriran, najduza osa `2.0 +/- 0.02`

`export_attributes = False` nije kozmetika: bez toga bi u `.glb` odsetali
i `sharp_face` i ostali interni atributi mesh-a kao `_GENERIC` accessor-i.

COLOR_0 IZLAZI KAO u16 I TO SE NE MOZE PODESITI
-----------------------------------------------
`BYTE_COLOR` u Blenderu NE daje `UNSIGNED_BYTE` u glTF-u. Exporter ima fiksnu
tabelu (`io_scene_gltf2/blender/com/conversion.py:91`):

    "BYTE_COLOR": ComponentType.UnsignedShort

Nema opcije koja to menja - `UNSIGNED_BYTE` u toj tabeli postoji samo za lazni
COLOR_0 koji exporter sam izmisli kad ga materijal trazi a mesh ga nema. Zato
sirov `.glb` uvek nosi 8 B/verteks na COLOR_0, i to se ispravlja tek u
kvantizaciji (`--quantize-color 8`), gde izlazi kao u8, 4 B/verteks.

Izbor `BYTE_COLOR` ovde i dalje nije uzaludan: on je ono sto pise u mesh-u i
sto ce svaki sledeci alat procitati kao 8-bitni podatak.

KOMPRESIJA - zasto NIJE `optimize`
-----------------------------------
`gltf-transform optimize --compress meshopt` ima dva default-a koja ovaj model
tiho polome, pa se lanac vozi rucno (`compress_commands()`):

1. `--prune-attributes` (default `true`) OBRISE `TEXCOORD_0` sa ekrana. Prune
   gleda da li materijal koristi UV; nas materijal je namerno prazan jer sliku
   kaci kod, pa alat zakljuci da UV nikom ne treba. To je tacno onaj atribut
   zbog koga ekran i postoji kao zaseban primitiv.
2. `optimize` ne izlaze `--quantization-volume`, pa kvantizuje po MESH-u. Svaki
   mesh onda dobije svoj opseg, a razliku exporter zapise kao `scale` +
   `translation` NA CVORU. `HeroCube` (i ceo obrazac iz ugovora podataka) cita
   `nodes[name].geometry` i transform cvora ODBACUJE - ekran bi u kodu odleteo
   sa svog mesta. Sa `--quantization-volume scene` oba mesh-a dele isti opseg,
   koji je posle normalizacije tacno `[-1, 1]` po najduzoj osi, pa oba cvora
   izadju sa identitetom i geometrija je upotrebljiva i bez transforma.

`--simplify` je iskljucen jer bi decimirao bas ivice zbog kojih bevel postoji.
"""

import bpy
import math
import os
import importlib
import sys

# ------------------------------------------------------------------ putanje

_OPS_DIR = os.path.dirname(os.path.abspath(__file__)) \
    if "__file__" in globals() else \
    r"C:\Users\admin\Desktop\Web Dev Projects\enigma-digital\blender\scripts\ops"
SCRIPTS_DIR = os.path.dirname(_OPS_DIR)
BLENDER_ROOT = os.path.dirname(SCRIPTS_DIR)
EXPORTS_DIR = os.path.join(BLENDER_ROOT, "exports")

# ------------------------------------------------------------------ konstante

NORMALIZE_TO = 2.0          # najduza osa (SECTION_SPEC sekcija 3)
COLOR_ATTR = "Col"          # ide u glTF kao COLOR_0
BAKE_ATTR = "AO_BAKE"       # radni, brise se pre exporta

BODY_MAT = "DISC_BODY"
SCREEN_MAT = "DISC_SCREEN"

#: `width_rel` je udeo NAJDUZE OSE (2.0), ne apsolutna mera - tako isti broj
#: znaci istu vidljivu ivicu na svih sest modela, koji su svi normalizovani na
#: istu velicinu. `angle_deg` je 25, ne 30: zakosenje zadnje ivice panela stoji
#: na 30.3 stepeni i na pragu od 30 bi ispalo iz bevela.
#:
#: `width_rel = 0.003` je 0.006 u svetu, a najuza povrsina koju bevel sme da
#: pojede je zakosenje gornje ivice baze - sirina `0.005*sqrt(2) W = 0.0139`.
#: Dva bevela po 0.006 staju u nju sa rezervom, pa `use_clamp_overlap` nigde ne
#: mora da interveniše i ivica je svuda ISTE sirine. To je ceo razlog zasto
#: broj nije veci: nejednaka ivica se vidi kao greska, jaka ivica se ne vidi
#: kao kvalitet.
#:
#: `segments = 8` je mesto gde odlazi budzet. Bevel od 8 segmenata na 0.006
#: nije "glatkiji" u smislu siluete - silueta je ista - nego daje traku po kojoj
#: specular klizi umesto da preskace, i to je jedina razlika izmedju ivice koja
#: izgleda kao presek i ivice koja izgleda kao obradjen komad.
PRESETS = {
    "web-development": {
        "builder": "ops.build_web_development",
        "body": "web-development",
        "screen": "web-development_screen",
        "bevel": {"width_rel": 0.0030, "segments": 8,
                  "angle_deg": 25.0, "profile": 0.5},
        "ao": {"samples": 512, "distance": 0.30, "floor": 0.40, "gain": 0.60},
    },
}


def exports_dir():
    os.makedirs(EXPORTS_DIR, exist_ok=True)
    return EXPORTS_DIR


def glb_path(key):
    return os.path.join(exports_dir(), key + ".glb")


def compressed_glb_path(key):
    return os.path.join(exports_dir(), key + ".meshopt.glb")


def compress_commands(key):
    """Lanac kompresije, kao lista argv-ova. Ne pokrece se odavde - `node` nije
    na PATH-u Blenderove Python sesije - nego iz ljuske, ali stoji ovde da bi
    ceo pipeline zivio u jednom fajlu.

    `dedup` + `weld` su lossless: spajaju identicne accessor-e i identicna
    temena. `meshopt` radi kvantizaciju i `EXT_meshopt_compression`.
    """
    src = glb_path(key)
    out = compressed_glb_path(key)
    a = os.path.join(exports_dir(), "_%s.a.glb" % key)
    b = os.path.join(exports_dir(), "_%s.b.glb" % key)
    return [
        ["gltf-transform", "dedup", src, a],
        ["gltf-transform", "weld", a, b],
        ["gltf-transform", "meshopt", b, out,
         "--level", "high", "--quantization-volume", "scene"],
    ]


# ------------------------------------------------------------------ builder

def _load_builder(dotted):
    """Uvezi builder modul svez - `sys.modules` bi inace vratio stari kod."""
    if SCRIPTS_DIR not in sys.path:
        sys.path.insert(0, SCRIPTS_DIR)
    for name in [m for m in sys.modules
                 if m == dotted or m.startswith(dotted + ".")]:
        del sys.modules[name]
    return importlib.import_module(dotted)


# ------------------------------------------------------------------ mesh alati

def _obj(name):
    o = bpy.data.objects.get(name)
    if o is None or o.type != 'MESH':
        raise RuntimeError("nema mesh objekta %r" % name)
    return o


def _activate(obj):
    for o in bpy.context.selected_objects:
        o.select_set(False)
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    return obj


def shade_smooth(obj):
    """Sve face-ove na smooth. U 5.1 je to per-face bool `sharp_face`, ne
    operator - `bpy.ops.object.shade_smooth` bi trazio kontekst kog iz MCP-a
    nema (blender/CLAUDE.md, "Kontekst iz MCP-a")."""
    me = obj.data
    a = me.attributes.get("sharp_face")
    if a is None:
        a = me.attributes.new("sharp_face", 'BOOLEAN', 'FACE')
    a.data.foreach_set("value", [False] * len(me.polygons))
    me.update()
    return len(me.polygons)


def bevel_and_weighted_normals(obj, spec):
    """Bevel + Weighted Normal, oba primenjena.

    Redosled je obavezan: WN mora da radi nad VEC bevelovanom geometrijom, jer
    ono sto se vidi kao "skupa ivica" nije sam bevel nego to sto WN vrati
    normale velikih ravnih strana na njihove prave vrednosti, pa uzana traka
    bevela ostane jedino mesto gde normala rotira - i tu se skupi specular.
    Obrnut redosled bi WN primenio na ostre ivice i bevel bi ga posle pojeo.
    """
    shade_smooth(obj)
    _activate(obj)

    for m in list(obj.modifiers):
        obj.modifiers.remove(m)

    b = obj.modifiers.new("BEVEL", 'BEVEL')
    b.affect = 'EDGES'
    b.offset_type = 'OFFSET'
    b.width = spec["width_rel"] * NORMALIZE_TO
    b.segments = spec["segments"]
    b.profile = spec.get("profile", 0.5)
    b.limit_method = 'ANGLE'
    b.angle_limit = math.radians(spec["angle_deg"])
    b.miter_outer = 'MITER_ARC'
    b.use_clamp_overlap = True
    b.loop_slide = True
    b.harden_normals = False        # WN to radi bolje i bez custom normala iz bevela
    b.mark_sharp = False
    b.mark_seam = False

    w = obj.modifiers.new("WEIGHTED_NORMAL", 'WEIGHTED_NORMAL')
    w.mode = 'FACE_AREA'
    w.weight = 50
    w.thresh = 0.01
    w.keep_sharp = True
    w.use_face_influence = False

    # procitaj PRE apply-ja: posle njega je `b` mrtav pointer i `b.width` vraca 0
    width_world = round(b.width, 6)

    for name in ("BEVEL", "WEIGHTED_NORMAL"):
        bpy.ops.object.modifier_apply(modifier=name)

    me = obj.data
    me.calc_loop_triangles()
    return {"tris": len(me.loop_triangles),
            "verts": len(me.vertices),
            "polys": len(me.polygons),
            "bevel_width_world": width_world,
            "bevel_segments": spec["segments"],
            "bevel_angle_deg": spec["angle_deg"]}


def normalize_pair(body, screen, target=NORMALIZE_TO):
    """Centriraj i skaliraj OBA mesh-a kao jedan objekat.

    Bevel odsece coskove, pa bbox posle njega vise nije tacno onaj koji je
    builder normalizovao - razlika je mala ali `2.0 +/- 0.02` je kriterijum
    prijema, ne cilj. Racuna se nad unijom oba mesh-a jer bi po-objektu
    normalizacija razmakla ekran od tela.

    Transformi objekata se resetuju na jedinicu: `displayScale` je stvar koda
    i QA kadra, ne `.glb`-a.
    """
    objs = [body, screen]
    for o in objs:
        o.location = (0.0, 0.0, 0.0)
        o.rotation_euler = (0.0, 0.0, 0.0)
        o.scale = (1.0, 1.0, 1.0)

    lo = [float("inf")] * 3
    hi = [float("-inf")] * 3
    for o in objs:
        for v in o.data.vertices:
            for i in range(3):
                lo[i] = min(lo[i], v.co[i])
                hi[i] = max(hi[i], v.co[i])
    ctr = [(lo[i] + hi[i]) / 2.0 for i in range(3)]
    k = target / max(hi[i] - lo[i] for i in range(3))

    for o in objs:
        me = o.data
        n = len(me.vertices)
        buf = [0.0] * (n * 3)
        me.vertices.foreach_get("co", buf)
        for j in range(n):
            for i in range(3):
                buf[j * 3 + i] = (buf[j * 3 + i] - ctr[i]) * k
        me.vertices.foreach_set("co", buf)
        me.update()

    lo2 = [float("inf")] * 3
    hi2 = [float("-inf")] * 3
    for o in objs:
        for v in o.data.vertices:
            for i in range(3):
                lo2[i] = min(lo2[i], v.co[i])
                hi2[i] = max(hi2[i], v.co[i])
    dims = [hi2[i] - lo2[i] for i in range(3)]
    return {"scale_applied": round(k, 6),
            "bbox_dims_blender_xyz": [round(d, 5) for d in dims],
            "bbox_dims_gltf_xyz": [round(dims[0], 5), round(dims[2], 5),
                                   round(dims[1], 5)],
            "bbox_center": [round((hi2[i] + lo2[i]) / 2.0, 6) for i in range(3)],
            "longest_axis": round(max(dims), 5)}


# ------------------------------------------------------------------ materijali

def _flat_material(name, base=(0.42, 0.44, 0.47, 1.0), metallic=0.0,
                   roughness=0.5):
    """Materijal bez ijedne slike. PBR vrednosti koje ovde stoje su placeholder -
    pravi materijali se grade u kodu (SECTION_SPEC, odluka 4). Jedino sto je
    ovde nosece je `use_backface_culling = True`, iz kog glTF exporter izvodi
    `doubleSided: false`."""
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    out.location = (300, 0)
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.location = (0, 0)
    b.inputs["Base Color"].default_value = base
    b.inputs["Metallic"].default_value = metallic
    b.inputs["Roughness"].default_value = roughness
    nt.links.new(b.outputs["BSDF"], out.inputs["Surface"])
    mat.use_backface_culling = True
    return mat


def assign_export_materials(body, screen):
    """Jedan slot po mesh-u. Ekran dobija prazan materijal - nosi mesto za
    sliku, ne sliku (SECTION_SPEC, odluka 4 amandman)."""
    for obj, mat in ((body, _flat_material(BODY_MAT, metallic=0.0, roughness=0.35)),
                     (screen, _flat_material(SCREEN_MAT, base=(0.05, 0.05, 0.06, 1.0),
                                             roughness=0.20))):
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return {"body": BODY_MAT, "screen": SCREEN_MAT}


# ------------------------------------------------------------------ AO bake

def _drop_color_attrs(me):
    for name in [c.name for c in me.color_attributes]:
        me.color_attributes.remove(me.color_attributes[name])


def _new_color_attr(me, name, data_type, domain='POINT'):
    if name in me.color_attributes:
        me.color_attributes.remove(me.color_attributes[name])
    return me.color_attributes.new(name=name, type=data_type, domain=domain)


def bake_ao(obj, spec):
    """AO u `COLOR_0`, remapovan. Cycles, jer `bpy.ops.object.bake` je Cycles-only.

    Non-Color po konstrukciji: bake u color atribut pise SIROVE vrednosti u
    mesh, nikad kroz `view_settings` - view transform postoji samo na putu ka
    slici. Zato je `AgX` scene irelevantan i ne dira se.
    """
    me = obj.data
    _drop_color_attrs(me)

    scn = bpy.context.scene
    prev = {
        "engine": scn.render.engine,
        "world": scn.world.name if scn.world else None,
        "ao_dist": (scn.world.light_settings.distance
                    if scn.world else None),
    }
    cyc_prev = {}
    try:
        scn.render.engine = 'CYCLES'
        c = scn.cycles
        for k, v in (("samples", spec["samples"]), ("seed", 0),
                     ("use_animated_seed", False), ("use_denoising", False),
                     ("bake_type", 'AO')):
            if hasattr(c, k):
                cyc_prev[k] = getattr(c, k)
                setattr(c, k, v)
        if scn.world is not None:
            scn.world.light_settings.distance = spec["distance"]

        _new_color_attr(me, BAKE_ATTR, 'FLOAT_COLOR', 'POINT')
        me.color_attributes.active_color_index = \
            me.color_attributes.find(BAKE_ATTR)
        _activate(obj)
        bpy.ops.object.bake(type='AO', target='VERTEX_COLORS', use_clear=True)

        src = me.color_attributes[BAKE_ATTR]
        n = len(src.data)
        raw = [0.0] * (n * 4)
        src.data.foreach_get("color", raw)
        vals = [raw[i * 4] for i in range(n)]

        floor, gain = spec["floor"], spec["gain"]
        out = [0.0] * (n * 4)
        for i in range(n):
            a = floor + gain * vals[i]
            out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = a
            out[i * 4 + 3] = 1.0

        dst = _new_color_attr(me, COLOR_ATTR, 'BYTE_COLOR', 'POINT')
        dst.data.foreach_set("color", out)
        me.color_attributes.remove(me.color_attributes[BAKE_ATTR])
        idx = me.color_attributes.find(COLOR_ATTR)
        me.color_attributes.active_color_index = idx
        me.color_attributes.render_color_index = idx
        me.update()

        read = [0.0] * (n * 4)
        me.color_attributes[COLOR_ATTR].data.foreach_get("color", read)
        got = [read[i * 4] for i in range(n)]
        return {
            "attribute": COLOR_ATTR, "domain": 'POINT', "type": 'BYTE_COLOR',
            "points": n, "samples": spec["samples"],
            "ao_distance": spec["distance"],
            "raw": {"min": round(min(vals), 4), "max": round(max(vals), 4),
                    "mean": round(sum(vals) / n, 4)},
            "remap": "%.2f + %.2f * ao" % (floor, gain),
            "stored": {"min": round(min(got), 4), "max": round(max(got), 4),
                       "mean": round(sum(got) / n, 4)},
        }
    finally:
        scn.render.engine = prev["engine"]
        for k, v in cyc_prev.items():
            setattr(scn.cycles, k, v)
        if scn.world is not None and prev["ao_dist"] is not None:
            scn.world.light_settings.distance = prev["ao_dist"]


# ------------------------------------------------------------------ export

def export_glb(key, body, screen):
    """Samo dva objekta u `.glb`. `use_selection` je jedina garancija da ni
    kamera ni tri QA svetla ne odu u fajl - scena ih ima i export bez selekcije
    bi ih pokupio."""
    path = glb_path(key)
    for o in bpy.context.selected_objects:
        o.select_set(False)
    body.select_set(True)
    screen.select_set(True)
    bpy.context.view_layer.objects.active = body

    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_normals=True,
        export_texcoords=True,      # ekran ima UV, telo nema UV layer -> nema TEXCOORD_0
        export_tangents=False,
        export_vertex_color='ACTIVE',
        export_all_vertex_colors=False,
        export_attributes=False,
        export_materials='EXPORT',
        export_image_format='NONE',
        export_unused_images=False,
        export_unused_textures=False,
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_skins=False,
        export_morph=False,
        export_extras=False,
        export_draco_mesh_compression_enable=False,
    )
    return {"path": path, "bytes": os.path.getsize(path)}


# ------------------------------------------------------------------ run

def run(key, preset=None):
    """Ceo lanac za jednu disciplinu. Vraca izvestaj, ne pise nista u scenu
    sto ne bi prezivelo ponovno pokretanje."""
    p = preset or PRESETS[key]
    scn = bpy.context.scene
    state = {
        "mode": bpy.context.mode,
        "active": bpy.context.view_layer.objects.active.name
                  if bpy.context.view_layer.objects.active else None,
        "selected": [o.name for o in bpy.context.selected_objects],
        "engine": scn.render.engine,
    }
    try:
        if bpy.context.mode != 'OBJECT':
            bpy.ops.object.mode_set(mode='OBJECT')

        builder = _load_builder(p["builder"])
        blocking = builder.build(normalize=True)

        body, screen = _obj(p["body"]), _obj(p["screen"])
        bev = bevel_and_weighted_normals(body, p["bevel"])
        norm = normalize_pair(body, screen)
        mats = assign_export_materials(body, screen)
        ao = bake_ao(body, p["ao"])

        body.data.calc_loop_triangles()
        screen.data.calc_loop_triangles()
        tris = {"body": len(body.data.loop_triangles),
                "screen": len(screen.data.loop_triangles)}
        tris["total"] = tris["body"] + tris["screen"]

        exp = export_glb(key, body, screen)
        exp["bytes_per_tri"] = round(exp["bytes"] / tris["total"], 2)

        return {
            "key": key,
            "blocking_tris": blocking["tris"],
            "bevel": bev,
            "tris": tris,
            "normalize": norm,
            "materials": mats,
            "ao": ao,
            "export": exp,
            "body_uv_layers": [u.name for u in body.data.uv_layers],
            "screen_uv_layers": [u.name for u in screen.data.uv_layers],
            "body_color_attrs": [c.name for c in body.data.color_attributes],
            "screen_color_attrs": [c.name for c in screen.data.color_attributes],
        }
    finally:
        scn.render.engine = state["engine"]
        for o in bpy.context.selected_objects:
            o.select_set(False)
        for n in state["selected"]:
            o = bpy.data.objects.get(n)
            if o:
                o.select_set(True)
        a = bpy.data.objects.get(state["active"]) if state["active"] else None
        bpy.context.view_layer.objects.active = a
