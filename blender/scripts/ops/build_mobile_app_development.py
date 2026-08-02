"""FAZA C / blocking: `mobile-app-development` - telefon.

SAMO BLOCKING. Bez bevela, bez weighted normals, bez AO bake-a, bez exporta.
Sve je eksplicitna geometrija (`from_pydata`) - nijedan modifier i nijedan
`bpy.ops.mesh.*`, pa je rezultat deterministican i idempotentan. Isti obrazac
kao `build_web_development`, samo drugi predmet.

DVA MESH-A OD POCETKA (SECTION_SPEC, odluka 4 amandman):
  BODY   "mobile-app-development"          kuciste, sine dugmadi, modul kamere
  SCREEN "mobile-app-development_screen"   prednja ploca, UV 0-1 preko bbox-a

PROPORCIJE - sve u jedinicama W = SIRINA EKRANA
----------------------------------------------
    ekran            1.0 x 2.166667 (9 : 19.5, IZVEDENO)
    okvir            0.035 na sve cetiri strane
    debljina tela    0.12          radijus uglova   0.17
    zakosenje        0.016 po osi  bocna traka      0.088
    sine dugmadi     0.02 uzdignute

SIMETRICAN OKVIR JE CEO SIGNAL, i to je tacno ono cime se ovaj model razlikuje
od monitora: tamo brada dole nosi identitet studijskog displeja, ovde bi ista
asimetrija napravila telefon od pre deset godina. `FACE_H` se zato izvodi kao
`SCREEN_H + 2*BEZEL`, ne kao zbir dva razlicita broja.

Ekran je TACNO 9:19.5: `SCREEN_H` se IZVODI iz `SCREEN_W` (* 19.5/9), nikad se
ne kuca kao broj.

TRI PROFILA, JEDAN INSET LANAC
------------------------------
Ceo obris je jedan zaobljen pravougaonik uvucen dva puta:

    OUT    BODY_W  x BODY_H   r = 0.17            bocna traka, spoljni obris
    FACE   -2*CHAMFER         r = 0.17 - CHAMFER  prednja i zadnja ravan
    SCR    -2*BEZEL           r = FACE_R - BEZEL  otvor ekrana

Uvlacenje cuva korespondenciju temena 1:1, pa se okvir i zakosenje mere kao
RASTOJANJE IZMEDJU TEMENA ISTOG INDEKSA u dva prstena - zato `verify_proportions`
nista ne racuna iz konstanti. Radijusi su izvedeni, ne kucani: uvucen ugao ima
manji radijus za tacno onoliko koliko je uvucen, i svaki drugi izbor bi napravio
obris koji se u coskovima ne poklapa sam sa sobom.

BOCNA IVICA. Ravna traka (0.088 W) sa zakosenjem od 45 stepeni napred i nazad.
Zakosenje je jednako u obe ose namerno - to je jedini ugao na kome front i back
citaju kao isti komad. Sirina tog zakosenja je 0.0226 W, i posto sine bevel ne
dira (vidi komentar uz `RAIL_OUT`), ona je NAJUZA povrsina koju bevel mora da
postuje - dakle gornja granica bevel-a u Fazi A.

DUGMAD nose "masinski obradjeno": tri niske sine sa zakosenom kapom, ne
udubljenja i ne jezicci. Dve na -X (glasnoca, 2 x 0.07 W) jer se ta strana IZ
OVOG KADRA VIDI, jedna na +X (napajanje, 0.10 W) koja se ne vidi ali telefon sa
dugmadima na jednoj strani nije telefon. Izbacenost je 0.008 W - vidi komentar
uz `RAIL_OUT` za to zasto je manje bolje.

MODUL KAMERE je na +X polovini ledja, tj. gore-levo gledano sa zadnje strane.
Ta strana je ovde nosece: daleki obris siluete pravi zadnja ivica, pa modul
tamo dodaje stepenik u obrisu - "profil nije gola plocica" se tako i dokazuje.
Objektivi se NE modeluju: iz fiksnog kadra se leđa ne vide, a silueta dobija
isti stepenik i bez njih.

ZAOKRET - JEDAN BROJ, ALI PODELJEN NA DVE OSE
---------------------------------------------
Kamera je fiksna za svih sest (SECTION_SPEC sekcija 3), pa je orijentacija deo
modela. Kriterijum je ukupan zaokret 15-18 stepeni, meren `orientation()` iz
konstanti i `measure_orientation()` iz gotovog mesh-a.

Ukupan zaokret je jedan broj, ali NIJE svejedno kako se dobije. Portret 9:19.5
nosi tekst po SIRINI - horizontalni zaokret gnjeci bas onu osu po kojoj se
screenshot cita, a vertikalni gnjeci dugu osu koja to podnese. Prethodna
podela (yaw 11.6 / pitch -10.5) je bila skoro ravnopravna i time najgora
moguca: isti ukupan zaokret, a maksimum stete na osi koja se cita.

Nova podela je yaw 7.07 / pitch -15.04, ukupno 16.55. Horizontalni udeo je
prepolovljen, a razlika je prebacena na nagib, koji dolazi besplatno od visine
kamere (elevacija +18.542).

Horizontalni zaokret ima i drugi efekat, koji se na renderu vidi pre nego
skracenje: on otvara BOCNI PROFIL. Pri yaw-u od 11.6 stepeni se sa leve strane
vidi ceo niz traka - okvir, zakosenje, bocna traka, sina - a sa desne samo okvir
i zakosenje.

Mereno u kadru (`qa_rig.frame_fraction`, razmak izmedju krajnosti ekrana i
krajnosti tela po ekranskom X):

    yaw 11.57, RAIL_OUT 0.020   levo 0.0217   desno 0.0131   odnos 1.66
    yaw  7.07, RAIL_OUT 0.008   levo 0.0175   desno 0.0158   odnos 1.11

To se citalo kao "levi okvir je deblji", iako je geometrija simetricna do
sestog decimalnog mesta - `symmetry` u `verify_proportions` to i dokazuje
(`body_x_asymmetry == 0` tacno, ne zaokruzeno). Isti niz traka je i razlog
zasto se zaokret na oko procenjuje dvostruko vecim nego sto jeste.

`YAW_DEG` NIJE taj horizontalni zaokret. Kamera stoji na azimutu -116.565, a
prednja normala na -90, pa se vidi `26.565 + YAW_DEG`: -19.5 daje 7.07. Ta dva
broja idu u suprotnim smerovima i to je jedini razlog zasto vrednost izgleda
"prevelika" za rezultat koji daje.

`TILT_DEG` = 3.5 je onda IZVEDEN, ne izabran: kad se horizontalni udeo fiksira
na 7, nagib je jedina preostala sloboda kojom ukupan zaokret ulazi u opseg.
Telefon LEBDI, pa je nagib oko sopstvenog centra, bez postolja.

Bez logoa, bez teksta, bez glifova - to zivi iskljucivo u slici ekrana.
"""

import bpy
import bmesh
import math

BODY = "mobile-app-development"
SCREEN = "mobile-app-development_screen"
COLLECTION = "DISCIPLINES"

# ------------------------------------------------------------------ mere (u W)

SCREEN_W = 1.0
SCREEN_H = SCREEN_W * 19.5 / 9.0         # IZVEDENO. 9:19.5 tacno.

BEZEL = 0.035                            # sve cetiri strane, simetricno
CHAMFER = 0.016                          # po osi; sirina zakosenja = *sqrt(2)
BODY_T = 0.12
CORNER_R = 0.17                          # na SPOLJNOM obrisu (bocna traka)

FACE_W = SCREEN_W + 2.0 * BEZEL
FACE_H = SCREEN_H + 2.0 * BEZEL
BODY_W = FACE_W + 2.0 * CHAMFER
BODY_H = FACE_H + 2.0 * CHAMFER
FACE_R = CORNER_R - CHAMFER
SCREEN_R = FACE_R - BEZEL
SIDE_FLAT = BODY_T - 2.0 * CHAMFER

RECESS = 0.018                           # ekran iza ravni okvira (15% debljine)
CAVITY_D = 0.030                         # dno dzepa, iza ekrana

#: Lukova po cosku. Kriterijum NIJE duzina tetive nego SAGITTA - odstupanje
#: tetive od pravog luka, jer se na siluetu prenosi samo ono. Na 12 segmenata je
#: `0.17 * (1 - cos(3.75)) = 0.000364 W`, sto na ovom kadru izlazi na 0.11
#: piksela. Vise segmenata bi kupovalo odstupanje ispod desetine piksela i
#: placalo ga u trouglovima, pa je 12 mesto gde kriva prestane da bude vidljivo
#: kriva i broj se zaustavlja.
CORNER_SEG = 12

# Sine dugmadi. `RAIL_T` je manje od `SIDE_FLAT`, pa sina lezi na ravnoj traci
# i nigde ne prelazi preko zakosenja - inace bi bevel morao da resava presek
# dve kose povrsine, sto je tacno mesto na kome ivica prestane da bude jednaka.
#
# IZBACENOST JE 0.008 W I TO JE GORNJA GRANICA, ne meta koju treba dostici.
# Prethodnih 0.020 W je na ovom kadru bilo 6-7 piksela cistog stepenika u
# siluetu, pa su se sine citale kao JEZICCI zalepljeni sa strane. Dugme na
# telefonu se ne vidi kao obris nego kao PREKID u odsjaju bocne trake - zato
# se protrusion smanjuje na trecinu, a citljivost se vraca kroz zaobljenje.
#
# ZAOBLJENJE JE MODELOVANO, NE PREPUSTENO BEVEL MODIFIKATORU, i to je jedina
# odluka na ovom modelu doneta iz budzeta trouglova. Merenje: tri sine sa
# ostrom kapom, pod bevelom od 8 segmenata, kostale su 4.860 trouglova - 42%
# celog modela na tri dugmeta visoka 0.008 W. Uzrok nije bevel po ivicama nego
# TEMENA: kvadar ima 8 uglova, a svaki ugao pod bevelom od N segmenata daje
# zakrpu od N x N. Zato se profil kape gradi eksplicitno, u koracima ISPOD
# `angle_deg` praga bevela (25):
#
#   `RAIL_CAP_SEG = 4`   -> 22.5 stepeni po koraku profila
#   `RAIL_FOOT_SEG = 4`  -> 22.5 stepeni po coskovima stope
#
# Nijedna ivica sine tako ne prelazi prag i bevel je CEO preskace. Cena pada sa
# 4.860 na 1.068, oblik je isti (kapa je zaobljena po konstrukciji), a shade
# smooth + weighted normals je i seniraju kao glatku - dugme se naslucuje kao
# meki jastucic, ne kao stepenik sa fazetom.
#
# Nuspojava koja se isplati: posto bevel vise ne dira sine, najuza povrsina
# koju bevel mora da postuje nije vise zakosenje kape (0.0113 W) nego zakosenje
# kucista (0.0226 W). Zato ovaj model moze da nosi ISTU sirinu bevela kao
# monitor (`width_rel = 0.0030`) umesto upola uze - ivica je konzistentna kroz
# celu porodicu, sto je bio ceo smisao relativne mere.
RAIL_OUT = 0.008                         # koliko strci iz bocne trake (max)
RAIL_T = 0.055                           # < SIDE_FLAT (0.088)
RAIL_CHAMFER = 0.008                     # uvlacenje kape po profilu
RAIL_R = 0.014                           # radijus stope, u ravni bocne trake
RAIL_EMBED = 0.015                       # ulazi u telo, da nema koplanarnih lica
#: Koraka po profilu kape. Prag bevela je 25 stepeni; 4 koraka daju nagib od
#: 22.5, ali PRELOM izmedju dva lica se meri po tetivama i izlazi 23.13 - manje
#: od praga za 1.87 stepeni. To je prolaz koji zavisi od zaokruzenja. 5 koraka
#: spusta prelom na 18.6 i vraca rezervu, uz 350 trouglova na celom modelu.
RAIL_CAP_SEG = 5
RAIL_FOOT_SEG = 4                        # lukova po cosku stope (22.5 stepeni)

#: (ime, znak X, z centra, duzina). Sve z su unutar prave bocne trake:
#: |z| < BODY_H/2 - CORNER_R = 0.964. Duzine su iz zahteva: power 0.10 W,
#: volume 2 x 0.07 W. Par za glasnocu stoji na -X jer se TA strana iz ovog
#: kadra vidi; razmak izmedju njih (0.03 W) je manji od same sine, pa se citaju
#: kao par, ne kao dva nezavisna dugmeta.
RAILS = (
    ("vol_up", -1, 0.600, 0.070),
    ("vol_down", -1, 0.500, 0.070),
    ("power", +1, 0.450, 0.100),
)

MOD_W = 0.40
MOD_H = 0.40
MOD_R = 0.11
MOD_RAISE = 0.030
MOD_EMBED = 0.010
MOD_FILLET = 0.012                       # zaobljenje ruba, isti razlog kao kod sina
MOD_SEG = 6                              # 15 stepeni po cosku, ispod praga bevela
MOD_CAP_SEG = 5                          # kao `RAIL_CAP_SEG`, isti razlog
MOD_CX = 0.26
MOD_CZ = 0.80

TILT_DEG = 3.5
YAW_DEG = -19.5
NORMALIZE_TO = 2.0                       # najduza osa (SECTION_SPEC sekcija 3)

Y_FRONT = -BODY_T / 2.0
Y_BACK = BODY_T / 2.0
Y_CH_F = Y_FRONT + CHAMFER
Y_CH_B = Y_BACK - CHAMFER

#: Kamera iz SECTION_SPEC sekcije 3, Blender Z-up.
CAM_POS = (-3.2, -6.4, 2.4)

def _ring_indices():
    """Indeksi karakteristicnih temena u prstenu od 4*(seg+1).

    Prsten krece od luka dole-desno na uglu -90, pa je indeks 0 desni kraj
    DONJE ivice, `seg` donji kraj DESNE ivice, itd. `verify_proportions` meri
    iskljucivo preko njih.

    Funkcija, ne cetiri modul-konstante: `CORNER_SEG` se tokom kalibracije
    budzeta trouglova menja spolja (`M.CORNER_SEG = 12`), a konstante izracunate
    na import-u bi ostale na staroj vrednosti i merenje bi tiho citalo pogresna
    temena - ili puklo, ako je novi prsten manji.
    """
    return (0, CORNER_SEG, 2 * (CORNER_SEG + 1) - 1, 3 * (CORNER_SEG + 1))


# ------------------------------------------------------------------ provera zaokreta

def _screen_normal():
    t, y = math.radians(TILT_DEG), math.radians(YAW_DEG)
    return _rot_z(_rot_x((0.0, -1.0, 0.0), -t), y)


def orientation():
    """Zaokret ekrana prema kameri, RAZLOZEN na dve ose.

    Jedan broj (ugao izmedju normale i pravca ka kameri) kaze koliko je ekran
    skracen UKUPNO, ali ne kaze u kom pravcu - a za citljivost screenshot-a to
    je cela razlika. Portret 9:19.5 nosi tekst po SIRINI, pa horizontalni
    zaokret gnjeci bas onu osu po kojoj se cita, dok vertikalni gnjeci dugu
    osu koja ima 19.5 jedinica da to podnese. Zato se zaokret ne bira kao jedan
    broj nego kao PODELA:

        yaw_deg  (horizontalno)  ~7    - toliko da se bocni profil vidi
        pitch_deg (vertikalno)  ~-15   - ostatak, besplatno od visine kamere
        offaxis_deg (ukupno)    ~16.5  - u trazenom opsegu 15-18

    Kamera vec stoji 26.565 stepeni levo od prednje normale (azimut -116.565
    prema -90), pa YAW_DEG NIJE horizontalni zaokret koji se vidi: vidi se
    `26.565 + YAW_DEG`. Ta dva broja se krecu u suprotnim smerovima i to je
    jedini razlog zasto -19.5 daje 7 stepeni, a ne 19.5.

    `TILT_DEG` je onda izveden, ne izabran: kad se horizontalni udeo fiksira,
    nagib je jedina preostala sloboda kojom ukupan zaokret ulazi u opseg.
    """
    n = _screen_normal()
    r = math.sqrt(sum(c * c for c in CAM_POS))
    c = tuple(v / r for v in CAM_POS)
    dot = max(-1.0, min(1.0, sum(a * b for a, b in zip(n, c))))
    az_n = math.degrees(math.atan2(n[1], n[0]))
    az_c = math.degrees(math.atan2(c[1], c[0]))
    el_n = math.degrees(math.asin(max(-1.0, min(1.0, n[2]))))
    el_c = math.degrees(math.asin(max(-1.0, min(1.0, c[2]))))
    return {
        "offaxis_deg": round(math.degrees(math.acos(dot)), 3),
        "yaw_deg": round(az_n - az_c, 3),
        "pitch_deg": round(el_n - el_c, 3),
        "cam_azimuth_deg": round(az_c, 3),
        "screen_normal_azimuth_deg": round(az_n, 3),
        "foreshorten_width": round(math.cos(math.radians(az_n - az_c)), 4),
        "foreshorten_height": round(math.cos(math.radians(el_n - el_c)), 4),
    }


def screen_offaxis_deg():
    """Ukupan zaokret, u stepenima. Cilj 15-18."""
    return orientation()["offaxis_deg"]


# ------------------------------------------------------------------ transformacije

def _rot_x(p, a):
    ca, sa = math.cos(a), math.sin(a)
    return (p[0], p[1] * ca - p[2] * sa, p[1] * sa + p[2] * ca)


def _rot_z(p, a):
    ca, sa = math.cos(a), math.sin(a)
    return (p[0] * ca - p[1] * sa, p[0] * sa + p[1] * ca, p[2])


def _tilt(p):
    """Nagib unazad oko sopstvenog centra - telefon lebdi, nema oslonac."""
    return _rot_x(p, -math.radians(TILT_DEG))


# ------------------------------------------------------------------ profil

def _rounded_rect_xz(w, h, r, seg):
    """Obod zaobljenog pravougaonika u ravni X-Z, 4*(seg+1) temena.

    Redosled je CCW gledano sa -Y (od posmatraca), pa n-gon u tom redosledu ima
    normalu ka posmatracu i namotaj se ne mora pogadjati.

    Uvucen obod se dobija istim pozivom sa (w-2c, h-2c, r-c): isti broj temena i
    ista korespondencija po indeksu, sto je ceo razlog zasto se okvir i zakosenje
    mogu izmeriti kao rastojanje temena istog indeksa.
    """
    hx, hz = w / 2.0 - r, h / 2.0 - r
    pts = []
    for cx, cz, a0 in ((hx, -hz, -90.0), (hx, hz, 0.0),
                       (-hx, hz, 90.0), (-hx, -hz, 180.0)):
        for s in range(seg + 1):
            a = math.radians(a0 + 90.0 * s / seg)
            pts.append((cx + r * math.cos(a), cz + r * math.sin(a)))
    return pts


# ------------------------------------------------------------------ kuciste

def _shell():
    """Zatvoreno kuciste: prednji okvir, dzep, zakosenja, bocna traka, ledja.

        r1  prednja ravan, spoljni obris   FACE @ Y_FRONT
        r2  pocetak bocne trake            OUT  @ Y_CH_F
        r3  kraj bocne trake               OUT  @ Y_CH_B
        r4  zadnja ravan, spoljni obris    FACE @ Y_BACK
        r5  obod otvora ekrana             SCR  @ Y_FRONT
        r6  obod dna dzepa                 SCR  @ Y_FRONT + CAVITY_D

    Svaka ivica pripada tacno dva lica, pa je shell manifold po konstrukciji i
    `recalc_face_normals` ima sta da orijentise.
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


def _quarter(out, fillet, seg):
    """Cetvrt-elipsa `(pomeraj, uvlacenje)`, uzorkovana po UGLU TANGENTE.

    Ravnomerno po parametru elipse NE daje ravnomerne prelome kad poluose nisu
    jednake: kod modula kamere (`out = 0.030`, `fillet = 0.012`) sve skretanje
    se nagomila na kraju i poslednji prelom izadje 45.9 stepeni - preko praga,
    pa bevel opet uhvati rub. Zato se uzorkuje po nagibu povrsine:

        tan(nagib) = (fillet / out) * tan(parametar)

    pa se parametar racuna unazad iz zeljenog nagiba. Prelom je onda tacno
    `90 / seg` bez obzira na odnos poluosa, i isti `cap_seg` radi i za sinu
    (1:1) i za modul (2.5:1).
    """
    pts = []
    for k in range(seg + 1):
        f = math.radians(90.0 * k / seg)
        t = math.atan2(out * math.sin(f), fillet * math.cos(f))
        pts.append((out * math.sin(t), fillet * (1.0 - math.cos(t))))
    return pts


def _pad(w, h, r, foot_seg, fillet, embed, out, cap_seg, place):
    """Zaobljen jastucic: zaobljen pravougaonik izvucen po profilu cetvrt-kruga.

    Jedan oblik za DVE izbocine na modelu - sine dugmadi i modul kamere. Obe su
    isto: nizak zaobljen pravougaonik koji izlazi iz ravne povrsine, ukopan sa
    donje strane da ne bi bio koplanaran sa njom.

    Profil je `(pomeraj po osi izvlacenja, uvlacenje stope)`, cetvrt-elipsa sa
    poluosama `out` i `fillet`, UZORKOVANA PO UGLU TANGENTE a ne po parametru
    elipse - vidi `_quarter`. Tako je razlika izmedju dva susedna lica
    konstantnih `90 / cap_seg` bez obzira na odnos poluosa, pa je `cap_seg = 4`
    (22.5 stepeni) sigurno ispod bevelovog praga od 25. Na 3 koraka bi razlika
    bila 30, preko praga, i modifikator bi poceo da zaobljava ono sto je vec
    zaobljeno - platio bi to zakrpama na temenima, sto je bila cela
    4.860-trouglova greska prve verzije.

    Ukopana strana ide po istom pravilu, samo sa `embed` umesto `out`. Mogla bi
    biti i ravno dno, ali ravno dno je prsten ivica pod 90 stepeni UNUTAR tela -
    nevidljivih, a bevel bi ih svejedno platio.

    Svaki prsten je isti zaobljen pravougaonik uvucen za `ins`, pa vazi ista
    korespondencija temena 1:1 kao u glavnom inset lancu i mere se citaju kao
    rastojanje temena istog indeksa.

    `place(offset, a, b) -> (x, y, z)` je jedina razlika izmedju sine (izlazi po
    X) i modula (izlazi po Y).
    """
    up = _quarter(out, fillet, cap_seg)
    down = _quarter(embed, fillet, cap_seg)
    prof = [(-d, ins) for d, ins in reversed(down[1:])] + up

    verts, rings = [], []
    for d, ins in prof:
        ring = _rounded_rect_xz(w - 2.0 * ins, h - 2.0 * ins, r - ins, foot_seg)
        rings.append(len(verts))
        for a, b in ring:
            verts.append(place(d, a, b))
    n = len(verts) // len(prof)

    fq = [list(range(n))]                         # ukopano dno
    for m in range(len(prof) - 1):
        a, b = rings[m], rings[m + 1]
        for k in range(n):
            j = (k + 1) % n
            fq.append([a + k, a + j, b + j, b + k])
    fq.append(list(range(rings[-1], rings[-1] + n)))   # kapa
    return verts, fq


def _rail(sign, zc, length):
    """Sina dugmeta na bocnoj traci.

    Prsten na ravni bocne trake je `RAIL_CAP_SEG`-ti po redu i uvucen je 0 - to
    je jedini prsten koji lezi TACNO na telu i on je referenca za merenje
    izbacenosti.
    """
    return _pad(length, RAIL_T, RAIL_R, RAIL_FOOT_SEG, RAIL_CHAMFER,
                RAIL_EMBED, RAIL_OUT, RAIL_CAP_SEG,
                lambda d, a, b: (sign * (BODY_W / 2.0 + d), b, zc + a))


def _camera_module():
    """Nisko uzdignut zaobljen kvadar na ledjima, ukopan `MOD_EMBED` u telo.

    Isti `_pad` kao sine, iz istog razloga: ostar rub od 90 stepeni na modulu
    je 28 ivica koje bevel placa zakrpama po temenima, a modul se iz fiksnog
    kadra ni ne vidi - njegov posao je stepenik u obrisu, a stepenik postoji i
    kad je rub zaobljen po konstrukciji.
    """
    return _pad(MOD_W, MOD_H, MOD_R, MOD_SEG, MOD_FILLET,
                MOD_EMBED, MOD_RAISE, MOD_CAP_SEG,
                lambda d, a, b: (MOD_CX + a, Y_BACK + d, MOD_CZ + b))


# ------------------------------------------------------------------ ekran

def _screen():
    """Ploca ekrana: zaobljen pravougaonik, uvucen `RECESS` iza ravni okvira.

    UV je planarna projekcija preko SOPSTVENOG bbox-a, racunata u prostoru
    gradnje pre ikakve rotacije: bbox je tacno SCREEN_W x SCREEN_H, pa slika
    9:19.5 legne bez rastezanja, a zaobljeni coskovi je samo isecu.
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

    body_verts, body_faces, ranges = _shell()

    for name, sign, zc, length in RAILS:
        v, fq = _rail(sign, zc, length)
        o = len(body_verts)
        body_verts += v
        body_faces += [[i + o for i in f] for f in fq]
        ranges["rail_" + name] = o

    v, fq = _camera_module()
    o = len(body_verts)
    body_verts += v
    body_faces += [[i + o for i in f] for f in fq]
    ranges["module"] = o
    ranges["module_n"] = 4 * (MOD_SEG + 1)

    s_verts, s_uvs = _screen()

    tilt = math.radians(TILT_DEG)
    yaw = math.radians(YAW_DEG)
    body_verts = [_rot_z(_rot_x(p, -tilt), yaw) for p in body_verts]
    s_verts = [_rot_z(_rot_x(p, -tilt), yaw) for p in s_verts]

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
        "orientation": orientation(),
        "orientation_measured": measure_orientation(),
        "tilt_deg": TILT_DEG, "yaw_deg_applied": YAW_DEG,
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


def measure_orientation():
    """Isto sto i `orientation()`, ali iz GOTOVOG MESH-A.

    `orientation()` racuna iz konstanti i zato ne moze da uhvati gresku u lancu
    transformacija - ako se rotacije ikad primene pogresnim redom ili se ekranu
    obrne namotaj, konstante bi i dalje javljale tacan broj. Ovde se normala
    uzima iz tri stvarna temena ploce, pa je broj proverljiv.
    """
    S = [v.co for v in bpy.data.objects[SCREEN].data.vertices]
    n = _plane_n(S[0], S[1], S[2])
    r = math.sqrt(sum(c * c for c in CAM_POS))
    c = [v / r for v in CAM_POS]
    dot = max(-1.0, min(1.0, sum(a * b for a, b in zip(n, c))))
    if dot < 0.0:                       # ploca gleda od kamere -> uzmi lice
        n = -n
        dot = -dot
    az_n = math.degrees(math.atan2(n[1], n[0]))
    az_c = math.degrees(math.atan2(c[1], c[0]))
    el_n = math.degrees(math.asin(max(-1.0, min(1.0, n[2]))))
    el_c = math.degrees(math.asin(max(-1.0, min(1.0, c[2]))))
    return {
        "offaxis_deg": round(math.degrees(math.acos(dot)), 3),
        "yaw_deg": round(az_n - az_c, 3),
        "pitch_deg": round(el_n - el_c, 3),
        "screen_normal": [round(v, 5) for v in n],
    }


def verify_proportions(ranges):
    """Izmeri sve odnose IZ GOTOVOG MESH-A, ne iz konstanti.

    Ceo lanac transformacija je kruta rotacija plus JEDNOLIKA skala, pa
    rastojanja trpe samo faktor k - a k se skrati cim se sve podeli sa W.
    Zato merenje ne mora da vraca mesh u prostor gradnje.

    Okvir i zakosenje se mere kao rastojanje temena ISTOG INDEKSA u dva
    prstena; to je tacno ono sto inset lanac garantuje i jedini nacin da se
    izmeri simetrija okvira, a ne da se pretpostavi.
    """
    V = [v.co for v in bpy.data.objects[BODY].data.vertices]
    S = [v.co for v in bpy.data.objects[SCREEN].data.vertices]

    def d(a, b):
        return (a - b).length

    r1, r2, r3, r4, r5 = (ranges["r1"], ranges["r2"], ranges["r3"],
                          ranges["r4"], ranges["r5"])
    B, R, T, L = _ring_indices()

    W = d(S[R], S[L])
    H = d(S[B], S[T])

    n_front = _plane_n(V[r1 + B], V[r1 + R], V[r1 + T])
    n_back = _plane_n(V[r4 + B], V[r4 + R], V[r4 + T])
    n_left = _plane_n(V[r2 + L], V[r2 + L - 1], V[r3 + L])
    n_right = _plane_n(V[r2 + R], V[r2 + R + 1], V[r3 + R])

    rn = 4 * (RAIL_FOOT_SEG + 1)                    # temena po prstenu sine
    rB, rR, rT, rL = 0, RAIL_FOOT_SEG, 2 * (RAIL_FOOT_SEG + 1) - 1, \
        3 * (RAIL_FOOT_SEG + 1)
    i_seat = RAIL_CAP_SEG                           # prsten na bocnoj traci
    i_cap = 2 * RAIL_CAP_SEG                        # prsten kape

    rails = {}
    for name, sign, zc, length in RAILS:
        o = ranges["rail_" + name]
        base = V[r2 + (R if sign > 0 else L)]
        nrm = n_right if sign > 0 else n_left

        def ring(m, i):
            return V[o + m * rn + i]

        seat, cap = ring(i_seat, rR), ring(i_cap, rR)
        out = abs((cap - seat).dot(nrm))

        # najveci prelom izmedju dva susedna lica profila. Ovaj broj je dokaz da
        # bevel sinu ne dira: ako je manji od `angle_deg` preseta (25), nijedna
        # ivica sine ne prolazi kroz modifikator.
        dirs = [(ring(m + 1, rR) - ring(m, rR)).normalized()
                for m in range(2 * RAIL_CAP_SEG)]
        facets = [math.degrees(math.acos(max(-1.0, min(1.0, a.dot(b)))))
                  for a, b in zip(dirs, dirs[1:])]
        # poslednja traka prema ravnoj kapi: kapa je normalna na `nrm`, pa je
        # prelom DOPUNA ugla izmedju trake i te normale do 90
        facets.append(90.0 - math.degrees(math.acos(
            max(-1.0, min(1.0, abs(dirs[-1].dot(nrm)))))))

        rails[name] = {
            # izbacenost se meri od PRSTENA NA BOCNOJ TRACI, ne od ukopanog dna -
            # inace bi u broj usao i `RAIL_EMBED`, koji se ne vidi
            "protrusion": round(out / W, 5),
            "length": round(d(ring(i_seat, rR), ring(i_seat, rL)) / W, 5),
            "thickness": round(d(ring(i_seat, rT), ring(i_seat, rB)) / W, 5),
            "cap_length": round(d(ring(i_cap, rR), ring(i_cap, rL)) / W, 5),
            "cap_thickness": round(d(ring(i_cap, rT), ring(i_cap, rB)) / W, 5),
            "max_facet_deg": round(max(facets), 3),
            # prsten `i_seat` mora da lezi TACNO na bocnoj traci
            "seated_offset": round(abs((seat - base).dot(nrm)) / W, 6),
        }

    # ---- simetrija okvira, merena kao POLOZAJ a ne kao sirina
    #
    # `bezel_left == bezel_right` dokazuje da su dva prstena jednako uvucena,
    # ali NE dokazuje da telo stoji centrirano na ekranu: dva jednaka uvlacenja
    # bi izgledala isto i da je ceo obris pomeren u stranu. Zato se ovde meri
    # PROJEKCIJA na osu sirine ekrana, u odnosu na teziste ekrana - ako su leva
    # i desna krajnost suprotnog znaka i istog modula, telo ne moze biti sire sa
    # jedne strane. Isto po visini.
    ctr = S[0].copy()
    for p in S[1:]:
        ctr = ctr + p
    ctr = ctr / len(S)
    u = (S[R] - S[L]).normalized()
    vv = (S[T] - S[B]).normalized()
    px = sorted((p - ctr).dot(u) for p in V)
    py = sorted((p - ctr).dot(vv) for p in V)
    symmetry = {
        "body_x_min_over_W": round(px[0] / W, 5),
        "body_x_max_over_W": round(px[-1] / W, 5),
        "body_x_asymmetry": round((px[0] + px[-1]) / W, 6),
        "body_y_min_over_H": round(py[0] / H, 5),
        "body_y_max_over_H": round(py[-1] / H, 5),
        "body_y_asymmetry": round((py[0] + py[-1]) / H, 6),
        "screen_centre_offset_x": round(
            ((max((p - ctr).dot(u) for p in S)
              + min((p - ctr).dot(u) for p in S)) / 2.0) / W, 6),
    }

    mo, mn = ranges["module"], ranges["module_n"]
    seat = mo + MOD_CAP_SEG * mn              # prsten na ravni ledja
    top = mo + 2 * MOD_CAP_SEG * mn           # prsten kape
    mB, mR = 0, MOD_SEG
    mT, mL = 2 * (MOD_SEG + 1) - 1, 3 * (MOD_SEG + 1)

    mdirs = [(V[mo + (m + 1) * mn + mR] - V[mo + m * mn + mR]).normalized()
             for m in range(2 * MOD_CAP_SEG)]
    mfacets = [math.degrees(math.acos(max(-1.0, min(1.0, a.dot(b)))))
               for a, b in zip(mdirs, mdirs[1:])]
    mfacets.append(90.0 - math.degrees(math.acos(
        max(-1.0, min(1.0, abs(mdirs[-1].dot(n_back)))))))

    return {
        "screen_W_world": round(W, 5),
        "screen_H_world": round(H, 5),
        "screen_aspect": round(W / H, 6),
        "screen_aspect_target": round(9.0 / 19.5, 6),
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
        "rails": rails,
        "symmetry": symmetry,
        "module_raise": round(abs((V[top] - V[seat]).dot(n_back)) / W, 5),
        "module_w": round(d(V[seat + mR], V[seat + mL]) / W, 5),
        "module_h": round(d(V[seat + mB], V[seat + mT]) / W, 5),
        "module_seated_offset": round(
            abs((V[seat] - V[r4 + B]).dot(n_back)) / W, 6),
        "module_max_facet_deg": round(max(mfacets), 3),
        "ring_verts": ranges["n"],
    }
