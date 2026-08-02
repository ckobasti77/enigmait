"""FAZA C / blocking: `social-media` - tri story panela u lepezi na plintu.

SAMO BLOCKING. Bez bevela, bez weighted normals, bez AO bake-a, bez exporta.
Sve je eksplicitna geometrija (`from_pydata`) - nijedan modifier i nijedan
`bpy.ops.mesh.*`, pa je rezultat deterministican i idempotentan. Isti obrazac
kao `build_mobile_app_development`, samo drugi predmet.

DVA MESH-A OD POCETKA (SECTION_SPEC, odluka 4 amandman):
  BODY   "social-media"          tri rama panela, plint, uzvisenje, sest usadnih usana
  SCREEN "social-media_screen"   TRI ploce u JEDNOM mesh-u, UV u tri trecine JEDNOG atlasa

JEDAN EKRAN, TRI KVADRATA - ZASTO NE `InstancedMesh`
---------------------------------------------------
SECTION_SPEC je za ovaj model predvideo jedan panel iz koga u kodu nastaju sva
tri, kao `InstancedMesh` sa per-instance UV offset-om. Odbaceno: tri ploce su
UKUPNO 78 trouglova pre bevela. Instancing na toj kolicini ne stedi nista, a
kosta per-instance UV offset - dakle izmenu shader-a, jer glTF/three standardni
materijal ne zna za offset po instanci.

Umesto toga sve tri ploce zive u JEDNOM mesh-u, a razlika je iskljucivo u UV-u:
ploca `k` pokriva `u ∈ [k/3, (k+1)/3]`. Jedan mesh, jedna tekstura, jedan draw
call, nijedna linija instancing koda - isti rezultat po draw call-ovima kao
plan iz spec-a, bez ijedne izmene u three.js sloju.

ATLAS JE MERA, NE POSLEDICA
---------------------------
Atlas je 1536x910 = tri komada 512x910 jedan pored drugog, redom levo -> sredina
-> desno. `SCREEN_H` se zato IZVODI iz odnosa komada (`910/512`), nikad se ne
kuca kao `16/9`: 512x910 nije tacno 9:16 (910 vs 910.22), a razlika od 0.025%
je tacno ona vrsta greske koja se vidi kao mrvicavo rastezanje na tekstu u
screenshot-u. Ovako je teksela po jedinici sveta identican u `u` i `v` po
konstrukciji, a ne po srecnom zaokruzenju:

    px_u = 1536 / (3 * SCREEN_W)   px_v = 910 / SCREEN_H   ->  jednaki

PROPORCIJE - sve u jedinicama W = SIRINA JEDNOG PANELA
-----------------------------------------------------
    ekran            0.94 x 1.670703 (odnos komada atlasa, IZVEDENO)
    okvir            0.03 na sve cetiri strane
    panel            1.0 x 1.730703, debljina 0.05, radijus uglova 0.06
    lepeza           bocni paneli +-22 stepeni, 0.10 unazad, 0.06 nanize
    razmak           0.045 izmedju panela (zadatak je trazio 25% PREKLOPA)
    plint            <izvedeno> x 0.35 x 0.08, zakosen

PREKLOP JE MORAO DA POSTANE RAZMAK
----------------------------------
Zadatak trazi da bocni paneli preklapaju srednji ~25% svoje sirine. Tako
zadan, model PADA na siluetnom testu, koji je po SECTION_SPEC-u (Faza C,
tacka 4) tvrd kriterijum i "sam za sebe obara fazu".

Razlog nije podesavanje nego geometrija. Tri panela koja se u projekciji
dodiruju ili preklapaju daju JEDNU crnu mrlju - unija se ne moze razdvojiti
ni jednim uglom lepeze ni jednim pomerajem unazad, jer nigde nema pozadine
izmedju njih. Jedina artikulacija koja preostane je gornja ivica, a ona daje
"plocu sa jezickom", ne "tri panela". Mereno, ne procenjeno - siluete su
renderovane za preklop 25% i 12% i za pad od 0.06, 0.14, 0.22, 0.30, 0.35 i
0.45 W, u kombinaciji sa uglom lepeze 22, 30 i 32 stepena: SVIH deset varijanti
sa pozitivnim preklopom daje istu mrlju. Gore od toga, ta mrlja je siroka ploca
na postolju - dakle isti obris kao `branding` (bilbord na dve noge) i
`web-development` (monitor na stopi), a "nijedna dva se ne smeju pomesati" je
druga polovina istog kriterijuma.

Sa razmakom od 0.045 W silueta odmah cita tri uspravna panela i ne lici ni na
jedan od preostalih pet. Zato preklop ide u minus. To je odstupanje od zadatka
i stoji ovde da bi bilo vidljivo, a ne u commit poruci.

Odstupanje povlaci tacno jos jedno: zadatih 2.6 W za plint je bila mera lepeze
sa 25% preklopa (2.41 W plus rub), pa je sa razmakom prestala da vazi. Zato je
sirina plinta postala IZVEDENA (`PLINTH_SIDE_MARGIN`), a ne kucana - dubina,
visina i zakosenje su ostali tacno zadati.

Sve ostalo iz zadatka je netaknuto: ugao 22, pomeraj unazad 0.10 W, pad
0.06 W, proporcije panela, plint 0.35 x 0.08 sa zakosenjem, atlas i UV.

LEPEZA SE OTVARA NAPOLJE, I TO JE ONO STO OSU STAVLJA IZA
---------------------------------------------------------
Bocni paneli su okrenuti OD sredisnje ose, ne prema njoj, pa grupa cita kao
lepeza a ne kao triptih. Smer nije ukras: on je jedini razlog zbog kog osa
rotacije pada IZA panela, kako zadatak i trazi.

Rotacija oko vertikale nosi jednu ivicu napred a drugu nazad. Okrenut napolje,
napred ide UNUTRASNJA ivica - i to je tacno ona varijanta koja se sa 25%
preklopa nije mogla graditi, jer bi pri +-22 stepena unutrasnja ivica ulazila
u debljinu srednjeg panela. Cim je preklop postao razmak, preseka vise nema
(najbliza tacka bocnog panela je 0.036 W bocno od ivice srednjeg), pa je smer
opet slobodan - i bira se onaj koji zadovoljava "osu iza".

OSA LEPEZE JE IZVEDENA, NE KUCANA
---------------------------------
Zadatak trazi rotaciju "oko vertikalne ose IZA panela". Ta osa se ovde ne kuca
kao jos jedna konstanta, jer je vec potpuno odredjena merama koje su zadate:
ugao (22), pomeraj unazad (0.10 W) i bocni polozaj. Kompozicija rotacije i
translacije u ravni ima tacno jednu fiksnu tacku, `p = (I - R)^-1 t`, i to
JESTE ta osa; `fan_axis()` je racuna iz istih konstanti iz kojih se gradi mesh,
pa je tvrdnja "osa je iza panela" merljiva a ne opisna. Izlazi na ~2.64 W iza
prednje ravni panela.

Merenje je ovde uhvatilo gresku koju bi opis prosao: sa panelima okrenutim
UNUTRA ista formula vraca osu 1.83 W ISPRED panela. Isti ugao, isti pomeraj,
suprotan znak - i zahtev iz zadatka pada. Zato se osa racuna, a ne tvrdi.

Pad od 0.06 W je klizanje PO toj osi, pa je ceo pokret jedan zavoj - lepeza se
otvara i spusta odjednom.

BOCNI PANELI SU 0.06 W NIZE, A PLINT JE VISOK 0.08 W - I TO SE NE UKLAPA
-----------------------------------------------------------------------
Dve zadate mere su u direktnoj tenziji: da bi panel utonuo 0.06 W nize u plint
visok 0.08 W, ispod njegovog lezista ostaje najvise 0.02 W materijala, a
srednji panel bi morao da lezi na samom vrhu, bez ijednog useka. Svaka podela
te razlike unutar plinta zavrsava ili u papirnatom dnu ili u prorezu koji
plint prakticno preseca (posto je stopa zaokrenutog panela 0.42 W duboka, a
plint 0.35 W - usek bi izasao kroz obe bocne strane).

Resenje ide NAVISE umesto naniže: plint ostaje tacno 0.35 dubok i 0.08 visok, a
srednji panel stoji na masinskom UZVISENJU na njegovom vrhu.

    RISER_H = FAN_DROP

je zato jedina konstanta koja nosi dva posla: visina uzvisenja JESTE pad
lepeze. Sva tri panela onda tonu isto duboko (`SEAT_EMBED`) u svoju povrsinu,
a razlika u visini dolazi iskljucivo od toga na cemu stoje.

USECI SU PAR USANA, NE GLODANI DZEP
-----------------------------------
Dzep bi bio tacniji opis "useka", ali je i nevidljiv: popunjava ga bas onaj
komad koji u njega ulazi, pa se od celog dzepa vidi samo linija ulaza. Zato
svaki panel dobija par niskih usana (napred i nazad, `CLEAR` od lica panela),
a sam panel tone `SEAT_EMBED` ispod povrsine. Vidi se tacno ono sto bi se
videlo i od pravog dzepa - prorez sa panelom u njemu - a geometrija je
aditivna, bez ijednog preseka sa panelom.

Zadnja usna se iz fiksnog kadra NE vidi (panel je 1.73 W visok i stoji tacno
ispred nje). Ostaje svejedno: leziste sa jednom stranom nije leziste, isto
kao sto telefon sa dugmadima na jednoj strani nije telefon
(`build_mobile_app_development`, `RAILS`).

PLINT POKRIVA PREDNJU STOPU, NE CELU
------------------------------------
Zaokrenut panel od 1.0 W ima stopu duboku 0.42 W, a plint je zadatih 0.35 W.
Razlika mora negde da izadje, pa izlazi POZADI: plint se pozicionira tako da
mu prednja ivica pokrije najistureniju tacku lepeze (`PLINTH_MARGIN`), a
zadnji uglovi bocnih panela i zadnji krajevi usana prelaze preko zadnje ivice.
Obrnut izbor bi ostavio prednji donji ugao panela da visi ispred plinta - to
je jedino mesto sa ovog kadra na kome bi se prelaz uopste video.

ZAOKRET - ISTA PODELA KAO KOD TELEFONA, ALI PLINT OSTAJE U VODI
--------------------------------------------------------------
Kriterijum je ukupan zaokret 15-18 stepeni iz fiksne kamere. Podela je ista
kao na telefonu i iz istog razloga (`build_mobile_app_development.orientation`):
yaw 7.07 / pitch -15.04, ukupno 16.55.

Razlika je u tome STA se naginje. Telefon lebdi, pa se naginje ceo. Ovaj model
stoji na plintu, a nagnut plint je prevrnut plint. Zato nagib od 3.5 stepeni
nose SAMO paneli, i to oko sopstvene donje ivice, pa ostaju u svojim
lezistima: paneli se naslanjaju unazad, baza stoji u vodi. Globalni yaw
(-19.5) nosi ceo model, jer je rotacija oko vertikale i plint ne dira.

Bez logoa, bez teksta, bez glifova - to zivi iskljucivo u slici atlasa.
"""

import bpy
import bmesh
import math

BODY = "social-media"
SCREEN = "social-media_screen"
COLLECTION = "DISCIPLINES"

# ------------------------------------------------------------------ atlas

#: Jedan komad atlasa. Tri komada jedan pored drugog = 1536 x 910.
ATLAS_TILE_PX = (512, 910)
ATLAS_TILES = 3

# ------------------------------------------------------------------ mere (u W)

PANEL_W = 1.0
FRAME = 0.03                             # okvir oko ekrana, sve cetiri strane
SCREEN_W = PANEL_W - 2.0 * FRAME
#: IZVEDENO iz komada atlasa, ne iz 16/9 - vidi zaglavlje.
SCREEN_H = SCREEN_W * ATLAS_TILE_PX[1] / ATLAS_TILE_PX[0]
PANEL_H = SCREEN_H + 2.0 * FRAME
PANEL_T = 0.05
CORNER_R = 0.06
SCREEN_R = CORNER_R - FRAME              # uvucen obris -> manji radijus za tacno FRAME

RECESS = 0.008                           # ploca ekrana iza ravni okvira
CAVITY_D = 0.016                         # dno dzepa, iza ploce

#: Lukova po cosku. Kriterijum je SAGITTA, ne duzina tetive - na siluetu se
#: prenosi samo odstupanje tetive od luka. Na 6 segmenata je
#: `0.06 * (1 - cos(7.5)) = 0.000514 W`, sto na ovom kadru izlazi ispod 0.2
#: piksela. Radijus je ovde skoro tri puta manji nego na telefonu (0.06 prema
#: 0.17), pa je i pola njegovih segmenata previse tacno, a ne premalo.
CORNER_SEG = 6

Y_FRONT = -PANEL_T / 2.0
Y_BACK = PANEL_T / 2.0

# ------------------------------------------------------------------ lepeza

FAN_DEG = 22.0
FAN_BACK = 0.10                          # bocni paneli unazad
FAN_DROP = 0.06                          # bocni paneli nanize

#: Nagib panela unazad. Stoji OVDE a ne u sekciji poze, jer ne ucestvuje samo
#: u kadru - ulazi u razmak lepeze, vidi `FAN_LEAN_SHIFT`.
TILT_DEG = 3.5

#: Razmak izmedju susednih panela, MEREN NA VRHU PANELA. Vrh je merodavan jer
#: se tamo silueta i cita; na dnu je razmak veci i nikoga ne zanima.
#: 0.045 W je oko 11 piksela na QA renderu od 1024.
GAP_TOP = 0.045

_FAN_C = math.cos(math.radians(FAN_DEG))
_FAN_S = math.sin(math.radians(FAN_DEG))

#: Projektovana sirina zaokrenutog panela nosi I clan debljine. Bez njega
#: (`PANEL_W * cos`) racun promasi za `PANEL_T * sin` = 0.0187 W, sto je 42%
#: samog razmaka - dakle greska koja se vidi.
FAN_PROJ_W = PANEL_W * _FAN_C + PANEL_T * _FAN_S

#: Nagib unazad gura VRH bocnog panela ka sredini, i to nije zanemarljivo:
#: naginjanje pomera vrh za `PANEL_H * sin(TILT)` po dubini, a zaokret lepeze
#: onda deo tog pomeraja preslika u sirinu, `* sin(FAN_DEG)`. Izlazi 0.0396 W -
#: skoro cela sirina razmaka. Bez ovog clana razmak od 0.045 W na dnu bi se na
#: vrhu zatvorio na 0.005 W i silueta bi se opet slila u jednu mrlju, sto je
#: tacno greska zbog koje ovaj model prvi put nije prosao.
FAN_LEAN_SHIFT = PANEL_H * math.sin(math.radians(TILT_DEG)) * _FAN_S

#: Bocni pomeraj po X je IZVEDEN, ne izabran: srednji panel ide do `PANEL_W/2`,
#: zaokrenut bocni panel je `FAN_PROJ_W` sirok, pa je pozicija ono sto na vrhu
#: ostavi tacno `GAP_TOP` izmedju njih.
FAN_X = PANEL_W / 2.0 + FAN_PROJ_W / 2.0 + GAP_TOP + FAN_LEAN_SHIFT

#: Ekvivalentan "preklop" iz zadatka, samo radi izvestaja - negativan je jer
#: preklopa nema. Vidi "PREKLOP JE MORAO DA POSTANE RAZMAK" u zaglavlju.
OVERLAP = -(FAN_X - PANEL_W / 2.0 - FAN_PROJ_W / 2.0) / FAN_PROJ_W

# ------------------------------------------------------------------ postolje

#: Sirina plinta je JEDINA mera baze koja se ne kuca. Zadatih 2.6 W je tacno
#: ono sto lepeza sa 25% preklopa zauzima (2.41 W plus rub) - dva broja koja
#: opisuju istu stvar. Cim je preklop postao razmak, grupa je porasla na ~3.06
#: W i kucanih 2.6 bi znacilo da paneli vise nemaju sta ispod sebe.
#:
#: Zato se sirina meri iz gotove lepeze i dodaje joj se rub. Dubina, visina i
#: zakosenje ostaju tacno zadati.
PLINTH_D = 0.35
PLINTH_H = 0.08
PLINTH_CH = 0.012                        # zakosenje gornje i donje ivice
PLINTH_R = 0.03                          # radijus uglova u planu
PLINTH_SEG = 4
PLINTH_MARGIN = 0.015                    # koliko plint prelazi preko prednje stope lepeze
PLINTH_SIDE_MARGIN = 0.06                # rub sa svake bocne strane

#: Uzvisenje pod srednjim panelom. `RISER_H` NIJE nezavisan broj - to je pad
#: lepeze, vidi zaglavlje. `RISER_EMB` je ukop u plint, da dno uzvisenja ne
#: bude koplanarno sa vrhom plinta.
RISER_W = 1.16
RISER_D = 0.17
RISER_H = FAN_DROP
RISER_EMB = 0.012
RISER_CH = 0.008
RISER_R = 0.02
RISER_SEG = 3

SEAT_EMBED = 0.010                       # koliko panel tone ispod svoje povrsine
CLEAR = 0.010                            # prorez izmedju lica panela i usne

#: Usne lezista. `LIP_SEG = 4` je 22.5 stepeni po cosku u planu, ISPOD praga
#: bevela (25) - isti razlog kao `RAIL_FOOT_SEG` na telefonu: vertikalne ivice
#: coskova tako ne prolaze kroz modifikator, pa nema zakrpi po temenima i
#: sest sitnih usana ne pojede budzet.
#:
#: `LIP_L = 0.55` je gornja granica, ne meta. Zaokrenuta usna duzine L zauzima
#: `L*sin(22) + LIP_W*cos(22)` dubine; na 0.55 to je 0.33 W i jos staje u plint
#: od 0.35 W. Na punoj sirini panela usna bi bila 0.52 W duboka i visila bi sa
#: obe strane plinta.
LIP_L = 0.55
LIP_W = 0.03
LIP_H = 0.014
LIP_EMB = 0.010
LIP_R = 0.010
LIP_SEG = 4

# ------------------------------------------------------------------ poza

#: `TILT_DEG` je gore, uz lepezu - naginju se SAMO paneli, oko donje ivice.
YAW_DEG = -19.5                          # ceo model, oko vertikale
NORMALIZE_TO = 2.0                       # najduza osa (SECTION_SPEC sekcija 3)

#: Kamera iz SECTION_SPEC sekcije 3, Blender Z-up.
CAM_POS = (-3.2, -6.4, 2.4)

#: Redosled panela = redosled komada atlasa. Indeks je i indeks trecine u UV-u.
PANELS = ((0, -1), (1, 0), (2, +1))      # (indeks atlasa, znak X)


# ------------------------------------------------------------------ transformacije

def _rot_x(p, a):
    ca, sa = math.cos(a), math.sin(a)
    return (p[0], p[1] * ca - p[2] * sa, p[1] * sa + p[2] * ca)


def _rot_z(p, a):
    ca, sa = math.cos(a), math.sin(a)
    return (p[0] * ca - p[1] * sa, p[0] * sa + p[1] * ca, p[2])


def _land(sign):
    """Visina povrsine na kojoj panel sedi. Srednji stoji na uzvisenju."""
    return RISER_H if sign == 0 else 0.0


def _panel_offset(sign):
    return (sign * FAN_X,
            FAN_BACK if sign != 0 else 0.0,
            _land(sign) - SEAT_EMBED)


def _panel_xform(sign):
    """Panel-lokalno (dno na z = 0) -> prostor gradnje.

    Redosled je obavezan: nagib PRVI, oko lokalne X ose kroz dno panela, pa
    tek onda zaokret lepeze. Obrnuto bi nagnulo panel oko globalne X ose, pa
    bi se bocni paneli naslanjali u stranu umesto unazad i lepeza bi izgubila
    simetriju.
    """
    a = math.radians(sign * FAN_DEG)
    t = math.radians(TILT_DEG)
    ox, oy, oz = _panel_offset(sign)

    def f(p):
        q = _rot_z(_rot_x(p, -t), a)
        return (q[0] + ox, q[1] + oy, q[2] + oz)
    return f


def _seat_xform(sign):
    """Isto mesto i isti zaokret lepeze, ali BEZ nagiba i na svojoj povrsini.

    Usne pripadaju bazi, a baza stoji u vodi. Panel se u prorez naslanja pod
    3.5 stepeni, sto na visini usne (0.024 W) pomera lice za 0.0015 W - sedam
    puta manje od `CLEAR`, pa prorez ostaje otvoren sa obe strane.
    """
    a = math.radians(sign * FAN_DEG)
    ox, oy, _ = _panel_offset(sign)
    oz = _land(sign)

    def f(p):
        q = _rot_z(p, a)
        return (q[0] + ox, q[1] + oy, q[2] + oz)
    return f


# ------------------------------------------------------------------ provera zaokreta

def _screen_normal():
    t, y = math.radians(TILT_DEG), math.radians(YAW_DEG)
    return _rot_z(_rot_x((0.0, -1.0, 0.0), -t), y)


def orientation():
    """Zaokret SREDNJEG ekrana prema kameri, razlozen na dve ose.

    Ista podela kao na telefonu: `YAW_DEG` nije horizontalni zaokret koji se
    vidi - kamera vec stoji 26.565 stepeni levo od prednje normale, pa se vidi
    `26.565 + YAW_DEG`. Nagib nose samo paneli, pa u ovaj racun ulazi
    `TILT_DEG` a ne orijentacija plinta.
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
    return orientation()["offaxis_deg"]


def fan_axis():
    """Vertikalna osa oko koje se lepeza otvara, IZVEDENA iz konstanti.

    Bocni panel je slika srednjeg pod `q -> R q + t`, gde je `R` rotacija za
    `FAN_DEG` a `t` pomeraj (bocno + unazad). Takva transformacija u ravni ima
    tacno jednu fiksnu tacku, `p = (I - R)^-1 t`, i ona JESTE osa rotacije.
    Vertikalni deo pomeraja (`FAN_DROP`) je paralelan osi, pa je ne pomera -
    on je klizanje PO njoj.

    Vraca poziciju ose za desni panel i njeno rastojanje iza prednje ravni
    panela. Ako taj broj ispadne negativan, "osa iza panela" iz zadatka ne
    stoji i lepeza se otvara oko tacke ispred - zato se meri, ne tvrdi.
    """
    a = math.radians(FAN_DEG)                  # desni panel
    ca, sa = math.cos(a), math.sin(a)
    tx, ty = FAN_X, FAN_BACK
    # (I - R) = [[1-ca, sa], [-sa, 1-ca]]
    det = (1.0 - ca) ** 2 + sa ** 2
    px = ((1.0 - ca) * tx - sa * ty) / det
    py = (sa * tx + (1.0 - ca) * ty) / det
    return {
        "axis_x_over_W": round(px, 5),
        "axis_y_over_W": round(py, 5),
        "behind_panel_face_over_W": round(py - Y_FRONT, 5),
        "slide_along_axis_over_W": round(-FAN_DROP, 5),
    }


# ------------------------------------------------------------------ profil

def _rounded_rect(w, h, r, seg):
    """Obod zaobljenog pravougaonika u 2D, 4*(seg+1) temena, CCW.

    Uvucen obod se dobija istim pozivom sa (w-2c, h-2c, r-c): isti broj temena
    i ista korespondencija po indeksu, pa se sve mere citaju kao rastojanje
    temena ISTOG INDEKSA u dva prstena.
    """
    hx, hy = w / 2.0 - r, h / 2.0 - r
    pts = []
    for cx, cy, a0 in ((hx, -hy, -90.0), (hx, hy, 0.0),
                       (-hx, hy, 90.0), (-hx, -hy, 180.0)):
        for s in range(seg + 1):
            a = math.radians(a0 + 90.0 * s / seg)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def _ring_indices(seg=None):
    """Indeksi (dole, desno, gore, levo) u prstenu od 4*(seg+1).

    Funkcija a ne konstante: `CORNER_SEG` se tokom kalibracije budzeta menja
    spolja (`M.CORNER_SEG = 8`), a konstante izracunate na import-u bi citale
    pogresna temena.
    """
    s = CORNER_SEG if seg is None else seg
    return (0, s, 2 * (s + 1) - 1, 3 * (s + 1))


# ------------------------------------------------------------------ panel

def _panel_shell(place):
    """Ram jednog panela: okvir, dzep ekrana, bocna traka, ledja.

        r1  prednja ravan, spoljni obris   OUT @ Y_FRONT
        r2  zadnja ravan, spoljni obris    OUT @ Y_BACK
        r3  obod otvora ekrana             SCR @ Y_FRONT
        r4  obod dna dzepa                 SCR @ Y_FRONT + CAVITY_D

    Bez zakosenja po obimu, za razliku od telefona: zakosenje su dve dodatne
    prstenaste ivice po panelu, tj. sest na modelu, a svaka ide kroz bevel i
    plati se punom trakom segmenata. Na panelu debelom 0.05 W bevel modifikator
    daje isti masinski rub jeftinije (isto resenje kao `branding`).

    Svaka ivica pripada tacno dva lica, pa je shell manifold po konstrukciji.
    """
    p_out = _rounded_rect(PANEL_W, PANEL_H, CORNER_R, CORNER_SEG)
    p_scr = _rounded_rect(SCREEN_W, SCREEN_H, SCREEN_R, CORNER_SEG)
    n = len(p_out)
    dz = PANEL_H / 2.0                    # profil je centriran, dno panela na z = 0

    verts, faces = [], []

    def ring(prof, y):
        base = len(verts)
        for x, z in prof:
            verts.append(place((x, y, z + dz)))
        return base

    r1 = ring(p_out, Y_FRONT)
    r2 = ring(p_out, Y_BACK)
    r3 = ring(p_scr, Y_FRONT)
    r4 = ring(p_scr, Y_FRONT + CAVITY_D)

    def band(a, b):
        for k in range(n):
            m = (k + 1) % n
            faces.append([a + k, a + m, b + m, b + k])

    band(r1, r3)                          # okvir
    band(r3, r4)                          # zid dzepa
    band(r1, r2)                          # bocna traka
    faces.append(list(range(r4, r4 + n)))     # dno dzepa
    faces.append(list(range(r2, r2 + n)))     # ledja

    return verts, faces, {"r1": r1, "r2": r2, "r3": r3, "r4": r4, "n": n}


# ------------------------------------------------------------------ baza

def _chamfered_box(w, d, h, ch, r, seg, z0, place):
    """Nizak masinski kvadar sa zaobljenim uglovima u planu i zakosenom
    gornjom i donjom ivicom.

    Jedan oblik za tri stvari na modelu - plint, uzvisenje i sest usana - jer
    su sve tri isto: nizak blok kome se vidi da je obradjen. Zakosenje je
    modelovano a ne prepusteno bevelu iz istog razloga iz kog i na telefonu:
    ono nosi karakter i mora da bude iste sirine bez obzira na to koliko je
    bevel u Fazi A sirok.

        b_in  @ z0        uvucen obris, dno
        b_out @ z0+ch     spoljni obris
        t_out @ z0+h-ch   spoljni obris
        t_in  @ z0+h      uvucen obris, vrh
    """
    outer = _rounded_rect(w, d, r, seg)
    inner = _rounded_rect(w - 2.0 * ch, d - 2.0 * ch, r - ch, seg)
    n = len(outer)
    verts, faces = [], []

    def ring(prof, z):
        base = len(verts)
        for x, y in prof:
            verts.append(place((x, y, z)))
        return base

    b_in = ring(inner, z0)
    b_out = ring(outer, z0 + ch)
    t_out = ring(outer, z0 + h - ch)
    t_in = ring(inner, z0 + h)

    def band(a, b):
        for k in range(n):
            m = (k + 1) % n
            faces.append([a + k, a + m, b + m, b + k])

    band(b_in, b_out)
    band(b_out, t_out)
    band(t_out, t_in)
    faces.append(list(range(b_in, b_in + n)))
    faces.append(list(range(t_in, t_in + n)))
    return verts, faces, {"b_in": b_in, "b_out": b_out,
                          "t_out": t_out, "t_in": t_in, "n": n}


def _box(w, d, h, r, seg, z0, place):
    """Nizak blok BEZ zakosenja - dva prstena, bocna traka, dno i vrh.

    Usne ga koriste umesto `_chamfered_box` zbog bevela u Fazi A. Zakosenje od
    `LIP_CH` bi na usni visokoj 0.014 W dalo traku od 0.0057 W, tj. 0.0037
    sveta posle normalizacije - uze od dva bevela (0.0052) i jedino mesto na
    modelu gde bi `use_clamp_overlap` morao da interveniše. Bez zakosenja tu
    stoji ivica od 90 stepeni, koju bevel zaobli sam, a traka koju mora da
    postuje postaje visina usne (0.014 W) - trostruko komotnije.
    """
    prof = _rounded_rect(w, d, r, seg)
    n = len(prof)
    verts, faces = [], []
    for z in (z0, z0 + h):
        for x, y in prof:
            verts.append(place((x, y, z)))
    for k in range(n):
        m = (k + 1) % n
        faces.append([k, m, n + m, n + k])
    faces.append(list(range(n)))
    faces.append(list(range(n, 2 * n)))
    return verts, faces, {"bottom": 0, "top": n, "n": n}


def _lips(sign):
    """Par usana lezista, napred i nazad od panela.

    Usna je pomerena za `PANEL_T/2 + CLEAR + LIP_W/2` od ose panela, pa je
    prorez sa obe strane tacno `CLEAR`. Ukopana je `LIP_EMB` u svoju povrsinu,
    da joj dno ne bude koplanarno sa vrhom plinta odnosno uzvisenja.
    """
    place = _seat_xform(sign)
    off = PANEL_T / 2.0 + CLEAR + LIP_W / 2.0
    out_v, out_f, bases = [], [], []
    for s in (-1.0, +1.0):
        v, f, _ = _box(
            LIP_L, LIP_W, LIP_H + LIP_EMB, LIP_R, LIP_SEG,
            -LIP_EMB, lambda p, s=s: place((p[0], p[1] + s * off, p[2])))
        o = len(out_v)
        bases.append(o)
        out_v += v
        out_f += [[i + o for i in fc] for fc in f]
    return out_v, out_f, bases


# ------------------------------------------------------------------ ekran

def _screen_plates():
    """TRI ploce u JEDNOM mesh-u, UV u tri trecine JEDNOG atlasa.

    UV je planarna projekcija preko SOPSTVENOG bbox-a ploce, racunata u
    prostoru gradnje pre ikakve rotacije, pa je nezavisna od poze. Bbox je
    tacno SCREEN_W x SCREEN_H, a odnos stranica je odnos komada atlasa, pa
    slika legne bez rastezanja a zaobljeni coskovi je samo isecu.

    Trecina se dodeljuje po indeksu panela sleva nadesno, sto je isti redosled
    u kom su komadi u atlasu. Islands se ne preklapaju po konstrukciji: `u`
    ploce `k` nikad ne izlazi iz `[k/3, (k+1)/3]` jer je `(x + W/2)/W ∈ [0,1]`.
    """
    prof = _rounded_rect(SCREEN_W, SCREEN_H, SCREEN_R, CORNER_SEG)
    dz = PANEL_H / 2.0
    y = Y_FRONT + RECESS
    verts, uvs, faces = [], [], []
    for idx, sign in PANELS:
        place = _panel_xform(sign)
        base = len(verts)
        for x, z in prof:
            verts.append(place((x, y, z + dz)))
            uvs.append(((idx + (x + SCREEN_W / 2.0) / SCREEN_W) / float(ATLAS_TILES),
                        (z + SCREEN_H / 2.0) / SCREEN_H))
        faces.append(list(range(base, base + len(prof))))
    return verts, uvs, faces, len(prof)


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

    body_verts, body_faces = [], []
    ranges = {}

    for idx, sign in PANELS:
        v, f, rr = _panel_shell(_panel_xform(sign))
        o = len(body_verts)
        body_verts += v
        body_faces += [[i + o for i in fc] for fc in f]
        ranges["panel_%d" % idx] = {k: (val + o if k != "n" else val)
                                    for k, val in rr.items()}
        ranges["panel_%d" % idx]["start"] = o
        ranges["panel_%d" % idx]["end"] = len(body_verts)

    # Plint se pozicionira tek sada, jer mu polozaj po dubini zavisi od stope
    # lepeze - vidi zaglavlje. Prednja ivica pokriva najistureniju tacku
    # panela, ostatak izlazi pozadi gde ga sami paneli zaklanjaju.
    fan_y_min = min(v[1] for v in body_verts)
    plinth_cy = fan_y_min - PLINTH_MARGIN + PLINTH_D / 2.0
    fan_w = max(v[0] for v in body_verts) - min(v[0] for v in body_verts)
    plinth_w = fan_w + 2.0 * PLINTH_SIDE_MARGIN

    v, f, rr = _chamfered_box(
        plinth_w, PLINTH_D, PLINTH_H, PLINTH_CH, PLINTH_R, PLINTH_SEG,
        -PLINTH_H, lambda p: (p[0], p[1] + plinth_cy, p[2]))
    o = len(body_verts)
    body_verts += v
    body_faces += [[i + o for i in fc] for fc in f]
    ranges["plinth"] = {k: (val + o if k != "n" else val) for k, val in rr.items()}

    v, f, rr = _chamfered_box(
        RISER_W, RISER_D, RISER_H + RISER_EMB, RISER_CH, RISER_R, RISER_SEG,
        -RISER_EMB, lambda p: p)
    o = len(body_verts)
    body_verts += v
    body_faces += [[i + o for i in fc] for fc in f]
    ranges["riser"] = {k: (val + o if k != "n" else val) for k, val in rr.items()}

    for idx, sign in PANELS:
        v, f, bases = _lips(sign)
        o = len(body_verts)
        body_verts += v
        body_faces += [[i + o for i in fc] for fc in f]
        ranges["lips_%d" % idx] = [b + o for b in bases]

    s_verts, s_uvs, s_faces, plate_n = _screen_plates()
    ranges["plate_n"] = plate_n

    yaw = math.radians(YAW_DEG)
    body_verts = [_rot_z(p, yaw) for p in body_verts]
    s_verts = [_rot_z(p, yaw) for p in s_verts]

    # centriranje + jednolika skala nad OBA mesh-a zajedno: ploce moraju da
    # ostanu u ramovima, pa se bbox racuna nad unijom, nikad po objektu
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
    # ploce su otvorene povrsine - recalc nema "spolja" da odredi, pa se
    # namotaj zakljucava rucno: CCW u ravni X-Z daje normalu -Y, ka posmatracu
    me_screen = _make_mesh(SCREEN, s_verts, s_faces, recalc=False)

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
        "plinth_cy": round(plinth_cy, 5),
        "plinth_w_derived": round(plinth_w, 5),
        "mesh_bbox_gltf_xyz": [round((hi[0] - lo[0]) * k, 4),
                               round((hi[2] - lo[2]) * k, 4),
                               round((hi[1] - lo[1]) * k, 4)],
        "normalize_scale": round(k, 6),
        "body_uv_layers": [u.name for u in me_body.uv_layers],
        "screen_uv_layers": [u.name for u in me_screen.uv_layers],
        "orientation": orientation(),
        "orientation_measured": measure_orientation(),
        "fan_axis": fan_axis(),
        "tilt_deg": TILT_DEG, "yaw_deg_applied": YAW_DEG,
        "proportions": verify_proportions(ranges),
        "uv": verify_uv(ranges),
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


def _plate_frame(S, idx, n):
    """(centar, normala, osa sirine, osa visine) jedne ploce, iz gotovog mesh-a."""
    B, R, T, L = _ring_indices()
    o = idx * n
    p = S[o:o + n]
    ctr = p[0].copy()
    for q in p[1:]:
        ctr = ctr + q
    ctr = ctr / len(p)
    nrm = _plane_n(p[B], p[R], p[T])
    u = (p[R] - p[L]).normalized()
    v = (p[T] - p[B]).normalized()
    return ctr, nrm, u, v


def measure_orientation():
    """Isto sto i `orientation()`, ali iz GOTOVOG MESH-A.

    `orientation()` racuna iz konstanti i zato ne moze da uhvati gresku u lancu
    transformacija - ako se rotacije ikad primene pogresnim redom ili se ploci
    obrne namotaj, konstante bi i dalje javljale tacan broj.
    """
    me = bpy.data.objects[SCREEN].data
    S = [v.co for v in me.vertices]
    n_ring = len(S) // ATLAS_TILES
    _, n, _, _ = _plate_frame(S, 1, n_ring)          # SREDNJA ploca
    r = math.sqrt(sum(c * c for c in CAM_POS))
    c = [v / r for v in CAM_POS]
    dot = max(-1.0, min(1.0, sum(a * b for a, b in zip(n, c))))
    if dot < 0.0:
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


def verify_uv(ranges):
    """UV se meri iz gotovog mesh-a: granice svakog ostrva, preklop i gustina.

    Tri stvari koje UV render ne moze da dokaze brojem, a ovde se dokazuju:
    da nijedno ostrvo ne izlazi iz svoje trecine, da se dva ostrva nigde ne
    seku po `u`, i da je teksela po jedinici sveta ista u `u` i `v` - poslednje
    je definicija "bez distorzije".
    """
    ob = bpy.data.objects[SCREEN]
    me = ob.data
    uvl = me.uv_layers.active
    n = ranges["plate_n"]
    S = [v.co for v in me.vertices]

    islands = []
    for idx, _sign in PANELS:
        us, vs = [], []
        for loop in me.loops:
            if idx * n <= loop.vertex_index < (idx + 1) * n:
                uv = uvl.data[loop.index].uv
                us.append(uv[0])
                vs.append(uv[1])
        lo, hi = idx / float(ATLAS_TILES), (idx + 1) / float(ATLAS_TILES)
        islands.append({
            "tile": idx,
            "u_range": [round(min(us), 6), round(max(us), 6)],
            "v_range": [round(min(vs), 6), round(max(vs), 6)],
            "u_target": [round(lo, 6), round(hi, 6)],
            "u_error": round(max(abs(min(us) - lo), abs(max(us) - hi)), 8),
            "v_error": round(max(abs(min(vs)), abs(max(vs) - 1.0)), 8),
        })

    # gustina: piksela atlasa po jedinici sveta, po `u` i po `v`
    ctr, _, u_ax, v_ax = _plate_frame(S, 1, n)
    w_world = max((p - ctr).dot(u_ax) for p in S[n:2 * n]) \
        - min((p - ctr).dot(u_ax) for p in S[n:2 * n])
    h_world = max((p - ctr).dot(v_ax) for p in S[n:2 * n]) \
        - min((p - ctr).dot(v_ax) for p in S[n:2 * n])
    px_u = ATLAS_TILE_PX[0] / w_world
    px_v = ATLAS_TILE_PX[1] / h_world

    overlaps = []
    for i in range(len(islands)):
        for j in range(i + 1, len(islands)):
            a, b = islands[i]["u_range"], islands[j]["u_range"]
            overlaps.append(round(min(a[1], b[1]) - max(a[0], b[0]), 8))

    return {
        "layer": uvl.name,
        "islands": islands,
        "max_u_error": round(max(i["u_error"] for i in islands), 8),
        "max_v_error": round(max(i["v_error"] for i in islands), 8),
        "max_island_u_overlap": round(max(overlaps), 8),
        "px_per_world_u": round(px_u, 4),
        "px_per_world_v": round(px_v, 4),
        "anisotropy": round(px_u / px_v, 8),
    }


def verify_proportions(ranges):
    """Izmeri sve odnose IZ GOTOVOG MESH-A, ne iz konstanti.

    Ceo lanac je kruta rotacija plus JEDNOLIKA skala, pa rastojanja trpe samo
    faktor k - a k se skrati cim se sve podeli sa W. Zato merenje ne mora da
    vraca mesh u prostor gradnje.

    Uglovi lepeze, preklop i pomeraji se mere u RAMU SREDNJEG PANELA (njegova
    normala i osa sirine), a ne po globalnim osama - globalne ose posle
    `YAW_DEG` vise nisu vezane ni za sta na modelu.
    """
    V = [v.co for v in bpy.data.objects[BODY].data.vertices]
    S = [v.co for v in bpy.data.objects[SCREEN].data.vertices]
    n = ranges["plate_n"]
    B, R, T, L = _ring_indices()

    def d(a, b):
        return (a - b).length

    mid_ctr, mid_n, mid_u, mid_v = _plate_frame(S, 1, n)
    #: SVE se deli sirinom SREDNJEG PANELA - to je `W` iz zadatka. Ekran je
    #: uzi za dva okvira i njegove mere idu odvojeno.
    r1_mid = ranges["panel_1"]["r1"]
    W = d(V[r1_mid + R], V[r1_mid + L])
    SW = d(S[n + R], S[n + L])
    SH = d(S[n + B], S[n + T])

    # --- panel po panel
    panels = {}
    normals = {}
    for idx, sign in PANELS:
        rr = ranges["panel_%d" % idx]
        r1, r2, r3 = rr["r1"], rr["r2"], rr["r3"]
        ctr, nrm, _u, _v = _plate_frame(S, idx, n)
        normals[idx] = nrm
        cos_fan = max(-1.0, min(1.0, nrm.dot(mid_n)))
        panels[idx] = {
            "sign": sign,
            "panel_w": round(d(V[r1 + R], V[r1 + L]) / W, 5),
            "panel_h": round(d(V[r1 + B], V[r1 + T]) / W, 5),
            "thickness": round(d(V[r1 + B], V[r2 + B]) / W, 5),
            "frame_bottom": round(d(V[r1 + B], V[r3 + B]) / W, 5),
            "frame_top": round(d(V[r1 + T], V[r3 + T]) / W, 5),
            "frame_left": round(d(V[r1 + L], V[r3 + L]) / W, 5),
            "frame_right": round(d(V[r1 + R], V[r3 + R]) / W, 5),
            "corner_r": round(_circum_r(V[r1], V[r1 + 1], V[r1 + 2]) / W, 5),
            "screen_corner_r": round(
                _circum_r(S[idx * n], S[idx * n + 1], S[idx * n + 2]) / W, 5),
            "recess": round(abs((ctr - V[r1 + B]).dot(nrm)) / W, 5),
            "fan_deg": round(math.degrees(math.acos(cos_fan)), 3),
            # pomeraj centra ploce prema srednjoj, u ramu srednje ploce
            "back_over_W": round((ctr - mid_ctr).dot(mid_n) * -1.0 / W, 5),
            "drop_over_W": round((mid_ctr[2] - ctr[2]) / W, 5),
        }

    # --- razmak, meren kao rastojanje intervala po osi sirine SREDNJEG panela.
    #
    # Meri se DVAPUT: nad celim panelom (dno) i nad gornjom cetvrtinom (vrh).
    # Razmak nije konstantan po visini - nagib unazad ga suzava ka vrhu - a
    # silueta se cita na vrhu, pa je taj broj onaj koji odlucuje.
    z_top = max(p[2] for p in V[ranges["panel_1"]["start"]:ranges["panel_1"]["end"]])
    z_cut = z_top - 0.25 * (z_top - min(
        p[2] for p in V[ranges["panel_1"]["start"]:ranges["panel_1"]["end"]]))

    def _spans(top_only):
        out = {}
        for idx, _s in PANELS:
            rr = ranges["panel_%d" % idx]
            pv = [p for p in V[rr["start"]:rr["end"]]
                  if (not top_only or p[2] >= z_cut)]
            proj = [(p - mid_ctr).dot(mid_u) for p in pv]
            out[idx] = (min(proj), max(proj))
        return out

    spans = _spans(False)
    spans_top = _spans(True)

    def gap(sp, a, b):
        return max(sp[a][0], sp[b][0]) - min(sp[a][1], sp[b][1])

    side_proj_w = spans[2][1] - spans[2][0]
    group = (min(s[0] for s in spans.values()), max(s[1] for s in spans.values()))

    # --- baza
    pl, ri = ranges["plinth"], ranges["riser"]
    pn, rn = pl["n"], ri["n"]
    pB, pR, pT, pL = _ring_indices(PLINTH_SEG)
    rB, rR, rT, rL = _ring_indices(RISER_SEG)
    up = (V[ri["t_in"] + rB] - V[ri["b_in"] + rB]).normalized()

    lips = {}
    lB, lR, lT, lL = _ring_indices(LIP_SEG)
    ln = 4 * (LIP_SEG + 1)
    for idx, _s in PANELS:
        front_lip = ranges["lips_%d" % idx][0]
        out = front_lip                            # donji prsten usne
        top = front_lip + ln                       # gornji prsten usne
        # povrsina na kojoj usna stoji - uzvisenje za srednji, plint za bocne
        land = V[ri["t_in"] + rB] if idx == 1 else V[pl["t_in"] + pB]
        rr = ranges["panel_%d" % idx]
        lips[idx] = {
            "length": round(d(V[out + lR], V[out + lL]) / W, 5),
            "width": round(d(V[out + lB], V[out + lT]) / W, 5),
            "height_over_land": round((V[top + lB] - land).dot(up) / W, 5),
            # prorez: unutrasnje lice PREDNJE usne (indeks lT je +Y kraj njenog
            # obrisa) prema prednjoj ravni panela, po normali TOG panela
            "clearance": round(
                (V[top + lT] - V[rr["r1"] + B]).dot(normals[idx]) / W, 5),
            # koliko panel tone ispod svoje povrsine (mereno u najnizoj tacki,
            # pa nosi i 0.0015 W od nagiba donjeg lica)
            "seat_embed": round((land[2] - min(p[2] for p in
                                V[rr["start"]:rr["end"]])) / W, 5),
        }

    return {
        "panel_W_world": round(W, 5),
        "screen_w": round(SW / W, 5),
        "screen_h": round(SH / W, 5),
        "screen_aspect": round(SW / SH, 6),
        "screen_aspect_target": round(ATLAS_TILE_PX[0] / ATLAS_TILE_PX[1], 6),
        "panels": panels,
        "gap_bottom_right_over_W": round(gap(spans, 1, 2) / W, 5),
        "gap_bottom_left_over_W": round(gap(spans, 0, 1) / W, 5),
        "gap_top_right_over_W": round(gap(spans_top, 1, 2) / W, 5),
        "gap_top_left_over_W": round(gap(spans_top, 0, 1) / W, 5),
        "equivalent_overlap": round(OVERLAP, 5),
        "side_projected_w_over_W": round(side_proj_w / W, 5),
        "group_width_over_W": round((group[1] - group[0]) / W, 5),
        "group_centre_offset_over_W": round((group[0] + group[1]) / 2.0 / W, 6),
        "plinth_w": round(d(V[pl["b_out"] + pR], V[pl["b_out"] + pL]) / W, 5),
        "plinth_d": round(d(V[pl["b_out"] + pB], V[pl["b_out"] + pT]) / W, 5),
        "plinth_h": round(abs((V[pl["t_in"] + pB] - V[pl["b_in"] + pB]).dot(up)) / W, 5),
        "plinth_chamfer": round(abs((V[pl["b_out"] + pB]
                                     - V[pl["b_in"] + pB]).dot(up)) / W, 5),
        "riser_w": round(d(V[ri["t_in"] + rR], V[ri["t_in"] + rL]) / W, 5),
        "riser_d": round(d(V[ri["t_in"] + rB], V[ri["t_in"] + rT]) / W, 5),
        "riser_h_over_plinth": round(
            (V[ri["t_in"] + rB] - V[pl["t_in"] + pB]).dot(up) / W, 5),
        "lips": lips,
        "ring_verts": ranges["panel_0"]["n"],
    }
