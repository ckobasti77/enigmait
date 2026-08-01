"""Provere putanje (A2). Ciste funkcije - bez bpy, bez side-efekata na import.

Putanja je lista temena [(x,y,z), ...]. Uzastopni par je segment.
Zatvorena putanja ima poslednje teme jednako prvom.
"""

EPS = 1e-9


# ---------------------------------------------------------------- osnovno

def _key(p, nd=6):
    return (round(p[0], nd), round(p[1], nd), round(p[2], nd))


def segments(path):
    return [(path[i], path[i + 1]) for i in range(len(path) - 1)]


def is_closed(path):
    return _key(path[0]) == _key(path[-1])


def seg_axis(seg):
    """Indeks ose duz koje segment ide, ili None ako nije ose-poravnat."""
    a, b = seg
    diff = [i for i in range(3) if abs(a[i] - b[i]) > EPS]
    return diff[0] if len(diff) == 1 else None


def seg_length(seg):
    a, b = seg
    return max(abs(a[i] - b[i]) for i in range(3))


def seg_key(seg):
    """Neusmeren kljuc segmenta - za detekciju poklopljenih greda."""
    a, b = _key(seg[0]), _key(seg[1])
    return (a, b) if a <= b else (b, a)


# ---------------------------------------------------------------- graf

def degree_map(path):
    """Stepen svakog temena u multigrafu koji putanja iscrtava."""
    deg = {}
    for a, b in segments(path):
        for p in (a, b):
            deg[_key(p)] = deg.get(_key(p), 0) + 1
    if is_closed(path):
        # prvo i poslednje teme su isto teme - ne broji ga dvaput kao dva kraja
        pass
    return deg


def odd_vertices(path):
    return [v for v, d in degree_map(path).items() if d % 2 == 1]


def euler_status(path):
    """Da li skup ivica dozvoljava Ojlerov ciklus / putanju."""
    odd = len(odd_vertices(path))
    return {
        "odd_degree_vertices": odd,
        "euler_circuit": odd == 0,
        "euler_trail": odd in (0, 2),
    }


def is_connected(path):
    """Da li su sva temena u jednoj komponenti - inace nije 'jedna sipka'."""
    adj = {}
    for a, b in segments(path):
        ka, kb = _key(a), _key(b)
        adj.setdefault(ka, set()).add(kb)
        adj.setdefault(kb, set()).add(ka)
    if not adj:
        return False
    start = next(iter(adj))
    seen, stack = {start}, [start]
    while stack:
        for nb in adj[stack.pop()]:
            if nb not in seen:
                seen.add(nb)
                stack.append(nb)
    return len(seen) == len(adj)


# ---------------------------------------------------------------- geometrija

def duplicate_segments(path):
    """Segmenti koji zauzimaju isto mesto u prostoru - poklopljene grede.

    Ovo mora biti prazno: dve grede na istom mestu znace da je t dvoznacan
    na tom delu, sto ubija animaciju u Fazi C.
    """
    seen, dupes = set(), []
    for seg in segments(path):
        k = seg_key(seg)
        if k in seen:
            dupes.append(k)
        seen.add(k)
    return dupes


def length_histogram(path, nd=4):
    hist = {}
    for seg in segments(path):
        L = round(seg_length(seg), nd)
        hist[L] = hist.get(L, 0) + 1
    return dict(sorted(hist.items()))


def non_axis_aligned(path):
    return [i for i, seg in enumerate(segments(path)) if seg_axis(seg) is None]


def min_gap_between_parallel(path, width):
    """Najmanji razmak izmedju nesusednih paralelnih segmenata.

    Ako je manji od sirine grede, dve grede se probijaju - to je rupa u dizajnu,
    ne feature. Vraca (min_gap, broj_konflikata).
    """
    segs = segments(path)
    n = len(segs)
    worst, conflicts = float("inf"), 0
    for i in range(n):
        ai = seg_axis(segs[i])
        if ai is None:
            continue
        for j in range(i + 2, n):
            if i == 0 and j == n - 1:
                continue  # susedni preko sava
            if seg_axis(segs[j]) != ai:
                continue
            # razmak u dve ose upravne na pravac
            others = [k for k in range(3) if k != ai]
            d = max(abs(segs[i][0][k] - segs[j][0][k]) for k in others)
            # preklapaju li se uopste duz svoje ose
            lo_i, hi_i = sorted((segs[i][0][ai], segs[i][1][ai]))
            lo_j, hi_j = sorted((segs[j][0][ai], segs[j][1][ai]))
            if min(hi_i, hi_j) - max(lo_i, lo_j) <= EPS:
                continue
            if d < worst:
                worst = d
            if d < width - EPS:
                conflicts += 1
    return (None if worst == float("inf") else worst), conflicts


def projection_silhouette(path, axis, extent=1.0):
    """Projekcija na osu `axis`: da li silueta rama ima prekid.

    RANIJA VERZIJA JE BILA POGRESAN TEST. Trazila je teme neparnog stepena u 2D
    projekciji, ali projekcija ZATVORENE 3D petlje je zatvorena 2D kontura, pa
    su svi stepeni uvek parni - test nije mogao da prodje ni za jednu ispravnu
    zatvorenu putanju.

    Pravi test: pogledaj 4 stranice bounding kvadrata projekcije i proveri da li
    je ijedna nepotpuno pokrivena. Ram bez prekida pokriva stranicu celom
    duzinom; prekid na cosku ostavlja rupu.
    """
    u, v = [k for k in range(3) if k != axis]
    segs = segments(path)
    sides = {}
    for name, fixed_ax, fixed_val, free_ax in (
            ("u_min", u, -extent, v), ("u_max", u, +extent, v),
            ("v_min", v, -extent, u), ("v_max", v, +extent, u)):
        spans = []
        for a, b in segs:
            if abs(a[fixed_ax] - fixed_val) > EPS or abs(b[fixed_ax] - fixed_val) > EPS:
                continue
            lo, hi = sorted((a[free_ax], b[free_ax]))
            if hi - lo > EPS:
                spans.append((lo, hi))
        spans.sort()
        merged = []
        for lo, hi in spans:
            if merged and lo <= merged[-1][1] + EPS:
                merged[-1] = (merged[-1][0], max(merged[-1][1], hi))
            else:
                merged.append((lo, hi))
        covered = sum(h - l for l, h in merged)
        sides[name] = {"covered": round(covered, 6),
                       "full": round(2.0 * extent, 6),
                       "has_gap": covered < 2.0 * extent - 1e-6}
    return {
        "sides": sides,
        "sides_with_gap": sum(1 for s in sides.values() if s["has_gap"]),
        "has_gap": any(s["has_gap"] for s in sides.values()),
    }


# ---------------------------------------------------------------- izvestaj

def check_all(path, name="", expected_segments=None, width=0.14,
              allow_lengths=None):
    """Kompletna A2 provera. Vraca dict spreman za tabelu."""
    segs = segments(path)
    hist = length_histogram(path)
    gap, conflicts = min_gap_between_parallel(path, width)
    eu = euler_status(path)
    proj = {"xyz"[a]: projection_silhouette(path, a) for a in range(3)}

    lengths_ok = True
    if allow_lengths is not None:
        lengths_ok = all(
            any(abs(L - a) < 1e-4 for a in allow_lengths) for L in hist
        )

    checks = {
        "1_segment_count": (len(segs) == expected_segments
                            if expected_segments is not None else None),
        "2_all_axis_aligned": len(non_axis_aligned(path)) == 0,
        "3_lengths_allowed": lengths_ok,
        "4_euler": eu["euler_trail"],
        "5_connected": is_connected(path),
        "6_projections_have_gap": all(p["has_gap"] for p in proj.values()),
        "7_no_duplicate_segments": len(duplicate_segments(path)) == 0,
        "8_no_beam_interpenetration": conflicts == 0,
    }
    return {
        "name": name,
        "segments": len(segs),
        "vertices": len(path),
        "closed": is_closed(path),
        "length_histogram": hist,
        "odd_degree_vertices": eu["odd_degree_vertices"],
        "euler_circuit": eu["euler_circuit"],
        "min_parallel_gap": None if gap is None else round(gap, 4),
        "interpenetrations": conflicts,
        "duplicate_segments": len(duplicate_segments(path)),
        "projections": proj,
        "checks": checks,
        "all_pass": all(v for v in checks.values() if v is not None),
    }
