"""ZAKLJUCANA putanja hero-kocke (Faza A). Ciste funkcije - bez bpy.

Topologija je IZMERENA iz `blender/refs/one_line_cube.glb`, nije izmisljena.
Postupak je u `ops/extract_ref.py`; rezultat je zakljucan ovde radi determinizma.

STA JE IZMERENO
---------------
18 greda, svaka stepena tacno 2, nula preklapanja greda -> JEDAN ZATVOREN CIKLUS
od 18 segmenata. Devetnaesta greda koju je ekstrakcija izbacila imala je stepen 0
(nije se spajala ni sa cim) i odbacena je - graf ju je sam odbio, nije rucno
uklonjena.

Svaka koordinata pada na resetku {+-1, +-s} gde je s ~ 0.78 izmereno sa reference.
`s` je jedini slobodan parametar: to je nivo na koji je ram uvucen u odnosu na
stranicu kocke. Manje `s` = veci razmak izmedju udvojenih paralelnih greda.

GEOMETRIJA KOJA IZ TOGA SLEDI
-----------------------------
Duzine segmenata su DVE, ne jedna:
    12 segmenata duzine (1 + s)      ~ 1.78 pri s=0.78
     6 segmenata duzine (2 * s)      ~ 1.56 pri s=0.78
Obrazac se ponavlja sa periodom 3 (dugacak, kratak, dugacak) sest puta - odatle
sestostruka rotaciona simetrija oblika.

Sest greda lezi tacno na ivicama kocke i one cine Petrijev sestougao kocke;
preostalih 12 su uvucene. Zato se citaju kao "ram kome fali cosak".

RAZMAK IZMEDJU UDVOJENIH GREDA
------------------------------
Dve paralelne grede na nivoima 1 i s razmaknute su za (1 - s); posle oduzimanja
sirine grede `w` cist vazduh izmedju njih je:

    gap = (1 - s) - w

Na referenci: (1 - 0.78) - 0.19 = 0.03 -> grede se skoro dodiruju. To je ono sto
je Jovan primetio kao "mnogo su blizu". Sirina sa loga je 6-8% raspona (raspon =
2), tj. w ~ 0.14, sto samo po sebi dize gap na 0.08.
"""

# ---------------------------------------------------------------- topologija

#: 18 cospova kao (znak, nivo) po osi; nivo 0 = +-1 (stranica), 1 = +-s (uvuceno).
#: Izlaz iz ops/extract_ref.py, obilazak ciklusa. NE MENJATI RUCNO.
CORNERS = [
    ((-1, 1), (+1, 0), (-1, 1)),
    ((-1, 1), (+1, 0), (+1, 0)),
    ((+1, 1), (+1, 0), (+1, 0)),
    ((+1, 1), (-1, 1), (+1, 0)),
    ((-1, 0), (-1, 1), (+1, 0)),
    ((-1, 0), (+1, 1), (+1, 0)),
    ((-1, 0), (+1, 1), (-1, 1)),
    ((-1, 0), (-1, 0), (-1, 1)),
    ((-1, 0), (-1, 0), (+1, 1)),
    ((+1, 1), (-1, 0), (+1, 1)),
    ((+1, 1), (-1, 0), (-1, 0)),
    ((-1, 1), (-1, 0), (-1, 0)),
    ((-1, 1), (+1, 1), (-1, 0)),
    ((+1, 0), (+1, 1), (-1, 0)),
    ((+1, 0), (-1, 1), (-1, 0)),
    ((+1, 0), (-1, 1), (+1, 1)),
    ((+1, 0), (+1, 0), (+1, 1)),
    ((+1, 0), (+1, 0), (-1, 1)),
]

#: uvlacenje izmereno sa reference
INSET_REF = 0.78

#: sirina grede izmerena sa reference, u jedinicama gde je polu-raspon = 1
WIDTH_REF = 0.19

#: sirina sa loga: 6-8% raspona kocke (raspon = 2) -> sredina opsega
WIDTH_LOGO = 0.14


def square_hole_z(inset, width):
    """Z nivoi pri kojima je otvor bocne stranice KVADRAT, a gornji/donji ram
    naleze tacno na bocne (dodiruju se, ne preklapaju).

    Izvod
    -----
    Bocna stranica (npr. y=+1) ima ram: levo x=-s, desno x=+1, gore z=+zo,
    dole z=-zi. Otvor je omedjen unutrasnjim povrsinama greda:

        sirina po X = (1 - w/2) - (-s + w/2) = 1 + s - w
        visina po Z = (zo - w/2) - (-zi + w/2) = zo + zi - w

    Kvadrat  =>  zo + zi = 1 + s.

    Donja povrsina gornjeg rama je zo - w/2; gornja povrsina bocnog rama je
    zi + w/2. Da se dodiruju:  zo - w/2 = zi + w/2  =>  zo = zi + w.

    Iz to dvoje:
        zi = (1 + s - w) / 2
        zo = (1 + s + w) / 2

    Gornja i donja stranica (normala +-Z) imaju otvor 1 + s - w po obe ose vec
    po konstrukciji, jer koriste samo nivoe +-1 i +-s. Tako su SVE sest rupa
    kvadrati iste velicine: (1 + s - w).
    """
    zi = (1.0 + inset - width) / 2.0
    return zi, zi + width


def build(inset=INSET_REF, width=WIDTH_LOGO, square_holes=True,
          z_inner=None, z_outer=None):
    """Zatvorena putanja kao lista temena. Poslednje teme == prvo.

    `inset`        nivo uvucenog rama po X i Y (referenca: 0.78).
    `square_holes` izvedi Z nivoe iz `square_hole_z` tako da su sve rupe
                   kvadrati i da gornji/donji ram naleze na bocne.
    `z_inner` / `z_outer`  rucno gaziranje Z nivoa; gase `square_holes`.

    Referentne vrednosti (square_holes=False) su z_inner=inset, z_outer=1.0 -
    tako je u refs modelu, gde gornji ram viri iznad bocnih za (1 - inset - w)
    i pravi vidljiv stepenik.
    """
    if z_inner is None or z_outer is None:
        if square_holes:
            zi, zo = square_hole_z(inset, width)
        else:
            zi, zo = inset, 1.0
        z_inner = zi if z_inner is None else z_inner
        z_outer = zo if z_outer is None else z_outer

    pts = []
    for c in CORNERS:
        p = []
        for axis, (sign, level) in enumerate(c):
            if axis == 2:
                p.append(sign * (z_outer if level == 0 else z_inner))
            else:
                p.append(sign * (1.0 if level == 0 else inset))
        pts.append(tuple(p))
    pts.append(pts[0])
    return pts


def hole_sizes(inset, width, z_inner=None, z_outer=None, square_holes=True):
    """Velicine sve tri klase rupa - za verifikaciju da su kvadrati."""
    if z_inner is None or z_outer is None:
        zi, zo = square_hole_z(inset, width) if square_holes else (inset, 1.0)
        z_inner = zi if z_inner is None else z_inner
        z_outer = zo if z_outer is None else z_outer
    xy = 1.0 + inset - width
    z = z_outer + z_inner - width
    return {
        "top_bottom_faces": (round(xy, 6), round(xy, 6)),
        "side_faces": (round(xy, 6), round(z, 6)),
        "all_square": abs(xy - z) < 1e-9,
        "z_inner": round(z_inner, 6), "z_outer": round(z_outer, 6),
    }


def gap(inset=INSET_REF, width=WIDTH_REF):
    """Cist vazduh izmedju dve paralelne grede na nivoima 1 i `inset`."""
    return (1.0 - inset) - width


def inset_for_gap(target_gap, width=WIDTH_LOGO):
    """Koje `inset` daje trazeni razmak pri datoj sirini grede."""
    return 1.0 - (target_gap + width)


def segment_lengths(inset=INSET_REF):
    """Ocekivane duzine: 12 x (1+inset), 6 x (2*inset)."""
    return {round(1.0 + inset, 6): 12, round(2.0 * inset, 6): 6}
