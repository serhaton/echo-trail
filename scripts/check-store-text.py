#!/usr/bin/env python3
"""
Checks that the App Store text in store/README.md fits Apple's limits.

Reads each fenced block that follows a bold field name ("**Name**", …) in
the two language sections, plus the in-app purchase table.

Usage: python3 scripts/check-store-text.py
"""
import re
import sys
from pathlib import Path

LIMITS = {"Name": 30, "Subtitle": 30, "Promotional text": 170, "Description": 4000, "Keywords": 100, "What's New": 4000}
text = (Path(__file__).resolve().parent.parent / "store" / "README.md").read_text(encoding="utf-8")
ok = True


def report(label, value, limit):
    global ok
    good = len(value) <= limit
    ok = ok and good
    print(f"{'ok ' if good else 'TOO LONG'} {label:<34} {len(value):>4} / {limit}")


for lang in ("English (U.S.)", "Turkish"):
    section = text.split(f"### {lang}\n", 1)[1].split("\n## ", 1)[0].split("\n### ", 1)[0]
    for field, block in re.findall(r"\*\*([^*]+)\*\*[^\n]*\n\n```\n(.*?)\n```", section, flags=re.S):
        if field in LIMITS:
            report(f"{lang[:2]} · {field}", block, LIMITS[field])
        if field == "Keywords" and ", " in block:
            ok = False
            print("  keywords must not have spaces after commas")

for row, limit in (("Display name", 30), ("Description", 45)):
    match = re.search(rf"\| {row} \(\d+ max\) \| `([^`]*)` \| `([^`]*)` \|", text)
    for lang, value in zip(("en", "tr"), match.groups()):
        report(f"{lang} · IAP {row}", value, limit)

sys.exit(0 if ok else 1)
