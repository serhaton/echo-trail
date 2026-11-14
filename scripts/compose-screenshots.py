#!/usr/bin/env python3
"""
Turns the raw simulator captures into finished App Store screenshots:
a headline above the screen on the game's dark background, rendered at
every size Apple asks for, in English and Turkish.

  store/screenshots/raw/<iphone|ipad>/<lang>/<n>-<name>.png   (input)
  store/screenshots/iphone-6.9/<lang>/…   1320 x 2868
  store/screenshots/iphone-6.1/<lang>/…   1206 x 2622
  store/screenshots/ipad-13/<lang>/…      2064 x 2752
  docs/assets/shots/<lang>-<n>.jpg        small copies for the website

Usage: python3 scripts/compose-screenshots.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "store" / "screenshots" / "raw"
OUT = ROOT / "store" / "screenshots"
BG = (5, 6, 10)
FONT = ("/System/Library/Fonts/HelveticaNeue.ttc", 7)  # Light

# (raw file, accent colour, English headline, Turkish headline), in upload order.
SHOTS = [
    ("3-walk", (185, 220, 198), "Find your way\nby sound", "Yolunu\nsesle bul"),
    ("4-hint", (227, 178, 107), "Stuck? A hint\nlights the way", "Takıldın mı? İpucu\nyolu aydınlatır"),
    ("6-reveal", (247, 200, 180), "Reach the sound,\nreveal the place", "Sese ulaş,\nmekânı ortaya çıkar"),
    ("2-journey", (185, 220, 198), "Four journeys,\n120 levels", "Dört yolculuk,\n120 bölüm"),
    ("5-rings", (255, 209, 102), "No headphones?\nFollow the waves", "Kulaklık yok mu?\nDalgaları izle"),
    ("7-ready", (224, 108, 117), "Finger, joystick\nor tilt", "Parmak, joystick\nya da eğerek"),
    ("9-album", (201, 184, 232), "Collect\nevery picture", "Bütün resimleri\ntopla"),
]

# output folder → (raw device, canvas size)
SIZES = {
    "iphone-6.9": ("iphone", (1320, 2868)),
    "iphone-6.1": ("iphone", (1206, 2622)),
    "ipad-13": ("ipad", (2064, 2752)),
}
# Shots shown on the website, in this order.
WEB = ["2-journey", "3-walk", "4-hint", "6-reveal"]


def compose(raw, size, accent, headline):
    w, h = size
    img = Image.new("RGB", size, BG)
    # A soft wash of the journey's colour behind the headline.
    wash = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(wash).ellipse([w * 0.1, -h * 0.16, w * 0.9, h * 0.2], fill=accent + (64,))
    img.paste(wash.filter(ImageFilter.GaussianBlur(w * 0.14)), (0, 0), wash.filter(ImageFilter.GaussianBlur(w * 0.14)))

    d = ImageDraw.Draw(img)
    tall = h / w > 1.8  # phones are tall; the iPad leaves less room above
    font = ImageFont.truetype(FONT[0], int(w * (0.083 if tall else 0.058)), index=FONT[1])
    lines = headline.split("\n")
    line_h = int(font.size * 1.18)
    top = int(h * (0.062 if tall else 0.055))
    for i, line in enumerate(lines):
        tw = d.textlength(line, font=font)
        d.text(((w - tw) / 2, top + i * line_h), line, font=font, fill=(237, 239, 245))
    text_bottom = top + len(lines) * line_h

    # The screen: rounded, thin outline, soft glow.
    screen_top = text_bottom + int(h * 0.035)
    avail_h = h - screen_top - int(h * 0.03)
    scale = min(w * 0.8 / raw.size[0], avail_h / raw.size[1])
    sw, sh = int(raw.size[0] * scale), int(raw.size[1] * scale)
    shot = raw.convert("RGB").resize((sw, sh), Image.LANCZOS)
    radius = int(sw * (0.105 if tall else 0.045))
    mask = Image.new("L", (sw, sh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, sw, sh], radius=radius, fill=255)
    x, y = (w - sw) // 2, screen_top
    halo = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(halo).rounded_rectangle([x - 6, y - 6, x + sw + 6, y + sh + 6], radius=radius + 6, fill=accent + (70,))
    blurred = halo.filter(ImageFilter.GaussianBlur(w * 0.03))
    img.paste(blurred, (0, 0), blurred)
    img.paste(shot, (x, y), mask)
    ImageDraw.Draw(img).rounded_rectangle([x, y, x + sw, y + sh], radius=radius, outline=(70, 74, 92), width=max(2, w // 440))
    return img


if __name__ == "__main__":
    made = 0
    for folder, (device, size) in SIZES.items():
        for lang in ("en", "tr"):
            out = OUT / folder / lang
            out.mkdir(parents=True, exist_ok=True)
            for n, (name, accent, en, tr) in enumerate(SHOTS, start=1):
                raw_path = RAW / device / lang / f"{name}.png"
                if not raw_path.exists():
                    print("missing", raw_path.relative_to(ROOT))
                    continue
                img = compose(Image.open(raw_path), size, accent, en if lang == "en" else tr)
                img.save(out / f"{n:02d}-{name.split('-', 1)[1]}.png")
                made += 1
    web = ROOT / "docs" / "assets" / "shots"
    web.mkdir(parents=True, exist_ok=True)
    for lang in ("en", "tr"):
        for i, name in enumerate(WEB, start=1):
            raw_path = RAW / "iphone" / lang / f"{name}.png"
            if raw_path.exists():
                raw = Image.open(raw_path).convert("RGB")
                raw.resize((660, int(660 * raw.size[1] / raw.size[0])), Image.LANCZOS).save(web / f"{lang}-{i}.jpg", quality=84)
    print(f"composed {made} store screenshots; website shots in docs/assets/shots/")
