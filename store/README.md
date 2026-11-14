# App Store submission kit

Everything needed to fill in App Store Connect for **Echo Trail**, in English
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
| Name | Echo Trail |
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
| Version | 1.0.0 (app.json currently says 0.1.0, see section 9) |
| Export compliance | Uses no non-exempt encryption (already declared in the app: `ITSAppUsesNonExemptEncryption = false`) |
| Advertising identifier | Yes, the app uses the IDFA to serve ads (through AdMob, behind the tracking prompt) |

## 2. Listing text

### English (U.S.)

**Name** (30 max)

```
Echo Trail
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

Echo Trail is a game you play with your ears. Put on your headphones and follow the sound: it grows louder, clearer and faster as you get closer, and your left and right ear tell you which way to turn. You cannot see the walls, trees and water in your way, but you can hear and feel them. And as you walk, the path behind you lights up in colour. Reach the sound, and the picture of the place you just crossed opens in front of you.

LISTEN
• True left/right sound: turn toward what you hear.
• Closer means louder, clearer and faster. A sound behind you turns dull and low.
• Bump into something and you hear a soft thud from its side and feel a tap.

FOUR JOURNEYS, 120 LEVELS
• Zen: a day-long walk through nature, from a forest at dawn to a hill under the stars. No rush; when time runs out you simply keep walking.
• Mystery: someone vanished in an old mansion. Thirty rooms, thirty letters, one story to piece together.
• Tension: something follows you through the night. Keep moving.
• Cheerful: a day at the fair, with stars to collect and rainbow trails.

MAKE IT YOURS
• Three ways to move: follow your finger, a joystick, or tilt your device.
• Three difficulty levels.
• Hints that light the way when you are stuck.
• Hidden sounds to find: extra time, album details and pieces of the story.
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
audio game,headphones,relaxing,zen,mystery,maze,dark,listen,puzzle,spatial,calm,explore,blind
```

**What's New** (4000 max)

```
The first release of Echo Trail. Put on your headphones and find your way.
```

### Turkish

**Name**

```
Echo Trail
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

Echo Trail, kulaklarınla oynadığın bir oyun. Kulaklığını tak ve sesi takip et: yaklaştıkça yükselir, netleşir ve sıklaşır; sol ve sağ kulağın hangi yöne döneceğini söyler. Yolundaki duvarları, ağaçları ve suyu göremezsin ama duyabilir ve hissedebilirsin. Sen yürüdükçe arkanda kalan yol renklenir. Sese ulaştığında, az önce geçtiğin yerin resmi önünde açılır.

DİNLE
• Gerçek sol/sağ ses: duyduğun yöne dön.
• Yakın olan daha yüksek, daha net ve daha sıktır. Arkandaki ses boğuk ve pes gelir.
• Bir şeye çarptığında onun olduğu taraftan tok bir ses duyar, hafif bir titreşim hissedersin.

DÖRT YOLCULUK, 120 BÖLÜM
• Zen: şafaktaki ormandan yıldızların altındaki tepeye, doğada gün boyu süren bir yürüyüş. Acele yok; süre bitse de yürümeye devam edersin.
• Gizem: eski bir konakta biri kayboldu. Otuz oda, otuz mektup, parça parça çözülen tek bir hikâye.
• Gerilim: gece boyunca bir şey peşinde. Durma, yürü.
• Neşeli: panayırda bir gün; toplanacak yıldızlar ve gökkuşağı izler.

KENDİNE GÖRE AYARLA
• Üç kontrol şekli: parmağını takip et, joystick kullan ya da cihazını eğ.
• Üç zorluk seviyesi.
• Takıldığında yolu aydınlatan ipuçları.
• Bulunacak gizli sesler: ekstra süre, albüm detayları ve hikâyeden parçalar.
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
sesli oyun,kulaklık,rahatlatıcı,zen,gizem,labirent,karanlık,dinle,bulmaca,sakin,keşif,ses oyunu
```

**What's New**

```
Echo Trail'in ilk sürümü. Kulaklığını tak ve yolunu bul.
```

## 3. URLs

The website lives in `docs/` and is served by GitHub Pages.

| Field | English | Turkish |
|---|---|---|
| Marketing URL | https://serhaton.github.io/echo-trail/ | https://serhaton.github.io/echo-trail/tr/ |
| Support URL | https://serhaton.github.io/echo-trail/support.html | https://serhaton.github.io/echo-trail/tr/support.html |
| Privacy Policy URL | https://serhaton.github.io/echo-trail/privacy.html | https://serhaton.github.io/echo-trail/tr/privacy.html |

The pages give GitHub Issues as the way to get in touch. Apple expects the
support page to offer a way to reach you; if you would rather publish an email
address, add it to `CONTENT` in `scripts/build-site.py` and rebuild **(decide)**.

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

### Header and Search Results (`store/creative/`)

New in App Store Connect since October 2026, shown on iOS 27 and iPadOS 27 or
later. Upload under the app version › Product Page Information › **Header and
Search Results**.

| File | Size (px) | Use |
|---|---|---|
| `header-3840x1646.png` | 3840 × 1646 (21:9) | Product page header |
| `search-3840x2560.png` | 3840 × 2560 (3:2) | Search results |
| `universal-5244x2950.png` | 5244 × 2950 (16:9, PNG) | One image for both placements (alternative to the two above; enables "Use header asset in search results") |

The name and mark sit inside Apple's art safe area for each format. Apple's
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

**Review screenshot:** a screenshot of the Settings screen showing the "Remove
ads" button (take it from a build on your device).

**Review notes for the purchase:**

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

**Notes for the reviewer:**

```
Echo Trail is an audio game: the screen is intentionally almost black during play. Please use headphones and turn the volume up.

How to play: start a level from Play > a journey > level 1. A card shows the control scheme; press Start. Hold a finger on the screen and the glowing dot walks toward it. Follow the repeating sound: it is louder and faster as you get closer, and panned left or right. Reaching it ends the level and reveals a picture.

If you get stuck, press Hint (bottom right): a light shows the way and the invisible obstacles appear briefly. Without headphones, the game shows wave rings coming from the direction of the sound.

No account or login is needed. Ads: full-screen ads appear only between levels (every third completed level); rewarded videos are optional (extra time, extra hint). The tracking permission prompt appears shortly after first launch; the app works the same whichever answer is given.

In-app purchase: "Remove ads" in Settings > Purchases, with "Restore purchases" next to it.

The Tension journey has a chaser that follows the player and is labelled "Not family friendly" in the menu.
```

## 9. Before you submit

Things that are still placeholders or development values. The app will run
without them, but they should be settled before a public release.

- [ ] **AdMob app ID.** `app.json` › `react-native-google-mobile-ads` ›
      `iosAppId` is Google's public *sample* ID. Replace it with your own.
- [ ] **AdMob ad units.** Fill `AD_UNIT_IDS` in `src/config/monetization.ts`
      (one interstitial, one rewarded). While they are empty, release builds
      show Google's test ads.
- [ ] **app-ads.txt.** AdMob asks for an `app-ads.txt` file at the root of the
      developer website listed in the store. A project site
      (`serhaton.github.io/echo-trail/`) cannot serve the domain root; you need
      either a `serhaton.github.io` repository or a custom domain for it.
- [ ] **SKAdNetwork IDs.** `app.json` lists only Google's own ID. Google
      publishes a longer list for its ad partners; add it for better ad fill.
- [ ] **In-app purchase** created and in "Ready to Submit", and submitted
      together with the first version (section 5).
- [ ] **Version.** Set `version` in `app.json` to `1.0.0` and choose a build
      number, then `npm run prebuild`.
- [ ] **Sounds.** Every sound is a synthesized placeholder
      (`assets/sounds/README.md` lists what each one should become). They are
      original and safe to ship, but they are not final sound design.
- [ ] **Story narration.** The 30 Mystery letters play a placeholder melody
      with subtitles; recordings in Turkish and English are still to be made.
- [ ] **Pictures.** The 120 level pictures are generated placeholders
      (`assets/images/PROMPTS.md` describes the final art).
- [ ] **Levels.** Levels 11–30 (and all of Tension and Cheerful) are generated;
      play through them on a device and adjust the generator where needed.
- [ ] **Release build on a real device.** Test with
      `npx expo run:ios --configuration Release --device`: controls (tilt
      especially), ads, the purchase with a sandbox account, restore.
- [ ] **Privacy answers** checked against Google's current disclosure
      (section 7).
- [ ] **Support contact** decided (section 3).
