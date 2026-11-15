#!/usr/bin/env python3
"""
Builds the static website in docs/ (served by GitHub Pages):

  docs/index.html      marketing page      docs/tr/index.html
  docs/privacy.html    privacy policy      docs/tr/privacy.html
  docs/support.html    support / FAQ       docs/tr/support.html

All text lives in CONTENT below, once per language. Edit it here and run:

    python3 scripts/build-site.py

Images in docs/assets/ come from scripts/generate-brand-assets.py and
scripts/compose-screenshots.py.
"""
from html import escape
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent / "docs"
SITE = "https://serhaton.github.io/echo-trail"
EMAIL = "serhaton@gmail.com"
DEVELOPER = "Serhat Onal"
EFFECTIVE = {"en": "14 November 2026", "tr": "14 Kasım 2026"}

CONTENT = {
    "en": {
        "lang": "en",
        "nav": {"home": "Home", "privacy": "Privacy", "support": "Support", "other": "Türkçe"},
        "tagline": "Find your way by sound",
        "lead": "The screen is dark. Somewhere ahead a sound is calling. Follow it with your ears, feel your way past what you cannot see, and watch the place you walked through come to light.",
        "soon": "Coming soon to the App Store",
        "platform": "For iPhone and iPad",
        "features_title": "A game you play with your ears",
        "features": [
            ("Listen", "Left ear, right ear, louder, clearer, faster: the sound tells you where to go. If it turns dull and low, it is behind you."),
            ("Feel", "Walls, trees and water are invisible. You hear a soft thud from their side and feel a tap when you touch them."),
            ("Reveal", "The path you walk glows in colour. Reach the sound and the picture of the place opens and joins your album."),
            ("Your way", "Follow your finger, use a joystick or tilt the phone. Best with headphones; without them, gentle wave rings show the direction."),
        ],
        "journeys_title": "Four journeys, 120 levels",
        "journeys": [
            ("Zen", "#B9DCC6", "A day-long walk through nature. No rush: when time runs out you simply keep walking."),
            ("Mystery", "#E3B26B", "Someone vanished in an old mansion. Thirty rooms, thirty letters, one story."),
            ("Tension", "#E06C75", "Something follows you through the night. Keep moving. Not for young children."),
            ("Cheerful", "#FFD166", "A day at the fair: bright sounds, stars to collect, rainbow trails."),
        ],
        "shots_title": "A look inside",
        "shots_alt": ["Journey map", "Following the sound", "A hint lights the way", "The picture is revealed"],
        "more_title": "Good to know",
        "more": [
            "Free to play, with ads between some levels.",
            "One optional purchase removes those ads and gives you an extra free hint in every level.",
            "No account, no sign-up. Your progress stays on your device.",
            "English and Turkish.",
        ],
        "footer": f"© 2026 {DEVELOPER}",
        "privacy": {
            "title": "Privacy Policy",
            "intro": f"This policy explains what information the Echo Trail: Sound Maze app (“the app”, “Echo Trail”) handles. Echo Trail is made by {DEVELOPER} (“I”, “me”). Effective date: {{date}}.",
            "sections": [
                ("The short version", [
                    "The app has no accounts and I do not run any server that receives your data.",
                    "Your game progress and settings are stored only on your device.",
                    "The app shows ads through Google AdMob. Google may collect some device and usage information to deliver and measure those ads.",
                    "You decide whether ads may be personalised, through Apple's tracking prompt.",
                ]),
                ("Information stored on your device", [
                    "Game progress (finished levels, stars, items found), your settings (language, controls, volumes, vibration) and whether you own the “Remove ads” purchase are saved locally on your device. They are not sent to me. Deleting the app deletes them.",
                ]),
                ("Advertising (Google AdMob)", [
                    "The app uses the Google Mobile Ads SDK (AdMob) to show ads: full-screen ads between some levels, and optional rewarded videos that you choose to watch.",
                    "To deliver, limit and measure ads, and to prevent fraud, Google may collect and process: device identifiers (such as the advertising identifier, if you allow it, and the identifier for vendors), your IP address (which can indicate your approximate location), information about your device and operating system, how you interact with ads, and diagnostic data.",
                    "When the app starts it asks, through Apple's App Tracking Transparency prompt, whether it may track you. If you choose “Ask App Not to Track”, the app requests non-personalised ads and the advertising identifier is not available to it. You can change this at any time in iOS Settings › Privacy & Security › Tracking.",
                    "Google's use of this information is described in Google's Privacy Policy (https://policies.google.com/privacy) and in “How Google uses information from sites or apps that use our services” (https://policies.google.com/technologies/partner-sites).",
                ]),
                ("Purchases", [
                    "The optional “Remove ads” purchase is processed entirely by Apple through the App Store. I never see your payment details. The app only learns from Apple whether the purchase exists, so it can stop showing ads between levels.",
                ]),
                ("Device features the app uses", [
                    "Motion sensor: only if you choose tilt controls, the app reads the accelerometer to move your character. The readings stay on the device.",
                    "Audio output: the app checks whether headphones are connected, to decide whether to show visual direction cues. This is not stored or sent anywhere.",
                    "The app does not use the microphone, camera, contacts, photos or precise location.",
                ]),
                ("Children", [
                    "Echo Trail is not directed at children under 13 and is not part of the App Store Kids category. It shows third-party ads, and one of its journeys (Tension) is not suitable for young children.",
                ]),
                ("Your choices", [
                    "Decline tracking in Apple's prompt, or turn it off later in iOS Settings.",
                    "Remove the ads between levels with the one-time purchase.",
                    "Delete all locally stored data by deleting the app.",
                ]),
                ("Changes to this policy", [
                    "If the app starts handling information differently, this page will be updated and the effective date above will change.",
                ]),
                ("Contact", [
                    f"Questions about privacy? Write to {EMAIL}.",
                ]),
            ],
        },
        "support": {
            "title": "Support",
            "intro": "Answers to common questions. If yours is not here, get in touch at the bottom of the page.",
            "faq": [
                ("I can't hear anything.", "Turn the volume up with the side buttons and check Settings › Sound in the game: Effects and Ambience each have their own level. The game plays even when the silent switch is on. If you use Bluetooth headphones, make sure they are connected before you start a level."),
                ("Do I need headphones?", "They are strongly recommended: the game tells you the direction through your left and right ear. Without headphones the game shows soft wave rings coming from the direction of the sound. You can force either behaviour in Settings › Sound output."),
                ("How do I tell whether the sound is in front of me or behind me?", "A sound behind you is duller and lower in pitch. The target's strikes also come faster as you get closer, so walk a few steps: if the rhythm speeds up, you are heading the right way."),
                ("How do I change the controls?", "Three ways to move: follow your finger, a joystick, or tilting the phone. Change them in Settings › Controls, on the card shown before each level, or with the button at the bottom-left during a level."),
                ("Tilt controls move me when I'm not tilting.", "With tilt controls the resting position is the phone held with its top edge raised slightly toward you, as you would naturally hold it to look at the screen. Tilt it from there to walk; the more you tilt, the faster."),
                ("What do hints do?", "A hint shows a light pointing along the way to the sound and briefly reveals the obstacles. You get one free hint per level; more are available by watching a rewarded video."),
                ("I bought “Remove ads” but still see ads.", "The purchase removes the ads shown between levels. Rewarded videos stay available because you choose to watch them. If ads between levels still appear, open Settings › Purchases and tap “Restore purchases”."),
                ("How do I restore my purchase on a new device?", "Sign in with the same Apple ID, open Settings › Purchases in the game and tap “Restore purchases”."),
                ("Is my progress backed up?", "Progress is stored on your device. It is included in your device backups, but it is not synced between devices and is deleted if you delete the app."),
                ("Which devices are supported?", "iPhone and iPad, in portrait orientation."),
            ],
            "contact_title": "Contact",
            "contact": f"Found a bug or have a question? Write to {EMAIL} and describe what happened, your device and iOS version.",
        },
    },
    "tr": {
        "lang": "tr",
        "nav": {"home": "Ana sayfa", "privacy": "Gizlilik", "support": "Destek", "other": "English"},
        "tagline": "Yolunu sesle bul",
        "lead": "Ekran karanlık. İleride bir yerde bir ses seni çağırıyor. Onu kulaklarınla takip et, göremediklerinin yanından hissederek geç ve gezdiğin yerin aydınlanışını izle.",
        "soon": "Yakında App Store'da",
        "platform": "iPhone ve iPad için",
        "features_title": "Kulaklarınla oynadığın bir oyun",
        "features": [
            ("Dinle", "Sol kulak, sağ kulak, daha yüksek, daha net, daha sık: ses sana nereye gideceğini söyler. Boğuk ve pes geliyorsa arkandadır."),
            ("Hisset", "Duvarlar, ağaçlar ve su görünmezdir. Dokunduğunda onların olduğu taraftan tok bir ses duyar, hafif bir titreşim hissedersin."),
            ("Ortaya çıkar", "Yürüdüğün yol renklenir. Sese ulaştığında o mekânın resmi açılır ve albümüne eklenir."),
            ("Senin tarzın", "Parmağını takip et, joystick kullan ya da telefonu eğ. Kulaklıkla en güzeli; kulaklıksız oynarken yumuşak dalga halkaları yönü gösterir."),
        ],
        "journeys_title": "Dört yolculuk, 120 bölüm",
        "journeys": [
            ("Zen", "#B9DCC6", "Doğada gün boyu süren bir yürüyüş. Acele yok: süre bitse de yürümeye devam edersin."),
            ("Gizem", "#E3B26B", "Eski bir konakta biri kayboldu. Otuz oda, otuz mektup, tek bir hikâye."),
            ("Gerilim", "#E06C75", "Gece boyunca bir şey peşinde. Durma, yürü. Küçük çocuklar için uygun değil."),
            ("Neşeli", "#FFD166", "Panayırda bir gün: cıvıl cıvıl sesler, toplanacak yıldızlar, gökkuşağı izler."),
        ],
        "shots_title": "İçeriden bir bakış",
        "shots_alt": ["Yolculuk haritası", "Sesi takip ederken", "İpucu yolu aydınlatır", "Resim ortaya çıkıyor"],
        "more_title": "Bilmen gerekenler",
        "more": [
            "Ücretsiz oynanır; bazı bölümlerin arasında reklam çıkar.",
            "İsteğe bağlı tek bir satın alım bu reklamları kaldırır ve her bölümde fazladan bir ücretsiz ipucu verir.",
            "Hesap ya da kayıt yok. İlerlemen cihazında kalır.",
            "Türkçe ve İngilizce.",
        ],
        "footer": f"© 2026 {DEVELOPER}",
        "privacy": {
            "title": "Gizlilik Politikası",
            "intro": f"Bu politika, Echo Trail: Ses Labirenti uygulamasının (“uygulama”, “Echo Trail”) hangi bilgileri işlediğini açıklar. Echo Trail'in geliştiricisi {DEVELOPER}'dır (“ben”). Yürürlük tarihi: {{date}}.",
            "sections": [
                ("Kısaca", [
                    "Uygulamada hesap yoktur ve verilerini alan bir sunucu işletmiyorum.",
                    "Oyun ilerlemen ve ayarların yalnızca cihazında saklanır.",
                    "Uygulama, Google AdMob aracılığıyla reklam gösterir. Google, bu reklamları sunmak ve ölçmek için bazı cihaz ve kullanım bilgilerini toplayabilir.",
                    "Reklamların kişiselleştirilip kişiselleştirilmeyeceğine, Apple'ın izleme izni penceresiyle sen karar verirsin.",
                ]),
                ("Cihazında saklanan bilgiler", [
                    "Oyun ilerlemen (bitirilen bölümler, yıldızlar, bulunan öğeler), ayarların (dil, kontrol, ses seviyeleri, titreşim) ve “Reklamları kaldır” satın alımına sahip olup olmadığın cihazında yerel olarak saklanır. Bana gönderilmez. Uygulamayı silmek bunları da siler.",
                ]),
                ("Reklamlar (Google AdMob)", [
                    "Uygulama reklam göstermek için Google Mobile Ads SDK'sını (AdMob) kullanır: bazı bölümlerin arasında tam ekran reklamlar ve izlemeyi senin seçtiğin ödüllü videolar.",
                    "Google; reklamları sunmak, sınırlamak ve ölçmek ile dolandırıcılığı önlemek için şunları toplayıp işleyebilir: cihaz tanımlayıcıları (izin verirsen reklam tanımlayıcısı ve satıcı tanımlayıcısı gibi), IP adresin (yaklaşık konumunu gösterebilir), cihazın ve işletim sistemin hakkında bilgiler, reklamlarla etkileşimin ve tanılama verileri.",
                    "Uygulama açıldığında Apple'ın Uygulama İzleme Şeffaflığı penceresiyle seni izleyip izleyemeyeceğini sorar. “Uygulamadan İzlememesini İste”yi seçersen uygulama kişiselleştirilmemiş reklam ister ve reklam tanımlayıcısına erişemez. Bunu istediğin zaman iOS Ayarlar › Gizlilik ve Güvenlik › İzleme bölümünden değiştirebilirsin.",
                    "Google'ın bu bilgileri nasıl kullandığı Google Gizlilik Politikası'nda (https://policies.google.com/privacy) ve “Google, hizmetlerimizi kullanan site veya uygulamalardan gelen bilgileri nasıl kullanır” sayfasında (https://policies.google.com/technologies/partner-sites) açıklanır.",
                ]),
                ("Satın alımlar", [
                    "İsteğe bağlı “Reklamları kaldır” satın alımı tamamen Apple tarafından, App Store üzerinden işlenir. Ödeme bilgilerini hiçbir zaman görmem. Uygulama, bölüm aralarındaki reklamları kapatabilmek için Apple'dan yalnızca satın alımın var olup olmadığını öğrenir.",
                ]),
                ("Uygulamanın kullandığı cihaz özellikleri", [
                    "Hareket sensörü: yalnızca eğerek kontrolü seçersen, karakterini hareket ettirmek için ivmeölçer okunur. Okumalar cihazdan çıkmaz.",
                    "Ses çıkışı: görsel yön ipuçlarını gösterip göstermeyeceğine karar vermek için kulaklık bağlı mı diye bakılır. Bu bilgi saklanmaz ve hiçbir yere gönderilmez.",
                    "Uygulama mikrofonu, kamerayı, kişileri, fotoğrafları ya da kesin konumu kullanmaz.",
                ]),
                ("Çocuklar", [
                    "Echo Trail 13 yaşından küçük çocuklara yönelik değildir ve App Store Çocuklar kategorisinde yer almaz. Üçüncü taraf reklamları gösterir ve yolculuklarından biri (Gerilim) küçük çocuklar için uygun değildir.",
                ]),
                ("Seçeneklerin", [
                    "Apple'ın penceresinde izlemeyi reddedebilir ya da sonradan iOS Ayarlar'dan kapatabilirsin.",
                    "Bölüm aralarındaki reklamları tek seferlik satın alımla kaldırabilirsin.",
                    "Uygulamayı silerek yerel olarak saklanan tüm verileri silebilirsin.",
                ]),
                ("Bu politikadaki değişiklikler", [
                    "Uygulama bilgileri farklı biçimde işlemeye başlarsa bu sayfa güncellenir ve yukarıdaki yürürlük tarihi değişir.",
                ]),
                ("İletişim", [
                    f"Gizlilikle ilgili soruların için {EMAIL} adresine yazabilirsin.",
                ]),
            ],
        },
        "support": {
            "title": "Destek",
            "intro": "Sık sorulan soruların yanıtları. Seninki burada yoksa sayfanın altından ulaşabilirsin.",
            "faq": [
                ("Hiç ses duymuyorum.", "Yan tuşlarla sesi aç ve oyunda Ayarlar › Ses bölümüne bak: Efektler ve Ortam ayrı ayrı ayarlanır. Oyun, sessiz mod açıkken de ses çalar. Bluetooth kulaklık kullanıyorsan bölüme başlamadan önce bağlı olduğundan emin ol."),
                ("Kulaklık şart mı?", "Kuvvetle önerilir: oyun yönü sol ve sağ kulağın üzerinden anlatır. Kulaklıksız oynarken sesin geldiği yönden yumuşak dalga halkaları görünür. İki davranışı da Ayarlar › Ses çıkışı bölümünden elle seçebilirsin."),
                ("Sesin önümde mi arkamda mı olduğunu nasıl anlarım?", "Arkandaki ses daha boğuk ve daha pes gelir. Ayrıca hedefin vuruşları yaklaştıkça sıklaşır; birkaç adım yürü: ritim hızlanıyorsa doğru yöndesin."),
                ("Kontrolü nasıl değiştiririm?", "Üç kontrol şekli var: parmağı takip, joystick ve telefonu eğerek. Ayarlar › Kontrol bölümünden, her bölümden önce çıkan karttan ya da bölüm sırasında sol alttaki düğmeden değiştirebilirsin."),
                ("Eğerek kontrolde eğmediğim halde hareket ediyorum.", "Eğerek kontrolde dinlenme konumu, telefonun üst kenarı hafifçe sana doğru kalkık halidir; ekrana bakarken doğal tutuşun gibi. Oradan eğerek yürürsün; ne kadar eğersen o kadar hızlı."),
                ("İpucu ne işe yarar?", "İpucu, sese giden yolu gösteren bir ışık yakar ve engelleri kısa bir an görünür kılar. Bölüm başına bir ücretsiz ipucun vardır; daha fazlası ödüllü video izleyerek alınır."),
                ("“Reklamları kaldır”ı aldım ama hâlâ reklam görüyorum.", "Satın alım, bölüm aralarında çıkan reklamları kaldırır. Ödüllü videolar, izlemeyi sen seçtiğin için durmaya devam eder. Bölüm aralarında hâlâ reklam çıkıyorsa Ayarlar › Satın alımlar bölümünden “Satın alımları geri yükle”ye dokun."),
                ("Satın alımımı yeni cihazda nasıl geri yüklerim?", "Aynı Apple Kimliği ile giriş yap, oyunda Ayarlar › Satın alımlar bölümünü aç ve “Satın alımları geri yükle”ye dokun."),
                ("İlerlemem yedekleniyor mu?", "İlerleme cihazında saklanır. Cihaz yedeklerine dahildir, ama cihazlar arasında eşitlenmez ve uygulamayı silersen silinir."),
                ("Hangi cihazlar destekleniyor?", "iPhone ve iPad, dikey ekranda."),
            ],
            "contact_title": "İletişim",
            "contact": f"Bir hata mı buldun ya da sorun mu var? {EMAIL} adresine yaz; ne olduğunu, cihazını ve iOS sürümünü belirt.",
        },
    },
}


def linkify(text):
    """Escape text and turn bare https:// URLs and the contact email into links."""
    out = []
    for word in text.split(" "):
        core = word.rstrip(").,;")
        if core == EMAIL:
            out.append(f'<a href="mailto:{EMAIL}">{EMAIL}</a>{escape(word[len(core):])}')
            continue
        if core.startswith("(https://") or core.startswith("https://"):
            url = core.lstrip("(")
            tail = word[len(core):]
            lead = "(" if core.startswith("(") else ""
            out.append(f'{lead}<a href="{escape(url)}">{escape(url)}</a>{escape(tail)}')
        else:
            out.append(escape(word))
    return " ".join(out)


def store_name(c):
    """The app's App Store name in the page's language."""
    return "Echo Trail: Ses Labirenti" if c["lang"] == "tr" else "Echo Trail: Sound Maze"


def page(c, kind, body, title, description):
    root = "" if c["lang"] == "en" else "../"
    other = ("tr/" if c["lang"] == "en" else "../") + ("" if kind == "index" else f"{kind}.html")
    here = "" if c["lang"] == "en" else "tr/"
    canonical = f"{SITE}/{here}{'' if kind == 'index' else kind + '.html'}"
    nav = c["nav"]
    return f"""<!doctype html>
<html lang="{c['lang']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)}</title>
<meta name="description" content="{escape(description)}">
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{escape(title)}">
<meta property="og:description" content="{escape(description)}">
<meta property="og:image" content="{SITE}/assets/og.jpg">
<meta name="theme-color" content="#05060A">
<link rel="icon" href="{root}assets/icon.png">
<link rel="apple-touch-icon" href="{root}assets/icon.png">
<link rel="stylesheet" href="{root}style.css">
</head>
<body>
<header class="top">
  <a class="brand" href="{'./' if kind == 'index' else 'index.html' if c['lang'] == 'tr' else './'}"><img src="{root}assets/icon.png" alt="" width="36" height="36"><span>Echo Trail</span></a>
  <nav>
    <a href="{'./' if c['lang'] == 'en' else 'index.html'}"{' aria-current="page"' if kind == 'index' else ''}>{escape(nav['home'])}</a>
    <a href="privacy.html"{' aria-current="page"' if kind == 'privacy' else ''}>{escape(nav['privacy'])}</a>
    <a href="support.html"{' aria-current="page"' if kind == 'support' else ''}>{escape(nav['support'])}</a>
    <a class="lang" href="{other}" hreflang="{'tr' if c['lang'] == 'en' else 'en'}">{escape(nav['other'])}</a>
  </nav>
</header>
{body}
<footer class="bottom">
  <span>{escape(c['footer'])}</span>
  <span><a href="privacy.html">{escape(nav['privacy'])}</a> · <a href="support.html">{escape(nav['support'])}</a></span>
</footer>
</body>
</html>
"""


def index(c):
    root = "" if c["lang"] == "en" else "../"
    feats = "".join(f"<li><h3>{escape(t)}</h3><p>{escape(d)}</p></li>" for t, d in c["features"])
    journeys = "".join(
        f'<li style="--accent:{col}"><h3>{escape(n)}</h3><p>{escape(d)}</p></li>' for n, col, d in c["journeys"]
    )
    shots = "".join(
        f'<img src="{root}assets/shots/{c["lang"]}-{i + 1}.jpg" alt="{escape(alt)}" loading="lazy" width="330" height="717">'
        for i, alt in enumerate(c["shots_alt"])
    )
    more = "".join(f"<li>{escape(m)}</li>" for m in c["more"])
    body = f"""<main>
<section class="hero">
  <img class="hero-art" src="{root}assets/hero.jpg" alt="" width="1920" height="823">
  <div class="hero-text">
    <h1>Echo Trail</h1>
    <p class="tagline">{escape(c['tagline'])}</p>
    <p class="lead">{escape(c['lead'])}</p>
    <p class="cta"><span class="badge">{escape(c['soon'])}</span><span class="platform">{escape(c['platform'])}</span></p>
  </div>
</section>
<section>
  <h2>{escape(c['features_title'])}</h2>
  <ul class="cards">{feats}</ul>
</section>
<section>
  <h2>{escape(c['journeys_title'])}</h2>
  <ul class="cards journeys">{journeys}</ul>
</section>
<section>
  <h2>{escape(c['shots_title'])}</h2>
  <div class="shots">{shots}</div>
</section>
<section>
  <h2>{escape(c['more_title'])}</h2>
  <ul class="plain">{more}</ul>
</section>
</main>"""
    return page(c, "index", body, f"{store_name(c)} · {c['tagline']}", c["lead"])


def privacy(c):
    p = c["privacy"]
    parts = [f"<h1>{escape(p['title'])}</h1>", f"<p class=\"lead\">{linkify(p['intro'].format(date=EFFECTIVE[c['lang']]))}</p>"]
    for heading, items in p["sections"]:
        parts.append(f"<h2>{escape(heading)}</h2>")
        if len(items) > 1:
            parts.append("<ul>" + "".join(f"<li>{linkify(i)}</li>" for i in items) + "</ul>")
        else:
            parts.append(f"<p>{linkify(items[0])}</p>")
    body = f"<main class=\"doc\">{''.join(parts)}</main>"
    return page(c, "privacy", body, f"{p['title']} · {store_name(c)}", p["sections"][0][1][0])


def support(c):
    s = c["support"]
    faq = "".join(f"<details><summary>{escape(q)}</summary><p>{linkify(a)}</p></details>" for q, a in s["faq"])
    body = f"""<main class="doc">
<h1>{escape(s['title'])}</h1>
<p class="lead">{escape(s['intro'])}</p>
<div class="faq">{faq}</div>
<h2>{escape(s['contact_title'])}</h2>
<p>{linkify(s['contact'])}</p>
</main>"""
    return page(c, "support", body, f"{s['title']} · {store_name(c)}", s["intro"])


if __name__ == "__main__":
    for lang, c in CONTENT.items():
        out = DOCS if lang == "en" else DOCS / lang
        out.mkdir(parents=True, exist_ok=True)
        (out / "index.html").write_text(index(c), encoding="utf-8")
        (out / "privacy.html").write_text(privacy(c), encoding="utf-8")
        (out / "support.html").write_text(support(c), encoding="utf-8")
    # Serve files as they are (no Jekyll processing).
    (DOCS / ".nojekyll").write_text("")
    print("built", sorted(str(p.relative_to(DOCS)) for p in DOCS.rglob("*.html")))
