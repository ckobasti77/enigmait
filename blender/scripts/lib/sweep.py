"""Mitered sweep pravougaonog profila duz ose-poravnate putanje + t bake.

Cist modul: bez bpy, bez mathutils - da moze da se testira van Blendera.
Vraca sirove podatke (verts / faces / uv / sharp edges) koje ops/ sloj ubacuje
u mesh.

Zasto rucno a ne Curve bevel: Curve miter nije pouzdan na 90 stepeni skretanjima
(pravi preklapanja ili rupe). Ovde je spoj tacan po konstrukciji - tacke profila
se pomeraju duz dolaznog pravca taman toliko da padnu na ravan bisektrise.
"""

import math

EPS = 1e-9


# ---------------------------------------------------------------- vektori

def sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def add(a, b):
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def mul(a, s):
    return (a[0] * s, a[1] * s, a[2] * s)


def dot(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0])


def length(a):
    return math.sqrt(dot(a, a))


def norm(a):
    L = length(a)
    return (a[0] / L, a[1] / L, a[2] / L)


def rotate_90(v, axis):
    """Rodrigues za tacno 90 stepeni oko jedinicne ose."""
    return add(cross(axis, v), mul(axis, dot(axis, v)))


# ---------------------------------------------------------------- profil

def make_profile(width, bevel_ratio=0.18):
    """Pravougaona greda width x width sa uskim bevelom -> 8-ugao.

    Bevel je namerno uzak: ivica ostaje ostra i highlight je tanka linija,
    a ne mekan prelaz.
    """
    h = width * 0.5
    c = h * bevel_ratio
    return [
        (h - c, -h), (h, -h + c), (h, h - c), (h - c, h),
        (-h + c, h), (-h, h - c), (-h, -h + c), (-h + c, -h),
    ]


# ---------------------------------------------------------------- okvir

def initial_frame(d0):
    """Pocetni U,V upravni na pravac d0, poravnati sa osama gde god moze."""
    up = (0.0, 0.0, 1.0)
    if abs(dot(d0, up)) > 0.9:
        up = (0.0, 1.0, 0.0)
    u = norm(cross(up, d0))
    v = cross(d0, u)
    return u, v


def transport(u, v, d_in, d_out):
    """Prenesi okvir preko skretanja d_in -> d_out (rotation-minimizing)."""
    if dot(d_in, d_out) > 1.0 - 1e-6:
        return u, v
    axis = cross(d_in, d_out)
    L = length(axis)
    if L < EPS:
        return u, v  # 180 stepeni - ne desava se na ovim putanjama
    axis = mul(axis, 1.0 / L)
    return rotate_90(u, axis), rotate_90(v, axis)


# ---------------------------------------------------------------- sweep

def sweep(path, width=0.14, bevel_ratio=0.18):
    """Sweep zatvorene putanje. path[-1] == path[0].

    Vraca dict:
      verts   [(x,y,z), ...]                    n_rings * n_profile
      faces   [(a,b,c,d), ...]                  quad-ovi
      t       [float, ...]                      po temenu, 0..1
      sharp   [(i,j), ...]                      ivice koje idu ostro
      rings   n_rings
      twist_defect_deg                          zatvaranje okvira
    """
    closed = (length(sub(path[0], path[-1])) < 1e-9)
    if not closed:
        raise ValueError("sweep ocekuje zatvorenu putanju (path[-1] == path[0])")

    P = list(path[:-1])          # jedinstvena temena
    n = len(P)                   # broj segmenata == broj cosaka
    prof = make_profile(width, bevel_ratio)
    np_ = len(prof)

    dirs = [norm(sub(P[(i + 1) % n], P[i])) for i in range(n)]

    # kumulativna duzina luka -> t po prstenu
    seglen = [length(sub(P[(i + 1) % n], P[i])) for i in range(n)]
    total = sum(seglen)
    arc = [0.0]
    for L in seglen:
        arc.append(arc[-1] + L)
    t_ring = [a / total for a in arc]          # n+1 vrednosti
    t_ring[0] = 0.0
    t_ring[-1] = 1.0        # pribij na tacnu 1.0 - inace fract(t) u shaderu puca

    # okvir se prenosi kroz sve cospe; prsten `i` koristi okvir DOLAZNOG segmenta
    fu, fv = initial_frame(dirs[0])
    frame_in = []
    for i in range(n):
        frame_in.append((fu, fv))            # okvir za segment i
        fu, fv = transport(fu, fv, dirs[i], dirs[(i + 1) % n])
    twist_defect = _defect_deg(frame_in[0][0], fu, dirs[0])

    verts, t_vals = [], []
    for r in range(n + 1):
        i = r % n                             # koji cosak
        d_in = dirs[(i - 1) % n]
        d_out = dirs[i]
        # okvir dolaznog segmenta
        fu, fv = frame_in[(i - 1) % n]
        m = norm(add(d_in, d_out))
        denom = dot(d_in, m)
        origin = P[i]
        for (pu, pv) in prof:
            base = add(mul(fu, pu), mul(fv, pv))
            s = -dot(base, m) / denom
            verts.append(add(add(origin, base), mul(d_in, s)))
            t_vals.append(t_ring[r])

    faces, sharp = [], []
    for r in range(n):
        a0 = r * np_
        b0 = (r + 1) * np_
        for k in range(np_):
            k2 = (k + 1) % np_
            faces.append((a0 + k, a0 + k2, b0 + k2, b0 + k))
            # uzduzna ivica profila -> ostra (crisp highlight)
            sharp.append((a0 + k, b0 + k))
    # prstenovi u cospovima -> ostri, da se dve grede ne razmazu jedna u drugu
    for r in range(n + 1):
        a0 = r * np_
        for k in range(np_):
            sharp.append((a0 + k, a0 + (k + 1) % np_))

    return {
        "verts": verts,
        "faces": faces,
        "t": t_vals,
        "sharp": sharp,
        "rings": n + 1,
        "profile_points": np_,
        "segments": n,
        "total_length": total,
        "twist_defect_deg": twist_defect,
    }


def _defect_deg(u_start, u_end, axis):
    """Ugao izmedju pocetnog i zavrsnog U oko `axis`, u stepenima."""
    c = max(-1.0, min(1.0, dot(norm(u_start), norm(u_end))))
    ang = math.degrees(math.acos(c))
    return round(ang, 4)


# ---------------------------------------------------------------- provere

def verify_t(data):
    """B3 provere: monotonost, granice, sav, konstantnost po prstenu."""
    t = data["t"]
    np_ = data["profile_points"]
    rings = data["rings"]
    verts = data["verts"]

    per_ring = [t[r * np_:(r + 1) * np_] for r in range(rings)]
    ring_t = [rt[0] for rt in per_ring]

    const_ok = all(max(rt) - min(rt) < 1e-12 for rt in per_ring)
    mono_ok = all(ring_t[i + 1] > ring_t[i] - 1e-12 for i in range(rings - 1))

    # sav: poslednji prsten mora geometrijski da lezi na prvom, t da se razlikuje za 1
    seam_dist = max(
        length(sub(verts[(rings - 1) * np_ + k], verts[k])) for k in range(np_)
    )
    return {
        "t_min": min(t),
        "t_max": max(t),
        "monotonic": mono_ok,
        "constant_per_ring": const_ok,
        "seam_max_distance": seam_dist,
        "seam_t_delta": ring_t[-1] - ring_t[0],
        "all_pass": (mono_ok and const_ok
                     and abs(min(t)) < 1e-12 and abs(max(t) - 1.0) < 1e-12
                     and seam_dist < 1e-9
                     and abs((ring_t[-1] - ring_t[0]) - 1.0) < 1e-12),
    }
