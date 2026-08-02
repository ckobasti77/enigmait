"""FAZA C / blocking: `branding` - bilbord panel na dve noge.

SAMO BLOCKING. Bez bevela, bez weighted normals, bez AO bake-a, bez exporta.
Sve je ravan shading i eksplicitna geometrija (`from_pydata`) - nijedan modifier
i nijedan `bpy.ops.mesh.*`, pa je rezultat deterministican i idempotentan.

DVA MESH-A OD POCETKA (SECTION_SPEC, odluka 4 amandman):
  BODY   "branding"          panel + noge + spona + staza, JEDAN mesh, BEZ UV-ova
  SCREEN "branding_screen"   ravna ploca, UV 0-1 na pun opseg

ZASTO OVAJ MODEL NE SME DA LICI NA UREDJAJ
------------------------------------------
Monitor, telefon i tablet su ista recenica izgovorena tri puta: zaobljena,
tanka, samostojeca ploca. Cetvrti takav objekat obara celu sekciju. Bilbord se
zato gradi po suprotnom nacelu - OSTAR i KONSTRUKCIJSKI:

    radijus uglova   0.008 W   protiv 0.075 W na stopi monitora
    nosac            dva stuba i poprecna spona, ne jedan vrat i stopa
    detalj           servisna staza sa ogradom - stvar koju nijedan uredjaj nema

Bevel na kraju lanca je 0.0012 rel (0.0024 sveta) - traka za specular, ne
zaobljenje. Sve preko toga bi vratilo model u porodicu uredjaja.

PROPORCIJE - sve u jedinicama W = SIRINA PANELA
----------------------------------------------
    okvir oko ekrana   0.018   jednako sa sve cetiri strane
    debljina panela    0.020   radijus uglova       0.008
    noge        0.022 x 0.030  razmak nogu          0.440
    pad nogu           0.340   spona ispod panela   0.180
    staza dubina       0.050   ograda visina        0.020

TROSTRUKI SUKOB 3:1 - I ZASTO JE RESEN U KORIST EKRANA
------------------------------------------------------
Zadatak trazi tri stvari koje se ISKLJUCUJU: panel 3:1, okvir jednak sa sve
cetiri strane, i ekran tacno 3:1. Za pravougaonik spoljne mere W x H sa
jednakim obodom b, unutrasnji odnos je (W - 2b)/(H - 2b), sto je za W/H = 3 i
b > 0 UVEK vece od 3. Dve od tri mogu, sve tri ne mogu.

Ispunjeni su okvir i EKRAN, panel je zrtvovan: `SCREEN_H` se izvodi iz
`SCREEN_W / 3`, `PANEL_H` iz `SCREEN_H + 2*BEZEL`, pa panel izlazi na 2.799:1
umesto 3:1 - 6.7% odstupanja na proporciji koja se opisuje recima. Obrnut izbor
bi razvukao SVAKU sliku koja ikad ode na ovaj bilbord za 8% po sirini, trajno i
na svakoj disciplini. To je ista logika po kojoj `build_web_development`
izvodi `SCREEN_H = SCREEN_W * 9/16` umesto da je kuca.

ZAOKRET
-------
Kamera je fiksna za svih sest (SECTION_SPEC sekcija 3), pa je orijentacija deo
modela. Bilbord stoji USPRAVNO - nagiba unazad nema, jer nagib je gest uredjaja
koji se gleda iz blizine, a bilbord se gleda odozdo i stoji pravo. Bez nagiba
donja granica ugla van-ose je sama elevacija kamere (18.542), pa `YAW_DEG`
= -16 daje 21.3 - koliko se sa ovim kadrom uopste moze dobiti a da model ostane
uspravan. Isti broj i isti razlog kao `build_seo_geo`, koji je takodje bez nagiba.

PAZI NA ZNAK. Kamera stoji na azimutu -116.565, a normala ekrana na `-90 + yaw`,
pa je VODORAVNI zaokret prema kameri `26.565 + YAW_DEG` - dakle 10.6 stepeni, ne
16. Negativniji yaw okrece panel KA kameri i cini ga frontalnijim; da model
deluje jace okrenut, yaw mora ka nuli, ne dalje od nje. Konvencija 15-18 sa
negativnim znakom je zajednicka za svih sest i zato se ovde ne razilazi.

Bez logoa, bez teksta, bez glifova - to zivi iskljucivo u slici ekrana.
"""

import bpy
import bmesh
import math

BODY = "branding"
SCREEN = "branding_screen"
COLLECTION = "PILOT"

# ------------------------------------------------------------------ mere (u W)

PANEL_W = 1.0                             # W - jedinica celog modula
BEZEL = 0.018                             # jednako sa sve cetiri strane

SCREEN_W = PANEL_W - 2.0 * BEZEL
SCREEN_H = SCREEN_W / 3.0                 # IZVEDENO. 3:1 tacno.
PANEL_H = SCREEN_H + 2.0 * BEZEL          # IZVEDENO -> panel 2.799:1

PANEL_D = 0.020
CORNER_R = 0.008                          # skoro ostro
CORNER_SEG = 2                            # 2 faceta po uglu; luk je 5 px u kadru

#: Otvor ekrana je OSTAR pravougaonik, ne zaobljen: konstantan obod od 0.018 oko
#: ugla poluprecnika 0.008 matematicki trazi unutrasnji poluprecnik 0.008-0.018,
#: tj. negativan. Prsten otvora zato nosi isti broj tacaka kao spoljni obod
#: (pa je okvir cist quad-strip), ali su tri tacke po uglu razmaknute duz same
#: ivice otvora za `OPEN_CORNER_E` umesto da leze na luku. Bez tog razmaka
#: tacke bi se poklopile i bevel bi pukao na nultoj ivici.
OPEN_CORNER_E = 0.010

RECESS = 0.006                            # ekran iza ravni okvira (30% debljine)
CAVITY_D = 0.010                          # dno dzepa

PANEL_FRONT_Y = 0.0
PANEL_BACK_Y = PANEL_FRONT_Y + PANEL_D
PANEL_Z0 = 0.0
PANEL_Z1 = PANEL_Z0 + PANEL_H

# ------------------------------------------------------------------ nosac

LEG_W = 0.022                             # po X
LEG_D = 0.030                             # po Y
LEG_SPACING = 0.44                        # razmak osa stubova
LEG_DROP = 0.34                           # koliko vire ispod panela
LEG_EMBED_Z = 0.09                        # koliko se penju IZA panela

#: Noge ulaze u telo panela 0.006 umesto da im prednja ravan sedne na zadnju
#: ravan panela. Koplanarne povrsine su tacno ono na cemu i bevel i AO bake
#: prave artefakte - presek je jeftiniji i nevidljiv.
LEG_Y0 = PANEL_BACK_Y - 0.006
LEG_Y1 = LEG_Y0 + LEG_D
LEG_Z0 = PANEL_Z0 - LEG_DROP
LEG_Z1 = PANEL_Z0 + LEG_EMBED_Z

BRACE_DROP = 0.18                         # centar spone ispod panela
BRACE_H = 0.016
BRACE_D = 0.018
BRACE_Z_C = PANEL_Z0 - BRACE_DROP
BRACE_Y_C = LEG_Y0 + LEG_D / 2.0
BRACE_X = LEG_SPACING / 2.0 + LEG_W / 2.0  # do spoljnih ravni stubova

# ------------------------------------------------------------------ servisna staza

DECK_DEPTH = 0.05                         # koliko vire ISPRED panela
DECK_T = 0.007
DECK_INSET_X = 0.02                       # uza od panela - opet protiv koplanarnosti
DECK_TOP_Z = PANEL_Z0 + 0.001
DECK_Y0 = PANEL_FRONT_Y - DECK_DEPTH
DECK_Y1 = PANEL_BACK_Y - 0.006
DECK_X = PANEL_W / 2.0 - DECK_INSET_X

#: Ograda je NAMERNO niska. Prava bi bila oko 0.06 W, ali kamera stoji na
#: elevaciji 18.542 i sve sto je ispred ravni ekrana pada u kadru za
#: `dubina * tan(18.542)`. Vrh ograde je 0.024 iznad dna panela a 0.049 ispred
#: ekrana, pa se projektuje na 0.0076 - ispod donje ivice ekrana (0.018) sa
#: rezervom od 0.010 W. Visa ograda bi presekla sliku po dnu na svih sest
#: disciplina, i to je jedini razlog za ovaj broj.
RAIL_H = 0.020                            # visina stubica iznad staze
RAIL_BAR = 0.006                          # presek rukohvata
POST_S = 0.007                            # presek stubica
POST_N = 9
RAIL_X = DECK_X
POST_X = RAIL_X - 0.02
RAIL_Y_C = DECK_Y0 + POST_S

TILT_DEG = 0.0                            # uspravno, bez nagiba unazad
YAW_DEG = -16.0                           # 15-18 kao ostali modeli
NORMALIZE_TO = 2.0                        # najduza osa (SECTION_SPEC sekcija 3)

#: Kamera iz SECTION_SPEC sekcije 3, Blender Z-up.
CAM_POS = (-3.2, -6.4, 2.4)


# ------------------------------------------------------------------ provera zaokreta

def screen_offaxis_deg():
    """Ugao izmedju normale ekrana i pravca ka kameri, u stepenima.

    Bez nagiba je donja granica sama elevacija kamere (18.542) - nijedan yaw ne
    moze ispod nje, pa je kriterijum ovde "sto blize 18.5", ne 15-20.
    """
    t, y = math.radians(TILT_DEG), math.radians(YAW_DEG)
    n = _rot_z(_rot_x((0.0, -1.0, 0.0), -t), y)
    r = math.sqrt(sum(c * c for c in CAM_POS))
    c = tuple(v / r for v in CAM_POS)
    dot = max(-1.0, min(1.0, sum(a * b for a, b in zip(n, c))))
    return math.degrees(math.acos(dot))


def rail_clearance_w():
    """Koliko ograda promasi donju ivicu ekrana, u W. Mora biti > 0.

    Racun je projekcija: tacka `d` ispred ravni ekrana i `h` iznad dna panela
    pada u kadru na `h - d*tan(elevacija)`.
    """
    el = math.asin(CAM_POS[2] / math.sqrt(sum(c * c for c in CAM_POS)))
    top_z = DECK_TOP_Z + RAIL_H + RAIL_BAR / 2.0
    depth = (PANEL_FRONT_Y + RECESS) - (RAIL_Y_C - RAIL_BAR / 2.0)
    return round((PANEL_Z0 + BEZEL) - (top_z - depth * math.tan(el)), 5)


# ------------------------------------------------------------------ transformacije

def _rot_x(p, a):
    ca, sa = math.cos(a), math.sin(a)
    return (p[0], p[1] * ca - p[2] * sa, p[1] * sa + p[2] * ca)


def _rot_z(p, a):
    ca, sa = math.cos(a), math.sin(a)
    return (p[0] * ca - p[1] * sa, p[0] * sa + p[1] * ca, p[2])


# ------------------------------------------------------------------ obodi

def _round_rect_ring(w, h, r, seg):
    """Obod zaobljenog pravougaonika u ravni XZ, CCW, 4*(seg+1) tacaka.

    Uglovi idu redom (+x,-z), (+x,+z), (-x,+z), (-x,-z), pa je tacka `c*(seg+1)`
    uvek pocetak luka a `c*(seg+1)+seg` njegov kraj - i to je jedini redosled na
    koji se `verify_proportions` oslanja.
    """
    hx, hz = w / 2.0 - r, h / 2.0 - r
    pts = []
    for cx, cz, a0 in ((hx, -hz, -90.0), (hx, hz, 0.0),
                       (-hx, hz, 90.0), (-hx, -hz, 180.0)):
        for k in range(seg + 1):
            a = math.radians(a0 + 90.0 * k / seg)
            pts.append((cx + r * math.cos(a), cz + r * math.sin(a)))
    return pts


#: Za svaki ugao: pravac duz ivice na kojoj luk POCINJE i one na kojoj se
#: ZAVRSAVA, oba od ugla ka sredini stranice. Isti CCW redosled kao gore.
_OPEN_DIRS = (((-1.0, 0.0), (0.0, 1.0)),
              ((0.0, -1.0), (-1.0, 0.0)),
              ((1.0, 0.0), (0.0, -1.0)),
              ((0.0, 1.0), (1.0, 0.0)))


def _opening_ring(w, h, e, seg):
    """Obod OSTROG pravougaonika sa istim brojem tacaka kao `_round_rect_ring`.

    Tacke po uglu se razvlace duz L putanje (ivica -> ugao -> ivica) ukupne
    duzine `2e`, pa se svaka tacka spoljneg luka spari sa jednom unutrasnjom i
    okvir ispada kao obican quad-strip, bez ijednog trougla i bez nulte ivice.
    """
    hx, hz = w / 2.0, h / 2.0
    pts = []
    for (sx, sz), (sd, ed) in zip(((1, -1), (1, 1), (-1, 1), (-1, -1)),
                                  _OPEN_DIRS):
        kx, kz = sx * hx, sz * hz
        for k in range(seg + 1):
            s = 2.0 * e * k / seg
            d, t = (sd, e - s) if s <= e else (ed, s - e)
            pts.append((kx + d[0] * t, kz + d[1] * t))
    return pts


# ------------------------------------------------------------------ panel + ekran

def _panel_and_screen():
    """Panel sa dzepom i ostrim otvorom + ploca ekrana.

        0 .. n-1     prednji spoljni obod   (zaobljen pravougaonik)
        n .. 2n-1    prednji obod otvora
        2n .. 3n-1   zadnji spoljni obod
        3n .. 4n-1   dno dzepa
    """
    n_out = _round_rect_ring(PANEL_W, PANEL_H, CORNER_R, CORNER_SEG)
    n_in = _opening_ring(SCREEN_W, SCREEN_H, OPEN_CORNER_E, CORNER_SEG)
    zc = PANEL_Z0 + PANEL_H / 2.0

    verts = ([(x, PANEL_FRONT_Y, z + zc) for x, z in n_out] +
             [(x, PANEL_FRONT_Y, z + zc) for x, z in n_in] +
             [(x, PANEL_BACK_Y, z + zc) for x, z in n_out] +
             [(x, PANEL_FRONT_Y + CAVITY_D, z + zc) for x, z in n_in])

    n = len(n_out)
    FO, FI, BO, PI = 0, n, 2 * n, 3 * n
    faces = []
    for k in range(n):
        m = (k + 1) % n
        faces.append([FO + k, FO + m, FI + m, FI + k])   # okvir
        faces.append([FO + k, BO + k, BO + m, FO + m])   # bok
        faces.append([FI + k, FI + m, PI + m, PI + k])   # zid dzepa
    faces.append(list(range(BO, BO + n)))                # ledja
    faces.append(list(range(PI, PI + n)))                # dno dzepa

    sy = PANEL_FRONT_Y + RECESS
    sx, sz0 = SCREEN_W / 2.0, PANEL_Z0 + BEZEL
    sz1 = sz0 + SCREEN_H
    s_verts = [(-sx, sy, sz0),      # dole-levo   -> uv (0,0)
               (sx, sy, sz0),       # dole-desno  -> uv (1,0)
               (sx, sy, sz1),       # gore-desno  -> uv (1,1)
               (-sx, sy, sz1)]      # gore-levo   -> uv (0,1)
    return verts, faces, s_verts


# ------------------------------------------------------------------ kutije

def _box(x0, x1, y0, y1, z0, z1):
    """Kvadar. Redosled temena je ugovor - `verify_proportions` meri preko njega:
    0-3 donji obod (CCW gledano odozgo), 4-7 gornji, oba pocinju u (x0,y0)."""
    v = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
         (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
    f = [[0, 1, 2, 3], [7, 6, 5, 4],
         [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]]
    return v, f


def _legs():
    """Dva uspravna stuba. Vracaju se kao dva zasebna dela da bi se razmak
    merio izmedju ODGOVARAJUCIH temena, a ne preko bbox-a."""
    hw = LEG_W / 2.0
    out = []
    for sx in (-1.0, 1.0):
        cx = sx * LEG_SPACING / 2.0
        out.append(_box(cx - hw, cx + hw, LEG_Y0, LEG_Y1, LEG_Z0, LEG_Z1))
    return out


def _brace():
    """Jedna poprecna spona. Bez nje panel lebdi na dva stapa - u siluetnom
    prolazu su dve paralelne linije bez veze najgori moguc citljiv oblik."""
    return _box(-BRACE_X, BRACE_X,
                BRACE_Y_C - BRACE_D / 2.0, BRACE_Y_C + BRACE_D / 2.0,
                BRACE_Z_C - BRACE_H / 2.0, BRACE_Z_C + BRACE_H / 2.0)


def _deck():
    """Servisna staza duz donje ivice panela, konzolno ka posmatracu."""
    return _box(-DECK_X, DECK_X, DECK_Y0, DECK_Y1,
                DECK_TOP_Z - DECK_T, DECK_TOP_Z)


def _railing():
    """Rukohvat, srednja preca i `POST_N` stubica.

    Dve prece a ne jedna: jedna se cita kao sipka polozena u vazduh, dve kao
    ograda. To je cela razlika izmedju detalja i stapa.
    """
    parts = []
    hy0, hy1 = RAIL_Y_C - RAIL_BAR / 2.0, RAIL_Y_C + RAIL_BAR / 2.0
    for frac in (1.0, 0.5):
        zc = DECK_TOP_Z + RAIL_H * frac
        parts.append(_box(-RAIL_X, RAIL_X, hy0, hy1,
                          zc - RAIL_BAR / 2.0, zc + RAIL_BAR / 2.0))
    hp = POST_S / 2.0
    for i in range(POST_N):
        x = -POST_X + 2.0 * POST_X * i / (POST_N - 1)
        parts.append(_box(x - hp, x + hp, RAIL_Y_C - hp, RAIL_Y_C + hp,
                          DECK_TOP_Z, DECK_TOP_Z + RAIL_H))
    return parts


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

    leg_a, leg_b = _legs()
    rail_parts = _railing()
    parts = [("leg_l", leg_a), ("leg_r", leg_b),
             ("brace", _brace()), ("deck", _deck()),
             ("rail_top", rail_parts[0]), ("rail_mid", rail_parts[1])]
    parts += [("post_%d" % i, rail_parts[2 + i]) for i in range(POST_N)]

    for key, (v, fq) in parts:
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
        "rail_clearance_w": rail_clearance_w(),
        "tilt_deg": TILT_DEG, "yaw_deg": YAW_DEG,
        "proportions": verify_proportions(ranges),
    }


# ------------------------------------------------------------------ merenje

def verify_proportions(ranges):
    """Izmeri sve odnose IZ GOTOVOG MESH-A, ne iz konstanti.

    Ceo lanac transformacija je rotacija oko Z plus JEDNOLIKA skala, pa:
      - rastojanja trpe samo faktor k, koji se skrati deljenjem sa W;
      - Z se ne dira uopste, pa visine mogu direktno;
      - X i Y se mesaju, pa se sirine i dubine mere kao PROJEKCIJE na osu
        `u` (lokalni +x, uzet iz donje ivice ekrana) i na `nf` = u x Z
        (normala panela, ka posmatracu). Bez toga bi yaw ulazio u svaku meru.
    """
    from mathutils import Vector

    me = bpy.data.objects[BODY].data
    ms = bpy.data.objects[SCREEN].data
    V = [v.co for v in me.vertices]
    S = [v.co for v in ms.vertices]

    u = (S[1] - S[0]).normalized()
    nf = u.cross(Vector((0.0, 0.0, 1.0)))       # ka posmatracu (lokalni -y)

    def span(rng, axis):
        a, b = rng
        p = [axis.dot(V[i]) for i in range(a, b)]
        return min(p), max(p)

    def d(a, b):
        return (a - b).length

    p0, p1 = ranges["panel"]
    px0, px1 = span(ranges["panel"], u)
    W = px1 - px0
    pn0, pn1 = span(ranges["panel"], nf)
    panel_z = [V[i].z for i in range(p0, p1)]

    sx = [u.dot(s) for s in S]
    sz = [s.z for s in S]

    l0 = ranges["leg_l"][0]
    r0 = ranges["leg_r"][0]
    b0, b1 = ranges["brace"]
    dk = ranges["deck"]
    rt = ranges["rail_top"]

    brace_z = [V[i].z for i in range(b0, b1)]
    leg_z = [V[i].z for i in range(ranges["leg_l"][0], ranges["leg_r"][1])]
    rail_z = [V[i].z for i in range(ranges["rail_top"][0],
                                    ranges["post_%d" % (POST_N - 1)][1])]
    deck_z = [V[i].z for i in range(dk[0], dk[1])]
    post = ranges["post_0"]

    r = {
        "screen_W_world": round(d(S[0], S[1]), 5),
        "screen_H_world": round(d(S[1], S[2]), 5),
        "screen_aspect": round(d(S[0], S[1]) / d(S[1], S[2]), 6),
        "screen_aspect_target": 3.0,
        "panel_W_world": round(W, 5),
        "panel_aspect": round(W / (max(panel_z) - min(panel_z)), 6),
        "bezel_left": (min(sx) - px0) / W,
        "bezel_right": (px1 - max(sx)) / W,
        "bezel_bottom": (min(sz) - min(panel_z)) / W,
        "bezel_top": (max(panel_z) - max(sz)) / W,
        "panel_thickness": (pn1 - pn0) / W,
        "corner_radius": d(V[p0 + 0], V[p0 + CORNER_SEG]) / math.sqrt(2.0) / W,
        "leg_width": d(V[l0 + 0], V[l0 + 1]) / W,
        "leg_depth": d(V[l0 + 1], V[l0 + 2]) / W,
        "leg_spacing": d(V[l0 + 0], V[r0 + 0]) / W,
        "leg_drop_below_panel": (min(panel_z) - min(leg_z)) / W,
        "brace_below_panel": (min(panel_z) - (min(brace_z) + max(brace_z)) / 2.0) / W,
        "brace_height": (max(brace_z) - min(brace_z)) / W,
        "brace_depth": d(V[b0 + 1], V[b0 + 2]) / W,
        "deck_depth_forward": (span(dk, nf)[1] - pn1) / W,
        "deck_thickness": (max(deck_z) - min(deck_z)) / W,
        "deck_width": (span(dk, u)[1] - span(dk, u)[0]) / W,
        "rail_height_over_deck": (max(rail_z) - max(deck_z)) / W,
        "rail_bar_section": d(V[rt[0] + 1], V[rt[0] + 2]) / W,
        "post_section": d(V[post[0] + 0], V[post[0] + 1]) / W,
        "post_count": POST_N,
        "rail_clearance_under_screen": rail_clearance_w(),
    }
    for key, val in list(r.items()):
        if isinstance(val, float) and key not in ("screen_aspect", "panel_aspect",
                                                  "screen_aspect_target"):
            r[key] = round(val, 5)
    return r
