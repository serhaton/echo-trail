#!/usr/bin/env python3
"""
Imports final level pictures.

Drop images named after their level into assets/images/incoming/
(zen-01.png, mystery-07.jpg, …) and run:

    python3 scripts/import-images.py

Each one is centre-cropped to 1:2 portrait, resized to 900x1800 and written
as WebP to assets/images/<mode>/<level>.webp, replacing the placeholder.
The originals stay in incoming/.
"""
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "assets" / "images"
INCOMING = ROOT / "incoming"
SIZE = (900, 1800)
NAME = re.compile(r"^(zen|mystery)-(0[1-9]|10)$")


def main() -> int:
    files = [p for p in sorted(INCOMING.iterdir()) if p.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")]
    if not files:
        print(f"No images in {INCOMING}")
        return 0
    failed = 0
    for path in files:
        match = NAME.match(path.stem)
        if not match:
            print(f"skipped {path.name}: name must look like zen-01 or mystery-10")
            failed += 1
            continue
        img = Image.open(path).convert("RGB")
        w, h = img.size
        # Centre-crop to 1:2 (width : height).
        if w * 2 > h:
            new_w = h // 2
            left = (w - new_w) // 2
            img = img.crop((left, 0, left + new_w, h))
        else:
            new_h = w * 2
            top = (h - new_h) // 2
            img = img.crop((0, top, w, top + new_h))
        if img.size[0] < SIZE[0]:
            print(f"warning {path.name}: only {img.size[0]}px wide after cropping, will look soft")
        img = img.resize(SIZE, Image.LANCZOS)
        out = ROOT / match.group(1) / f"{path.stem}.webp"
        img.save(out, "WEBP", quality=88, method=6)
        print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
