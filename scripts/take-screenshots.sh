#!/bin/bash
# Captures raw App Store screenshots from the iOS simulator.
#
# Needs a Release build made in screenshot mode (the game then plays itself
# and opens whatever screen the launch argument names):
#
#   cd ios && EXPO_PUBLIC_SCREENSHOT_MODE=1 xcodebuild -workspace EchoTrail.xcworkspace \
#     -scheme EchoTrail -configuration Release -sdk iphonesimulator \
#     -destination 'generic/platform=iOS Simulator' -derivedDataPath build-shots \
#     CODE_SIGNING_ALLOWED=NO
#
# Then:  scripts/take-screenshots.sh
# and:   python3 scripts/compose-screenshots.py   (adds captions, makes every size)
#
# Output: store/screenshots/raw/<device>/<lang>/<n>-<name>.png
set -euo pipefail
cd "$(dirname "$0")/.."

APP="ios/build-shots/Build/Products/Release-iphonesimulator/EchoTrail.app"
BUNDLE="com.serhatonal.echotrail"
OUT="store/screenshots/raw"

# name on disk | simulator name
DEVICES=("iphone|iPhone 17 Pro Max" "ipad|iPad Pro 13-inch (M5)")

# n-name | route | seconds to wait before the capture
SHOTS=(
  "2-journey|/journey/zen|10"  # first launch after install: give the app time to open
  "3-walk|/level/zen-05?demo=walk&difficulty=easy|9"
  "4-hint|/level/mystery-04?demo=hint&difficulty=easy|7.2"
  "5-rings|/level/cheerful-04?demo=walk&cues=1&difficulty=easy|7"
  "6-reveal|/level/zen-01?demo=walk&difficulty=easy|17"
  "7-ready|/level/tension-03|6"
  "8-modes|/mode-select|5"
  "9-album|/album/zen|5"
)

[ -d "$APP" ] || { echo "Missing $APP: build it first (see the top of this file)."; exit 1; }

udid_of() {
  # Newest runtime's device with this exact name.
  xcrun simctl list devices available -j | python3 -c "
import json, sys
name = sys.argv[1]
devices = json.load(sys.stdin)['devices']
found = [d['udid'] for rt in sorted(devices) for d in devices[rt] if d['name'] == name]
print(found[-1] if found else '')" "$1"
}

for entry in "${DEVICES[@]}"; do
  key="${entry%%|*}"; name="${entry#*|}"
  udid="$(udid_of "$name")"
  [ -n "$udid" ] || { echo "No simulator named '$name'"; exit 1; }
  echo "== $name ($udid)"
  xcrun simctl boot "$udid" 2>/dev/null || true
  xcrun simctl bootstatus "$udid" -b >/dev/null
  xcrun simctl status_bar "$udid" override --time "9:41" --batteryState charged --batteryLevel 100 --wifiBars 3 --cellularBars 4
  xcrun simctl install "$udid" "$APP"

  for lang in en tr; do
    locale=$([ "$lang" = tr ] && echo tr_TR || echo en_US)
    mkdir -p "$OUT/$key/$lang"
    for shot in "${SHOTS[@]}"; do
      IFS='|' read -r file route wait <<<"$shot"
      xcrun simctl terminate "$udid" "$BUNDLE" 2>/dev/null || true
      xcrun simctl launch "$udid" "$BUNDLE" -AppleLanguages "($lang)" -AppleLocale "$locale" -ScreenshotRoute "$route" >/dev/null
      sleep "$wait"
      xcrun simctl io "$udid" screenshot "$OUT/$key/$lang/$file.png" >/dev/null 2>&1
      echo "   $lang $file"
    done
  done
  xcrun simctl terminate "$udid" "$BUNDLE" 2>/dev/null || true
  xcrun simctl status_bar "$udid" clear
  xcrun simctl shutdown "$udid" 2>/dev/null || true
done
echo "done: $OUT"
