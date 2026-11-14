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

from PIL import Image, ImageDraw, ImageFilter, ImageFont

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


def creative(name, w, h, safe, tagline="Find your way by sound"):
    """Store artwork: the mark and the name inside Apple's art safe area."""
    sx, sy, sw, sh = safe
    wide = sw / sh > 2.3
    if wide:  # mark on the left, name on the right
        mark_at, s = (sx + sw * 0.19, sy + sh * 0.56), sh / 780
        title_size, tx, ty = int(sh * 0.18), sx + sw * 0.69, sy + sh * 0.32
    else:  # mark above, name below
        mark_at, s = (sx + sw * 0.5, sy + sh * 0.36), sh * 0.6 / 780
        title_size = int(min(sh * 0.13, sw / 9))
        tx, ty = sx + sw * 0.5, sy + sh * 0.72
    img = background(w, h, mark_at, max(w, h) * 0.55)
    # Auxiliary art: huge, barely visible sound rings crossing the whole canvas.
    far = Image.new("RGBA", img.size, (0, 0, 0, 0))
    fd = ImageDraw.Draw(far)
    src = (mark_at[0] + 250 * s, mark_at[1] - 250 * s)
    for k in range(1, 9):
        r = (150 + 105 * 3 + 330 * k) * s
        fd.ellipse([src[0] - r, src[1] - r, src[0] + r, src[1] + r], outline=RING + (max(6, 26 - 3 * k),), width=max(2, int(6 * s)))
    img.alpha_composite(far.filter(ImageFilter.GaussianBlur(2 * s)))
    mark(img, mark_at, s)
    spaced_text(img, "ECHO TRAIL", tx, ty, THIN, title_size, (237, 239, 245, 255), title_size * 0.16)
    spaced_text(img, tagline, tx, ty + title_size * 1.35, LIGHT, int(title_size * 0.34), (154, 160, 180, 255), title_size * 0.02)
    out = img.convert("RGB")
    path = ROOT / "store" / "creative" / name
    path.parent.mkdir(parents=True, exist_ok=True)
    out.save(path)
    print("wrote", path.relative_to(ROOT), out.size, out.mode)
    return out


if __name__ == "__main__":
    ic = icon()
    splash()
    header = creative("header-3840x1646.png", 3840, 1646, (1097, 493, 1646, 661))
    creative("search-3840x2560.png", 3840, 2560, (836, 765, 2168, 1030))
    creative("universal-5244x2950.png", 5244, 2950, (1921, 660, 1402, 962))
    docs = ROOT / "docs" / "assets"
    docs.mkdir(parents=True, exist_ok=True)
    ic.resize((512, 512), Image.LANCZOS).save(docs / "icon.png")
    header.resize((1920, 823), Image.LANCZOS).save(docs / "hero.jpg", quality=88)
    # Social preview (1200x630): crop the middle of the header.
    crop = header.crop((1097 - 250, 493 - 190, 1097 + 1646 + 250, 493 + 661 + 190))
    crop.resize((1200, int(1200 * crop.size[1] / crop.size[0])), Image.LANCZOS).crop((0, 0, 1200, 600)).save(docs / "og.jpg", quality=88)
    print("wrote docs/assets/icon.png, hero.jpg, og.jpg")
