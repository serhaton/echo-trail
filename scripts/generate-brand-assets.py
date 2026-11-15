#!/usr/bin/env python3
"""
Generates Echo Trail's brand artwork with Pillow:

  assets/icon.png                      1024x1024 app icon (no alpha)
  assets/splash-icon.png               splash mark (transparent)
  store/creative/header-3840x1646.png  App Store product page header (21:9)
  store/creative/search-3840x2560.png  App Store search results (3:2)
  store/creative/universal-5244x2950.png  universal asset (16:9, PNG)
  docs/assets/hero.jpg, og.jpg, icon.png  for the website

The mark: a warm point of light in the dark (the player), a coloured
trail leading to it, and sound rings arriving from ahead.

Usage: python3 scripts/generate-brand-assets.py
"""
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageStat

ROOT = Path(__file__).resolve().parent.parent
BG = (5, 6, 10)
GLOW = (255, 241, 214)
RING = (191, 227, 210)
TRAIL = [(247, 200, 180), (243, 223, 162), (185, 220, 198), (168, 200, 234), (201, 184, 232)]
THIN = ("/System/Library/Fonts/HelveticaNeue.ttc", 12)
LIGHT = ("/System/Library/Fonts/HelveticaNeue.ttc", 7)


def lerp(a, b, t):
    return a + (b - a) * t


def mix(c1, c2, t):
    return tuple(int(round(lerp(a, b, t))) for a, b in zip(c1, c2))


def palette(t):
    t = max(0.0, min(0.9999, t)) * (len(TRAIL) - 1)
    i = int(t)
    return mix(TRAIL[i], TRAIL[i + 1], t - i)


def background(w, h, centre, reach):
    """Near-black with a faint blue-green lift around the light."""
    img = Image.new("RGB", (w, h), BG)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i in range(24, 0, -1):
        r = reach * i / 24
        a = int(46 * (1 - i / 25) ** 1.6)
        d.ellipse([centre[0] - r, centre[1] - r, centre[0] + r, centre[1] + r], fill=(40, 64, 86, a))
    img.paste(layer, (0, 0), layer)
    return img.convert("RGBA")


def glow(img, centre, radius, color, strength):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i in range(14, 0, -1):
        r = radius * i / 14
        a = int(255 * strength * (1 - i / 15) ** 2)
        d.ellipse([centre[0] - r, centre[1] - r, centre[0] + r, centre[1] + r], fill=color + (a,))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(max(1, radius / 7))))


def bezier(p0, p1, p2, p3, n=120):
    pts = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        pts.append((u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0],
                    u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1]))
    return pts


def mark(img, centre, s, rings=3, trail=True):
    """Draw the mark around `centre`; `s` is the scale (1 ≈ a 1024 icon)."""
    cx, cy = centre
    # Sound rings arriving from the upper right.
    src = (cx + 250 * s, cy - 250 * s)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for k in range(rings):
        r = (150 + 105 * k) * s
        alpha = int(235 - 62 * k)
        d.arc([src[0] - r, src[1] - r, src[0] + r, src[1] + r], 100, 170, fill=RING + (alpha,), width=max(2, int(15 * s)))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(14 * s)))  # soft glow under the rings
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(0.8 * s)))
    glow(img, src, 60 * s, RING, 0.9)
    ImageDraw.Draw(img).ellipse([src[0] - 15 * s, src[1] - 15 * s, src[0] + 15 * s, src[1] + 15 * s], fill=RING + (255,))

    # The trail: where the player has walked, in the journey's colours.
    if trail:
        pts = bezier((cx - 330 * s, cy + 330 * s), (cx - 60 * s, cy + 350 * s), (cx - 250 * s, cy + 60 * s), (cx, cy))
        wide = Image.new("RGBA", img.size, (0, 0, 0, 0))
        thin = Image.new("RGBA", img.size, (0, 0, 0, 0))
        dw, dt = ImageDraw.Draw(wide), ImageDraw.Draw(thin)
        for i in range(len(pts) - 1):
            t = i / (len(pts) - 1)
            c = palette(t)
            fade = int(255 * min(1, t * 5))  # the far end fades into the dark
            dw.line([pts[i], pts[i + 1]], fill=c + (int(fade * 0.75),), width=max(2, int(44 * s)))
            dt.line([pts[i], pts[i + 1]], fill=c + (fade,), width=max(2, int(11 * s)))
        for i in range(0, len(pts), 2):  # round joins
            t = i / (len(pts) - 1)
            r = 5.5 * s
            dt.ellipse([pts[i][0] - r, pts[i][1] - r, pts[i][0] + r, pts[i][1] + r], fill=palette(t) + (int(255 * min(1, t * 5)),))
        img.alpha_composite(wide.filter(ImageFilter.GaussianBlur(20 * s)))
        img.alpha_composite(thin.filter(ImageFilter.GaussianBlur(0.8 * s)))

    # The player: a warm point of light.
    glow(img, centre, 300 * s, GLOW, 0.5)
    glow(img, centre, 120 * s, GLOW, 0.95)
    ImageDraw.Draw(img).ellipse([cx - 44 * s, cy - 44 * s, cx + 44 * s, cy + 44 * s], fill=(255, 250, 238, 255))


def spaced_text(img, text, centre_x, y, font_spec, size, color, tracking):
    """Centred text with letter spacing (Pillow has none built in)."""
    font = ImageFont.truetype(font_spec[0], size, index=font_spec[1])
    d = ImageDraw.Draw(img)
    widths = [d.textlength(ch, font=font) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = centre_x - total / 2
    for ch, w in zip(text, widths):
        d.text((x, y), ch, font=font, fill=color)
        x += w + tracking
    return total


def icon():
    size = 2048  # drawn at 2x, then reduced for clean edges
    img = background(size, size, (size * 0.5, size * 0.5), size * 0.9)
    mark(img, (size * 0.5, size * 0.52), 2.5)  # fills the icon; stays clear of the rounded corners
    out = img.convert("RGB").resize((1024, 1024), Image.LANCZOS)
    out.save(ROOT / "assets" / "icon.png")
    print("wrote assets/icon.png", out.size, out.mode)
    return out


def splash():
    size = 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    mark(img, (size * 0.47, size * 0.56), 1.0)
    img.save(ROOT / "assets" / "splash-icon.png")
    print("wrote assets/splash-icon.png", img.size, img.mode)


def spline(points, per=40):
    """Catmull-Rom curve through the points."""
    pts = [points[0]] + list(points) + [points[-1]]
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        for k in range(per):
            t = k / per
            out.append(tuple(
                0.5 * (2 * p1[j] + (p2[j] - p0[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t
                       + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * t ** 3) for j in (0, 1)))
    out.append(points[-1])
    return out


def panorama(w, h):
    """The four journeys side by side (Zen, Mystery, Tension, Cheerful), melting into each other."""
    names = ["zen/zen-05", "mystery/mystery-05", "tension/tension-20", "cheerful/cheerful-02"]
    if w / h > 2:  # a very wide canvas: more, narrower panels, so each picture stays whole
        names = ["zen/zen-05", "zen/zen-17", "mystery/mystery-05", "tension/tension-20", "cheerful/cheerful-17", "cheerful/cheerful-02"]
    pw = w / len(names)
    overlap = pw * 0.25
    pano = Image.new("RGB", (w, h), BG)
    for i, name in enumerate(names):
        src = Image.open(ROOT / "assets" / "images" / f"{name}.webp").convert("RGB")
        tw = int(pw + overlap * 2)
        scale = max(tw / src.size[0], h / src.size[1])
        src = src.resize((int(src.size[0] * scale) + 1, int(src.size[1] * scale) + 1), Image.LANCZOS)
        # Keep the horizon band of each picture in view.
        top = int((src.size[1] - h) * 0.42)
        left = (src.size[0] - tw) // 2
        tile = src.crop((left, top, left + tw, top + h))
        # The night-time journeys are very dark; lift them so they read once lit.
        lum = ImageStat.Stat(tile.convert("L")).mean[0]
        if lum < 70:
            tile = ImageEnhance.Brightness(tile).enhance(min(2.2, 70 / max(lum, 1)))
        fade = Image.new("L", (tw, 1), 255)
        for x in range(tw):
            edge = min(x, tw - 1 - x) / (overlap * 2)
            fade.putpixel((x, 0), int(255 * max(0.0, min(1.0, edge)) ** 1.0))
        x0 = int(i * pw - overlap)
        pano.paste(tile, (x0, 0), fade.resize((tw, h)))
        if i == 0:  # nothing lies under the first panel's left edge
            pano.paste(tile.crop((0, 0, int(overlap * 2), h)), (x0, 0))
    return pano


def note(d, x, y, s, color):
    """A small eighth note."""
    d.ellipse([x - 13 * s, y + 6 * s, x + 3 * s, y + 18 * s], fill=color)
    d.line([(x + 1.5 * s, y + 12 * s), (x + 1.5 * s, y - 20 * s)], fill=color, width=max(2, int(3.4 * s)))
    d.arc([x - 12 * s, y - 22 * s, x + 14 * s, y + 6 * s], 285, 30, fill=color, width=max(2, int(3.4 * s)))


def star_points(x, y, outer, inner):
    return [(x + math.cos(-math.pi / 2 + i * math.pi / 5) * (outer if i % 2 == 0 else inner),
             y + math.sin(-math.pi / 2 + i * math.pi / 5) * (outer if i % 2 == 0 else inner)) for i in range(10)]


# The walked path per format, in fractions of the canvas. It crosses all four
# journeys, sweeps under the title inside Apple's art safe area, and ends at
# the player's light; the sound it is walking toward sits a little further on.
PATHS = {
    "header": dict(
        trail=[(-0.03, 0.80), (0.05, 0.60), (0.11, 0.27), (0.19, 0.20), (0.245, 0.46), (0.31, 0.665),
               (0.42, 0.675), (0.56, 0.655), (0.68, 0.675), (0.755, 0.56), (0.80, 0.40)],
        target=(0.895, 0.20), notes=[(0.185, 0.36), (0.615, 0.80)]),
    "search": dict(
        trail=[(-0.03, 0.86), (0.06, 0.74), (0.10, 0.50), (0.07, 0.26), (0.15, 0.15), (0.24, 0.30),
               (0.26, 0.56), (0.36, 0.665), (0.52, 0.655), (0.68, 0.675), (0.80, 0.60), (0.86, 0.42)],
        target=(0.90, 0.17), notes=[(0.172, 0.41), (0.62, 0.80)]),
    "universal": dict(
        trail=[(-0.03, 0.74), (0.07, 0.62), (0.13, 0.36), (0.21, 0.24), (0.29, 0.36), (0.33, 0.50),
               (0.40, 0.535), (0.50, 0.525), (0.60, 0.54), (0.68, 0.50), (0.73, 0.38)],
        target=(0.83, 0.18), notes=[(0.215, 0.37), (0.56, 0.66)]),
}


def creative(name, w, h, safe, layout, subtitle="SOUND MAZE", tagline="Find your way by sound"):
    """
    Store artwork, drawn the way the game plays: everything is dark except
    where the light has walked. The trail winds across the four journeys and
    their pictures (and the obstacles it went around) show through along it.
    The name sits inside Apple's art safe area; the rest is auxiliary art.
    """
    sx, sy, sw, sh = safe
    spec = PATHS[layout]
    u = h / 1646  # scale unit: 1 on the header
    px = lambda p: (p[0] * w, p[1] * h)
    pts = [px(p) for p in spline(spec["trail"])]
    player, target = pts[-1], px(spec["target"])

    pano = panorama(w, h)
    # The unlit world: almost black, with the faintest memory of the pictures.
    dark = Image.blend(Image.new("RGB", (w, h), BG), ImageEnhance.Color(pano).enhance(0.5), 0.085)

    # Where the light has been (drawn small, then enlarged: it is all soft anyway).
    q = 4
    mask = Image.new("L", (w // q, h // q), 0)
    md = ImageDraw.Draw(mask)
    band = 190 * u / q
    small = [(x / q, y / q) for x, y in pts]
    md.line(small, fill=255, width=int(band), joint="curve")
    for x, y in small[::6]:
        md.ellipse([x - band / 2, y - band / 2, x + band / 2, y + band / 2], fill=255)
    r = 190 * u / q  # the light itself opens a wider pool
    md.ellipse([player[0] / q - r, player[1] / q - r, player[0] / q + r, player[1] / q + r], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(52 * u / q)).resize((w, h), Image.BICUBIC)
    img = Image.composite(pano, dark, mask).convert("RGBA")

    # Obstacles the path bent around, visible only inside the light.
    obs = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(obs)
    for k, frac in enumerate((0.13, 0.27, 0.43, 0.6, 0.77, 0.9)):
        i = int(frac * (len(pts) - 2))
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        ln = math.hypot(x1 - x0, y1 - y0) or 1
        side = 1 if k % 2 == 0 else -1
        cx, cy = x0 - (y1 - y0) / ln * 118 * u * side, y0 + (x1 - x0) / ln * 118 * u * side
        if sx - 40 * u < cx < sx + sw + 40 * u and sy < cy < sy + sh * 0.72:
            continue  # keep the title clear
        bw, bh = ((150, 54), (60, 130), (120, 60))[k % 3]
        box = [cx - bw * u / 2, cy - bh * u / 2, cx + bw * u / 2, cy + bh * u / 2]
        od.rounded_rectangle(box, radius=12 * u, fill=GLOW + (58,), outline=GLOW + (215,), width=max(2, int(4 * u)))
    obs.putalpha(ImageChops.multiply(obs.getchannel("A"), mask))
    img.alpha_composite(obs)

    # Sound: rings rolling out from the target toward the player, and far across the canvas.
    rings = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    rd = ImageDraw.Draw(rings)
    toward = math.degrees(math.atan2(player[1] - target[1], player[0] - target[0]))
    for k in range(4):
        r = (95 + 78 * k) * u
        rd.arc([target[0] - r, target[1] - r, target[0] + r, target[1] + r], toward - 42, toward + 42,
               fill=RING + (235 - 50 * k,), width=max(2, int(11 * u)))
    for k in range(1, 10):
        r = (95 + 78 * 3 + 260 * k) * u
        rd.ellipse([target[0] - r, target[1] - r, target[0] + r, target[1] + r],
                   outline=RING + (max(7, 30 - 3 * k),), width=max(2, int(5 * u)))
    img.alpha_composite(rings.filter(ImageFilter.GaussianBlur(12 * u)))
    img.alpha_composite(rings.filter(ImageFilter.GaussianBlur(0.8 * u)))
    glow(img, target, 70 * u, RING, 0.9)
    ImageDraw.Draw(img).polygon(star_points(target[0], target[1], 26 * u, 10.5 * u), fill=(244, 255, 250, 255))

    # The trail itself, in the journeys' colours.
    wide = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    thin = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dw, dt = ImageDraw.Draw(wide), ImageDraw.Draw(thin)
    n = len(pts) - 1
    for i in range(n):
        t = i / n
        c = palette(abs(((t * 2.4) % 2) - 1))  # runs through the palette and back
        dw.line([pts[i], pts[i + 1]], fill=c + (190,), width=max(2, int(34 * u)))
        dt.line([pts[i], pts[i + 1]], fill=c + (255,), width=max(2, int(8 * u)))
        rr = 4 * u
        dt.ellipse([pts[i][0] - rr, pts[i][1] - rr, pts[i][0] + rr, pts[i][1] + rr], fill=c + (255,))
    img.alpha_composite(wide.filter(ImageFilter.GaussianBlur(16 * u)))
    img.alpha_composite(thin.filter(ImageFilter.GaussianBlur(0.8 * u)))

    # Hidden sounds along the way: bright little notes.
    for nx, ny in (px(p) for p in spec["notes"]):
        glow(img, (nx, ny), 62 * u, TRAIL[1], 0.75)
        note(ImageDraw.Draw(img), nx, ny, 1.5 * u, (255, 252, 240, 255))

    # The player: a warm point of light.
    glow(img, player, 230 * u, GLOW, 0.45)
    glow(img, player, 95 * u, GLOW, 0.95)
    ImageDraw.Draw(img).ellipse([player[0] - 33 * u, player[1] - 33 * u, player[0] + 33 * u, player[1] + 33 * u],
                                fill=(255, 250, 238, 255))

    # The name, on a soft pool of darkness so it reads over anything.
    title_size = int(min(sh * 0.2, sw / 7.6))
    tx, ty = sx + sw * 0.5, sy + sh * 0.1
    shade = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(shade).rounded_rectangle(
        [tx - sw * 0.5, ty - title_size * 0.5, tx + sw * 0.5, ty + title_size * 2.95],
        radius=title_size, fill=BG + (215,))
    img.alpha_composite(shade.filter(ImageFilter.GaussianBlur(title_size * 0.55)))
    spaced_text(img, "ECHO TRAIL", tx, ty, THIN, title_size, (237, 239, 245, 255), title_size * 0.16)
    # Second line of the store name, in the trail's warm colour, as wide as the first.
    sub_size = int(title_size * 0.4)
    spaced_text(img, subtitle, tx, ty + title_size * 1.24, LIGHT, sub_size, TRAIL[1] + (255,), sub_size * 0.62)
    spaced_text(img, tagline, tx, ty + title_size * 2.0, LIGHT, int(title_size * 0.34), (190, 196, 214, 255), title_size * 0.02)

    out = img.convert("RGB")
    path = ROOT / "store" / "creative" / name
    path.parent.mkdir(parents=True, exist_ok=True)
    out.save(path)
    print("wrote", path.relative_to(ROOT), out.size, out.mode)
    return out


if __name__ == "__main__":
    ic = icon()
    splash()
    header = creative("header-3840x1646.png", 3840, 1646, (1097, 493, 1646, 661), "header")
    creative("search-3840x2560.png", 3840, 2560, (836, 765, 2168, 1030), "search")
    creative("universal-5244x2950.png", 5244, 2950, (1921, 660, 1402, 962), "universal")
    docs = ROOT / "docs" / "assets"
    docs.mkdir(parents=True, exist_ok=True)
    ic.resize((512, 512), Image.LANCZOS).save(docs / "icon.png")
    header.resize((1920, 823), Image.LANCZOS).save(docs / "hero.jpg", quality=88)
    # Social preview (1200x630): crop the middle of the header.
    crop = header.crop((1097 - 250, 493 - 190, 1097 + 1646 + 250, 493 + 661 + 190))
    crop.resize((1200, int(1200 * crop.size[1] / crop.size[0])), Image.LANCZOS).crop((0, 0, 1200, 600)).save(docs / "og.jpg", quality=88)
    print("wrote docs/assets/icon.png, hero.jpg, og.jpg")
