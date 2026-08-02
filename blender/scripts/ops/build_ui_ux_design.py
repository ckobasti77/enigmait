"""FAZA C / blocking: `ui-ux-design` - tablet koji LEBDI, sa olovkom.

SAMO BLOCKING. Bez bevela, bez weighted normals, bez AO bake-a, bez exporta.
Sve je eksplicitna geometrija (`from_pydata`) - nijedan modifier i nijedan
`bpy.ops.mesh.*`, pa je rezultat deterministican i idempotentan. Isti obrazac
kao `build_web_development` i `build_mobile_app_development`, drugi predmet.

DVA MESH-A OD POCETKA (SECTION_SPEC, odluka 4 amandman):
  BODY   "ui-ux-design"          tablet + OLOVKA, JEDAN mesh, BEZ UV-ova
  SCREEN "ui-ux-design_screen"   ravna ploca, UV 0-1 preko sopstvenog bbox-a

ZASTO JE PRVA VERZIJA ODBIJENA - i sta se ovde promenilo
--------------------------------------------------------
Prva verzija je tablet spustala na nizak kosi podmetac. Iz fiksnog kadra
(SECTION_SPEC sekcija 3) taj podmetac je citan kao STOPA MONITORA, pa je silueta
bila skoro identicna `web-development`-u. Sekcija postoji da pokaze sest
RAZLICITIH stvari; dva modela koja se mesaju su pad kriterijuma prijema, bez
obzira koliko su tacni pojedinacno.

Resenje NIJE tanji ili uzi podmetac - svako telo ispod donje ivice ploce cita se
kao postolje. Podmetac je zato UKLONJEN u celosti i model LEBDI, kao telefon.
Sve sto od njega ostaje je jedna stvar u ovom fajlu: nema `_stand()`, nema
`_seat_offset()`, ploca se nagne oko sopstvenog centra i to je ceo transform.

PROPORCIJE - sve u jedinicama W = SIRINA EKRANA
----------------------------------------------
    ekran            1.0 x 0.75 (4:3 POLOZEN, IZVEDENO)
    okvir            0.045 na sve cetiri strane
    debljina tela    0.026          radijus uglova   0.06
    zakosenje        0.007 po osi   bocna traka      0.012
    olovka           0.45 duga, 0.030 debela, jedna faseta

SIMETRICAN OKVIR. Kod monitora brada dole nosi identitet studijskog displeja;
kod tableta bi ista asimetrija napravila citac e-knjiga. `FACE_H` se zato izvodi
kao `SCREEN_H + 2*BEZEL`, ne kao zbir dva razlicita broja.

Ekran je TACNO 4:3: `SCREEN_H` se IZVODI iz `SCREEN_W` (* 3/4), nikad se ne
kuca kao broj. Export ugovor trazi tacan odnos, jer UV ide preko bbox-a ekrana.

DEBLJINA JE RAZLIKOVNI ZNAK. 0.026 W je 2.6% sirine ekrana - na tabletu od 25 cm
to je 6.5 mm. Sada nosi jos jedan posao: kad podmetaca nema, jedino po cemu se
iz profila vidi da ovo NIJE monitor jeste koliko je tanko. Sve ostale mere na
profilu su podredjene njoj - zakosenje 0.007 po osi ostavlja bocnu traku od
0.012, a to je najuza povrsina na modelu i time gornja granica bevela u Fazi B.

TRI PROFILA, JEDAN INSET LANAC (isto kao telefon)
-------------------------------------------------
    OUT    BODY_W x BODY_H   r = 0.06             bocna traka, spoljni obris
    FACE   -2*CHAMFER        r = 0.06 - CHAMFER   prednja i zadnja ravan
    SCR    -2*BEZEL          r = FACE_R - BEZEL   otvor ekrana

Uvlacenje cuva korespondenciju temena 1:1, pa se okvir i zakosenje mere kao
RASTOJANJE IZMEDJU TEMENA ISTOG INDEKSA u dva prstena. Radijus otvora ekrana
izlazi kao 0.008 W i to je TACNO - konstantno sirok okvir oko zaobljenog
pravougaonika i daje skoro ostar otvor. Nije greska nego posledica toga sto je
okvir (0.045) skoro isto sirok kao radijus tela (0.06).

POZA - ovde se odlucuje da li lici na monitor
---------------------------------------------
`TILT_DEG = 35` je nagib od USPRAVNE ravni, UNAZAD: gornja ivica ide DALJE od
kamere. Kamera stoji na elevaciji +18.5, dakle gleda odozgo, pa se ta dva ugla
sabiraju u citljivost ekrana - ravan ekrana je okrenuta ka kameri, a ne od nje.

Ono sto nagib pravi u siluetnom prolazu je vaznije od citljivosti: uspravan
pravougaonik u perspektivi ostaje pravougaonik, a nagnut postaje TRAPEZ -
gornja ivica je dalje i time kraca. Trapez koji lebdi ne moze da se pomesa sa
"pravougaonik na stopi", i to je ceo razlog zasto je bas 35 a ne 20: manji ugao
daje skoro pravougaonik, veci pretvara ekran u traku.

`YAW_DEG = -16`, u opsegu ostalih modela. Off-axis ugao izmedju normale ekrana
i pravca ka kameri izlazi na ~19 stepeni. Racuna ga `screen_offaxis_deg()` iz
samih konstanti, pa je provera deo modula a ne komentar.

Znak je bitan: `+16` bi okrenuo ekran OD kamere (off-axis preko 40) jer kamera
ne stoji na normali nego na azimutu -116.565.

OLOVKA JE DEO TELA
------------------
Isti mesh, isti material slot, drugi zatvoreni omotac pored ploce - kao sine i
modul kamere na telefonu. Ne pravi se treci objekat: ugovor exporta zna za tacno
dva primitiva (telo bez UV-ova, ekran sa UV-ovima).

Presek je krug sa JEDNOM tetivom (`FLAT_REL` = 0.86 radijusa). Faseta je ono
sto olovku cini masinskom a ne stapom: bez nje je to obican suzen valjak i
silueta je stap. Sirina fasete izlazi 0.0153 W, tj. polovina precnika.

Isti normalizovan presek se skalira na svakom prstenu, pa se faseta suzava
zajedno sa telom - kod suzenog dela to je i fizicki tacno. Tetiva je izmedju
POSLEDNJEG i PRVOG temena prstena, pa `band()` sa modulom zatvara i nju bez
posebnog slucaja.

GDE OLOVKA STOJI - i zasto ne preko sredine
-------------------------------------------
Sredina ekrana je REZERVISANA: tamo ide screenshot dizajna, i to je jedini
sadrzaj koji ovaj model ima da pokaze. Zato olovka zivi iskljucivo u donjem
desnom kvadrantu: vrh stoji nad ekranom dole-desno, a telo ide NIZ-DESNO
(`PEN_INPLANE_DEG = -35`) i izlazi iz obrisa ploce preko donje-desne ivice.

To je i tacno citanje pokreta: saka je dole-desno IZVAN tableta, olovka ulazi u
kadar spolja i staje na ekranu. Suprotan smer (gore-desno) bi telo olovke
polozio PREKO desne trecine ekrana - fizicki isto tacno, ali pojede sliku.

`PEN_ELEV_DEG = 35` je ugao prema RAVNI EKRANA. Olovka LEBDI: `PEN_GAP` je
razmak od povrsine ekrana do centra vrha, a `verify_proportions` meri STVARNI
najmanji razmak preko svih temena olovke. Ako taj broj ikad padne na nulu,
olovka dodiruje ekran i naracija je pala - odlozena olovka nije zaustavljena
olovka.

Bez logoa, bez teksta, bez glifova - to zivi iskljucivo u slici ekrana.
"""

import bpy
import bmesh
import math

BODY = "ui-ux-design"
SCREEN = "ui-ux-design_screen"
COLLECTION = "DISCIPLINES"

# ------------------------------------------------------------------ mere (u W)

SCREEN_W = 1.0
SCREEN_H = SCREEN_W * 3.0 / 4.0          # IZVEDENO. 4:3 tacno, POLOZEN.

BEZEL = 0.045                            # sve cetiri strane, simetricno
CHAMFER = 0.007                          # po osi; sirina zakosenja = *sqrt(2)
BODY_T = 0.026                           # tablet je tanak, to je razlikovni znak
CORNER_R = 0.06                          # na SPOLJNOM obrisu (bocna traka)

FACE_W = SCREEN_W + 2.0 * BEZEL
FACE_H = SCREEN_H + 2.0 * BEZEL
BODY_W = FACE_W + 2.0 * CHAMFER
BODY_H = FACE_H + 2.0 * CHAMFER
FACE_R = CORNER_R - CHAMFER
SCREEN_R = FACE_R - BEZEL
SIDE_FLAT = BODY_T - 2.0 * CHAMFER

RECESS = 0.006                           # ekran iza ravni okvira (23% debljine)
CAVITY_D = 0.014                         # dno dzepa; ostavlja 0.012 zadnjeg zida

#: Lukova po cosku. 10 umesto 8: podmetaca vise nema, pa je budzet koji je on
#: trosio slobodan, a jedini potrosac koji se na 400px stvarno vidi je obris
#: zaobljenog coska - on je na ovom modelu 0.06 W, najveci u setu.
CORNER_SEG = 10

Y_FRONT = -BODY_T / 2.0
Y_BACK = BODY_T / 2.0
Y_CH_F = Y_FRONT + CHAMFER
Y_CH_B = Y_BACK - CHAMFER

# ------------------------------------------------------------------ olovka

PEN_LEN = 0.45
PEN_R = 0.030 / 2.0
PEN_SEG = 16                             # temena po prstenu (luk + tetiva)
FLAT_REL = 0.86                          # tetiva na 0.86 R -> faseta ~0.5 D

#: (t po duzini, faktor radijusa). Suzenje je koncentrisano u prvoj trecini -
#: to je ono sto se cita kao "vrh", dok je zadnjih 10% blago suzenje kraja.
PEN_RINGS = ((0.000, 0.13), (0.035, 0.34), (0.090, 0.63), (0.170, 0.87),
             (0.270, 1.00), (0.900, 1.00), (1.000, 0.90))

#: Vrh stoji nad DONJIM DESNIM kvadrantom ekrana (ekran je +-0.5 x +-0.375), a
#: telo ide niz-desno i izlazi iz obrisa ploce (+-0.552 x +-0.427). Sredina
#: ostaje prazna za sliku.
#:
#: Vrh je namerno BLIZU coska a ne na sredini kvadranta, i to je siluetna mera,
#: ne kompozicija: pri fiksnoj duzini od 0.45 W svaki milimetar kojim vrh ide ka
#: cosku je milimetar vise tela IZVAN obrisa ploce. Na (0.335, -0.220) je izvan
#: obrisa ostajalo 0.095 W i olovka se u siluetnom prolazu citala kao patrljak;
#: odavde je 0.145 W i cita se kao olovka. Rezerva do ivice ekrana je i dalje
#: 0.115 W po X i 0.120 W po Z, pa vrh ni na jednom temenu ne izlazi nad okvir.
PEN_TIP_X = 0.385
PEN_TIP_Z = -0.255
PEN_GAP = 0.026                          # od povrsine ekrana do centra vrha
PEN_ELEV_DEG = 35.0                      # ugao prema RAVNI EKRANA
PEN_INPLANE_DEG = -35.0                  # smer poteza u ravni ekrana, od +X

# ------------------------------------------------------------------ orijentacija

TILT_DEG = 35.0                          # UNAZAD od uspravne ravni; gornja ivica dalje
YAW_DEG = -16.0
NORMALIZE_TO = 2.0                       # najduza osa (SECTION_SPEC sekcija 3)

#: Kamera iz SECTION_SPEC sekcije 3, Blender Z-up.
CAM_POS = (-3.2, -6.4, 2.4)

#: Indeksi karakteristicnih temena u prstenu od 4*(seg+1); prsten krece od luka
#: dole-desno na uglu -90. `verify_proportions` meri iskljucivo preko njih.
_I_BOTTOM = 0
_I_RIGHT = CORNER_SEG
_I_TOP = 2 * (CORNER_SEG + 1) - 1
_I_LEFT = 3 * (CORNER_SEG + 1)


# ------------------------------------------------------------------ vektori

def _add(a, b):
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def _sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def _mul(a, k):
    return (a[0] * k, a[1] * k, a[2] * k)


def _dot(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def _cross(a, b):
    return (a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0])


def _norm(a):
    L = math.sqrt(_dot(a, a))
    return (a[0] / L, a[1] / L, a[2] / L)


def _rot_x(p, a):
    ca, sa = math.cos(a), math.sin(a)
    return (p[0], p[1] * ca - p[2] * sa, p[1] * sa + p[2] * ca)


def _rot_z(p, a):
    ca, sa = math.cos(a), math.sin(a)
    return (p[0] * ca - p[1] * sa, p[0] * sa + p[1] * ca, p[2])


def _tilt(p):
    """Nagib UNAZAD oko koordinatnog pocetka, u LOKALNOM prostoru ploce.

    Kamera je na -Y, pa "unazad" znaci da tacke sa +Z odlaze ka +Y. Provera na
    jednom broju: `_tilt((0,0,1))` mora da ima POZITIVNU Y komponentu.
    """
    return _rot_x(p, -math.radians(TILT_DEG))


# ------------------------------------------------------------------ provera poze

def screen_normal_world():
    """Spoljna normala ekrana posle nagiba i zaokreta (jedinicna)."""
    t, y = math.radians(TILT_DEG), math.radians(YAW_DEG)
    return _rot_z(_rot_x((0.0, -1.0, 0.0), -t), y)


def screen_offaxis_deg():
    """Ugao izmedju normale ekrana i pravca ka kameri, u stepenima."""
    n = screen_normal_world()
    c = _norm(CAM_POS)
    return math.degrees(math.acos(max(-1.0, min(1.0, _dot(n, c)))))


def screen_tilt_back_deg():
    """Nagib ekrana UNAZAD od uspravne ravni. Cilj 35.

    Normala uspravnog ekrana lezi u horizontali; nagib unazad je dize, pa je
    `asin(n.z)` tacno taj ugao. Zaokret oko Z ne dira Z komponentu, pa je mera
    nezavisna od `YAW_DEG` - sto je i poenta razdvajanja ta dva broja.
    """
    return math.degrees(math.asin(max(-1.0, min(1.0, screen_normal_world()[2]))))


def screen_plane_from_horizontal_deg():
    """Ugao ravni ekrana prema horizontali. Komplement nagiba."""
    return 90.0 - screen_tilt_back_deg()


# ------------------------------------------------------------------ profil

def _rounded_rect_xz(w, h, r, seg):
    """Obod zaobljenog pravougaonika u ravni X-Z, 4*(seg+1) temena.

    Redosled je CCW gledano sa -Y (od posmatraca). Uvucen obod se dobija istim
    pozivom sa (w-2c, h-2c, r-c): isti broj temena i ista korespondencija po
    indeksu, sto je ceo razlog zasto se okvir i zakosenje mogu izmeriti kao
    rastojanje temena istog indeksa.
    """
    hx, hz = w / 2.0 - r, h / 2.0 - r
    pts = []
    for cx, cz, a0 in ((hx, -hz, -90.0), (hx, hz, 0.0),
                       (-hx, hz, 90.0), (-hx, -hz, 180.0)):
        for s in range(seg + 1):
            a = math.radians(a0 + 90.0 * s / seg)
            pts.append((cx + r * math.cos(a), cz + r * math.sin(a)))
    return pts


# ------------------------------------------------------------------ ploca

def _shell():
    """Zatvoreno kuciste tableta: okvir, dzep, zakosenja, bocna traka, ledja.

        r1  prednja ravan, spoljni obris   FACE @ Y_FRONT
        r2  pocetak bocne trake            OUT  @ Y_CH_F
        r3  kraj bocne trake               OUT  @ Y_CH_B
        r4  zadnja ravan, spoljni obris    FACE @ Y_BACK
        r5  obod otvora ekrana             SCR  @ Y_FRONT
        r6  obod dna dzepa                 SCR  @ Y_FRONT + CAVITY_D

    Svaka ivica pripada tacno dva lica, pa je shell manifold po konstrukciji.
    """
    p_out = _rounded_rect_xz(BODY_W, BODY_H, CORNER_R, CORNER_SEG)
    p_face = _rounded_rect_xz(FACE_W, FACE_H, FACE_R, CORNER_SEG)
    p_scr = _rounded_rect_xz(SCREEN_W, SCREEN_H, SCREEN_R, CORNER_SEG)
    n = len(p_out)

    verts, faces = [], []

    def ring(prof, y):
        base = len(verts)
        for x, z in prof:
            verts.append((x, y, z))
        return base

    r1 = ring(p_face, Y_FRONT)
    r2 = ring(p_out, Y_CH_F)
    r3 = ring(p_out, Y_CH_B)
    r4 = ring(p_face, Y_BACK)
    r5 = ring(p_scr, Y_FRONT)
    r6 = ring(p_scr, Y_FRONT + CAVITY_D)

    def band(a, b):
        for k in range(n):
            m = (k + 1) % n
            faces.append([a + k, a + m, b + m, b + k])

    band(r1, r5)          # okvir
    band(r5, r6)          # zid dzepa
    band(r1, r2)          # zakosenje napred
    band(r2, r3)          # bocna traka
    band(r3, r4)          # zakosenje nazad
    faces.append(list(range(r6, r6 + n)))     # dno dzepa
    faces.append(list(range(r4, r4 + n)))     # ledja

    return verts, faces, {"r1": r1, "r2": r2, "r3": r3, "r4": r4,
                          "r5": r5, "r6": r6, "n": n}


# ------------------------------------------------------------------ olovka

def _pen_profile(seg):
    """Presek olovke na jedinicnom krugu: luk + JEDNA tetiva.

    Tetiva stoji na `FLAT_REL` radijusa, na +u strani. Vraca `seg` tacaka; prva
    i poslednja su krajevi tetive, pa je zatvara obicno `(k+1) % seg` u `band`.
    """
    half = math.degrees(math.asin(FLAT_REL))
    a0 = 180.0 - half
    a1 = 360.0 + half
    return [(math.cos(math.radians(a0 + (a1 - a0) * k / (seg - 1))),
             math.sin(math.radians(a0 + (a1 - a0) * k / (seg - 1))))
            for k in range(seg)]


def _pen_axis():
    """Jedinicni vektor od vrha ka kraju olovke, u LOKALNOM prostoru ploce.

    Elevacija je ugao prema RAVNI EKRANA (lokalna X-Z), a ne prema nekoj osi -
    zato -Y komponenta ide kao `sin`, a smer poteza kao `cos` puta jedinicni
    vektor u ravni. Tako `PEN_ELEV_DEG` ostaje tacan i posle svake promene
    smera poteza.
    """
    e = math.radians(PEN_ELEV_DEG)
    p = math.radians(PEN_INPLANE_DEG)
    return (math.cos(e) * math.cos(p), -math.sin(e), math.cos(e) * math.sin(p))


def _pen_basis(w):
    """Bocna i fasetna osa preseka. `u` gleda OD EKRANA, pa faseta hvata kljuc.

    Referenca je normala ekrana (0,-1,0): `s = w x ref` je upravno na obe, a
    `u = s x w` lezi u ravni koju razapinju osa olovke i normala, na strani
    normale. Faseta je time okrenuta ka posmatracu i vidi se kao ravna traka.
    """
    ref = (0.0, -1.0, 0.0)
    s = _norm(_cross(w, ref))
    return s, _norm(_cross(s, w))


def _pen():
    """Suzen valjak sa jednom fasetom, zatvoren kapama na oba kraja."""
    prof = _pen_profile(PEN_SEG)
    n = len(prof)
    w = _pen_axis()
    s_ax, u_ax = _pen_basis(w)
    tip = (PEN_TIP_X, Y_FRONT + RECESS - PEN_GAP, PEN_TIP_Z)

    verts, faces = [], []
    for t, k in PEN_RINGS:
        c = _add(tip, _mul(w, t * PEN_LEN))
        r = k * PEN_R
        for a, b in prof:
            verts.append(_add(c, _add(_mul(s_ax, a * r), _mul(u_ax, b * r))))

    for j in range(len(PEN_RINGS) - 1):
        a0, b0 = j * n, (j + 1) * n
        for k in range(n):
            m = (k + 1) % n
            faces.append([a0 + k, a0 + m, b0 + m, b0 + k])

    last = (len(PEN_RINGS) - 1) * n
    faces.append(list(range(n)))                    # kapa vrha
    faces.append(list(range(last, last + n)))       # kapa kraja

    return verts, faces, {"pen_n": n, "pen_rings": len(PEN_RINGS),
                          "pen_last_ring": last}


# ------------------------------------------------------------------ ekran

def _screen():
    """Ploca ekrana: zaobljen pravougaonik, uvucen `RECESS` iza ravni okvira.

    UV je planarna projekcija preko SOPSTVENOG bbox-a, racunata u prostoru
    gradnje pre ikakve rotacije: bbox je tacno SCREEN_W x SCREEN_H, pa slika
    4:3 legne bez rastezanja, a zaobljeni coskovi je samo isecu.
    """
    prof = _rounded_rect_xz(SCREEN_W, SCREEN_H, SCREEN_R, CORNER_SEG)
    y = Y_FRONT + RECESS
    verts = [(x, y, z) for x, z in prof]
    uvs = [((x + SCREEN_W / 2.0) / SCREEN_W,
            (z + SCREEN_H / 2.0) / SCREEN_H) for x, z in prof]
    return verts, uvs


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

    shell_v, shell_f, ranges = _shell()
    body_verts = [_tilt(p) for p in shell_v]
    body_faces = [list(f) for f in shell_f]

    pen_v, pen_f, pen_meta = _pen()
    o = len(body_verts)
    body_verts += [_tilt(p) for p in pen_v]
    body_faces += [[i + o for i in f] for f in pen_f]
    ranges["pen"] = o
    ranges.update(pen_meta)

    s_verts, s_uvs = _screen()
    s_verts = [_tilt(p) for p in s_verts]

    yaw = math.radians(YAW_DEG)
    body_verts = [_rot_z(p, yaw) for p in body_verts]
    s_verts = [_rot_z(p, yaw) for p in s_verts]

    # centriranje + jednolika skala nad OBA mesh-a zajedno: ekran mora da ostane
    # u telu, pa se bbox racuna nad unijom, nikad po objektu. Tablet LEBDI, pa
    # je centar bbox-a i jedina referenca koja postoji - nema poda ni stope
    # koja bi trazila da model sedi na z = 0.
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
    # zakljucava rucno: CCW u ravni X-Z daje normalu -Y, tj. ka posmatracu
    me_screen = _make_mesh(SCREEN, s_verts, [list(range(len(s_verts)))],
                           recalc=False)

    uv = me_screen.uv_layers.new(name="UVMap")
    for loop in me_screen.loops:
        uv.data[loop.index].uv = s_uvs[loop.vertex_index]

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
        "screen_tilt_back_deg": round(screen_tilt_back_deg(), 3),
        "screen_plane_from_horizontal_deg": round(screen_plane_from_horizontal_deg(), 3),
        "tilt_deg": TILT_DEG, "yaw_deg": YAW_DEG,
        "proportions": verify_proportions(ranges),
    }


# ------------------------------------------------------------------ merenje

def _circum_r(a, b, c):
    """Radijus kruga kroz tri temena luka - prava mera zaobljenja, ne konstanta."""
    s = ((b - a).cross(c - a)).length / 2.0
    if s < 1e-12:
        return 0.0
    return (a - b).length * (b - c).length * (c - a).length / (4.0 * s)


def _plane_n(p0, p1, p2):
    return ((p1 - p0).cross(p2 - p0)).normalized()


def verify_proportions(ranges):
    """Izmeri sve odnose IZ GOTOVOG MESH-A, ne iz konstanti.

    Ceo lanac transformacija je kruta rotacija plus JEDNOLIKA skala, pa
    rastojanja trpe samo faktor k - a k se skrati cim se sve podeli sa W, i
    uglovi ga ne osecaju uopste. Zato merenje ne mora da vraca mesh u prostor
    gradnje: i odnosi i uglovi su tu vec tacni.
    """
    V = [v.co for v in bpy.data.objects[BODY].data.vertices]
    S = [v.co for v in bpy.data.objects[SCREEN].data.vertices]

    def d(a, b):
        return (a - b).length

    r1, r2, r3, r4, r5 = (ranges["r1"], ranges["r2"], ranges["r3"],
                          ranges["r4"], ranges["r5"])
    B, R, T, L = _I_BOTTOM, _I_RIGHT, _I_TOP, _I_LEFT

    W = d(S[R], S[L])
    H = d(S[B], S[T])

    n_front = _plane_n(V[r1 + B], V[r1 + R], V[r1 + T])
    if n_front.z < 0.0:                 # spoljna normala gleda gore-napred
        n_front = -n_front

    s_ctr = sum(S, S[0] * 0.0) / len(S)

    #: Lokalne ose ploce, rekonstruisane IZ MESH-A: `ex` desno, `ez` gore. Sve
    #: sto se tice polozaja olovke meri se u njima, pa mera ne zna za `TILT_DEG`
    #: ni `YAW_DEG` i ne raspada se ako se poza promeni.
    ex = (S[R] - S[L]).normalized()
    ez = (S[T] - S[B]).normalized()

    # --- olovka
    pn, prn = ranges["pen_n"], ranges["pen_rings"]
    p0, plast = ranges["pen"], ranges["pen"] + ranges["pen_last_ring"]
    pen_idx = [p0 + i * pn + j for i in range(prn) for j in range(pn)]
    tip_c = sum((V[p0 + i] for i in range(pn)), V[0] * 0.0) / pn
    tail_c = sum((V[plast + i] for i in range(pn)), V[0] * 0.0) / pn
    axis = (tail_c - tip_c).normalized()
    wide = p0 + 4 * pn                  # prsten na t = 0.270, pun radijus
    pen_r = _circum_r(V[wide + 1], V[wide + 2], V[wide + 3])
    gap = min((V[i] - s_ctr).dot(n_front) for i in pen_idx)

    # faseta: odstupanje krajeva tetive od ravni fasete, na pravom delu tela
    f_a, f_b = V[wide + pn - 1], V[wide]
    f_n = _plane_n(f_a, f_b, V[p0 + 5 * pn])          # t = 0.900, isti radijus
    f_dev = max(abs((V[p0 + i * pn + j] - f_a).dot(f_n))
                for i in (4, 5) for j in (0, pn - 1))

    pen_u = [(V[i] - s_ctr).dot(ex) for i in pen_idx]
    pen_w = [(V[i] - s_ctr).dot(ez) for i in pen_idx]
    body_hx = max((V[i] - s_ctr).dot(ex) for i in range(r1, ranges["pen"]))
    body_hz = min((V[i] - s_ctr).dot(ez) for i in range(r1, ranges["pen"]))

    return {
        "screen_W_world": round(W, 5),
        "screen_H_world": round(H, 5),
        "screen_aspect": round(W / H, 6),
        "screen_aspect_target": round(4.0 / 3.0, 6),
        "bezel_bottom": round(d(V[r1 + B], V[r5 + B]) / W, 5),
        "bezel_top": round(d(V[r1 + T], V[r5 + T]) / W, 5),
        "bezel_left": round(d(V[r1 + L], V[r5 + L]) / W, 5),
        "bezel_right": round(d(V[r1 + R], V[r5 + R]) / W, 5),
        "body_thickness": round(d(V[r1 + B], V[r4 + B]) / W, 5),
        "chamfer_front_width": round(d(V[r1 + B], V[r2 + B]) / W, 5),
        "chamfer_back_width": round(d(V[r3 + B], V[r4 + B]) / W, 5),
        "side_flat": round(d(V[r2 + B], V[r3 + B]) / W, 5),
        "corner_r_outer": round(_circum_r(V[r2], V[r2 + 1], V[r2 + 2]) / W, 5),
        "corner_r_face": round(_circum_r(V[r1], V[r1 + 1], V[r1 + 2]) / W, 5),
        "corner_r_screen": round(_circum_r(S[0], S[1], S[2]) / W, 5),
        "recess": round(abs((S[B] - V[r1 + B]).dot(n_front)) / W, 5),
        "recess_over_thickness": round(RECESS / BODY_T, 4),

        "tilt_back_deg": round(math.degrees(math.asin(min(1.0, n_front.z))), 3),
        "screen_plane_from_horizontal_deg":
            round(math.degrees(math.acos(min(1.0, abs(n_front.z)))), 3),
        "yaw_deg_measured":
            round(math.degrees(math.atan2(n_front.y, n_front.x)) + 90.0, 3),
        "screen_offaxis_deg": round(screen_offaxis_deg(), 3),

        "pen_length": round((tail_c - tip_c).length / W, 5),
        "pen_diameter": round(2.0 * pen_r / W, 5),
        "pen_facet_width": round(d(V[wide], V[wide + pn - 1]) / W, 5),
        "pen_facet_planarity": round(f_dev / W, 6),
        "pen_angle_to_screen_deg":
            round(math.degrees(math.asin(min(1.0, abs(axis.dot(n_front))))), 3),
        "pen_min_gap_to_screen": round(gap / W, 5),
        "pen_touches_screen": bool(gap <= 0.0),

        # Polozaj olovke u ravni ploce, mereno od CENTRA EKRANA. `min_u > 0`
        # znaci da nijedno teme olovke nije prešlo levo od sredine - to je
        # uslov, ne kompozicija: tamo ide screenshot dizajna.
        "pen_min_u_from_center": round(min(pen_u) / W, 5),
        "pen_max_u_from_center": round(max(pen_u) / W, 5),
        "pen_min_w_from_center": round(min(pen_w) / W, 5),
        "pen_crosses_center": bool(min(pen_u) <= 0.0),
        # koliko kraj olovke izlazi IZVAN obrisa ploce, po obe ose. Bar jedan od
        # ova dva mora da bude pozitivan, inace olovka ne postoji u siluetnom
        # prolazu i model je pravougaonik.
        "pen_beyond_body_right": round((max(pen_u) - body_hx) / W, 5),
        "pen_beyond_body_bottom": round((body_hz - min(pen_w)) / W, 5),
        "screen_half_w": round(0.5 * SCREEN_W, 5),
        "screen_half_h": round(0.5 * SCREEN_H, 5),

        "ring_verts": ranges["n"],
    }
