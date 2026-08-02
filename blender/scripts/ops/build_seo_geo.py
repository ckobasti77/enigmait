"""FAZA C / blocking: `seo-geo` - masinska lupa sa staklenim socivom.

SAMO BLOCKING. Bez bevela, bez weighted normals, bez AO bake-a, bez exporta.
Sve je eksplicitna geometrija (`from_pydata`) - nijedan modifier i nijedan
`bpy.ops.mesh.*`, pa je rezultat deterministican i idempotentan. Isti obrazac
kao `build_web_development`, drugi predmet.

DVA MESH-A OD POCETKA (SECTION_SPEC, odluka 4 amandman):
  BODY   "seo-geo"          obruc + spojnica + drska + nazubljeni pojas
  SCREEN "seo-geo_screen"   SOCIVO - bikonveksna staklena leca

JEDINI MODEL BEZ IJEDNOG UV-a
-----------------------------
Kod ostalih pet je `*_screen` ravna ploca sa UV-ovima na koju kod kaci sliku.
Ovde taj isti slot nosi STAKLO: socivo nema teksturu, materijal mu je
`MeshPhysicalMaterial` sa `transmission` (SECTION_SPEC sekcija 3, `seo-geo`
sme 4 draw call-a bas zbog njega). Zato nijedan primitiv u ovom fajlu nema
`TEXCOORD_0` - ni telo ni socivo - i `screenImage` za ovaj kljuc je nekoriscen.
Slot se NE preimenuje i NE dodaje se treci primitiv: ugovor podataka
(`constants/disciplines.ts`) zna za tacno dva mesh-a po modelu, a razliku nosi
novo polje `screenKind: "display" | "lens"`.

PROPORCIJE - sve u jedinicama W = PRECNIK SOCIVA
-----------------------------------------------
    socivo        1.000 precnik, bikonveksno, ispupcenje 0.055 sa svake strane
    obruc         1.100 spoljni precnik, dubina 0.160, DVA stepenika
    zljeb         0.014 sirok, 0.012 dubok, izmedju obruca i sociva
    spojnica      0.120 duga, stepenasta
    drska         1.150 duga, 0.200 precnik kod vrata -> 0.240 na kraju
    nazubljenje   0.450 dug pojas, 56 pravih paralelnih zlebova, 0.009 duboki

`BORE_R` se IZVODI kao `RING_OUT_R` minus svi stepenici i zljeb, nikad se ne
kuca - tako sabiranje profila ne moze da se raziđe sa otvorom kroz koji se
socivo vidi, i `LENS_EMBED` (koliko socivo ulazi u obruc) ispada kao posledica
a ne kao jos jedan slobodan broj.

STEPENAST PROFIL JE CEO ARGUMENT OBRUCA. Ravan prsten oko sociva je naocare;
dva stepenika sa ravnim gazistima i uspravnim celima su tokareni komad. Zato
gazista (0.018 / 0.016) i cela (0.030 / 0.024) NISU jednaka - jednaka bi se
citala kao navoj, a ne kao dva reza.

ZLJEB JE PREDVIDJENO MESTO ZA CYAN, NE CYAN
-------------------------------------------
Ovaj model nema ekran, pa nema ni izvor cyana kakav ostalih pet imaju. Umesto
toga: tanak prstenast zljeb UNUTAR obruca, tacno izmedju poslednjeg stepenika i
ivice sociva. U kodu on dobija emissive prsten (`InstancedMesh`, isti obrazac
kao svuda) i cita se kao osvetljena lupa. U GLB-u je SAMO geometrija - nijedan
emissive materijal ne izlazi iz Blendera (SECTION_SPEC: "sve cyan je
proceduralno u kodu").

Dno zljeba (`-0.014`) je ISPRED ravni u kojoj socivo ulazi u otvor, pa je kanal
otvoren ka posmatracu iz kadra sekcije 3 i emissive prsten ima sta da osvetli.

NAZUBLJENJE - zasto zaseban omotac i zasto PRAVO
------------------------------------------------
Zubci su PRAVI paralelni zlebovi duz ose drske, ne romboidni: romboidno
nazubljenje trazi dve ukrstene familije rezova, pojede duplo trouglova, a na
400px se od pravog ne razlikuje ni za piksel.

Pojas je ZASEBAN zatvoren omotac u istom mesh-u (isti obrazac kao olovka kod
`ui-ux-design` ili sine kod telefona), ne modulacija radijusa same drske. Razlog
je cena: da drska nosi zubce, ceo bi bareljef morao da ide na `KNURL_SEG` (112)
uglova, pa bi i svaki stepenik spojnice kostao 112 ivica umesto `SEG` (48).
Ovako visoka ugaona rezolucija zivi samo tamo gde se zaista koristi.

Pojas STOJI IZNAD povrsine drske: dno zleba je `KNURL_STANDOFF` iznad nje, vrh
zupca jos `KNURL_DEPTH` iznad toga. Da je dno zleba u ravni sa drskom ili ispod
nje, cilindar drske bi virio kroz zlebove. Nakovan pojas koji stoji malo iznad
tela je i fizicki tacan - nakivanje istiskuje materijal napolje.

POZA - rucni alat, ne lizalica na stapu
---------------------------------------
`HANDLE_ANGLE_DEG` = 35 je ugao drske od USPRAVNE ose obruca, nadole-desno u
ravni obruca. Drska u osi obruca (0 stepeni) daje lizalicu; 35 daje predmet
koji neko drzi. Ugao se meri iz gotovog mesh-a (`verify_proportions`), ne cita
iz konstante.

`YAW_DEG` = -16, u opsegu 15-18 kao ostali modeli. TILT-a nema i to je izbor:
kamera stoji na elevaciji +18.5, pa vec ona daje kosinu pod kojom se stepenici
obruca vide kao stepenici. Nagib bi tu kosinu povecao i pretvorio krug sociva u
izrazitu elipsu - a krug je ono po cemu se ovaj model prepoznaje iz siluete.

Bez logoa, bez teksta, bez glifova. Logo cipovi ispod tubusa su PLANIRAN dodatak
u kodu (SECTION_SPEC, Faza C) - ovde se ne gradi nista od toga.
"""

import bpy
import bmesh
import math

BODY = "seo-geo"
SCREEN = "seo-geo_screen"
COLLECTION = "DISCIPLINES"

# ------------------------------------------------------------------ socivo (u W)

LENS_D = 1.0
LENS_R = LENS_D / 2.0
LENS_BULGE = 0.055               # sagita jedne strane; bikonveksno
LENS_RADIAL = 6                  # radijalnih koraka od temena do oboda, po strani

# ------------------------------------------------------------------ obruc (u W)

RING_OUT_D = 1.10
RING_OUT_R = RING_OUT_D / 2.0
RING_DEPTH = 0.16
RING_Y0 = -RING_DEPTH / 2.0      # prednja ravan, ka posmatracu
RING_Y1 = +RING_DEPTH / 2.0

STEP_A_TREAD = 0.018             # gaziste prvog stepenika
STEP_A_RISE = 0.030              # celo prvog stepenika
STEP_B_TREAD = 0.016
STEP_B_RISE = 0.024
SHELF_LIP = 0.008                # ravna traka pre zljeba

GROOVE_W = 0.014                 # zljeb za cyan
GROOVE_D = 0.012

#: IZVEDENO: sve sto profil pojede od spoljnog radijusa je otvor kroz koji se
#: socivo vidi. Zato se ne kuca - i zato `LENS_EMBED` ispada sam.
BORE_R = RING_OUT_R - STEP_A_TREAD - STEP_B_TREAD - SHELF_LIP - GROOVE_W
LENS_EMBED = LENS_R - BORE_R     # koliko obod sociva ulazi u obruc

#: Meridijan obruca, zatvorena petlja (r, y), od spoljne prednje ivice ka unutra
#: pa nazad. Revolucija zatvorene petlje daje manifold po konstrukciji - nema
#: kapa i nema sta da se zaboravi.
BEZEL_PROFILE = [
    (RING_OUT_R, RING_Y0),                                            # 0
    (RING_OUT_R - STEP_A_TREAD, RING_Y0),                             # 1
    (RING_OUT_R - STEP_A_TREAD, RING_Y0 + STEP_A_RISE),               # 2
    (RING_OUT_R - STEP_A_TREAD - STEP_B_TREAD, RING_Y0 + STEP_A_RISE),  # 3
    (RING_OUT_R - STEP_A_TREAD - STEP_B_TREAD,
     RING_Y0 + STEP_A_RISE + STEP_B_RISE),                            # 4
    (BORE_R + GROOVE_W, RING_Y0 + STEP_A_RISE + STEP_B_RISE),         # 5
    (BORE_R + GROOVE_W, RING_Y0 + STEP_A_RISE + STEP_B_RISE + GROOVE_D),  # 6
    (BORE_R, RING_Y0 + STEP_A_RISE + STEP_B_RISE + GROOVE_D),         # 7
    (BORE_R, RING_Y1),                                                # 8
    (RING_OUT_R, RING_Y1),                                            # 9
]

# ------------------------------------------------------------------ spojnica + drska (u W)

#: Sve mere duz ose drske su `t` = rastojanje od centra obruca. Spojnica pocinje
#: UNUTAR obruca (`COLLAR_EMBED_T` < `RING_OUT_R`) pa nema koplanarnih lica ni
#: z-fighting-a; vidljiva duzina se meri od spoljne povrsine obruca i izlazi
#: tacno `COLLAR_LEN`.
COLLAR_EMBED_T = 0.520
COLLAR_LEN = 0.12
COLLAR_END_T = RING_OUT_R + COLLAR_LEN

#: Stopalo spojnice mora da stane u DUBINU obruca (0.08 poluprecnika), inace
#: prsten kroz njega viri sa prednje i zadnje strane. Odatle rastuci stepenici
#: do vrata drske - spojnica se SIRI, jer je drska deblja nego sto je obruc
#: dubok, i to je razlika izmedju obradjenog spoja i zalepljenog stapa.
COLLAR_R0 = 0.074
COLLAR_R1 = 0.092
COLLAR_R2 = 0.112
COLLAR_T1 = 0.566
COLLAR_T2 = 0.606

HANDLE_T0 = COLLAR_END_T
HANDLE_LEN = 1.15
HANDLE_T1 = HANDLE_T0 + HANDLE_LEN
HANDLE_R_NECK = 0.10             # precnik 0.20 kod vrata
HANDLE_R_END = 0.12              # precnik 0.24 na kraju

#: Profil (t, r) spojnice i drske kao JEDAN rotacioni solid. `r = 0` na krajevima
#: su temena kapa. Redosled je deo ugovora - `verify_proportions` meri preko
#: indeksa prstenova.
BARREL_PROFILE = [
    (COLLAR_EMBED_T, 0.0),           # teme prednje kape (u obrucu)
    (COLLAR_EMBED_T, COLLAR_R0),     # prsten 0  stopalo
    (COLLAR_T1, COLLAR_R0),          # prsten 1  gaziste 1
    (COLLAR_T1, COLLAR_R1),          # prsten 2  celo 1
    (COLLAR_T2, COLLAR_R1),          # prsten 3  gaziste 2
    (COLLAR_T2, COLLAR_R2),          # prsten 4  celo 2
    (COLLAR_END_T, COLLAR_R2),       # prsten 5  kraj spojnice
    (HANDLE_T0, HANDLE_R_NECK),      # prsten 6  rame -> vrat drske
    (HANDLE_T1, HANDLE_R_END),       # prsten 7  kraj drske
    (HANDLE_T1, 0.0),                # teme zadnje kape
]
_BARREL_NECK_RING = 6
_BARREL_END_RING = 7

# ------------------------------------------------------------------ nazubljenje (u W)

KNURL_T0 = 0.95
KNURL_LEN = 0.45
KNURL_T1 = KNURL_T0 + KNURL_LEN
KNURL_COUNT = 56                 # 50-60 iz spec-a
KNURL_SEG = 2 * KNURL_COUNT      # jedno teme po zupcu i jedno po zlebu
KNURL_DEPTH = 0.009              # plitko: 8% poluprecnika drske
KNURL_STANDOFF = 0.002           # dno zleba iznad povrsine drske

# ------------------------------------------------------------------ poza

HANDLE_ANGLE_DEG = 35.0          # od uspravne ose obruca, nadole-desno
YAW_DEG = -16.0                  # 15-18 kao ostali modeli
TILT_DEG = 0.0                   # namerno: vidi zaglavlje
#: 40 ugaonih koraka na obrucu, drsci i socivu. Krug sociva je najveci luk na
#: modelu: precnik 0.948 sveta, tj. oko 190px kad model stoji na 400px. Tetiva
#: 40-ugla tu odstupa od kruga za 0.29px - ispod piksela, pa 48 nije kupovalo
#: nista sto se vidi, a placalo je 144 bevelovane ivice vise.
SEG = 40                         # ugaonih koraka na obrucu, drsci i socivu
NORMALIZE_TO = 2.0               # najduza osa (SECTION_SPEC sekcija 3)

#: Kamera iz SECTION_SPEC sekcije 3, Blender Z-up.
CAM_POS = (-3.2, -6.4, 2.4)


# ------------------------------------------------------------------ vektori

def _add(a, b):
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def _mul(a, k):
    return (a[0] * k, a[1] * k, a[2] * k)


def _dot(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def _norm(a):
    L = math.sqrt(_dot(a, a))
    return (a[0] / L, a[1] / L, a[2] / L)


def _rot_x(p, a):
    ca, sa = math.cos(a), math.sin(a)
    return (p[0], p[1] * ca - p[2] * sa, p[1] * sa + p[2] * ca)


def _rot_z(p, a):
    ca, sa = math.cos(a), math.sin(a)
    return (p[0] * ca - p[1] * sa, p[0] * sa + p[1] * ca, p[2])


# ------------------------------------------------------------------ osa drske

def handle_axis():
    """Jedinicni vektor drske u prostoru gradnje: nadole (-Z) i udesno (+X).

    Ravan obruca je X-Z, osa obruca je Y. `HANDLE_ANGLE_DEG` je otklon od -Z,
    pa je 0 drska pravo nadole a 90 vodoravno - i ugao ostaje citljiv kao broj.
    """
    a = math.radians(HANDLE_ANGLE_DEG)
    return (math.sin(a), 0.0, -math.cos(a))


def _handle_frame():
    """(osa, e1, e2) - ortonormirani okvir preseka drske.

    `e1` je bas osa obruca (0,1,0): upravna je na drsku po konstrukciji, jer
    drska lezi u ravni obruca. Zato okvir nema singularitet ni za jedan ugao.
    """
    w = handle_axis()
    e1 = (0.0, 1.0, 0.0)
    e2 = (-w[2], 0.0, w[0])
    return w, e1, e2


def _axis_point(t, r, ang):
    """Tacka na rotacionom solidu oko ose drske."""
    w, e1, e2 = _handle_frame()
    return _add(_mul(w, t),
                _add(_mul(e1, r * math.cos(ang)), _mul(e2, r * math.sin(ang))))


def handle_r(t):
    """Poluprecnik drske na `t`. Linearno suzenje vrat -> kraj."""
    u = (t - HANDLE_T0) / HANDLE_LEN
    return HANDLE_R_NECK + u * (HANDLE_R_END - HANDLE_R_NECK)


# ------------------------------------------------------------------ provera zaokreta

def lens_normal_world():
    """Spoljna normala sociva posle nagiba i zaokreta (jedinicna)."""
    t, y = math.radians(TILT_DEG), math.radians(YAW_DEG)
    return _rot_z(_rot_x((0.0, -1.0, 0.0), -t), y)


def lens_offaxis_deg():
    """Ugao izmedju normale sociva i pravca ka kameri, u stepenima."""
    n = lens_normal_world()
    c = _norm(CAM_POS)
    return math.degrees(math.acos(max(-1.0, min(1.0, _dot(n, c)))))


# ------------------------------------------------------------------ obruc

def _bezel():
    """Obruc: zatvorena meridijanska petlja revolvirana oko Y.

    Temena idu prsten-po-prsten (`p * SEG + j`), pa `verify_proportions` moze da
    meri stepenike kao rastojanje temena ISTOG `j` u dva susedna prstena.
    """
    n = len(BEZEL_PROFILE)
    verts, faces = [], []
    for r, y in BEZEL_PROFILE:
        for j in range(SEG):
            a = 2.0 * math.pi * j / SEG
            verts.append((r * math.cos(a), y, r * math.sin(a)))
    for p in range(n):
        q = (p + 1) % n
        for j in range(SEG):
            k = (j + 1) % SEG
            faces.append([p * SEG + j, p * SEG + k, q * SEG + k, q * SEG + j])
    return verts, faces


# ------------------------------------------------------------------ spojnica + drska

def _barrel():
    """Spojnica i drska kao jedan zatvoren rotacioni solid oko ose drske."""
    rings = BARREL_PROFILE[1:-1]
    verts, faces = [], []

    verts.append(_axis_point(BARREL_PROFILE[0][0], 0.0, 0.0))
    for t, r in rings:
        for j in range(SEG):
            verts.append(_axis_point(t, r, 2.0 * math.pi * j / SEG))
    verts.append(_axis_point(BARREL_PROFILE[-1][0], 0.0, 0.0))

    apex0 = 0
    base = 1
    apex1 = 1 + len(rings) * SEG

    for j in range(SEG):
        k = (j + 1) % SEG
        faces.append([apex0, base + k, base + j])
    for p in range(len(rings) - 1):
        a0, b0 = base + p * SEG, base + (p + 1) * SEG
        for j in range(SEG):
            k = (j + 1) % SEG
            faces.append([a0 + j, a0 + k, b0 + k, b0 + j])
    last = base + (len(rings) - 1) * SEG
    for j in range(SEG):
        k = (j + 1) % SEG
        faces.append([apex1, last + j, last + k])

    return verts, faces, {"barrel_rings": len(rings)}


# ------------------------------------------------------------------ nazubljenje

def _knurl_radius(j, t):
    """Poluprecnik zupca (`j` parno) ili dna zleba (`j` neparno) na `t`."""
    floor = handle_r(t) + KNURL_STANDOFF
    return floor + KNURL_DEPTH if j % 2 == 0 else floor


def _knurl():
    """Nazubljeni pojas: zatvoren nazubljen valjak nabijen preko drske.

        teme kape na t0
        prsten 0  t0  pun profil zubaca
        prsten 1  t1  pun profil zubaca
        teme kape na t1

    DVA PRSTENA I DVE PUNE KAPE - a bilo je sest prstenova. Skinuta su dva puta
    po dva, i oba puta je razlog isti: bevel na ovom modelu placa po IVICI, a
    pojas nosi 112 uzduznih greben-ivica po traci.

    - Ulazna i izlazna kosina (dva prstena) su dodavale dve trake zubaca, oko
      3.600 trouglova posle bevela, a na 400px se ne vide. Bez njih se pojas
      zavrsava ostrim ramenom, sto nakivan pojas i ima.
    - Otvor pojasa (jos dva prstena) je bio potpuno UNUTAR drske - nijedan
      njegov trougao se ne vidi ni iz jednog ugla - a njegova dva ugla su nosila
      224 obodne ivice, oko 1.350 trouglova posle bevela. Pune kape daju isti
      vidljivi obris: kapa ulazi u povrsinu drske i vidi se samo isti onaj venac
      izmedju vrha zupca i tela.

    Kape zato SEKU cilindar drske umesto da ga obuhvate. To je namerno i isto je
    sto radi klin kod `ui-ux-design`: presek unutar materijala nema koplanarnih
    lica, ne vidi se, i ne kosta.
    """
    rows = [[_axis_point(t, _knurl_radius(j, t), 2.0 * math.pi * j / KNURL_SEG)
             for j in range(KNURL_SEG)]
            for t in (KNURL_T0, KNURL_T1)]

    verts = [_axis_point(KNURL_T0, 0.0, 0.0)]
    for row in rows:
        verts.extend(row)
    verts.append(_axis_point(KNURL_T1, 0.0, 0.0))

    apex0, r0, r1 = 0, 1, 1 + KNURL_SEG
    apex1 = 1 + 2 * KNURL_SEG
    faces = []
    for j in range(KNURL_SEG):
        k = (j + 1) % KNURL_SEG
        faces.append([apex0, r0 + k, r0 + j])
        faces.append([r0 + j, r0 + k, r1 + k, r1 + j])
        faces.append([apex1, r1 + j, r1 + k])

    return verts, faces, {"knurl_rows": len(rows)}


# ------------------------------------------------------------------ socivo

def lens_sphere_r():
    """Poluprecnik sfere jedne kalote iz oboda i sagite. IZVEDENO."""
    return (LENS_R ** 2 + LENS_BULGE ** 2) / (2.0 * LENS_BULGE)


def _lens():
    """Bikonveksna leca: dve sferne kalote koje dele obod na y = 0.

    Zatvoren omotac, ne dve ploce: `transmission` u three.js-u racuna debljinu,
    pa staklo mora da ima zapreminu. UV-ova nema - nema sta da se mapira.
    """
    R = lens_sphere_r()
    cy = -LENS_BULGE + R

    def y_front(r):
        return cy - math.sqrt(max(0.0, R * R - r * r))

    rows = []
    for i in range(1, LENS_RADIAL + 1):                 # prednja strana ka obodu
        r = LENS_R * i / LENS_RADIAL
        rows.append((r, y_front(r)))
    for i in range(LENS_RADIAL - 1, 0, -1):             # zadnja strana, ogledalo
        r = LENS_R * i / LENS_RADIAL
        rows.append((r, -y_front(r)))

    verts = [(0.0, -LENS_BULGE, 0.0)]
    for r, y in rows:
        for j in range(SEG):
            a = 2.0 * math.pi * j / SEG
            verts.append((r * math.cos(a), y, r * math.sin(a)))
    verts.append((0.0, LENS_BULGE, 0.0))

    apex0, base = 0, 1
    apex1 = 1 + len(rows) * SEG
    faces = []
    for j in range(SEG):
        k = (j + 1) % SEG
        faces.append([apex0, base + k, base + j])
    for p in range(len(rows) - 1):
        a0, b0 = base + p * SEG, base + (p + 1) * SEG
        for j in range(SEG):
            k = (j + 1) % SEG
            faces.append([a0 + j, a0 + k, b0 + k, b0 + j])
    last = base + (len(rows) - 1) * SEG
    for j in range(SEG):
        k = (j + 1) % SEG
        faces.append([apex1, last + j, last + k])

    return verts, faces, {"lens_rows": len(rows),
                          "lens_rim_row": LENS_RADIAL - 1}


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

    body_verts, body_faces, ranges = [], [], {}

    def add(key, v, f):
        o = len(body_verts)
        body_verts.extend(v)
        body_faces.extend([[i + o for i in face] for face in f])
        ranges[key] = o

    bz_v, bz_f = _bezel()
    add("bezel", bz_v, bz_f)

    br_v, br_f, br_meta = _barrel()
    add("barrel", br_v, br_f)
    ranges.update(br_meta)

    kn_v, kn_f, kn_meta = _knurl()
    add("knurl", kn_v, kn_f)
    ranges.update(kn_meta)

    s_verts, s_faces, s_meta = _lens()
    ranges.update(s_meta)

    tilt = math.radians(TILT_DEG)
    yaw = math.radians(YAW_DEG)

    def orient(p):
        return _rot_z(_rot_x(p, -tilt), yaw)

    body_verts = [orient(p) for p in body_verts]
    s_verts = [orient(p) for p in s_verts]

    # centriranje + jednolika skala nad OBA mesh-a zajedno: socivo mora da ostane
    # u obrucu, pa se bbox racuna nad unijom, nikad po objektu
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
    me_lens = _make_mesh(SCREEN, s_verts, s_faces, recalc=True)

    col = _collection()
    for name, me in ((BODY, me_body), (SCREEN, me_lens)):
        col.objects.link(bpy.data.objects.new(name, me))
        me.calc_loop_triangles()

    return {
        "objects": [BODY, SCREEN],
        "tris": {"body": len(me_body.loop_triangles),
                 "lens": len(me_lens.loop_triangles),
                 "total": len(me_body.loop_triangles) + len(me_lens.loop_triangles)},
        "verts": {"body": len(me_body.vertices), "lens": len(me_lens.vertices)},
        "vert_ranges": ranges,
        "mesh_bbox_gltf_xyz": [round((hi[0] - lo[0]) * k, 4),
                               round((hi[2] - lo[2]) * k, 4),
                               round((hi[1] - lo[1]) * k, 4)],
        "normalize_scale": round(k, 6),
        "body_uv_layers": [u.name for u in me_body.uv_layers],
        "screen_uv_layers": [u.name for u in me_lens.uv_layers],
        "lens_offaxis_deg": round(lens_offaxis_deg(), 3),
        "tilt_deg": TILT_DEG, "yaw_deg": YAW_DEG,
        "proportions": verify_proportions(ranges),
    }


# ------------------------------------------------------------------ merenje

def verify_proportions(ranges):
    """Izmeri sve odnose IZ GOTOVOG MESH-A, ne iz konstanti.

    Ceo lanac transformacija je kruta rotacija plus JEDNOLIKA skala, pa
    rastojanja trpe samo faktor k - a k se skrati cim se sve podeli sa W, i
    uglovi ga ne osecaju uopste.
    """
    V = [v.co for v in bpy.data.objects[BODY].data.vertices]
    S = [v.co for v in bpy.data.objects[SCREEN].data.vertices]

    def d(a, b):
        return (a - b).length

    half = SEG // 2
    bz = ranges["bezel"]
    br = ranges["barrel"]
    kn = ranges["knurl"]

    def bezel(p, j=0):
        return V[bz + p * SEG + j]

    def barrel_ring(p):
        """Centar prstena `p` profila drske (prsten 0 je prvi posle temena)."""
        base = br + 1 + p * SEG
        return sum((V[base + j] for j in range(SEG)), V[0] * 0.0) / SEG

    def barrel_diam(p):
        base = br + 1 + p * SEG
        return d(V[base], V[base + half])

    def knurl_row(k_):
        return kn + 1 + k_ * KNURL_SEG          # +1: teme prednje kape

    # --- socivo
    rim = 1 + ranges["lens_rim_row"] * SEG
    W = d(S[rim], S[rim + half])
    lens_axis = (S[0] - S[len(S) - 1]).normalized()          # teme -> teme, ka posmatracu
    rim_c = sum((S[rim + j] for j in range(SEG)), S[0] * 0.0) / SEG
    bulge_front = (S[0] - rim_c).dot(lens_axis)
    bulge_back = (rim_c - S[len(S) - 1]).dot(lens_axis)

    # --- osa drske iz mesh-a
    axis = (barrel_ring(_BARREL_END_RING) - barrel_ring(0)).normalized()
    ring_c = sum((bezel(0, j) for j in range(SEG)), V[0] * 0.0) / SEG

    # Uspravna osa obruca = svetsko "gore" projektovano u ravan obruca. Ne moze
    # da se izvede iz sociva i drske same - obe leze u toj ravni, pa bi svaki
    # pravac u njoj prosao kao "uspravan"; uspravnost je svetski pojam i mora da
    # udje spolja.
    world_up = V[0] * 0.0
    world_up.z = 1.0
    up = (world_up - lens_axis * world_up.dot(lens_axis)).normalized()

    def t_of(p):
        return (barrel_ring(p) - ring_c).dot(axis)

    # --- nazubljenje, mereno iz prstena punog profila
    row_a = knurl_row(0)
    kc = sum((V[row_a + j] for j in range(KNURL_SEG)),
             V[0] * 0.0) / KNURL_SEG
    kr = [(V[row_a + j] - kc).length for j in range(KNURL_SEG)]
    kmean = sum(kr) / len(kr)
    teeth = sum(1 for j in range(KNURL_SEG)
                if kr[j] > kmean and kr[(j + 1) % KNURL_SEG] <= kmean
                and kr[(j - 1) % KNURL_SEG] <= kmean)
    row_d_c = sum((V[knurl_row(1) + j] for j in range(KNURL_SEG)),
                  V[0] * 0.0) / KNURL_SEG

    return {
        "lens_W_world": round(W, 5),
        "lens_bulge_front": round(bulge_front / W, 5),
        "lens_bulge_back": round(bulge_back / W, 5),
        "lens_sphere_r": round(lens_sphere_r(), 5),

        "ring_outer_d": round(d(bezel(0), bezel(0, half)) / W, 5),
        "ring_depth": round(d(bezel(0), bezel(9)) / W, 5),
        "ring_bore_d": round(d(bezel(7), bezel(7, half)) / W, 5),
        "step_a_tread": round(d(bezel(0), bezel(1)) / W, 5),
        "step_a_rise": round(d(bezel(1), bezel(2)) / W, 5),
        "step_b_tread": round(d(bezel(2), bezel(3)) / W, 5),
        "step_b_rise": round(d(bezel(3), bezel(4)) / W, 5),
        "shelf_lip": round(d(bezel(4), bezel(5)) / W, 5),
        "groove_depth": round(d(bezel(5), bezel(6)) / W, 5),
        "groove_width": round(d(bezel(6), bezel(7)) / W, 5),
        "lens_embed_in_bore": round(LENS_EMBED, 5),

        "collar_len_visible": round((t_of(5) / W) - (RING_OUT_R), 5),
        "collar_foot_d": round(barrel_diam(0) / W, 5),
        "collar_end_d": round(barrel_diam(5) / W, 5),
        "handle_len": round((t_of(_BARREL_END_RING)
                             - t_of(_BARREL_NECK_RING)) / W, 5),
        "handle_neck_d": round(barrel_diam(_BARREL_NECK_RING) / W, 5),
        "handle_end_d": round(barrel_diam(_BARREL_END_RING) / W, 5),

        "knurl_belt_len": round(((row_d_c - kc).dot(axis)) / W, 5),
        "knurl_teeth": teeth,
        "knurl_depth": round((max(kr) - min(kr)) / W, 5),
        "knurl_pitch": round(2.0 * math.pi * kmean / (KNURL_COUNT * W), 5),

        "handle_angle_from_ring_up_deg":
            round(math.degrees(math.acos(max(-1.0, min(1.0, axis.dot(-up))))), 3),
        "handle_in_ring_plane_dev_deg":
            round(math.degrees(math.asin(min(1.0, abs(axis.dot(lens_axis))))), 3),
        "yaw_deg_measured":
            round(math.degrees(math.atan2(lens_axis.y, lens_axis.x)) + 90.0, 3),
        "lens_offaxis_deg": round(lens_offaxis_deg(), 3),

        "seg": SEG,
        "knurl_seg": KNURL_SEG,
    }
