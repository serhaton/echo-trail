#!/usr/bin/env python3
"""
Generates PLACEHOLDER reveal images (portrait 900x1800, WebP) with Pillow.

Procedural, painterly-looking scenes so the game looks presentable before
final artwork exists: layered landscapes for Zen (one day, dawn to night)
and one-point-perspective rooms for Mystery. Final art replaces these via
scripts/import-images.py (see assets/images/PROMPTS.md).

Usage: python3 scripts/generate-placeholder-images.py
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

W, H = 900, 1800
HORIZON = 0.40  # Zen horizon height (fraction from top); same in every picture
OUT = Path(__file__).resolve().parent.parent / "assets" / "images"


# --------------------------------------------------------------------------- helpers

def lerp(a, b, t):
    return a + (b - a) * t


def mix(c1, c2, t):
    return tuple(int(round(lerp(a, b, t))) for a, b in zip(c1, c2))


def shade(c, k):
    return tuple(max(0, min(255, int(v * k))) for v in c)


def vgrad(stops):
    """Vertical gradient image (RGB, W x H). stops: [(y_fraction, rgb), ...]."""
    col = []
    for y in range(H):
        f = y / (H - 1)
        c = stops[-1][1]
        for (f0, c0), (f1, c1) in zip(stops, stops[1:]):
            if f0 <= f <= f1:
                t = (f - f0) / (f1 - f0) if f1 > f0 else 0
                c = mix(c0, c1, t * t * (3 - 2 * t))
                break
        col.append(c)
    strip = Image.new("RGB", (1, H))
    strip.putdata(col)
    return strip.resize((W, H))


def new_layer():
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


def glow(img, center, radius, color, strength=0.9):
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    for i in range(12, 0, -1):
        r = radius * i / 12
        a = int(255 * strength * (1 - i / 13) ** 2)
        d.ellipse([center[0] - r, center[1] - r, center[0] + r, center[1] + r], fill=color + (a,))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(max(1, radius / 6))))


def paste_poly(img, pts, top, bottom, y0=None, y1=None, blur=0):
    """Fill a polygon with a vertical gradient (top colour at y0, bottom at y1)."""
    ys = [p[1] for p in pts]
    y0 = min(ys) if y0 is None else y0
    y1 = max(ys) if y1 is None else y1
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).polygon(pts, fill=255)
    if blur:
        mask = mask.filter(ImageFilter.GaussianBlur(blur))
    f0, f1 = max(0, y0 / H), min(1, y1 / H)
    fill = vgrad([(0, top), (f0, top), (max(f1, f0 + 1e-3), bottom), (1, bottom)])
    img.paste(fill, (0, 0), mask)


def ridge_points(base_y, amp, seed, rough=3):
    rnd = random.Random(seed)
    ph = [rnd.uniform(0, math.tau) for _ in range(rough)]
    fr = [rnd.uniform(0.6, 1.4) * (k + 1) for k in range(rough)]
    pts = []
    for x in range(-10, W + 20, 10):
        y = base_y
        for k in range(rough):
            y -= amp / (k + 1) * math.sin(x / W * math.tau * fr[k] / 2 + ph[k])
        pts.append((x, y))
    return pts


def hill(img, base_y, amp, top, bottom, seed, rough=3, blur=0):
    pts = ridge_points(base_y, amp, seed, rough)
    paste_poly(img, pts + [(W + 20, H), (-10, H)], top, bottom, y0=base_y - amp, y1=min(H, base_y + 500), blur=blur)
    return pts


def mist(img, y, height, color, alpha):
    layer = new_layer()
    ImageDraw.Draw(layer).rectangle([0, y, W, y + height], fill=color + (alpha,))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(height / 2)))


def pine(d, x, y, h, color, rnd):
    w = h * rnd.uniform(0.28, 0.36)
    d.rectangle([x - w * 0.05, y - h * 0.25, x + w * 0.05, y + 3], fill=shade(color, 0.7) + (255,))
    tiers = 5
    for k in range(tiers):
        t = k / (tiers - 1)
        top = y - h + t * h * 0.62
        bot = top + h * 0.3
        half = w * (0.22 + 0.78 * t) / 2 * rnd.uniform(0.9, 1.1)
        lean = rnd.uniform(-0.1, 0.1) * half
        d.polygon([(x + lean, top), (x - half, bot), (x + half, bot)], fill=color + (255,))


def leafy(d, x, y, h, color, rnd):
    d.polygon([(x - h * 0.03, y), (x + h * 0.03, y), (x + h * 0.015, y - h * 0.5), (x - h * 0.015, y - h * 0.5)], fill=shade(color, 0.6) + (255,))
    for _ in range(9):
        cx = x + rnd.uniform(-0.28, 0.28) * h
        cy = y - h * rnd.uniform(0.45, 0.95)
        r = h * rnd.uniform(0.14, 0.24)
        tone = shade(color, rnd.uniform(0.85, 1.2))
        d.ellipse([cx - r, cy - r * 0.85, cx + r, cy + r * 0.85], fill=tone + (255,))


def trees(img, pts, color, seed, count, hmin, hmax, kind="pine", xr=(0, 1)):
    rnd = random.Random(seed)
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    pool = [p for p in pts if xr[0] * W <= p[0] <= xr[1] * W]
    for x, y in sorted((rnd.choice(pool) for _ in range(count)), key=lambda p: p[1]):
        x += rnd.uniform(-5, 5)
        (pine if kind == "pine" else leafy)(d, x, y + 4, rnd.uniform(hmin, hmax), color, rnd)
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(0.7)))


def clouds(img, color, seed, count=7, band=(0.08, 0.36)):
    rnd = random.Random(seed)
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    for _ in range(count):
        cx, cy = rnd.uniform(0, W), H * rnd.uniform(*band)
        for _ in range(5):
            w, h = rnd.uniform(120, 300), rnd.uniform(14, 40)
            ox, oy = rnd.uniform(-90, 90), rnd.uniform(-14, 14)
            d.ellipse([cx + ox - w / 2, cy + oy - h / 2, cx + ox + w / 2, cy + oy + h / 2], fill=color + (rnd.randint(40, 90),))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(14)))


def stars(img, count, seed):
    rnd = random.Random(seed)
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    for i in range(count):
        if i % 3 == 0:  # denser diagonal band: a hint of the Milky Way
            t = rnd.uniform(0, 1)
            x = t * W + rnd.gauss(0, 60)
            y = H * (0.02 + 0.3 * (1 - t)) + rnd.gauss(0, 40)
        else:
            x, y = rnd.uniform(0, W), rnd.uniform(0, H * HORIZON)
        if y > H * HORIZON:
            continue
        r = rnd.choice([0.8, 1, 1, 1.4, 2])
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, rnd.randint(110, 255)))
    band = new_layer()
    ImageDraw.Draw(band).line([(0, H * 0.32), (W, H * 0.02)], fill=(190, 200, 255, 42), width=150)
    img.alpha_composite(band.filter(ImageFilter.GaussianBlur(60)))
    img.alpha_composite(layer)


def footpath(img, color, seed, y_end, width=120):
    rnd = random.Random(seed)
    ph = rnd.uniform(0, math.tau)
    left, right = [], []
    for i in range(41):
        t = i / 40
        y = H - t * (H - y_end)
        cx = W * 0.5 + math.sin(t * 3.2 + ph) * W * 0.14 * (1 - t) ** 0.6
        half = lerp(width, 4, t ** 0.6) / 2
        left.append((cx - half, y))
        right.append((cx + half, y))
    layer = new_layer()
    ImageDraw.Draw(layer).polygon(left + right[::-1], fill=color + (150,))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(4)))


def grass(img, color, seed, y0, count=900):
    rnd = random.Random(seed)
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    for _ in range(count):
        x = rnd.uniform(0, W)
        y = rnd.uniform(y0, H)
        size = lerp(8, 34, (y - y0) / (H - y0))
        tone = shade(color, rnd.uniform(0.7, 1.5))
        d.line([(x, y), (x + rnd.uniform(-0.3, 0.3) * size, y - size)], fill=tone + (200,), width=2)
    img.alpha_composite(layer)


def log(img, y, x0, x1, color):
    """A fallen trunk across the path at height y (fraction of H)."""
    th = lerp(12, 46, (y - HORIZON) / (1 - HORIZON))
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    yy = y * H
    d.rounded_rectangle([x0 * W, yy - th / 2, x1 * W, yy + th / 2], radius=th / 2, fill=color + (255,))
    d.line([(x0 * W + th, yy - th * 0.25), (x1 * W - th, yy - th * 0.25)], fill=shade(color, 1.5) + (160,), width=max(2, int(th / 7)))
    shadow = new_layer()
    ImageDraw.Draw(shadow).ellipse([x0 * W, yy + th * 0.2, x1 * W, yy + th * 1.1], fill=(0, 0, 0, 90))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(8)))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(0.6)))


def rocks(img, spots, color):
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    for x, y, r in spots:
        cx, cy = x * W, y * H
        d.ellipse([cx - r, cy - r * 0.6, cx + r, cy + r * 0.6], fill=color + (255,))
        d.ellipse([cx - r * 0.7, cy - r * 0.55, cx + r * 0.3, cy - r * 0.1], fill=shade(color, 1.45) + (120,))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(1.2)))


def ripples(img, y0, y1, color, seed, count=160, x0=0.0, x1=1.0):
    rnd = random.Random(seed)
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    for _ in range(count):
        y = rnd.uniform(y0, y1)
        x = rnd.uniform(x0 * W, x1 * W)
        w = lerp(8, 70, (y - y0) / max(1, y1 - y0)) * rnd.uniform(0.5, 1.3)
        d.line([(x, y), (x + w, y)], fill=color + (rnd.randint(25, 90),), width=2)
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(0.8)))


def painterly(img, vignette=0.35, seed=0):
    """Shared finish: paint-like patches, watercolour mottling, brush grain, vignette."""
    random.seed(seed)
    img = img.convert("RGB").filter(ImageFilter.MedianFilter(5))
    blot = Image.effect_noise((W // 12, H // 12), 46).filter(ImageFilter.GaussianBlur(1.3)).resize((W, H), Image.BICUBIC)
    img = Image.blend(img, ImageChops.soft_light(img, Image.merge("RGB", [blot] * 3)), 0.55)
    strokes = Image.effect_noise((W // 45, H // 5), 50).resize((W, H), Image.BICUBIC)
    img = Image.blend(img, ImageChops.soft_light(img, Image.merge("RGB", [strokes] * 3)), 0.14)
    grain = Image.effect_noise((W, H), 20)
    img = Image.blend(img, ImageChops.overlay(img, Image.merge("RGB", [grain] * 3)), 0.12)
    edge = Image.radial_gradient("L").resize((W, H)).point(lambda p: int(max(0, p - 80) * vignette * 1.6))
    return Image.composite(Image.new("RGB", (W, H), (0, 0, 0)), img, edge)


# --------------------------------------------------------------------------- Zen

SKIES = {
    #          top            middle           horizon         sun/moon (x, y, colour, r)        far land        near land     stars  light
    "dawn": ((38, 36, 84), (124, 94, 150), (250, 198, 160), (0.62, 0.385, (255, 236, 200), 52), (150, 130, 160), (28, 36, 40), 0, 0.9),
    "morning": ((96, 140, 200), (162, 198, 228), (238, 232, 212), (0.25, 0.2, (255, 250, 232), 44), (130, 160, 150), (30, 52, 38), 0, 1.0),
    "noon": ((64, 124, 200), (140, 190, 232), (222, 238, 240), (0.7, 0.1, (255, 255, 242), 42), (120, 160, 140), (34, 62, 40), 0, 1.0),
    "evening": ((52, 44, 100), (192, 102, 122), (255, 190, 122), (0.5, 0.385, (255, 214, 150), 56), (150, 100, 110), (40, 28, 36), 0, 0.85),
    "dusk": ((22, 22, 62), (98, 62, 116), (214, 120, 124), (0.3, 0.395, (255, 190, 160), 44), (90, 70, 104), (22, 18, 30), 70, 0.55),
    "night": ((6, 8, 26), (18, 24, 58), (48, 54, 96), (0.72, 0.14, (232, 236, 255), 34), (36, 44, 78), (6, 8, 16), 320, 0.32),
    # Tension: a blood-moon night.  Cheerful: a candy-bright day.
    "dread": ((10, 4, 10), (44, 12, 20), (110, 34, 34), (0.3, 0.16, (255, 120, 90), 46), (60, 26, 34), (8, 4, 8), 90, 0.3),
    "bright": ((70, 150, 240), (150, 210, 250), (255, 240, 214), (0.74, 0.12, (255, 252, 220), 50), (150, 200, 140), (60, 130, 70), 0, 1.0),
}


def rainbow(img, cx, cy, r):
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    for i, c in enumerate([(255, 90, 90), (255, 170, 70), (255, 230, 90), (110, 210, 120), (90, 170, 255), (160, 120, 230)]):
        rr = r - i * 16
        d.arc([cx - rr, cy - rr, cx + rr, cy + rr], 180, 360, fill=c + (150,), width=16)
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(5)))


def balloons(img, count, seed):
    rnd = random.Random(seed)
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    for _ in range(count):
        x, y = rnd.uniform(60, W - 60), rnd.uniform(H * 0.08, H * 0.5)
        r = rnd.uniform(18, 40)
        c = rnd.choice([(255, 110, 130), (255, 200, 90), (120, 210, 140), (110, 180, 255), (200, 140, 240)])
        d.line([(x, y + r), (x + rnd.uniform(-10, 10), y + r * 4)], fill=(255, 255, 255, 120), width=2)
        d.ellipse([x - r, y - r * 1.2, x + r, y + r * 1.2], fill=c + (235,))
        d.ellipse([x - r * 0.5, y - r * 0.8, x - r * 0.1, y - r * 0.3], fill=(255, 255, 255, 110))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(0.8)))


def zen_scene(time, kind, seed, target=(0.6, 0.47), extra=None):
    extra = extra or {}
    top, mid, hor, (sx, sy, sc, sr), far, near, nstars, light = SKIES[time]
    hz = H * HORIZON
    img = vgrad([(0, top), (HORIZON * 0.55, mid), (HORIZON, hor), (1, near)]).convert("RGBA")
    if nstars:
        stars(img, nstars, seed)
    glow(img, (W * sx, H * sy), sr * 5, sc, 0.55)
    glow(img, (W * sx, H * sy), sr, sc, 1.0)
    if time != "night":
        clouds(img, mix(hor, (255, 255, 255), 0.35), seed + 1)

    if kind == "forest":
        for i, (y, amp, n, hmin, hmax) in enumerate([(0.43, 60, 46, 26, 54), (0.52, 80, 40, 50, 100), (0.64, 100, 26, 110, 200), (0.80, 110, 12, 240, 420)]):
            t = i / 3
            col = mix(far, near, t)
            pts = hill(img, H * y, amp, mix(col, hor, 0.25 * (1 - t)), shade(col, 0.8), seed + 10 + i, blur=2 if i < 2 else 0)
            if i == 2:
                footpath(img, mix(col, hor, 0.5), seed, H * 0.60)
            trees(img, pts, shade(col, 0.82), seed + 20 + i, n, hmin, hmax, xr=(0, 1) if i < 3 else (0, 0.3))
            if i == 3:
                trees(img, pts, shade(col, 0.82), seed + 30, 5, 240, 400, xr=(0.74, 1))
            if i < 3:
                mist(img, H * (y + 0.03), 90, hor, int(110 * (1 - t) * light + 20))
        for y, x0, x1 in extra.get("logs", []):
            log(img, y, x0, x1, mix((92, 62, 40), near, 0.35))
        grass(img, mix(near, (70, 110, 70), 0.4 * light), seed + 40, H * 0.86)

    elif kind == "river":
        for i, (y, amp) in enumerate([(0.43, 50), (0.49, 60)]):
            col = mix(far, near, i * 0.3)
            pts = hill(img, H * y, amp, mix(col, hor, 0.3), col, seed + 10 + i, blur=2)
            trees(img, pts, shade(col, 0.85), seed + 20 + i, 30, 30, 70, kind="leafy")
        mist(img, H * 0.5, 70, hor, 80)
        bands = extra.get("rivers", [(0.56, 0.68)])
        stones = extra.get("stones", [0.72])
        for k, (r0, r1) in enumerate(bands):
            xs = list(range(0, W + 30, 30))
            wob = [math.sin(x / 90 + seed + k) * 10 for x in xs]
            edge_top = [(x, H * r0 + wob[i]) for i, x in enumerate(xs)]
            edge_bot = [(x, H * r1 + wob[i] * 1.6) for i, x in enumerate(xs)]
            paste_poly(img, edge_top + edge_bot[::-1], mix(hor, mid, 0.3), mix(mid, top, 0.45), blur=2)
            ripples(img, H * r0 + 10, H * r1 - 6, (255, 255, 255), seed + 50 + k)
            sx0 = stones[k % len(stones)]
            rocks(img, [(sx0 + j * 0.05, lerp(r0, r1, 0.2 + 0.2 * j), 16 + j * 5) for j in range(4)], (120, 118, 112))
            if k + 1 < len(bands):  # grassy strip between two streams
                nxt = H * bands[k + 1][0] + 20
                paste_poly(img, ridge_points(H * (r1 + 0.02), 8, seed + 60 + k) + [(W + 20, nxt), (-10, nxt)], mix(near, (90, 130, 80), 0.5), mix(near, (60, 100, 60), 0.4))
        bank = bands[-1][1] + 0.04
        hill(img, H * bank, 26, mix(near, (96, 140, 84), 0.55 * light), near, seed + 70)
        footpath(img, mix(near, hor, 0.45), seed, H * bank)
        trees(img, [(W * 0.12, H * 0.97)], mix(near, (60, 110, 60), 0.4), seed + 80, 1, 560, 620, kind="leafy")
        rocks(img, [(0.7, 0.9, 60)], (104, 102, 98))
        grass(img, mix(near, (90, 140, 80), 0.5), seed + 40, H * (bank + 0.03))

    elif kind == "beach":
        sea_end = 0.60
        hill(img, H * 0.405, 16, mix(far, hor, 0.4), far, seed + 10, rough=2, blur=2)  # distant headland
        paste_poly(img, [(0, hz), (W, hz), (W, H * sea_end + 30), (0, H * sea_end + 30)], mix(hor, mid, 0.35), mix(mid, top, 0.5))
        ripples(img, hz + 6, H * sea_end, (255, 255, 255), seed + 50, count=220)
        ripples(img, hz + 4, H * sea_end, sc, seed + 51, count=160, x0=sx - 0.07, x1=sx + 0.07)  # sun path
        sand_top = shade((226, 192, 146), light)
        sand_bot = shade((150, 118, 86), light)
        shore = [(x, H * sea_end + math.sin(x / 130 + seed) * 14) for x in range(-10, W + 30, 20)]
        paste_poly(img, shore + [(W + 20, H), (-10, H)], mix(sand_top, hor, 0.25), sand_bot)
        foam = new_layer()
        ImageDraw.Draw(foam).line(shore, fill=(255, 255, 255, 170), width=7)
        img.alpha_composite(foam.filter(ImageFilter.GaussianBlur(3)))
        for i, y in enumerate(extra.get("dunes", [])):
            hill(img, H * y, 40, mix(sand_top, hor, 0.2), shade(sand_bot, 0.8), seed + 90 + i, rough=2)
            mist(img, H * (y + 0.05), 50, shade(sand_bot, 0.5), 60)
        for x, y, r in extra.get("pools", []):
            layer = new_layer()
            d = ImageDraw.Draw(layer)
            cx, cy = x * W, y * H
            d.ellipse([cx - r, cy - r * 0.42, cx + r, cy + r * 0.42], fill=shade(sand_bot, 0.7) + (255,))
            d.ellipse([cx - r * 0.9, cy - r * 0.36, cx + r * 0.9, cy + r * 0.36], fill=mix(mid, (150, 176, 214), 0.65) + (255,))
            img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(1.5)))
        for y, x0, x1 in extra.get("logs", []):
            log(img, y, x0, x1, shade((150, 130, 110), light))
        rocks(img, extra.get("rocks", []), shade((70, 62, 66), max(0.5, light)))

    elif kind == "hill":
        glow(img, (W * sx, H * sy), 150, sc, 0.3)
        for i, (y, amp) in enumerate([(0.43, 70), (0.55, 120), (0.78, 90)]):
            col = mix(far, near, i / 2)
            hill(img, H * y, amp, mix(col, hor, 0.3 * (1 - i / 2)), shade(col, 0.7), seed + 10 + i, rough=2, blur=2 if i == 0 else 0)
            if i == 1:
                angles = [k * math.tau / 9 for k in range(9)]
                ring = [(W * (0.5 + 0.3 * math.cos(a)), H * (0.56 + 0.07 * math.sin(a))) for a in angles if not 1.9 < a < 2.9]
                trees(img, ring, shade(col, 0.55), seed + 20, len(ring) * 2, 130, 200, kind="leafy")
            mist(img, H * (y + 0.04), 80, mix(hor, top, 0.4), 50)
        footpath(img, mix(near, hor, 0.5), seed, H * 0.62, width=90)
        trees(img, [(W * 0.1, H * 0.99), (W * 0.9, H * 0.97)], shade(near, 1.4), seed + 30, 2, 520, 640, kind="leafy")
        rnd = random.Random(seed + 99)
        for _ in range(26):  # fireflies
            glow(img, (rnd.uniform(0, W), rnd.uniform(H * 0.6, H * 0.97)), rnd.uniform(8, 16), (220, 240, 150), 0.9)

    if extra.get("rainbow"):
        rainbow(img, W * 0.5, hz + 30, W * 0.46)
    if extra.get("balloons"):
        balloons(img, extra["balloons"], seed + 7)
    if extra.get("fog"):  # heavy red-black ground fog for Tension
        for y in (0.5, 0.64, 0.8):
            mist(img, H * y, 150, (70, 16, 22), 90)

    # The target: a small warm point of light in the distance.
    tcol = (255, 232, 170) if time != "night" else (236, 240, 255)
    glow(img, (W * target[0], H * target[1]), 70, tcol, 0.8)
    glow(img, (W * target[0], H * target[1]), 12, (255, 255, 240), 1.0)
    return painterly(img, vignette=0.3 + (1 - light) * 0.3, seed=seed)


ZEN = [
    ("dawn", "forest", (0.62, 0.46), {}),
    ("dawn", "forest", (0.78, 0.45), {"logs": [(0.70, -0.05, 0.62)]}),
    ("morning", "forest", (0.22, 0.45), {"logs": [(0.76, 0.3, 1.05), (0.62, -0.05, 0.66)]}),
    ("noon", "river", (0.24, 0.5), {"stones": [0.72]}),
    ("noon", "river", (0.5, 0.48), {"rivers": [(0.54, 0.62), (0.70, 0.80)], "stones": [0.62, 0.12]}),
    ("evening", "beach", (0.6, 0.63), {"logs": [(0.74, 0.12, 0.52), (0.86, 0.3, 0.75)], "rocks": [(0.62, 0.7, 34), (0.28, 0.93, 50)]}),
    ("evening", "beach", (0.16, 0.63), {"pools": [(0.3, 0.68, 60), (0.7, 0.72, 80), (0.25, 0.8, 100), (0.72, 0.87, 120), (0.4, 0.95, 140)]}),
    ("dusk", "beach", (0.85, 0.62), {"dunes": [0.66, 0.78, 0.9]}),
    ("night", "hill", (0.5, 0.55), {}),
    ("night", "hill", (0.5, 0.57), {}),
]


TENSION = [
    ("dread", "forest", (0.6, 0.46), {"fog": True}),
    ("dread", "forest", (0.3, 0.46), {"fog": True, "logs": [(0.7, 0.3, 1.05)]}),
    ("dread", "hill", (0.5, 0.52), {"fog": True}),
    ("dread", "forest", (0.7, 0.45), {"fog": True, "logs": [(0.76, -0.05, 0.6), (0.62, 0.4, 1.05)]}),
    ("dread", "river", (0.76, 0.5), {"fog": True, "stones": [0.2]}),
    ("dread", "river", (0.5, 0.48), {"fog": True, "rivers": [(0.54, 0.62), (0.70, 0.80)], "stones": [0.3, 0.8]}),
    ("dread", "hill", (0.3, 0.5), {"fog": True}),
    ("dread", "forest", (0.5, 0.45), {"fog": True}),
    ("dread", "beach", (0.4, 0.62), {"fog": True, "rocks": [(0.3, 0.7, 50), (0.7, 0.8, 70), (0.5, 0.92, 90)]}),
    ("dread", "beach", (0.5, 0.42), {"rocks": [(0.2, 0.75, 70), (0.8, 0.85, 90)]}),
]
CHEERFUL = [
    ("bright", "forest", (0.4, 0.46), {"balloons": 9}),
    ("bright", "forest", (0.24, 0.45), {"balloons": 5, "rainbow": True}),
    ("bright", "river", (0.76, 0.5), {"balloons": 6, "stones": [0.2]}),
    ("bright", "hill", (0.5, 0.52), {"balloons": 12}),
    ("bright", "river", (0.5, 0.48), {"rainbow": True, "rivers": [(0.54, 0.62), (0.70, 0.80)], "stones": [0.3, 0.8]}),
    ("bright", "forest", (0.6, 0.45), {"balloons": 4, "logs": [(0.72, 0.36, 1.05)]}),
    ("bright", "beach", (0.84, 0.63), {"balloons": 8, "pools": [(0.7, 0.68, 60), (0.3, 0.74, 80), (0.72, 0.84, 110)]}),
    ("bright", "hill", (0.5, 0.5), {"balloons": 7, "rainbow": True}),
    ("evening", "beach", (0.5, 0.62), {"balloons": 10}),
    ("night", "hill", (0.5, 0.55), {"balloons": 14}),
]


# --------------------------------------------------------------------------- Mystery

BX0, BX1, BY0, BY1 = W * 0.2, W * 0.8, H * 0.2, H * 0.62  # back wall rectangle
MOON = (190, 205, 255)
CANDLE = (255, 186, 110)

ROOMS = {
    #                wall          floor       features
    "hall": ((70, 48, 44), (58, 38, 28), ["window", "door", "chandelier", "table", "wainscot"]),
    "library": ((60, 42, 38), (52, 34, 26), ["window", "shelves", "table"]),
    "cellar": ((54, 52, 50), (40, 38, 36), ["arches", "barrels"]),
    "kitchen": ((78, 66, 50), (62, 48, 36), ["window", "hearth", "table", "pots"]),
    "music": ((68, 42, 58), (50, 30, 34), ["window", "chandelier", "piano", "wainscot"]),
    "conservatory": ((44, 68, 60), (44, 50, 44), ["glass", "plants"]),
    "study": ((62, 52, 38), (50, 38, 26), ["window", "shelves", "desk"]),
    "bedroom": ((70, 54, 72), (52, 38, 44), ["window", "bed", "wardrobe", "wainscot"]),
    "attic": ((60, 48, 40), (50, 38, 30), ["round_window", "beams", "trunks"]),
    "clocktower": ((44, 44, 56), (36, 34, 40), ["clockface", "gears"]),
}


def room(kind, seed):
    wall, floor, feats = ROOMS[kind]
    rnd = random.Random(seed)
    img = Image.new("RGBA", (W, H), shade(wall, 0.4) + (255,))
    # Shell: ceiling, side walls, back wall, floor.
    paste_poly(img, [(0, 0), (W, 0), (BX1, BY0), (BX0, BY0)], shade(wall, 0.3), shade(wall, 0.6))
    paste_poly(img, [(0, 0), (BX0, BY0), (BX0, BY1), (0, H)], shade(wall, 0.55), shade(wall, 0.3))
    paste_poly(img, [(W, 0), (BX1, BY0), (BX1, BY1), (W, H)], shade(wall, 0.5), shade(wall, 0.28))
    paste_poly(img, [(BX0, BY0), (BX1, BY0), (BX1, BY1), (BX0, BY1)], shade(wall, 0.75), wall)
    paste_poly(img, [(BX0, BY1), (BX1, BY1), (W, H), (0, H)], shade(floor, 1.1), shade(floor, 0.45))
    d = ImageDraw.Draw(img)
    for k in range(1, 14):  # floorboards converge toward the back wall
        t = k / 14
        d.line([(lerp(BX0, BX1, t), BY1), (lerp(0, W, t), H)], fill=shade(floor, 0.55) + (150,), width=3)
    d.line([(BX0, BY0), (BX0, BY1)], fill=shade(wall, 0.4) + (255,), width=4)
    d.line([(BX1, BY0), (BX1, BY1)], fill=shade(wall, 0.4) + (255,), width=4)
    bw, bh = BX1 - BX0, BY1 - BY0
    cx = (BX0 + BX1) / 2

    if "wainscot" in feats:
        d.rectangle([BX0, BY1 - bh * 0.28, BX1, BY1], fill=shade(wall, 0.62) + (255,))
        d.line([(BX0, BY1 - bh * 0.28), (BX1, BY1 - bh * 0.28)], fill=shade(wall, 1.2) + (255,), width=5)
    if "glass" in feats:
        for gx in range(6):
            for gy in range(5):
                x0, y0 = BX0 + gx * bw / 6, BY0 + gy * bh / 5
                d.rectangle([x0 + 5, y0 + 5, x0 + bw / 6 - 5, y0 + bh / 5 - 5], fill=mix((40, 62, 84), MOON, 0.15 + 0.1 * rnd.random()) + (255,))
        glow(img, (cx, BY0 + bh * 0.3), 320, MOON, 0.35)
        d = ImageDraw.Draw(img)
    window = None
    if "window" in feats:
        window = (cx - bw * 0.16, BY0 + bh * 0.1, cx + bw * 0.16, BY0 + bh * 0.62)
        d.rounded_rectangle(window, radius=30, fill=(46, 62, 100, 255))
    if "round_window" in feats:
        r = bw * 0.16
        window = (cx - r, BY0 + bh * 0.12, cx + r, BY0 + bh * 0.12 + 2 * r)
        d.ellipse(window, fill=(46, 62, 100, 255))
    if window:
        wx0, wy0, wx1, wy1 = window
        glow(img, ((wx0 + wx1) / 2 + 30, wy0 + (wy1 - wy0) * 0.3), 46, (236, 240, 255), 0.9)  # the moon
        d = ImageDraw.Draw(img)
        d.line([((wx0 + wx1) / 2, wy0), ((wx0 + wx1) / 2, wy1)], fill=shade(wall, 0.5) + (255,), width=8)
        d.line([(wx0, (wy0 + wy1) / 2), (wx1, (wy0 + wy1) / 2)], fill=shade(wall, 0.5) + (255,), width=8)
        beam = new_layer()  # moonlight falling onto the floor
        ImageDraw.Draw(beam).polygon([(wx0, wy1), (wx1, wy1), (cx + bw * 0.5, H * 0.95), (cx - bw * 0.35, H * 0.95)], fill=MOON + (46,))
        img.alpha_composite(beam.filter(ImageFilter.GaussianBlur(36)))
        d = ImageDraw.Draw(img)
    if "shelves" in feats:
        for x0, x1 in ((BX0 + 8, cx - bw * 0.2), (cx + bw * 0.2, BX1 - 8)):
            d.rectangle([x0, BY0 + 12, x1, BY1], fill=shade(wall, 0.5) + (255,))
            rows = 8
            rh = (bh - 20) / rows
            for row in range(rows):
                y = BY0 + 22 + row * rh
                x = x0 + 6
                while x < x1 - 14:
                    w2 = rnd.randint(9, 20)
                    hh = rh * rnd.uniform(0.6, 0.82)
                    tone = rnd.randint(60, 120)
                    tint = rnd.choice([(1, 0.55, 0.42), (0.7, 0.45, 0.4), (0.95, 0.8, 0.5), (0.5, 0.55, 0.6), (0.55, 0.7, 0.5)])
                    d.rectangle([x, y + rh * 0.86 - hh, x + w2, y + rh * 0.86], fill=tuple(int(tone * c) for c in tint) + (255,))
                    x += w2 + rnd.randint(1, 3)
    if "door" in feats:
        d.rounded_rectangle([BX0 + bw * 0.06, BY1 - bh * 0.62, BX0 + bw * 0.24, BY1], radius=40, fill=shade(wall, 0.25) + (255,))
    if "arches" in feats:
        for ax in (BX0 + bw * 0.25, BX0 + bw * 0.75):
            d.ellipse([ax - bw * 0.2, BY0 + bh * 0.2, ax + bw * 0.2, BY0 + bh * 0.7], fill=shade(wall, 0.3) + (255,))
            d.rectangle([ax - bw * 0.2, BY0 + bh * 0.45, ax + bw * 0.2, BY1], fill=shade(wall, 0.3) + (255,))
        glow(img, (cx, BY1 + 40), 90, (160, 190, 220), 0.5)  # puddle catching light
        d = ImageDraw.Draw(img)
    if "hearth" in feats:
        hx0, hx1 = cx + bw * 0.2, BX1 - 14
        d.rectangle([hx0, BY1 - bh * 0.55, hx1, BY1], fill=shade(wall, 0.6) + (255,))
        d.rounded_rectangle([hx0 + 22, BY1 - bh * 0.36, hx1 - 22, BY1], radius=30, fill=(14, 8, 6, 255))
        glow(img, ((hx0 + hx1) / 2, BY1 - 26), 110, (255, 130, 50), 0.8)
        d = ImageDraw.Draw(img)
    if "pots" in feats:
        d.line([(BX0 + 20, BY0 + bh * 0.3), (cx - bw * 0.2, BY0 + bh * 0.3)], fill=shade(wall, 0.45) + (255,), width=8)
        for k in range(4):
            px = BX0 + 40 + k * 44
            d.ellipse([px, BY0 + bh * 0.3 - 40, px + 34, BY0 + bh * 0.3 - 4], fill=(150, 96, 60, 255))
    if "clockface" in feats:
        r = bw * 0.42
        cy = BY0 + bh * 0.48
        glow(img, (cx, cy), r * 1.5, (255, 240, 200), 0.45)
        d = ImageDraw.Draw(img)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(214, 204, 172, 255), outline=(60, 48, 36, 255), width=12)
        for k in range(12):
            a = k * math.tau / 12
            d.line([(cx + math.cos(a) * r * 0.8, cy + math.sin(a) * r * 0.8), (cx + math.cos(a) * r * 0.93, cy + math.sin(a) * r * 0.93)], fill=(50, 38, 30, 255), width=9)
        d.line([(cx, cy), (cx + r * 0.4, cy - r * 0.5)], fill=(34, 26, 22, 255), width=14)
        d.line([(cx, cy), (cx - r * 0.14, cy + r * 0.74)], fill=(34, 26, 22, 255), width=9)
    if "beams" in feats:
        for k in range(6):
            t = k / 5
            d.line([(lerp(0, W, t), 0), (lerp(BX0, BX1, t), BY0)], fill=shade(wall, 0.3) + (255,), width=16)

    # Things standing on the floor (drawn larger toward the viewer).
    wood = shade(floor, 1.5)
    if "table" in feats or "desk" in feats:
        ty = BY1 + (H - BY1) * 0.22
        d.polygon([(cx - 190, ty), (cx + 190, ty), (cx + 230, ty + 44), (cx - 230, ty + 44)], fill=wood + (255,))
        d.rectangle([cx - 230, ty + 44, cx + 230, ty + 60], fill=shade(wood, 0.7) + (255,))
        for lx in (cx - 215, cx + 195):
            d.rectangle([lx, ty + 60, lx + 20, ty + 230], fill=shade(wood, 0.55) + (255,))
        candle_at = (cx + 60, ty - 6)
    else:
        candle_at = (cx - bw * 0.3, BY1 + (H - BY1) * 0.3)
    if "piano" in feats:
        py = BY1 + (H - BY1) * 0.16
        d.polygon([(cx - 210, py - 150), (cx + 150, py - 150), (cx + 250, py), (cx - 250, py)], fill=(16, 12, 16, 255))
        d.rectangle([cx - 250, py, cx + 250, py + 44], fill=(232, 226, 210, 255))
        for k in range(1, 30):
            kx = cx - 250 + k * 500 / 30
            d.line([(kx, py), (kx, py + 44)], fill=(40, 36, 36, 255), width=2)
            if k % 7 not in (0, 3):
                d.rectangle([kx - 5, py, kx + 5, py + 26], fill=(14, 12, 14, 255))
        d.rectangle([cx - 250, py + 44, cx + 250, py + 80], fill=(20, 14, 18, 255))
        for lx in (cx - 235, cx + 215):
            d.rectangle([lx, py + 80, lx + 22, py + 260], fill=(16, 12, 14, 255))
        candle_at = (cx - 150, py - 160)
    if "barrels" in feats:
        for bx, by, s in ((W * 0.2, 0.72, 1.0), (W * 0.74, 0.76, 1.15), (W * 0.42, 0.9, 1.5)):
            y = H * by
            d.rounded_rectangle([bx - 70 * s, y - 180 * s, bx + 70 * s, y], radius=int(34 * s), fill=(96, 62, 36, 255))
            for band in (0.2, 0.5, 0.8):
                d.rectangle([bx - 72 * s, y - 180 * s * band - 6, bx + 72 * s, y - 180 * s * band + 6], fill=(50, 46, 44, 255))
    if "bed" in feats:
        by = BY1 + (H - BY1) * 0.14
        d.rectangle([BX0 - 60, by - 190, BX0 + 280, by], fill=shade(wood, 0.6) + (255,))
        d.polygon([(BX0 - 60, by), (BX0 + 280, by), (BX0 + 340, by + 330), (BX0 - 160, by + 330)], fill=(122, 82, 104, 255))
        d.polygon([(BX0 - 30, by + 6), (BX0 + 250, by + 6), (BX0 + 264, by + 80), (BX0 - 52, by + 80)], fill=(226, 216, 204, 255))
        d.rectangle([BX0 - 160, by + 330, BX0 + 340, by + 400], fill=shade((122, 82, 104), 0.6) + (255,))
        candle_at = (BX0 + 400, by + 120)
    if "wardrobe" in feats:
        d.rectangle([BX1 - 150, BY1 - bh * 0.6, BX1 - 12, BY1 + 20], fill=shade(wood, 0.5) + (255,))
        d.line([(BX1 - 81, BY1 - bh * 0.6), (BX1 - 81, BY1 + 20)], fill=shade(wood, 0.3) + (255,), width=4)
    if "trunks" in feats:
        for tx, ty2, s in ((W * 0.14, 0.76, 1.0), (W * 0.62, 0.86, 1.4)):
            y = H * ty2
            d.rounded_rectangle([tx, y - 110 * s, tx + 220 * s, y], radius=14, fill=(104, 70, 44, 255))
            d.rectangle([tx, y - 76 * s, tx + 220 * s, y - 64 * s], fill=(170, 136, 70, 255))
    if "gears" in feats:
        for gx, gy, gr in ((W * 0.13, H * 0.7, 150), (W * 0.86, H * 0.66, 190), (W * 0.8, H * 0.9, 110)):
            d.ellipse([gx - gr, gy - gr, gx + gr, gy + gr], outline=(150, 122, 64, 255), width=22)
            d.ellipse([gx - gr * 0.25, gy - gr * 0.25, gx + gr * 0.25, gy + gr * 0.25], fill=(120, 96, 50, 255))
            for k in range(14):
                a = k * math.tau / 14
                d.line([(gx + math.cos(a) * gr, gy + math.sin(a) * gr), (gx + math.cos(a) * gr * 1.14, gy + math.sin(a) * gr * 1.14)], fill=(150, 122, 64, 255), width=20)
    if "plants" in feats:
        spots = sorted(((rnd.choice([rnd.uniform(0, W * 0.3), rnd.uniform(W * 0.7, W)]), rnd.uniform(BY1 + 40, H * 0.98)) for _ in range(16)), key=lambda p: p[1])
        for px, py in spots:
            s = lerp(0.6, 1.8, (py - BY1) / (H - BY1))
            d.polygon([(px - 40 * s, py - 60 * s), (px + 40 * s, py - 60 * s), (px + 28 * s, py), (px - 28 * s, py)], fill=(150, 90, 60, 255))
            for _ in range(10):
                a = rnd.uniform(-2.6, -0.5)
                ln = rnd.uniform(70, 150) * s
                ex, ey = px + math.cos(a) * ln, py - 60 * s + math.sin(a) * ln
                d.ellipse([ex - 34 * s, ey - 14 * s, ex + 34 * s, ey + 14 * s], fill=(34, rnd.randint(86, 140), 60, 255))
    if "chandelier" in feats:
        d.line([(cx, 0), (cx, BY0 + 30)], fill=(90, 76, 50, 255), width=5)
        d.arc([cx - 150, BY0 - 30, cx + 150, BY0 + 90], 0, 180, fill=(130, 106, 60, 255), width=6)
        for k in range(5):
            glow(img, (cx - 140 + k * 70, BY0 + 34), 34, CANDLE, 0.9)

    # One candle per room: the warm heart of the scene.
    d = ImageDraw.Draw(img)
    d.rectangle([candle_at[0] - 7, candle_at[1] - 44, candle_at[0] + 7, candle_at[1]], fill=(236, 226, 204, 255))
    glow(img, (candle_at[0], candle_at[1] - 56), 380, CANDLE, 0.8)
    glow(img, (candle_at[0], candle_at[1] - 56), 22, (255, 244, 210), 1.0)
    # Dust drifting in the light.
    dust = new_layer()
    dd = ImageDraw.Draw(dust)
    for _ in range(140):
        x, y = rnd.uniform(BX0 * 0.6, BX1 * 1.1), rnd.uniform(BY0, H * 0.9)
        dd.ellipse([x - 2, y - 2, x + 2, y + 2], fill=(255, 240, 220, rnd.randint(20, 80)))
    img.alpha_composite(dust.filter(ImageFilter.GaussianBlur(1)))
    return painterly(img, vignette=0.45, seed=seed)


MYSTERY = ["hall", "library", "cellar", "kitchen", "music", "conservatory", "study", "bedroom", "attic", "clocktower"]


def save(img, rel):
    path = OUT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "WEBP", quality=88, method=6)
    print(f"wrote {rel} ({path.stat().st_size // 1024} KB)")


# Rooms of the mansion beyond the first ten (east wing, then the grounds).
MYSTERY_MORE = [
    "hall", "music", "kitchen", "cellar", "attic", "bedroom", "study", "hall", "clocktower", "attic",
    "cellar", "cellar", "cellar", "cellar", "attic", "attic", "conservatory", "cellar", "study", "clocktower",
]

if __name__ == "__main__":
    # Each journey has 30 pictures: the ten scene designs, three times over
    # with different seeds (so every level still gets its own picture).
    for n in range(1, 31):
        k = (n - 1) % 10
        lap = (n - 1) // 10
        for mode, specs, base in (("zen", ZEN, 100), ("tension", TENSION, 300), ("cheerful", CHEERFUL, 400)):
            time, kind, target, extra = specs[k]
            save(zen_scene(time, kind, seed=base + k + 1 + lap * 37, target=target, extra=extra), f"{mode}/{mode}-{n:02d}.webp")
        kind = MYSTERY[k] if n <= 10 else MYSTERY_MORE[n - 11]
        save(room(kind, seed=200 + n), f"mystery/mystery-{n:02d}.webp")
    # Used by the developer test level.
    save(zen_scene("dawn", "forest", seed=7), "placeholder/zen-dawn-forest.webp")
