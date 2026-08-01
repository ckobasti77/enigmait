"""FAZA A / blocking: `web-development` - studijski displej.

SAMO BLOCKING. Bez bevela, bez weighted normals, bez AO bake-a, bez exporta.
Sve je ravan shading i eksplicitna geometrija (`from_pydata`) - nijedan modifier
i nijedan `bpy.ops.mesh.*`, pa je rezultat deterministican i idempotentan.

DVA MESH-A OD POCETKA (SECTION_SPEC, odluka 4 amandman):
  BODY   "web-development"          panel + vrat + baza, JEDAN mesh, BEZ UV-ova
  SCREEN "web-development_screen"   ravna ploca, UV 0-1 na pun opseg

PROPORCIJE - sve u jedinicama W = SIRINA EKRANA
----------------------------------------------
`SCREEN_W` je 1.0 u prostoru gradnje i svaka druga mera je broj puta W. Zato je
ceo model jedna razmera i nijedan odnos ne moze da se raziđe sa drugim.

    okvir gore i sa strane   0.015     brada dole              0.045
    debljina panela          0.030     vrat (secivo)   0.10 x 0.025
    razmak baza -> panel     0.180     baza    0.32 x 0.20 x 0.015

ASIMETRIJA OKVIRA JE CEO SIGNAL. Tanko gore i sa strane, deblja brada dole -
to je ono sto razdvaja studijski displej od kancelarijskog monitora. `PANEL_H`
se zato izvodi kao `SCREEN_H + BEZEL_SIDE + BEZEL_CHIN`, ne kao `+ 2*bezel`.

Ekran je TACNO 16:9: `SCREEN_H` se IZVODI iz `SCREEN_W` (* 9/16), nikad se ne
kuca kao broj. Tekstura je 1280x720 i svako odstupanje razvlaci sliku.

ZADNJA IVICA PANELA. Panel nije prosta ploca: ravan zadnji deo, pa ostro
zakosenje po celom zadnjem obodu. Zakosenje je STRMO (`0.012` po dubini prema
`0.007` uvlacenja) namerno - zakosenje pod 45 bi uvuklo zadnju plocu skoro do
ivice ekrana i ostavilo traku od 0.001 W, sto je degenerisana geometrija na
kojoj bi bevel kasnije pukao.

ZAOKRET - najosetljiviji broj u fajlu
------------------------------------
Kamera je fiksna za svih sest (SECTION_SPEC sekcija 3), pa je orijentacija deo
modela. Kamera stoji na azimutu -116.565 i elevaciji +18.542. Ako panel gleda
pravo napred (-Y), ugao izmedju normale ekrana i pravca ka kameri je vec ~28 -
previse. `YAW_DEG` = -11.5 zakrece model ka kameri, `TILT_DEG` = 8 naginje
panel unazad kao pravi displej i usput pojede deo vertikalne razlike.
`screen_offaxis_deg()` racuna rezultat iz samih konstanti, pa je provera deo
modula a ne komentar. Kriterijum je 15-20.

Bez logoa, bez teksta, bez glifova - to zivi iskljucivo u slici ekrana.
"""

import bpy
import bmesh
import math

BODY = "web-development"
SCREEN = "web-development_screen"
COLLECTION = "PILOT"

# ------------------------------------------------------------------ mere (u W)

SCREEN_W = 1.0
SCREEN_H = SCREEN_W * 9.0 / 16.0        # IZVEDENO. 16:9 tacno.

BEZEL_SIDE = 0.015       # gore i sa obe strane
BEZEL_CHIN = 0.045       # brada dole - asimetrija je signal

PANEL_W = SCREEN_W + 2.0 * BEZEL_SIDE
PANEL_H = SCREEN_H + BEZEL_SIDE + BEZEL_CHIN

PANEL_D = 0.030          # ukupna debljina panela
BACK_CHAMFER_Y = 0.012   # dubina zakosenja zadnje ivice
BACK_CHAMFER_IN = 0.007  # uvlacenje zadnje ploce
PANEL_STRAIGHT = PANEL_D - BACK_CHAMFER_Y

RECESS = 0.008           # ekran iza ravni okvira (27% debljine panela)
CAVITY_D = 0.012         # dno dzepa, iza ekrana

NECK_W = 0.10            # secivo, ne trapezasti slab
NECK_T = 0.025
GAP = 0.180              # ciste vazduha izmedju vrha baze i dna panela

BASE_W = 0.32
BASE_D = 0.20
BASE_H = 0.015
BASE_CHAMFER = 0.005     # zakosenje gornje ivice
BASE_CORNER_R = 0.075    # zaobljen pravougaonik, NE osmougao
BASE_SEG = 6             # lukova po cosku; 6 je granica na kojoj prestaje da
                         # se cita kao mnogougao iz ovog kadra

TILT_DEG = 8.0
YAW_DEG = -11.5
NORMALIZE_TO = 2.0       # najduza osa (SECTION_SPEC sekcija 3)

BASE_Y_C = 0.020         # centar baze i vrata po Y

# Z raspored. PANEL_Z0 nosi ispravku od -BACK_CHAMFER_Y*sin(TILT). Nagib oko
# donje-zadnje ivice podigne SVE tacke panela; najnizu tacku ima donji red
# prstena L1, koji lezi BACK_CHAMFER_Y ispred osovine. Bez ispravke bi IZMEREN
# cist razmak bio 0.182 umesto trazenih 0.180 - razlika je mala, ali GAP je
# jedan od sedam odnosa koji se meri, pa mora da izadje tacan.
BASE_Z1 = BASE_H
PANEL_Z0 = BASE_Z1 + GAP - BACK_CHAMFER_Y * math.sin(math.radians(TILT_DEG))
PANEL_Z1 = PANEL_Z0 + PANEL_H
NECK_Z0 = 0.008                  # ulazi u bazu
NECK_Z1 = PANEL_Z0 + 0.018       # ulazi u panel iznad zone zakosenja

PANEL_BACK_Y = BASE_Y_C + NECK_T / 2.0 + 0.001
PANEL_FRONT_Y = PANEL_BACK_Y - PANEL_D

#: Kamera iz SECTION_SPEC sekcije 3, Blender Z-up.
CAM_POS = (-3.2, -6.4, 2.4)

#: Obilazak oboda mreze 4x4 (i, j), 12 temena. Isti redosled koriste prsten L1
#: i obod zadnje ploce, pa su bocne strane i zakosenje manifold po konstrukciji.
PERIM = [(0, 0), (1, 0), (2, 0), (3, 0), (3, 1), (3, 2), (3, 3),
         (2, 3), (1, 3), (0, 3), (0, 2), (0, 1)]


# ------------------------------------------------------------------ provera zaokreta

def screen_offaxis_deg():
    """Ugao izmedju normale ekrana i pravca ka kameri, u stepenima. Cilj 15-20."""
    t, y = math.radians(TILT_DEG), math.radians(YAW_DEG)
    n = _rot_z(_rot_x((0.0, -1.0, 0.0), -t), y)
    r = math.sqrt(sum(c * c for c in CAM_POS))
    c = tuple(v / r for v in CAM_POS)
    dot = max(-1.0, min(1.0, sum(a * b for a, b in zip(n, c))))
    return math.degrees(math.acos(dot))


# ------------------------------------------------------------------ transformacije

def _rot_x(p, a):
    ca, sa = math.cos(a), math.sin(a)
    return (p[0], p[1] * ca - p[2] * sa, p[1] * sa + p[2] * ca)


def _rot_z(p, a):
    ca, sa = math.cos(a), math.sin(a)
    return (p[0] * ca - p[1] * sa, p[0] * sa + p[1] * ca, p[2])


def _tilt(p, pivot):
    q = (p[0] - pivot[0], p[1] - pivot[1], p[2] - pivot[2])
    q = _rot_x(q, -math.radians(TILT_DEG))
    return (q[0] + pivot[0], q[1] + pivot[1], q[2] + pivot[2])


# ------------------------------------------------------------------ panel + ekran

def _panel_and_screen():
    """Panel sa dzepom i zakosenom zadnjom ivicom + ploca ekrana.

    Redosled temena je deo ugovora - `verify_proportions()` meri odnose preko
    imenovanih parova indeksa, pa se ne sme menjati bez menjanja i tamo.

        0..15   prednja mreza 4x4 (okvir je 8 celija, centralna je otvor)
        16..27  prsten L1 na kraju ravnog dela
        28..43  zadnja mreza 4x4, njen obod je kraj zakosenja
        44..47  dno dzepa
    """
    x1 = PANEL_W / 2.0
    z0, z1 = PANEL_Z0, PANEL_Z1
    yf, yb = PANEL_FRONT_Y, PANEL_BACK_Y

    xs = [-x1, -SCREEN_W / 2.0, SCREEN_W / 2.0, x1]
    zs = [z0, z0 + BEZEL_CHIN, z0 + BEZEL_CHIN + SCREEN_H, z1]
    c = BACK_CHAMFER_IN
    xs_b = [xs[0] + c, xs[1], xs[2], xs[3] - c]
    zs_b = [zs[0] + c, zs[1], zs[2], zs[3] - c]

    verts, faces = [], []

    def grid(gx, gz, y):
        base = len(verts)
        for j in range(4):
            for i in range(4):
                verts.append((gx[i], y, gz[j]))
        return base

    f = grid(xs, zs, yf)                          # 0..15
    l1 = len(verts)
    for i, j in PERIM:                            # 16..27
        verts.append((xs[i], yf + PANEL_STRAIGHT, zs[j]))
    b = grid(xs_b, zs_b, yb)                      # 28..43

    def gi(base, i, j):
        return base + j * 4 + i

    # prednji okvir: 8 celija, centralna je otvor ekrana
    for j in range(3):
        for i in range(3):
            if i == 1 and j == 1:
                continue
            faces.append([gi(f, i, j), gi(f, i + 1, j),
                          gi(f, i + 1, j + 1), gi(f, i, j + 1)])

    # zadnja ploca: svih 9
    for j in range(3):
        for i in range(3):
            faces.append([gi(b, i, j), gi(b, i, j + 1),
                          gi(b, i + 1, j + 1), gi(b, i + 1, j)])

    fp = [gi(f, i, j) for i, j in PERIM]
    bp = [gi(b, i, j) for i, j in PERIM]
    for k in range(12):
        n = (k + 1) % 12
        faces.append([fp[k], fp[n], l1 + n, l1 + k])          # ravan bok
        faces.append([l1 + k, l1 + n, bp[n], bp[k]])          # zakosenje

    # dzep: cetiri zida od prednje ravni do dna + dno
    cav = len(verts)                              # 44..47
    for i, j in ((1, 1), (2, 1), (2, 2), (1, 2)):
        verts.append((xs[i], yf + CAVITY_D, zs[j]))
    rim = [gi(f, 1, 1), gi(f, 2, 1), gi(f, 2, 2), gi(f, 1, 2)]
    for k in range(4):
        n = (k + 1) % 4
        faces.append([rim[k], rim[n], cav + n, cav + k])
    faces.append([cav + 0, cav + 1, cav + 2, cav + 3])

    pivot = (0.0, yb, z0)
    verts = [_tilt(v, pivot) for v in verts]

    s_verts = [(xs[1], yf + RECESS, zs[1]),       # dole-levo   -> uv (0,0)
               (xs[2], yf + RECESS, zs[1]),       # dole-desno  -> uv (1,0)
               (xs[2], yf + RECESS, zs[2]),       # gore-desno  -> uv (1,1)
               (xs[1], yf + RECESS, zs[2])]       # gore-levo   -> uv (0,1)
    s_verts = [_tilt(v, pivot) for v in s_verts]

    return verts, faces, s_verts


# ------------------------------------------------------------------ vrat + baza

def _blade():
    """Vrat kao secivo: tanka uspravna ploca konstantnog preseka.

    Namerno BEZ suzenja. Trapezasti slab je najgenericniji moguci izbor i tacno
    ono sto ovaj model pretvara u stock monitor; secivo konstantnog preseka je
    ono sto studijski displej i ima.
    """
    y0 = BASE_Y_C - NECK_T / 2.0
    y1 = y0 + NECK_T
    x = NECK_W / 2.0
    v = [(-x, y0, NECK_Z0), (x, y0, NECK_Z0), (x, y1, NECK_Z0), (-x, y1, NECK_Z0),
         (-x, y0, NECK_Z1), (x, y0, NECK_Z1), (x, y1, NECK_Z1), (-x, y1, NECK_Z1)]
    fq = [[0, 1, 2, 3], [7, 6, 5, 4],
          [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]]
    return v, fq


def _rounded_rect(w, d, r, seg):
    """Obod zaobljenog pravougaonika, CCW gledano odozgo. 4*(seg+1) temena.

    Uvuceni obod se dobija istim pozivom sa (w-2c, d-2c, r-c) - isti broj
    temena i ista korespondencija, pa se prstenovi spajaju bez razmisljanja.
    """
    hx, hy = w / 2.0 - r, d / 2.0 - r
    pts = []
    for cx, cy, a0 in ((hx, -hy, -90.0), (hx, hy, 0.0),
                       (-hx, hy, 90.0), (-hx, -hy, 180.0)):
        for s in range(seg + 1):
            a = math.radians(a0 + 90.0 * s / seg)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def _base():
    """Stopa: zaobljen pravougaonik sa zakosenom gornjom ivicom.

        prsten 0  z = 0                  pun obod
        prsten 1  z = H - chamfer        pun obod
        prsten 2  z = H                  obod uvucen za chamfer
    """
    c = BASE_CHAMFER
    r0 = _rounded_rect(BASE_W, BASE_D, BASE_CORNER_R, BASE_SEG)
    r2 = _rounded_rect(BASE_W - 2 * c, BASE_D - 2 * c, BASE_CORNER_R - c, BASE_SEG)
    n = len(r0)

    v = ([(x, y + BASE_Y_C, 0.0) for x, y in r0] +
         [(x, y + BASE_Y_C, BASE_H - c) for x, y in r0] +
         [(x, y + BASE_Y_C, BASE_H) for x, y in r2])
    fq = [list(range(n - 1, -1, -1)), list(range(2 * n, 3 * n))]
    for k in range(n):
        m = (k + 1) % n
        fq.append([k, m, n + m, n + k])
        fq.append([n + k, n + m, 2 * n + m, 2 * n + k])
    return v, fq


# ------------------------------------------------------------------ mesh

def _make_mesh(name, verts, faces, recalc=True):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.validate(verbose=False)
    me.update()
    if recalc:
        bm = bmesh.new()
        bm.from_mesh(me)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        bm.to_mesh(me)
        bm.free()
        me.update()
    return me


def _collection():
    col = bpy.data.collections.get(COLLECTION)
    if col is None:
        col = bpy.data.collections.new(COLLECTION)
        bpy.context.scene.collection.children.link(col)
    return col


def purge():
    removed = []
    for n in (BODY, SCREEN):
        o = bpy.data.objects.get(n)
        if o:
            bpy.data.objects.remove(o, do_unlink=True)
            removed.append(n)
    for m in [m for m in bpy.data.meshes if m.name in (BODY, SCREEN)]:
        bpy.data.meshes.remove(m)
    return removed


# ------------------------------------------------------------------ build

def build(normalize=True):
    purge()

    p_verts, p_faces, s_verts = _panel_and_screen()
    body_verts, body_faces = list(p_verts), [list(x) for x in p_faces]

    ranges = {"panel": (0, len(body_verts))}
    for key, (v, fq) in (("neck", _blade()), ("base", _base())):
        o = len(body_verts)
        body_verts += v
        body_faces += [[i + o for i in face] for face in fq]
        ranges[key] = (o, len(body_verts))

    yaw = math.radians(YAW_DEG)
    body_verts = [_rot_z(v, yaw) for v in body_verts]
    s_verts = [_rot_z(v, yaw) for v in s_verts]

    # centriranje + jednolika skala nad OBA mesh-a zajedno: ekran mora da ostane
    # u telu, pa se bbox racuna nad unijom, nikad po objektu
    allv = body_verts + s_verts
    lo = [min(v[i] for v in allv) for i in range(3)]
    hi = [max(v[i] for v in allv) for i in range(3)]
    ctr = [(lo[i] + hi[i]) / 2.0 for i in range(3)]
    k = (NORMALIZE_TO / max(hi[i] - lo[i] for i in range(3))) if normalize else 1.0

    def fix(v):
        return tuple((v[i] - ctr[i]) * k for i in range(3))

    body_verts = [fix(v) for v in body_verts]
    s_verts = [fix(v) for v in s_verts]

    me_body = _make_mesh(BODY, body_verts, body_faces, recalc=True)
    # ekran je otvorena ploca - recalc nema "spolja" da odredi, pa se namotaj
    # zakljucava rucno: (0,1,2,3) daje normalu -Y, tj. ka posmatracu
    me_screen = _make_mesh(SCREEN, s_verts, [[0, 1, 2, 3]], recalc=False)

    uv = me_screen.uv_layers.new(name="UVMap")
    corner_uv = {0: (0.0, 0.0), 1: (1.0, 0.0), 2: (1.0, 1.0), 3: (0.0, 1.0)}
    for loop in me_screen.loops:
        uv.data[loop.index].uv = corner_uv[loop.vertex_index]

    col = _collection()
    for name, me in ((BODY, me_body), (SCREEN, me_screen)):
        col.objects.link(bpy.data.objects.new(name, me))
        me.calc_loop_triangles()

    return {
        "objects": [BODY, SCREEN],
        "tris": {"body": len(me_body.loop_triangles),
                 "screen": len(me_screen.loop_triangles),
                 "total": len(me_body.loop_triangles) + len(me_screen.loop_triangles)},
        "verts": {"body": len(me_body.vertices), "screen": len(me_screen.vertices)},
        "vert_ranges": ranges,
        "mesh_bbox_gltf_xyz": [round((hi[0] - lo[0]) * k, 4),
                               round((hi[2] - lo[2]) * k, 4),
                               round((hi[1] - lo[1]) * k, 4)],
        "normalize_scale": round(k, 6),
        "body_uv_layers": [u.name for u in me_body.uv_layers],
        "screen_uv_layers": [u.name for u in me_screen.uv_layers],
        "screen_offaxis_deg": round(screen_offaxis_deg(), 3),
        "tilt_deg": TILT_DEG, "yaw_deg": YAW_DEG,
        "proportions": verify_proportions(ranges),
    }


# ------------------------------------------------------------------ merenje

def verify_proportions(ranges):
    """Izmeri svih sedam odnosa IZ GOTOVOG MESH-A, ne iz konstanti.

    Sve mere su rastojanja izmedju konkretnih temena ili raspon po Z. Ceo lanac
    transformacija je kruta rotacija plus JEDNOLIKA skala, pa rastojanja trpe
    samo faktor k - a k se skrati cim se sve podeli sa W. Zato merenje ne mora
    da vraca mesh u prostor gradnje: odnosi su tu vec tacni.

    Z raspon je iskoristiv iz istog razloga: yaw je oko Z pa ga ne dira, a
    nagib panela je oko X i baze se ne tice.
    """
    me = bpy.data.objects[BODY].data
    ms = bpy.data.objects[SCREEN].data
    V = [v.co for v in me.vertices]
    S = [v.co for v in ms.vertices]

    def d(a, b):
        return (a - b).length

    W = d(S[0], S[1])
    p0, p1 = ranges["panel"]
    n0, n1 = ranges["neck"]
    b0, b1 = ranges["base"]

    back = p0 + 16 + 12          # pocetak zadnje mreze 4x4
    nseg = (b1 - b0) // 3        # temena po prstenu baze

    panel_z = [V[i].z for i in range(p0, p1)]
    base_z = [V[i].z for i in range(b0, b1)]

    # obod baze, prsten 0: BR luk 0..seg, TR seg+1..2seg+1, TL .., BL ..
    s = BASE_SEG
    bw = d(V[b0 + s], V[b0 + 3 * (s + 1)])          # (+w/2,-hy) <-> (-w/2,-hy)
    bd = d(V[b0 + 0], V[b0 + 2 * (s + 1) - 1])      # (hx,-d/2) <-> (hx,+d/2)

    r = {
        "screen_W_world": round(W, 5),
        "screen_H_world": round(d(S[1], S[2]), 5),
        "screen_aspect": round(W / d(S[1], S[2]), 6),
        "screen_aspect_target": round(16.0 / 9.0, 6),
        "bezel_side_L": d(V[p0 + 4], V[p0 + 5]) / W,
        "bezel_side_R": d(V[p0 + 6], V[p0 + 7]) / W,
        "bezel_top": d(V[p0 + 9], V[p0 + 13]) / W,
        "bezel_chin": d(V[p0 + 1], V[p0 + 5]) / W,
        "panel_thickness": d(V[p0 + 5], V[back + 5]) / W,
        "neck_width": d(V[n0 + 0], V[n0 + 1]) / W,
        "neck_thickness": d(V[n0 + 1], V[n0 + 2]) / W,
        "gap_base_to_panel": (min(panel_z) - max(base_z)) / W,
        "base_width": bw / W,
        "base_depth": bd / W,
        "base_thickness": (max(base_z) - min(base_z)) / W,
        "base_perimeter_verts": nseg,
        "recess_world": round(RECESS * W, 5),
        "recess_over_panel_depth": round(RECESS / PANEL_D, 4),
    }
    for key in list(r):
        if isinstance(r[key], float) and key.startswith(("bezel", "panel", "neck",
                                                         "gap", "base_w", "base_d",
                                                         "base_t")):
            r[key] = round(r[key], 5)
    return r
