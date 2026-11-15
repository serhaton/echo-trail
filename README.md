# Echo Trail: Sound Maze

Karanlık bir ekranda yolunu sesle bulduğun, iOS için bir mobil oyun.
React Native + Expo (SDK 58), TypeScript, expo-router, development build.

## Gereksinimler

- macOS + Xcode (App Store'dan), Xcode > Settings > Accounts altında Apple ID'n ekli olmalı
- Node.js 20+ ve CocoaPods (`brew install cocoapods`)
- Ücretli Apple Developer hesabı (cihaza imzalı kurulum için)

## İlk kurulum

```bash
npm install
npm run prebuild        # app.json'dan ios/ klasörünü üretir (elle düzenleme!)
```

`ios/` klasörü **üretilen** bir klasördür ve git'e girmez. Native ayarlar
(izinler, bundle id, plugin'ler) her zaman `app.json` üzerinden değiştirilir;
sonra `npm run prebuild` tekrar çalıştırılır.

## iPhone'a development build kurmak (ilk sefer)

1. iPhone'u kabloyla Mac'e bağla, telefonda "Bu bilgisayara güven" de.
2. iPhone'da **Ayarlar > Gizlilik ve Güvenlik > Geliştirici Modu**'nu aç (telefon yeniden başlar).
3. İmzalama takımını seç (bir kez):
   ```bash
   xed ios
   ```
   Xcode'da sol panelde **EchoTrail** projesi > **Signing & Capabilities** >
   **Team** alanından geliştirici hesabını seç. Xcode'u kapatabilirsin.
4. Build alıp telefona kur:
   ```bash
   npm run ios:device
   ```
   Listeden kendi iPhone'unu seç. İlk build 5–15 dakika sürer.

## Günlük çalışma

Native bir şey değişmediği sürece tekrar build almaya gerek yok:

```bash
npm start               # Metro sunucusunu başlatır
```

Telefondaki Echo Trail uygulamasını aç; Mac ile aynı Wi‑Fi'deysen sunucuyu
otomatik bulur (bulamazsa açılan ekranda listeden seç). Kod değiştikçe
uygulama anında yenilenir.

**Yeniden build gereken durumlar:** yeni native kütüphane eklemek,
`app.json`'da plugin/izin/ikon değişikliği. Bu durumda:

```bash
npm run prebuild && npm run ios:device
```

## Kontroller

```bash
npm run typecheck       # TypeScript
npm run lint            # ESLint
npm run doctor          # Expo bağımlılık kontrolü
```

## Bölümler

Her modda 30 bölüm var. Zen ve Gizem'in ilk 10 bölümü elle tasarlandı;
geri kalanlar bir üreteçle oluşturuluyor:

```bash
npm run generate-levels # üretilen bölümleri yeniden yazar (aynı tohumla aynı sonuç)
npm run check-levels    # her bölüm her zorlukta çözülebilir mi?
```

Üretilen bölüm dosyalarını elle düzenleme; üreteç üzerine yazar. Bir bölümü
elle tasarlamak istersen üretecin aralığından çıkar (`scripts/generate-levels.ts`
içindeki `FIRST`).

## Mağaza ve web sitesi

- `store/README.md`: App Store Connect'e girilecek tüm bilgiler (ad, açıklama,
  anahtar kelimeler, yaş derecelendirmesi, gizlilik yanıtları, kontrol listesi).
- `store/screenshots/`: mağaza ekran görüntüleri (iPhone 6.9", 6.1", iPad 13";
  İngilizce ve Türkçe). `store/creative/`: Header ve Search Results görselleri.
- `docs/`: GitHub Pages sitesi (tanıtım, gizlilik, destek):
  https://serhaton.github.io/echo-trail/

```bash
python3 scripts/generate-brand-assets.py   # ikon, açılış ekranı, mağaza görselleri
python3 scripts/build-site.py              # docs/ altındaki sayfalar
scripts/take-screenshots.sh                # ham ekran görüntüleri (başındaki nota bak)
python3 scripts/compose-screenshots.py     # başlıklı son haller, tüm boyutlar
python3 scripts/check-store-text.py        # mağaza metinleri sınırlara sığıyor mu?
```

## Klasör yapısı

```
app/              expo-router ekranları
src/game/         oyun mantığı (hareket, çarpışma, mesafe/yön)
src/audio/        konumsal ses motoru
src/components/   görsel bileşenler (Skia)
src/modes/        mod tanımları (yeni mod = yeni dosya + kayıt)
src/data/levels/  bölüm verileri
src/i18n/         tr.ts, en.ts, çeviri sağlayıcısı
src/services/     reklam, satın alma, kayıt, haptik, kulaklık
src/theme/        renkler, mod paletleri, ölçüler, animasyon süreleri
assets/sounds/    sesler + README.md (ihtiyaç listesi)
assets/images/    bölüm sonu resimleri
locales/          iOS sistem metinleri (izin açıklamaları) iki dilde
```

## Çeviri eklemek

1. Metni önce `src/i18n/en.ts`'e ekle.
2. Aynı anahtarı `src/i18n/tr.ts`'e ekle; eksik bırakırsan TypeScript hata verir.
3. Kullan: `const { t } = useTranslation(); t('menu.play')`.
