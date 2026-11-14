# Bölüm resimleri için üretim tarifleri

Bu dosya, 20 bölüm resmini bir yapay zekâ görsel aracıyla (Midjourney,
DALL·E, Firefly vb.) üretmek için hazır tarifler içerir. Tarifler İngilizce,
çünkü araçlar İngilizce tarifle daha iyi sonuç veriyor.

## Nasıl kullanılır

1. Aşağıdaki **ortak üslup** metnini kopyala.
2. İstediğin bölümün tarifini bunun **sonuna** ekle ve araca ver.
3. Oranı **1:2 dikey** seç (Midjourney'de `--ar 1:2`). Araç 1:2 vermiyorsa
   9:16 üret; içe aktarma betiği ortadan 1:2'ye kırpar.
4. Beğendiğin sonucu `assets/images/incoming/` klasörüne bölümün adıyla
   kaydet: `zen-01.png`, `mystery-07.jpg` gibi.
5. `python3 scripts/import-images.py` çalıştır. Betik resmi 1:2'ye kırpar,
   900×1800'e küçültür ve WebP olarak doğru klasöre yazar. Kodda başka bir
   şey değiştirmen gerekmez.

## Tutarlılık için ipuçları

- Bir yolculuğun 10 resmini **aynı araçla, aynı oturumda** üret. Araç
  destekliyorsa ilk beğendiğin resmi **üslup referansı** olarak ver
  (Midjourney'de `--sref`), böylece 10 resim aynı elden çıkmış görünür.
- Albümde resimler yan yana birleşip tek manzara oluyor. Bunun için Zen'de
  **ufuk çizgisi her resimde aynı yükseklikte** (üstten yaklaşık %40),
  Gizem'de **zemin çizgisi aynı yükseklikte** (üstten yaklaşık %80) olmalı.
  Tariflerde bu yazıyor; uymayan sonucu yeniden üret.
- Resimde **yazı, insan figürü, çerçeve** olmasın. Araç eklerse yeniden üret.
- Her resimde hedef sesin kaynağı küçük, sıcak bir **ışık noktası** olarak
  uzakta görünür. Açılış animasyonu o noktadan başladığı için bu önemli.

## Oyun haritasıyla ilişki

Bölümler kuşbakışı haritalar, resimler ise göz hizasından manzaralar.
Resmin **alt kısmı (ön plan)** bölümün başlangıcına, **üst kısmı (uzak
plan)** hedefin olduğu yere karşılık gelir. Tarifler bölümdeki engelleri
(ağaç, kütük, nehir, raf, masa…) bu sırayla sahneye yerleştirir. Yapay
zekâ nesneleri tam istenen yere koyamaz; birebir eşleşme gerekirse resmi
elle düzeltmek ya da bir illüstratörle çalışmak gerekir.

## Lisans

App Store'da yayınlayacağın için, kullandığın aracın ürettiği görsellerin
**ticari kullanımına** izin verdiğini kontrol et.

---

## Ortak üslup (her tarifin başına)

```
Soft painterly realism, digital gouache and watercolor illustration,
gentle visible brushwork, atmospheric perspective, soft diffused light,
muted harmonious palette, quiet contemplative mood, high detail in the
focal area and looser edges, no text, no people, no border, no frame,
vertical composition, 1:2 aspect ratio.
```

---

## Zen: bir gün boyu doğa yürüyüşü

Tüm Zen resimleri için ek kural (tarife ekle):

```
Eye-level landscape, horizon line at 40% from the top, a faint footpath
leads from the bottom edge into the distance, left and right edges fade
into soft continuing terrain so the image can sit beside its neighbours.
```

### zen-01 · Şafakta Orman
```
Pine forest at dawn, peach and lavender sky, low mist between trees.
Foreground: a mossy rock on the left and two tall pines. Midground: a few
scattered pines with a clear path between them. Distance: a small songbird
on a branch catching the first warm sunlight, a tiny golden glow.
```

### zen-02 · Çiy ve Kuş Sesleri
```
Pine forest just after dawn, dew sparkling on grass, soft pink-gold light.
Foreground: a single pine. Midground: a large fallen log lying across the
path from the left, leaving a gap on the right side. Distance: a songbird
on a high branch at the upper right, a tiny golden glow.
```

### zen-03 · Dolambaçlı Patika
```
Forest in early morning, pale blue sky, sun just above the trees. The path
zigzags: a fallen log blocks it from the right in the foreground, another
from the left in the midground. Distance: a songbird in a clearing at the
upper left, a tiny golden glow.
```

### zen-04 · Nehir Kıyısı
```
Meadow at noon, clear blue sky, bright soft light. A calm river crosses the
midground from left to right, with a shallow pebble ford on the right side.
Foreground: a round boulder and a small tree. Distance: on the far bank at
the upper left, a mossy rock where water drips into a pool, a tiny bright
glint.
```

### zen-05 · Basamak Taşları
```
Riverside at noon, sunlight dancing on water. Two streams cross the scene:
the nearer one with stepping stones on the left, the farther one with
stepping stones on the right. Smooth rocks between them. Distance: a small
spring among two trees at the top centre, a tiny bright glint.
```

### zen-06 · Akşam Kıyısı
```
Sandy beach in the evening, orange and rose sky, sun low over the sea. The
sea runs along the right side of the image. Foreground and midground:
driftwood logs and a few dark rocks on the sand. Distance: a wind chime
hanging from a weathered post, catching the sunset, a tiny warm glow.
```

### zen-07 · Gelgit Havuzları
```
Beach at sunset, wet sand reflecting an orange sky. Many small round tide
pools scattered from foreground to distance, with narrow sandy paths
weaving between them. Distance: a wind chime on driftwood at the upper
left, a tiny warm glow.
```

### zen-08 · Alacakaranlıkta Kumullar
```
Sand dunes at dusk, purple and deep rose sky, first stars. Three long dune
ridges cross the scene one behind another, each with a low pass at
alternating ends: right, left, right. Distance: a wind chime on a post at
the upper right, a tiny warm glow.
```

### zen-09 · Yıldızlı Tepe
```
Grassy hill at night under a sky full of stars, deep blue palette, soft
moonlight. Midground to distance: a ring of dark trees with an opening at
the lower left. Inside the ring an owl sits on a low branch, softly lit by
the moon, a tiny pale glow. Foreground: two lone trees.
```

### zen-10 · Gece Yarısı
```
Hilltop at midnight, the Milky Way overhead, deep indigo palette. Fallen
tree trunks lie in a large spiral pattern on the hillside, winding inward.
At the centre of the spiral an owl perches on a stump in a pool of
moonlight, a tiny pale glow.
```

---

## Gizem: terk edilmiş konak

Tüm Gizem resimleri için ek kural (tarife ekle):

```
Interior of an abandoned old mansion at night, seen from the doorway
looking into the room, floor line at 80% from the top, dim moonlight from
tall windows, one warm candle-like light, dust in the air, amber and deep
wine palette, slightly eerie but not frightening, left and right edges are
plain dark wall so the image can sit beside its neighbours.
```

### mystery-01 · Giriş Holü
```
Grand entrance hall. Foreground: a long wooden table and an armchair.
Midground: an inner wall with an open doorway on the left. Beyond it,
another armchair. Distance: a small music box on a side table at the upper
left, glowing softly.
```

### mystery-02 · Kütüphane
```
Library with tall bookshelves standing in rows across the room like a maze,
gaps at alternating ends. Rain on the window. Distance: a music box on a
reading desk at the far right, glowing softly.
```

### mystery-03 · Mahzen
```
Stone cellar with vaulted arches, wooden barrels left and right, a thick
stone pillar in the middle. Distance: stone stairs at the far centre where
water drips into a small puddle that catches a faint light.
```

### mystery-04 · Mutfak
```
Old kitchen. Counters along the back and right walls, a large wooden table
in the middle, a brick hearth on the right with faint embers. Distance: a
copper kettle and a music box on a shelf at the upper right, glowing
softly.
```

### mystery-05 · Müzik Odası
```
Music room. A grand piano stands in the middle distance, softly lit, one
key seeming to glow. Foreground: two rows of small chairs facing it. Rain
on tall windows behind.
```

### mystery-06 · Limonluk
```
Glass conservatory at night, rain running down the panes. Rows of large
clay pots with overgrown lemon trees and ferns, narrow paths between them.
Distance: a music box among the leaves at the upper right, glowing softly.
```

### mystery-07 · Çalışma Odası
```
Study with three very tall bookshelves standing lengthwise like corridors
leading into the room. A desk with papers on the left. Distance: a brass
mantel clock at the far right, its face glowing softly.
```

### mystery-08 · Yatak Odası
```
Bedroom. Foreground: an old bed with a quilt on the left and a wardrobe on
the right. Midground: a partition wall with a single open door on the
right. Beyond it a dressing table. Distance: a music box on a nightstand at
the upper left, glowing softly.
```

### mystery-09 · Çatı Katı
```
Attic under sloping roof beams, a round window with moonlight. Old trunks
and covered furniture, low wooden partitions crossing the space with gaps
at alternating sides. Distance: an open music box at the upper right,
glowing softly.
```

### mystery-10 · Saat Kulesi
```
Inside a clock tower, behind a huge translucent clock face glowing with
moonlight. Large brass gears left and right, wooden platforms rising in a
zigzag toward the clock. Distance: at the top centre, beside the clock
mechanism, a warm lantern light.
```
