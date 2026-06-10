#!/usr/bin/env python3
"""Generate an ERD (users, categories, products) as a standalone SVG.

Crow's-foot notation encodes BOTH cardinality and participation:
  inner mark (nearest entity) = max cardinality  -> bar = one, crow = many
  outer mark                  = min / participation -> bar = mandatory(total), circle = optional(partial)

No third-party dependencies. Convert to PNG with:
    qlmanage -t -s 2000 -o docs/erd docs/erd/erd.svg
"""
from html import escape

HEADER_H = 30
ROW_H = 26
TABLE_W = 290
W, H = 1120, 1060
STROKE = "#4a5568"

TABLES = {
    "users": {
        "x": 415, "y": 80,
        "fields": [
            ("id", "uuid", "PK"),
            ("email", "varchar", "UQ"),
            ("password", "varchar", ""),
            ("firstName", "varchar", ""),
            ("lastName", "varchar", ""),
            ("role", "enum(customer,admin)", ""),
            ("createdAt", "timestamp", ""),
            ("updatedAt", "timestamp", ""),
        ],
    },
    "categories": {
        "x": 60, "y": 560,
        "fields": [
            ("id", "uuid", "PK"),
            ("name", "varchar", ""),
            ("slug", "varchar", "UQ"),
            ("parentId", "uuid", "FK"),
            ("createdById", "uuid", "FK"),
            ("createdAt", "timestamp", ""),
            ("updatedAt", "timestamp", ""),
        ],
    },
    "products": {
        "x": 780, "y": 540,
        "fields": [
            ("id", "uuid", "PK"),
            ("name", "varchar", ""),
            ("description", "text", ""),
            ("price", "int (minor units)", ""),
            ("currency", "char(3)", ""),
            ("sku", "varchar", "UQ"),
            ("stock", "int", ""),
            ("categoryId", "uuid", "FK"),
            ("createdById", "uuid", "FK"),
            ("createdAt", "timestamp", ""),
            ("updatedAt", "timestamp", ""),
        ],
    },
}

BADGE = {
    "PK": ("#b7791f", "#fefcbf"),
    "FK": ("#2b6cb0", "#bee3f8"),
    "UQ": ("#2f855a", "#c6f6d5"),
}


def row_cy(t, idx):
    return t["y"] + HEADER_H + idx * ROW_H + ROW_H / 2


def table_h(t):
    return HEADER_H + len(t["fields"]) * ROW_H


def render_table(name, t):
    x, y = t["x"], t["y"]
    h = table_h(t)
    p = []
    p.append(f'<rect x="{x+3}" y="{y+3}" width="{TABLE_W}" height="{h}" rx="8" fill="#00000018"/>')
    p.append(f'<rect x="{x}" y="{y}" width="{TABLE_W}" height="{h}" rx="8" fill="#ffffff" stroke="#cbd5e0" stroke-width="1.5"/>')
    p.append(f'<path d="M{x},{y+8} a8,8 0 0 1 8,-8 h{TABLE_W-16} a8,8 0 0 1 8,8 v{HEADER_H-8} h-{TABLE_W} z" fill="#2d3748"/>')
    p.append(f'<text x="{x+TABLE_W/2}" y="{y+20}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="15" font-weight="700" fill="#fff">{escape(name)}</text>')
    for i, (fname, ftype, key) in enumerate(t["fields"]):
        ry = y + HEADER_H + i * ROW_H
        fill = "#ffffff" if i % 2 == 0 else "#f7fafc"
        p.append(f'<rect x="{x}" y="{ry}" width="{TABLE_W}" height="{ROW_H}" fill="{fill}"/>')
        weight = "700" if key == "PK" else "400"
        deco = ' text-decoration="underline"' if key == "PK" else ''
        p.append(f'<text x="{x+12}" y="{ry+17}" font-family="Menlo,monospace" font-size="12.5" font-weight="{weight}" fill="#1a202c"{deco}>{escape(fname)}</text>')
        p.append(f'<text x="{x+150}" y="{ry+17}" font-family="Menlo,monospace" font-size="11" fill="#718096">{escape(ftype)}</text>')
        if key:
            fg, bg = BADGE[key]
            bx = x + TABLE_W - 38
            p.append(f'<rect x="{bx}" y="{ry+5}" width="30" height="16" rx="8" fill="{bg}"/>')
            p.append(f'<text x="{bx+15}" y="{ry+16.5}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="9.5" font-weight="700" fill="{fg}">{key}</text>')
        if i < len(t["fields"]) - 1:
            p.append(f'<line x1="{x}" y1="{ry+ROW_H}" x2="{x+TABLE_W}" y2="{ry+ROW_H}" stroke="#edf2f7"/>')
    return "\n".join(p)


# ---- Direction-aware crow's-foot endpoint ----
# dir: side of the entity the marker sits on (L/R/T/B). sym in:
#   'one'(||  exactly one) 'zoo'(o| zero/one) 'oom'(|< one/many) 'zom'(o< zero/many)
DIRS = {"L": ((-1, 0), (0, 1)), "R": ((1, 0), (0, 1)),
        "T": ((0, -1), (1, 0)), "B": ((0, 1), (1, 0))}


def endpoint(px, py, d, sym):
    (ox, oy), (qx, qy) = DIRS[d]

    def pt(dist, s=0):
        return (px + ox * dist + qx * s, py + oy * dist + qy * s)

    def line(a, b):
        return f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{STROKE}" stroke-width="1.7"/>'

    def tick(dist, half=8):
        return line(pt(dist, -half), pt(dist, half))

    def circle(dist, r=4.5):
        c = pt(dist)
        return f'<circle cx="{c[0]:.1f}" cy="{c[1]:.1f}" r="{r}" fill="#fff" stroke="{STROKE}" stroke-width="1.7"/>'

    def crow():
        apex = pt(16)
        return line(apex, pt(0, 0)) + line(apex, pt(0, 9)) + line(apex, pt(0, -9))

    out = []
    if sym == "one":
        out += [tick(12), tick(20)]
    elif sym == "zoo":
        out += [tick(12), circle(23)]
    elif sym == "oom":
        out += [crow(), tick(22)]
    elif sym == "zom":
        out += [crow(), circle(23)]
    return "".join(out)


def rel(path, ends, label, lx, ly):
    s = [f'<path d="{path}" fill="none" stroke="{STROKE}" stroke-width="1.7"/>']
    for (px, py, d, sym) in ends:
        s.append(endpoint(px, py, d, sym))
    tw = len(label) * 6.3 + 16
    s.append(f'<rect x="{lx-tw/2:.0f}" y="{ly-11}" width="{tw:.0f}" height="20" rx="10" fill="#edf2f7" stroke="#cbd5e0"/>')
    s.append(f'<text x="{lx}" y="{ly+3}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="11" fill="#2d3748">{escape(label)}</text>')
    return "\n".join(s)


svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica,Arial,sans-serif">']
svg.append(f'<rect width="{W}" height="{H}" fill="#f1f5f9"/>')
svg.append(f'<text x="{W/2}" y="40" text-anchor="middle" font-size="22" font-weight="700" fill="#1a202c">Shopping App — Entity Relationship Diagram</text>')
svg.append(f'<text x="{W/2}" y="62" text-anchor="middle" font-size="13" fill="#64748b">users · categories · products  —  with cardinality &amp; participation</text>')

# ---- Relationships (drawn under the tables) ----
# R1 users --creates--> products    (1 : N ; users partial, products total)
svg.append(rel("M560,318 V440 H850 V540",
               [(560, 318, "B", "one"), (850, 540, "T", "zom")],
               "creates", 705, 432))
# R2 users --orders--> products     (M : N ; both partial, via Orders)
svg.append(rel("M705,210 H980 V540",
               [(705, 210, "R", "zom"), (980, 540, "T", "zom")],
               "orders (M:N)", 845, 200))
# R3 users --creates--> categories  (1 : N ; users partial, categories total)
svg.append(rel("M415,300 H220 V560",
               [(415, 300, "L", "one"), (220, 560, "T", "zom")],
               "creates", 318, 300))
# R4 products --belongs to--> categories (N : 1 ; product partial, category partial)
svg.append(rel("M780,765 H560 V603 H360",
               [(780, 765, "L", "zom"), (360, 603, "R", "zoo")],
               "belongs to", 560, 690))
# R5 categories self-reference (parent of) (1 : N ; both partial)
svg.append(rel("M60,603 H30 V681 H60",
               [(60, 603, "L", "zoo"), (60, 681, "L", "zom")],
               "parent of", 95, 642))

# ---- Tables on top of the lines ----
for name, t in TABLES.items():
    svg.append(render_table(name, t))

# ---- Legend (notation) ----
lx0, ly0 = 60, 78
svg.append(f'<rect x="{lx0}" y="{ly0}" width="312" height="210" rx="8" fill="#fff" stroke="#cbd5e0"/>')
svg.append(f'<text x="{lx0+14}" y="{ly0+22}" font-size="13" font-weight="700" fill="#2d3748">Notation (Crow\'s Foot)</text>')
keys = [("PK", "Primary key"), ("FK", "Foreign key"), ("UQ", "Unique")]
for i, (k, lab) in enumerate(keys):
    bx = lx0 + 16 + i * 100
    fg, bg = BADGE[k]
    svg.append(f'<rect x="{bx}" y="{ly0+34}" width="30" height="16" rx="8" fill="{bg}"/>')
    svg.append(f'<text x="{bx+15}" y="{ly0+45.5}" text-anchor="middle" font-size="9.5" font-weight="700" fill="{fg}">{k}</text>')
    svg.append(f'<text x="{bx+36}" y="{ly0+46}" font-size="10.5" fill="#4a5568">{lab}</text>')
notes = [
    "inner mark = cardinality:   bar = one     crow = many",
    "outer mark = participation: bar = total(1)  o = partial(0)",
    "||  exactly one        o|  zero or one",
    "|<  one or many        o<  zero or many",
]
for i, n in enumerate(notes):
    svg.append(f'<text x="{lx0+16}" y="{ly0+74+i*22}" font-family="Menlo,monospace" font-size="10.5" fill="#4a5568">{escape(n)}</text>')

# ---- Relationships summary panel ----
px0, py0 = 60, 812
pw, ph = 690, 212
svg.append(f'<rect x="{px0}" y="{py0}" width="{pw}" height="{ph}" rx="8" fill="#fff" stroke="#cbd5e0"/>')
svg.append(f'<text x="{px0+14}" y="{py0+24}" font-size="13" font-weight="700" fill="#2d3748">Relationships — cardinality &amp; participation</text>')
cols = [px0 + 14, px0 + 330, px0 + 430]
svg.append(f'<text x="{cols[0]}" y="{py0+46}" font-size="10.5" font-weight="700" fill="#718096">RELATIONSHIP</text>')
svg.append(f'<text x="{cols[1]}" y="{py0+46}" font-size="10.5" font-weight="700" fill="#718096">CARD.</text>')
svg.append(f'<text x="{cols[2]}" y="{py0+46}" font-size="10.5" font-weight="700" fill="#718096">PARTICIPATION</text>')
rows = [
    ("users —creates→ products", "1 : N", "users partial · products total"),
    ("users —orders→ products", "M : N", "both partial  (via Orders junction)"),
    ("users —creates→ categories", "1 : N", "users partial · categories total"),
    ("products —belongs to→ categories", "N : 1", "product partial · category partial"),
    ("categories —parent of→ categories", "1 : N", "both partial  (self-reference)"),
]
for i, (r, c, part) in enumerate(rows):
    ry = py0 + 70 + i * 26
    if i % 2 == 1:
        svg.append(f'<rect x="{px0+8}" y="{ry-16}" width="{pw-16}" height="24" rx="4" fill="#f7fafc"/>')
    svg.append(f'<text x="{cols[0]}" y="{ry}" font-family="Menlo,monospace" font-size="11.5" fill="#1a202c">{escape(r)}</text>')
    svg.append(f'<text x="{cols[1]}" y="{ry}" font-family="Menlo,monospace" font-size="11.5" font-weight="700" fill="#2b6cb0">{escape(c)}</text>')
    svg.append(f'<text x="{cols[2]}" y="{ry}" font-size="11" fill="#4a5568">{escape(part)}</text>')

svg.append("</svg>")

with open("docs/erd/erd.svg", "w") as f:
    f.write("\n".join(svg))
print("wrote docs/erd/erd.svg")
