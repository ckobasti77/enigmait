"""Rekonstrukcije putanje hero-kocke. Ciste funkcije - bez bpy.

Dizajn (Jovan): jedna izlomljena sipka. Svaka stranica kocke je kvadratni ram
kome fali jedan cosak, i na tom prekidu se linija preliva na susednu stranicu.

DOKAZ KOJI JE OBLIKOVAO OVAJ MODUL
----------------------------------
Varijanta u kojoj svaka stranica zadrzava SVE 4 strane a prekinuta je samo u
jednom cosku NE MOZE da bude jedna petlja:

  Bez ijednog prekida stranice su 6 nezavisnih 4-ciklusa = 6 petlji.
  Da se 6 petlji svede na 1 treba 5 spajanja. Prekid u temenu kocke prespaja
  krajeve stranica koje se tu prekidaju; teme kocke dodiruje 3 stranice, pa
  jedno mesto prekida spaja najvise 3 petlje u 1, tj. smanjuje broj petlji za
  najvise 2. Ukupno prekida je 6 (tacno jedan po stranici), pa je najveci
  moguci zbir smanjenja sum(k_i - 1) uz sum(k_i) = 6 i k_i <= 3 jednak 4
  (raspodela 3+3). 4 < 5  =>  ostaju bar 2 petlje. QED.

Zato svaka stranica koristi 3 od 4 ivice (U-oblik, fali cela strana), sto daje
18 upotreba preko 12 ivica: 6 ivica dvaput, 6 jednom. Iscrpna pretraga nalazi
32 resenja u 11 klasa po simetriji kocke. Klase 0 i 3 su jedine kod kojih su
SVI segmenti ose-poravnati i nema probijanja greda - one su zakljucane dole.

Ramovi se uvlace za `d` da dve grede na udvojenim ivicama ne bi bile poklopljene
(poklopljene grede => t je dvoznacan => animacija u Fazi C ne radi). Uvlacenje
uvodi kratke L-konektore duzine `d` na 6 spojeva.

  mode="inplane"  ram uvucen U SVOJOJ RAVNI; konektori idu po ivicama kocke
  mode="normal"   ram pun (uglovi na +-1) ali pomeren duz svoje normale;
                  konektori prolaze tacno kroz cosak kocke
"""

import itertools
from collections import defaultdict

# ---------------------------------------------------------------- topologija

VERTS = [(i, j, k) for i in (0, 1) for j in (0, 1) for k in (0, 1)]
VIDX = {v: n for n, v in enumerate(VERTS)}

#: 6 stranica kao (osa normale, bit znaka)
FACES = [(a, s) for a in range(3) for s in (0, 1)]


def coord(bit):
    """bit 0/1 -> koordinata -1/+1"""
    return 2.0 * bit - 1.0


def face_cycle(face):
    """4 temena stranice u redosledu obilaska."""
    a, s = face
    u, w = [x for x in range(3) if x != a]
    out = []
    for bu, bw in ((0, 0), (1, 0), (1, 1), (0, 1)):
        v = [0, 0, 0]
        v[a], v[u], v[w] = s, bu, bw
        out.append(tuple(v))
    return out


def face_edges(face):
    c = face_cycle(face)
    return [(c[i], c[(i + 1) % 4]) for i in range(4)]


def _ekey(e):
    a, b = VIDX[e[0]], VIDX[e[1]]
    return (a, b) if a < b else (b, a)


# ---------------------------------------------------------------- pretraga

def search_u_configs():
    """Sva resenja: po stranici izostavi 1 od 4 ivice, spoji u JEDNU petlju.

    Zadrzano radi reproducibilnosti - CANDIDATES ispod su njeni izlazi.
    """
    solutions = []
    for combo in itertools.product(range(4), repeat=6):
        ends, used = {}, defaultdict(int)
        for fi, face in enumerate(FACES):
            fe = face_edges(face)
            omitted = fe[combo[fi]]
            ends[fi] = (omitted[0], omitted[1])
            for e in fe:
                if e != omitted:
                    used[_ekey(e)] += 1
        if any(c > 2 for c in used.values()) or sum(used.values()) != 18:
            continue

        at = defaultdict(list)
        for fi, (v1, v2) in ends.items():
            at[v1].append(fi)
            at[v2].append(fi)
        if any(len(v) % 2 for v in at.values()):
            continue

        for pairing in _pairings(at):
            adj = defaultdict(list)
            bad = False
            for f1, f2 in pairing:
                if f1 == f2:
                    bad = True
                    break
                adj[f1].append(f2)
                adj[f2].append(f1)
            if bad:
                continue
            if all(len(adj[f]) == 2 for f in range(6)) and _single_cycle(adj):
                solutions.append({
                    "omitted": combo,
                    "pairing": tuple(sorted(tuple(sorted(p)) for p in pairing)),
                    "doubled_edges": sorted(k for k, c in used.items() if c == 2),
                })
                break
    return solutions


def _pairings(at):
    per_vertex = [list(_perfect_matchings(f)) for f in at.values()]
    for combo in itertools.product(*per_vertex):
        yield [p for m in combo for p in m]


def _perfect_matchings(items):
    if not items:
        yield []
        return
    first, rest = items[0], items[1:]
    for i in range(len(rest)):
        remaining = rest[:i] + rest[i + 1:]
        for m in _perfect_matchings(remaining):
            yield [(first, rest[i])] + m


def _single_cycle(adj):
    seen, cur, prev = {0}, 0, None
    for _ in range(6):
        nxts = [x for x in adj[cur] if x != prev]
        if not nxts:
            return False
        prev, cur = cur, nxts[0]
        if cur == 0:
            break
        if cur in seen:
            return False
        seen.add(cur)
    return len(seen) == 6 and cur == 0


# ---------------------------------------------------------------- geometrija

def _face_order(pairing):
    adj = defaultdict(list)
    for f1, f2 in pairing:
        adj[f1].append(f2)
        adj[f2].append(f1)
    order, prev, cur = [], None, 0
    for _ in range(6):
        order.append(cur)
        cur, prev = [x for x in adj[cur] if x != prev][0], cur
    return order


def build_path(sol, mode="inplane", d=0.26):
    """Konkretna zatvorena putanja kao lista 3D temena.

    Poslednje teme je jednako prvom (zatvorena petlja).
    """
    combo = sol["omitted"]
    upath = {}
    for fi, face in enumerate(FACES):
        cyc = face_cycle(face)
        oi = combo[fi]
        upath[fi] = [cyc[(oi + 1 + k) % 4] for k in range(4)]

    def corner(face, v):
        """Ugao rama stranice `face` kod temena kocke `v`."""
        a, s = face
        p = [0.0, 0.0, 0.0]
        for ax in range(3):
            if ax == a:
                p[ax] = coord(s) * (1.0 - d) if mode == "normal" else coord(s)
            else:
                p[ax] = coord(v[ax]) * (1.0 - d) if mode == "inplane" else coord(v[ax])
        return tuple(p)

    def bridge(fA, fB, v):
        """Medjutacka L-konektora izmedju rama fA i rama fB kod temena v."""
        aA, sA = fA
        aB, sB = fB
        third = [x for x in range(3) if x not in (aA, aB)][0]
        p = [0.0, 0.0, 0.0]
        if mode == "normal":
            p[aA], p[aB], p[third] = coord(sA), coord(sB), coord(v[third])
        else:
            p[aA], p[aB] = coord(sA), coord(sB)
            p[third] = coord(v[third]) * (1.0 - d)
        return tuple(p)

    order = _face_order(sol["pairing"])
    pts, entry = [], None
    for idx, fi in enumerate(order):
        face = FACES[fi]
        seq = upath[fi]
        if entry is not None and seq[0] != entry:
            seq = seq[::-1]
        pts.extend(corner(face, v) for v in seq)
        nxt = FACES[order[(idx + 1) % 6]]
        pts.append(bridge(face, nxt, seq[-1]))
        entry = seq[-1]
    pts.append(pts[0])
    return pts


# ---------------------------------------------------------------- kandidati

#: Predstavnici jedinih dveju klasa kod kojih je sve ose-poravnato i nema
#: probijanja greda. Izlaz iz search_u_configs(), zakljucan radi determinizma.
_CLASS_0 = {
    "omitted": (0, 1, 0, 3, 1, 2),
    "pairing": ((0, 2), (0, 3), (1, 4), (1, 5), (2, 4), (3, 5)),
}
_CLASS_3 = {
    "omitted": (0, 2, 3, 1, 2, 0),
    "pairing": ((0, 2), (0, 4), (1, 3), (1, 5), (2, 5), (3, 4)),
}

#: sirina grede: 7% raspona kocke (raspon = 2), sredina izmerenog opsega 6-8%
BEAM_WIDTH = 0.14

#: uvlacenje rama; mora biti >= 1.5*BEAM_WIDTH da miter ne pojede ceo konektor
INSET = 0.26

CANDIDATES = {
    "H1a": {
        "sol": _CLASS_0, "mode": "inplane",
        "desc": "Ramovi uvuceni u svojoj ravni; konektori idu po ivicama kocke. "
                "Klasa simetrije 0 (12 od 32 resenja).",
        "segments": 30,
    },
    "H1b": {
        "sol": _CLASS_3, "mode": "inplane",
        "desc": "Isto uvlacenje, druga klasa simetrije (3) - drugi raspored "
                "izostavljenih strana, druga hiralnost. 4 od 32 resenja.",
        "segments": 30,
    },
    "H2a": {
        "sol": _CLASS_0, "mode": "normal",
        "desc": "Ramovi pune sirine (uglovi na +-1) pomereni duz svoje normale; "
                "konektori prolaze kroz cosak kocke. Klasa 0.",
        "segments": 30,
    },
    "H2b": {
        "sol": _CLASS_3, "mode": "normal",
        "desc": "Isto, klasa simetrije 3.",
        "segments": 30,
    },
}


def get(name, d=INSET):
    c = CANDIDATES[name]
    return build_path(c["sol"], mode=c["mode"], d=d)
