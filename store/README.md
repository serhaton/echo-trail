# App Store submission kit

Everything needed to fill in App Store Connect for **Echo Trail: Sound Maze**, in English
and Turkish. Text marked **(decide)** needs a choice only you can make.

Character limits are Apple's; `python3 scripts/check-store-text.py` verifies
that every field below fits.

- [1. App record](#1-app-record)
- [2. Listing text](#2-listing-text)
- [3. URLs](#3-urls)
- [4. Screenshots and artwork](#4-screenshots-and-artwork)
- [5. In-app purchase](#5-in-app-purchase)
- [6. Age rating](#6-age-rating)
- [7. App privacy answers](#7-app-privacy-answers)
- [8. App Review information](#8-app-review-information)
- [9. Before you submit](#9-before-you-submit)

## 1. App record

| Field | Value |
|---|---|
| Platform | iOS |
| Name | **Echo Trail: Sound Maze** (English). Turkish localization: **Echo Trail: Ses Labirenti**. |
| Name on the home screen | Echo Trail (`name` in `app.json`; independent of the store name) |
| Primary language | English (U.S.), plus a Turkish localization |
| Bundle ID | `com.serhatonal.echotrail` |
| SKU | `echotrail-ios` (any unique string; never shown to users) |
| Primary category | Games |
| Game subcategories | Puzzle, Adventure |
| Secondary category | none |
| Content rights | "Does not contain third-party content" once the final sounds and pictures are yours or properly licensed (see section 9) |
| Price | Free **(decide)** |
| Availability | All countries or regions **(decide)** |
| Copyright | `© 2026 Serhat Onal` |
| Version | 1.0.0, build 3 (`version` and `ios.buildNumber` in `app.json`) |
| Export compliance | Uses no non-exempt encryption (already declared in the app: `ITSAppUsesNonExemptEncryption = false`) |
| Advertising identifier | Yes, the app uses the IDFA to serve ads (through AdMob, behind the tracking prompt) |

About the name: "Echo Trail" alone and "Follow the sound" were already taken
on the App Store, so the store name carries a suffix. The game's own title
screen, the icon label and the short form used in running text stay "Echo
Trail". Store names must be unique in every language: the Turkish name is
entered when the Turkish localization is added and has not been checked for
availability yet (fallback: `Echo Trail: Sesin İzinde`).

## 2. Listing text

### English (U.S.)

**Name** (30 max)

```
Echo Trail: Sound Maze
```

**Subtitle** (30 max)

```
Find your way by sound
```

**Promotional text** (170 max, can be changed without a new version)

```
A game you play with your ears. Follow a sound through the dark, feel your way past what you cannot see, and watch the place you walked come to light.
```

**Description** (4000 max)

```
The screen is dark. Somewhere ahead, a sound is calling.

Echo Trail: Sound Maze is a game you play with your ears. Put on your headphones and follow the sound: it grows louder, clearer and faster as you get closer, and your left and right ear tell you which way to turn. You cannot see the walls, trees and water in your way, but you can hear and feel them. But wherever you walk, the dark gives way: the ground you crossed stays lit, showing a strip of the scene and the obstacles you slipped past. Reach the sound, and the whole picture of the place opens in front of you.

LISTEN
• True left/right sound: turn toward what you hear.
• Closer means louder, clearer and faster. A sound behind you turns dull and low.
• Bump into something and you hear a soft thud from its side and feel a tap.
• Your path stays lit behind you in colour, so you can see where you have been and what stood in the way.

FOUR JOURNEYS, 120 LEVELS
• Zen: a day-long walk through nature, from a forest at dawn to a hill under the stars. No rush; when time runs out you simply keep walking.
• Mystery: someone vanished in an old mansion. Thirty rooms, thirty letters, one story to piece together.
• Tension: something follows you through the night. Keep moving.
• Cheerful: a day at the fair, with stars to collect and rainbow trails.

MAKE IT YOURS
• Three ways to move: follow your finger, a joystick, or tilt your device.
• Three difficulty levels.
• Hints that light the way when you are stuck.
• Hidden sounds to find, each flashing now and then as a small note: extra time, album details and pieces of the story.
• An album that fills with the pictures you reveal, and joins them into one long landscape.

NO HEADPHONES?
Headphones are best, but not required: without them, soft wave rings show where the sound is coming from.

GOOD TO KNOW
• Free to play, with ads between some levels. One optional purchase removes them and gives you an extra free hint in every level.
• No account and no sign-up. Your progress stays on your device.
• English and Turkish.
```

**Keywords** (100 max, comma-separated, no spaces after commas; do not repeat words from the name or subtitle)

```
audio game,headphones,relaxing,zen,mystery,labyrinth,dark,listen,puzzle,spatial,calm,explore,blind
```

**What's New** (4000 max)

```
The first release of Echo Trail: Sound Maze. Put on your headphones and find your way.
```

### Turkish

**Name**

```
Echo Trail: Ses Labirenti
```

**Subtitle**

```
Yolunu sesle bul
```

**Promotional text**

```
Kulaklarınla oynadığın bir oyun. Karanlıkta bir sesi takip et, göremediklerinin yanından hissederek geç ve gezdiğin yerin aydınlanışını izle.
```

**Description**

```
Ekran karanlık. İleride bir yerde bir ses seni çağırıyor.

Echo Trail: Ses Labirenti, kulaklarınla oynadığın bir oyun. Kulaklığını tak ve sesi takip et: yaklaştıkça yükselir, netleşir ve sıklaşır; sol ve sağ kulağın hangi yöne döneceğini söyler. Yolundaki duvarları, ağaçları ve suyu göremezsin ama duyabilir ve hissedebilirsin. Ama yürüdüğün her yerde karanlık aralanır: geçtiğin zemin aydınlık kalır, manzaradan bir şeridi ve yanından süzüldüğün engelleri gösterir. Sese ulaştığında, o yerin resminin tamamı önünde açılır.

DİNLE
• Gerçek sol/sağ ses: duyduğun yöne dön.
• Yakın olan daha yüksek, daha net ve daha sıktır. Arkandaki ses boğuk ve pes gelir.
• Bir şeye çarptığında onun olduğu taraftan tok bir ses duyar, hafif bir titreşim hissedersin.
• Yolun arkanda renkli ve aydınlık kalır; nereden geçtiğini ve önüne neyin çıktığını görürsün.

DÖRT YOLCULUK, 120 BÖLÜM
• Zen: şafaktaki ormandan yıldızların altındaki tepeye, doğada gün boyu süren bir yürüyüş. Acele yok; süre bitse de yürümeye devam edersin.
• Gizem: eski bir konakta biri kayboldu. Otuz oda, otuz mektup, parça parça çözülen tek bir hikâye.
• Gerilim: gece boyunca bir şey peşinde. Durma, yürü.
• Neşeli: panayırda bir gün; toplanacak yıldızlar ve gökkuşağı izler.

KENDİNE GÖRE AYARLA
• Üç kontrol şekli: parmağını takip et, joystick kullan ya da cihazını eğ.
• Üç zorluk seviyesi.
• Takıldığında yolu aydınlatan ipuçları.
• Bulunacak gizli sesler, ara sıra küçük bir nota olarak parlar: ekstra süre, albüm detayları ve hikâyeden parçalar.
• Açtığın resimlerle dolan ve onları tek bir uzun manzarada birleştiren bir albüm.

KULAKLIĞIN YOK MU?
Kulaklıkla en güzeli, ama şart değil: kulaklıksız oynarken yumuşak dalga halkaları sesin nereden geldiğini gösterir.

BİLMEN GEREKENLER
• Ücretsiz oynanır; bazı bölümlerin arasında reklam çıkar. İsteğe bağlı tek bir satın alım bunları kaldırır ve her bölümde fazladan bir ücretsiz ipucu verir.
• Hesap ya da kayıt yok. İlerlemen cihazında kalır.
• Türkçe ve İngilizce.
```

**Keywords**

```
sesli oyun,kulaklık,rahatlatıcı,zen,gizem,macera,karanlık,dinle,bulmaca,sakin,keşif,ses oyunu
```

**What's New**

```
Echo Trail: Ses Labirenti'nin ilk sürümü. Kulaklığını tak ve yolunu bul.
```

## 3. URLs

The website lives in `docs/` and is served by GitHub Pages.

| Field | English | Turkish |
|---|---|---|
| Marketing URL | https://serhaton.github.io/echo-trail/ | https://serhaton.github.io/echo-trail/tr/ |
| Support URL | https://serhaton.github.io/echo-trail/support.html | https://serhaton.github.io/echo-trail/tr/support.html |
| Privacy Policy URL | https://serhaton.github.io/echo-trail/privacy.html | https://serhaton.github.io/echo-trail/tr/privacy.html |

The pages give `serhaton@gmail.com` as the contact address (set as `EMAIL` in
`scripts/build-site.py`).

## 4. Screenshots and artwork

All images are PNG or JPEG without transparency, as Apple requires.

### Screenshots (`store/screenshots/`)

| Folder | Size (px) | Display | Required? |
|---|---|---|---|
| `iphone-6.9/` | 1320 × 2868 | iPhone 6.9" (Dynamic Island, large) | optional, recommended |
| `iphone-6.1/` | 1206 × 2622 | iPhone 6.1" (Dynamic Island, medium) | **required** |
| `ipad-13/` | 2064 × 2752 | iPad 13" | **required** (the app runs on iPad) |

Each folder has `en/` and `tr/`, with the same shots in the same order
(upload them in this order; up to 10 are allowed per size). `raw/` holds the
unframed captures they were made from.

App Store Connect scales the larger sizes down for smaller devices, so these
three sets cover every iPhone and iPad.

The seven shots, in upload order (file names start with the number):

| # | Headline (EN / TR) | Shows |
|---|---|---|
| 01 | Find your way by sound / Yolunu sesle bul | Walking: the lit path with the obstacles it passed |
| 02 | Stuck? A hint lights the way / Takıldın mı? İpucu yolu aydınlatır | The hint light |
| 03 | Reach the sound, reveal the place / Sese ulaş, mekânı ortaya çıkar | The revealed picture, the star on the target, the result card |
| 04 | Four journeys, 120 levels / Dört yolculuk, 120 bölüm | The journey map |
| 05 | No headphones? Follow the waves / Kulaklık yok mu? Dalgaları izle | Wave rings and the hidden sounds' notes |
| 06 | Finger, joystick or tilt / Parmak, joystick ya da eğerek | The ready card with the control choice |
| 07 | Collect every picture / Bütün resimleri topla | The album |

The headlines do not contain the app name, so a name change does not touch
them. The set was last captured on 15 November 2026, after the lit path, the
notes and the target star were added. To retake it after a visual change:

1. Build the screenshot-mode app (the command is at the top of
   `scripts/take-screenshots.sh`).
2. `scripts/take-screenshots.sh` captures both simulators in both languages.
3. `python3 scripts/compose-screenshots.py` adds the headlines and makes
   every size, plus the four small shots on the website.

Look through the results before uploading: a capture taken before the app has
finished opening shows only the splash screen.

### Header and Search Results (`store/creative/`)

New in App Store Connect since October 2026, shown on iOS 27 and iPadOS 27 or
later. Upload under the app version › Product Page Information › **Header and
Search Results**.

| File | Size (px) | Use |
|---|---|---|
| `header-3840x1646.png` | 3840 × 1646 (21:9) | Product page header |
| `search-3840x2560.png` | 3840 × 2560 (3:2) | Search results |
| `universal-5244x2950.png` | 5244 × 2950 (16:9, PNG) | One image for both placements (alternative to the two above; enables "Use header asset in search results") |

Each image shows the game's idea: everything is dark except where the light
has walked, and along that trail the four journeys' pictures, the obstacles
and the hidden sounds (notes) show through, with the sound being followed
(the star and its rings) ahead. The title reads "ECHO TRAIL" with "SOUND
MAZE" beneath it and the line "Find your way by sound". The Turkish versions
are in `store/creative/tr/` under the same file names, with "SES LABİRENTİ"
and "Yolunu sesle bul"; upload them under the Turkish localization. The
title sits inside Apple's
art safe area for each format; everything outside it is auxiliary art that
may be cropped. The pictures in them are the current placeholder level
pictures, so regenerate once the final art is in.
Regenerate with `python3 scripts/generate-brand-assets.py`. Apple's
rules for these images (Review Guideline 2.3.14): content must relate to the
app, suit all audiences, and contain no prices or unverifiable claims.

### App icon

`assets/icon.png` (1024 × 1024, no transparency) is built into the app; App
Store Connect takes it from the uploaded build.

To regenerate any artwork: `python3 scripts/generate-brand-assets.py`.

## 5. In-app purchase

Create one product in App Store Connect › Monetization › In-App Purchases.

| Field | Value |
|---|---|
| Type | Non-Consumable |
| Reference name | Remove Ads |
| Product ID | `com.serhatonal.echotrail.removeads` (must match `REMOVE_ADS_PRODUCT_ID` in `src/config/monetization.ts`) |
| Price | **(decide)** |
| Family Sharing | On is reasonable for a non-consumable **(decide)** |

| | English (U.S.) | Turkish |
|---|---|---|
| Display name (30 max) | `Remove Ads` | `Reklamları Kaldır` |
| Description (45 max) | `No ads between levels, plus an extra hint.` | `Bölüm arası reklam yok, ek ipucu var.` |

**Image** (1024 × 1024, shown in offer code redemptions and, if App Store
Promotion is enabled, on the product page): `store/iap/remove-ads-1024.png`,
the game's light and trail with a crossed-out "AD" badge. Regenerate with
`python3 scripts/generate-brand-assets.py`.

**Review screenshot:** `store/iap/review-screenshot-2064x2752.png`, the
Settings screen on an iPad 13" simulator with the "Remove ads" button, its
description and "Restore purchases" under PURCHASES. It is only seen by App
Review.

**Review notes for the purchase** (paste into Review Information › Review Notes):

```
"Remove Ads" is a one-time, non-consumable purchase. It removes the full-screen ads shown between levels and raises the free hints per level from 1 to 2. Optional rewarded videos stay available. It is offered in Settings > Purchases, where "Restore purchases" is also located.
```

## 6. Age rating

You answer Apple's questionnaire yourself; these are the honest answers for the
app as it is today. With them, expect a rating around **9+** **(decide by
answering)**.

| Question | Answer | Why |
|---|---|---|
| Horror / fear themes | Infrequent or mild | The Tension journey: an unseen chaser, a heartbeat, a dark mood. No gore or jump-scare imagery. |
| Violence (cartoon, realistic), weapons | None | |
| Profanity, crude humour | None | |
| Sexual content, nudity | None | |
| Alcohol, tobacco, drugs | None | |
| Gambling, contests | None | |
| Medical or treatment information | None | |
| Unrestricted web access | No | |
| User-generated content, messaging, chat | No | |
| Advertising | Yes | Third-party ads through AdMob |
| Made for Kids / Kids category | No | The app shows third-party ads and is not designed for children |

In AdMob, set the app's **maximum ad content rating** to match the age rating
you end up with.

## 7. App privacy answers

For App Store Connect › App Privacy. The app itself collects nothing; the
answers below come from the **Google Mobile Ads SDK**. Check them against
Google's current disclosure before submitting:
https://developers.google.com/admob/ios/privacy/data-disclosure

**Does the app collect data?** Yes (through the ads SDK).

What Google's page says the SDK collects, and for what:

| Data type | Purposes Google states | Linked to the user, per Google |
|---|---|---|
| Location › Coarse Location | From the IP address; purpose not spelled out (treat as advertising and analytics) | not stated |
| Identifiers › Device ID | Third-party advertising, analytics | not stated |
| Usage Data › Advertising Data | Analytics and advertising features | not stated |
| Usage Data › Product Interaction | Improving advertising performance | not stated |
| Diagnostics › Crash Data | Diagnosing problems, improving the SDK | "non-user related" (not linked) |
| Diagnostics › Performance Data | Evaluating behaviour and features, displaying ads | "user-associated" (linked) |

Google's page does not say which of these count as "linked to you" or "used to
track you" in Apple's terms, apart from the two diagnostics rows; those answers
are yours to give **(decide)**. The cautious and common choice for an app that
shows personalised ads when the player allows tracking: mark Device ID, Coarse
Location, Advertising Data and Product Interaction as **linked** and as **used
for tracking**, with the purposes "Third-Party Advertising" and "Analytics".

Not collected: contact info, health, financial info, precise location,
contacts, user content, browsing or search history, purchases (handled by
Apple), sensitive info, audio, photos.

**Tracking:** Yes. The app asks permission with App Tracking Transparency and
requests non-personalised ads if the player declines.

## 8. App Review information

| Field | Value |
|---|---|
| Sign-in required | No |
| Contact name, phone, email | **(decide)** yours; not shown publicly |

**Notes for the reviewer** (4000 max; paste all of it). It answers, up front, every question App Review asked about
the two earlier apps (see "Lessons from earlier reviews" below):

```
Echo Trail: Sound Maze is an audio game: the screen is intentionally almost black during play. Please use headphones and turn the volume up.

1. SCREEN RECORDING
A recording made on a physical iPhone is attached. It starts with launching the app and shows: the tracking permission prompt, the intro, a full level (walk, hint, reaching the sound, picture reveal), an ad between levels, a rewarded ad, and the "Remove ads" purchase and "Restore purchases" in Settings.

2. TESTED ON
iPhone 16, iOS 27.2; iPhone 17 Pro, iOS 26.2; iPad Pro 13-inch (M5) simulator, iPadOS 27.2

3. WHAT THE APP IS AND WHO IT IS FOR
A single-player puzzle game for a general audience (not for children; not in the Kids category). The player finds a hidden sound by ear and walks to it past invisible obstacles before a countdown ends. The ground the player has walked stays lit, and reaching the sound reveals a picture. Four journeys of 30 levels each (Zen, Mystery, Tension, Cheerful). It offers a calm, screen-light kind of play, and is also playable without headphones.

4. HOW TO USE IT
No account, login or setup. Play > choose a journey > level 1. A card shows the control scheme; press Start. Hold a finger on the screen and the glowing dot walks toward it. Follow the repeating sound: it is louder and faster as you get closer, and panned left or right. If you get stuck, press Hint (bottom right): a light shows the way and the obstacles appear briefly. Without headphones, wave rings show where the sound comes from. For testing, Easy difficulty (top of the journey screen) gives the most time.

5. EXTERNAL SERVICES
- Google AdMob (Google Mobile Ads SDK): full-screen ads between levels and optional rewarded videos.
- Apple StoreKit: one non-consumable in-app purchase, "Remove ads" (Settings > Purchases, with "Restore purchases").
Nothing else: no analytics SDK, no backend, no accounts, no AI services. Progress and settings are stored only on the device.

6. REGIONS
The app works the same in every region. It is in English and Turkish and follows the device language (changeable in Settings).

7. CONTENT AND RIGHTS
Not a regulated field. All sounds and pictures were made for this game by the developer; there is no third-party or licensed material and no user-generated content.

PERMISSIONS
- Tracking (App Tracking Transparency): asked shortly after first launch. If declined, ads are non-personalised; the game works the same either way.
- Motion: used only by the optional tilt control (Settings > Controls > Tilt).
- Microphone: never used and never requested. Info.plist carries a microphone purpose string only because the audio playback library (react-native-audio-api) links the recording APIs and App Store validation requires the string; the app has no recording feature and the prompt never appears.
The app does not use the camera, location, contacts or notifications, and plays no audio in the background (no background modes are declared).

ADS
Full-screen ads appear only between levels (after every one or two completed levels, chosen at random), never during play. Rewarded videos are always the player's choice (extra time, extra hint).

OTHER
The Tension journey has a chaser that follows the player and is labelled "Not family friendly" in the menu. The name on the Home Screen is "Echo Trail", the short form of the store name.
```

### Lessons from earlier reviews

What App Review raised on the two earlier apps (Tersten / Say It Backwards
and Oyun Treni), and where each point stands here.

| Guideline | What happened before | Echo Trail |
|---|---|---|
| 2.5.4 Background audio | Both apps declared `audio` in `UIBackgroundModes` without playing audio in the background. | Not declared: `iosBackgroundMode: false` for `react-native-audio-api` in `app.json`; the generated `Info.plist` has no `UIBackgroundModes` key (checked 15 November 2026). Re-check after any `prebuild`: `grep UIBackgroundModes ios/EchoTrail/Info.plist` must print nothing. |
| 2.3.8 Name mismatch | The store name and the name on the device were unrelated. | Store "Echo Trail: Sound Maze" / "Echo Trail: Ses Labirenti", device "Echo Trail": the device name is the start of the store name. Keep it that way if the store name changes again. |
| 1.3 Kids Category | Submitted in the Kids category: questions about analytics, ads and data, then a rejection for links and purchases without a parental gate. | Do **not** select the Kids category or "Made for Kids" (section 6). The app shows third-party ads and has no parental gate, so it must stay out of it. |
| 2.1 Information needed | Apple asked for a screen recording on a physical device, tested devices, a description and audience, setup steps, external services, regional differences and rights. | All seven are answered in the notes above. Still to do: record the video and fill in the tested devices (section 9). |
| 5.1.1 Purpose strings | Listed by Apple as a common issue. | Tracking and motion both have specific strings, in English and Turkish (`app.json`, `locales/`). A microphone string is also present because upload validation demands it for the audio library (ITMS-90683, hit on build 1), although the app never uses the microphone; the review notes say so. |
| 2.3.3 Screenshots | Listed by Apple as a common issue: screenshots must show the app in use. | Every screenshot is a capture of the running game; none is title art or the splash screen. |
| 2.1 Crashes on review devices | Apple reviewed on an iPad Air 11-inch and an iPhone 17 Pro Max. | The app runs on iPad (portrait, full screen). Test a Release build on an iPad as well as an iPhone before submitting (section 9). |

## 9. Before you submit

Things that are still placeholders or development values. The app will run
without them, but they should be settled before a public release.

- [ ] **Turkish store name.** Add the Turkish localization in App Store
      Connect and confirm `Echo Trail: Ses Labirenti` is free (section 1).
- [x] **AdMob app ID and ad units.** Set on 15 November 2026 (table below).
      Development builds still use Google's test units; only release builds
      request real ads. After changing the app ID, run `npm run prebuild`.

      | What | ID | Where it is set |
      |---|---|---|
      | App ID | `ca-app-pub-4475107857161348~1377597514` | `app.json` › `react-native-google-mobile-ads` › `iosAppId` |
      | Interstitial ad unit | `ca-app-pub-4475107857161348/5197423028` | `AD_UNIT_IDS.interstitial` in `src/config/monetization.ts` |
      | Rewarded ad unit | `ca-app-pub-4475107857161348/7161066372` | `AD_UNIT_IDS.rewarded` in `src/config/monetization.ts` |

- [ ] **app-ads.txt.** AdMob asks for an `app-ads.txt` file at the root of the
      developer website listed in the store. A project site
      (`serhaton.github.io/echo-trail/`) cannot serve the domain root; you need
      either a `serhaton.github.io` repository or a custom domain for it.
- [ ] **SKAdNetwork IDs.** `app.json` lists only Google's own ID. Google
      publishes a longer list for its ad partners; add it for better ad fill.
- [ ] **In-app purchase.** The product `com.serhatonal.echotrail.removeads`
      was created in App Store Connect on 15 November 2026. Still to do: get
      it to "Ready to Submit" (price, both localizations, image, review
      screenshot and notes; section 5) and add it to the first version under
      "In-App Purchases and Subscriptions" before submitting for review.
- [x] **Version.** `app.json` says 1.0.0, build 3 (build 1 was refused at upload: missing microphone purpose string, ITMS-90683; build 2 could show no ads when the first ad load failed or the store was slow). For every further upload
      raise `ios.buildNumber`, then `npm run prebuild`.
- [ ] **Sounds.** Every sound is a synthesized placeholder
      (`assets/sounds/README.md` lists what each one should become). They are
      original and safe to ship, but they are not final sound design.
- [ ] **Story narration.** The 30 Mystery letters play a placeholder melody
      with subtitles; recordings in Turkish and English are still to be made.
- [ ] **Pictures.** The 120 level pictures are generated placeholders
      (`assets/images/PROMPTS.md` describes the final art).
- [ ] **Levels.** Levels 11–30 (and all of Tension and Cheerful) are generated;
      play through them on a device and adjust the generator where needed.
- [ ] **Screen recording for App Review.** On your iPhone (Control Centre ›
      Screen Recording), starting from launching a fresh install: tracking
      prompt, intro, one full level with a hint, the ad between levels, a
      rewarded ad, Settings › Purchases with the purchase and restore. Attach
      it in App Review Information › Attachment.
- [x] **Tested devices** written into point 2 of the review notes (check
      the model names against Settings › General › About before pasting).
- [ ] **iPad.** Run the Release build once on an iPad (or the iPad
      simulator at least): Apple reviewed the earlier apps on an iPad Air.
- [ ] **Release build on a real device.** Test with
      `npx expo run:ios --configuration Release --device`: controls (tilt
      especially: its resting pose is the phone held with the top edge
      raised about 25°), the shortened countdowns on all three difficulties,
      ads, the purchase with a sandbox account, restore.
- [ ] **Privacy answers** checked against Google's current disclosure
      (section 7).
