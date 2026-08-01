"""FAZA A1: izvuci topologiju putanje iz referentnog mesh-a.

Referenca je `blender/refs/one_line_cube.glb` (Sketchfab, "One Line Cube" by
rodrivgm, CC-BY 4.0). Mesh se NE isporucuje i NE exportuje - koristi se samo kao
merni instrument. Geometrija se u Fazi B gradi iznova iz izvucene putanje.

ZAMKE KOJE SU OBLIKOVALE OVAJ MODUL
-----------------------------------
1. Sirovi GLB accessor podaci su spljosteni (z raspon 2.07 naspram 22.2 u x/y).
   Skala zivi u node `matrix`-u: `Cube_0` ima scale (-0.996, -11.80, -0.996).
   Sve se mora citati kroz `matrix_world`. Bez toga objekat izgleda kao ravna
   ploca i svaki zakljucak o topologiji je pogresan.
2. `matrix_world.determinant() < 0` - jedina negativna osa je Y, pa je objekat
   ogledalski. Bez korekcije izvucena putanja ima suprotnu hiralnost od loga.
3. Mesh je gusto subdivided (81.920 trouglova na ~30 greda). Nijedan poligon ne
   pokriva celu stranicu grede, pa filtriranje po velicini poligona ne radi.
   Zato: grupisi po (osa normale, koordinata ravni), rasterizuj, pa trazi
   run-ove konstantne debljine.
4. Stranica ram-a je povezan U/L oblik, pa connected-components daje jedan
   komponent po ravni, ne jednu gredu. Zato run-length skeniranje, ne bbox.
"""

import bpy
from mathutils import Vector

REF_OBJECTS = ["Object_4", "Object_5", "Object_6"]

CELL = 0.1          # rasterizacija ravni
BEAM_MIN = 1.5      # ocekivana debljina grede, donja granica
BEAM_MAX = 2.5      # ... gornja
MIN_RUN = 2.5       # najkraca greda koja se uzima ozbiljno
VOTE_TOL = 0.45     # tolerancija klasterovanja centara greda
MIN_VOTES = 3       # greda ima 4 bocne stranice; 3 je prag


# ---------------------------------------------------------------- ucitavanje

def world_planes(names=REF_OBJECTS):
    """Rasterizovane ravni: {(osa_normale, koord_ravni): set((u,v) celija)}.

    Vraca i mirror-korigovane world koordinate svih temena.
    """
    dg = bpy.context.evaluated_depsgraph_get()
    buckets = {}
    allpts = []
    for n in names:
        ob = bpy.data.objects.get(n)
        if ob is None:
            continue
        mw = ob.matrix_world
        flip = mw.determinant() < 0
        ev = ob.evaluated_get(dg)
        me = ev.to_mesh()
        co = [mw @ v.co for v in me.vertices]
        if flip:
            co = [Vector((c[0], -c[1], c[2])) for c in co]
        allpts.extend((c[0], c[1], c[2]) for c in co)
        for p in me.polygons:
            vs = [co[i] for i in p.vertices]
            if len(vs) < 3:
                continue
            nrm = Vector((0.0, 0.0, 0.0))
            for k in range(1, len(vs) - 1):
                nrm += (vs[k] - vs[0]).cross(vs[k + 1] - vs[0])
            if nrm.length < 1e-9:
                continue
            nrm.normalize()
            a = max(range(3), key=lambda i: abs(nrm[i]))
            if abs(nrm[a]) < 0.999:
                continue                     # bevel, ne ravna stranica
            pc = sum(v[a] for v in vs) / len(vs)
            o = [i for i in range(3) if i != a]
            cells = buckets.setdefault((a, round(pc, 2)), set())
            u0 = int(round(min(v[o[0]] for v in vs) / CELL))
            u1 = int(round(max(v[o[0]] for v in vs) / CELL))
            v0 = int(round(min(v[o[1]] for v in vs) / CELL))
            v1 = int(round(max(v[o[1]] for v in vs) / CELL))
            for uu in range(u0, u1 + 1):
                for vv in range(v0, v1 + 1):
                    cells.add((uu, vv))
        ev.to_mesh_clear()
    return buckets, allpts


# ---------------------------------------------------------------- run-ovi

def face_rects(buckets):
    """Bocne stranice greda: run-ovi konstantne debljine unutar svake ravni.

    Za ravan sa normalom `a` i in-plane osama o=[o0,o1]:
      swap=0  skeniraj po o1 na fiksnom o0  ->  greda ide duz o0, debljina po o1
      swap=1  obrnuto
    Debljina je ono sto je ~BEAM_*; duzina je ono sto se akumulira.
    """
    lo = int(BEAM_MIN / CELL)
    hi = int(BEAM_MAX / CELL)
    samples = []
    for (a, pc), cells in buckets.items():
        o = [i for i in range(3) if i != a]
        for swap in (0, 1):
            cols = {}
            for (u, v) in cells:
                k, w = (u, v) if swap == 0 else (v, u)
                cols.setdefault(k, []).append(w)
            d_ax = o[0] if swap == 0 else o[1]     # duz cega greda ide
            s_ax = o[1] if swap == 0 else o[0]     # po cemu je debela
            for k, ws in cols.items():
                ws.sort()
                start = prev = ws[0]
                for w in ws[1:] + [None]:
                    if w is None or w != prev + 1:
                        if lo <= prev - start + 1 <= hi:
                            samples.append((a, pc, d_ax, s_ax, k * CELL,
                                            (start + prev) / 2.0 * CELL))
                        if w is not None:
                            start = w
                    if w is not None:
                        prev = w

    runs = {}
    for a, pc, d_ax, s_ax, dpos, scen in samples:
        runs.setdefault((a, pc, d_ax, s_ax, round(scen, 1)), []).append(dpos)

    rects = []
    for (a, pc, d_ax, s_ax, scen), ds in runs.items():
        ds.sort()
        start = prev = ds[0]
        for x in ds[1:] + [None]:
            if x is None or x - prev > CELL * 1.5:
                if prev - start >= MIN_RUN:
                    rects.append({"a": a, "plane": pc, "d": d_ax, "s": s_ax,
                                  "sc": scen, "d0": start, "d1": prev})
                if x is not None:
                    start = x
            if x is not None:
                prev = x
    return rects


# ---------------------------------------------------------------- grede

def beams_from_rects(rects, half_width):
    """Svaka stranica zna tacno jednu perp koordinatu grede; druga je plane+-hw.

    Zato svaka stranica glasa za dva kandidata; pravi centar dobija glasove od
    sve 4 bocne stranice, lazni od najvise jedne.
    """
    cands = []
    for r in rects:
        d = r["d"]
        perp = [i for i in range(3) if i != d]
        for sign in (-1, 1):
            c = {r["s"]: r["sc"], r["a"]: r["plane"] + sign * half_width}
            cands.append((d, c[perp[0]], c[perp[1]], r["d0"], r["d1"]))

    clusters = []
    for d, p, q, d0, d1 in cands:
        hit = None
        for cl in clusters:
            if cl["d"] == d and abs(cl["p"] - p) < VOTE_TOL \
                    and abs(cl["q"] - q) < VOTE_TOL:
                hit = cl
                break
        if hit is None:
            clusters.append({"d": d, "p": p, "q": q, "n": 1,
                             "d0": [d0], "d1": [d1]})
        else:
            hit["n"] += 1
            hit["p"] = (hit["p"] * (hit["n"] - 1) + p) / hit["n"]
            hit["q"] = (hit["q"] * (hit["n"] - 1) + q) / hit["n"]
            hit["d0"].append(d0)
            hit["d1"].append(d1)

    out = []
    for cl in clusters:
        if cl["n"] < MIN_VOTES:
            continue
        perp = [i for i in range(3) if i != cl["d"]]
        c = [0.0, 0.0, 0.0]
        c[perp[0]] = cl["p"]
        c[perp[1]] = cl["q"]
        out.append({"axis": cl["d"], "center": c, "votes": cl["n"],
                    "d0": min(cl["d0"]), "d1": max(cl["d1"])})
    return out


def measure_beam_width(buckets):
    """Debljina grede iz histograma run-duzina (najcesca vrednost)."""
    hist = {}
    for (a, pc), cells in buckets.items():
        o = [i for i in range(3) if i != a]
        for swap in (0, 1):
            cols = {}
            for (u, v) in cells:
                k, w = (u, v) if swap == 0 else (v, u)
                cols.setdefault(k, []).append(w)
            for k, ws in cols.items():
                ws.sort()
                start = prev = ws[0]
                for w in ws[1:] + [None]:
                    if w is None or w != prev + 1:
                        ln = round((prev - start + 1) * CELL, 1)
                        if 0.5 < ln < 4.0:
                            hist[ln] = hist.get(ln, 0) + 1
                        if w is not None:
                            start = w
                    if w is not None:
                        prev = w
    return hist


def run():
    buckets, pts = world_planes()
    hist = measure_beam_width(buckets)
    width = max(hist.items(), key=lambda kv: kv[1])[0] if hist else 2.0
    rects = face_rects(buckets)
    beams = beams_from_rects(rects, width / 2.0)

    mn = [min(p[i] for p in pts) for i in range(3)]
    mx = [max(p[i] for p in pts) for i in range(3)]
    return {
        "planes": len(buckets),
        "beam_width": width,
        "width_hist": dict(sorted(hist.items(), key=lambda kv: -kv[1])[:6]),
        "rects": len(rects),
        "beams": len(beams),
        "by_axis": {"XYZ"[a]: sum(1 for b in beams if b["axis"] == a)
                    for a in range(3)},
        "bbox_min": [round(x, 3) for x in mn],
        "bbox_max": [round(x, 3) for x in mx],
        "span": [round(mx[i] - mn[i], 3) for i in range(3)],
        "beam_list": [
            {"ax": "XYZ"[b["axis"]],
             "c": [round(x, 2) for x in b["center"]],
             "rng": [round(b["d0"], 2), round(b["d1"], 2)],
             "len": round(b["d1"] - b["d0"], 2),
             "v": b["votes"]}
            for b in sorted(beams, key=lambda b: (b["axis"], b["center"]))
        ],
    }
