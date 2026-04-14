# Pronunciation Practice App (Spelling Bee Alıştırması)

Bu proje, oğlumun yaklaşan İngilizce "Spelling Bee" (kelime telaffuz ve heceleme) yarışması için hazırlanmasına yardımcı olmak amacıyla geliştirilmiştir. Uygulama, öğretmeninin verdiği kelime listesi üzerinden interaktif bir şekilde telaffuz alıştırması yapabilmesini sağlar. Modern, temiz ve üretime hazır bir yapıya sahiptir.

## Kelime Listesi

Uygulamada kullanılan tüm kelimeler `src/data/words.json` dosyasında tutulmaktadır. Kelimeler harf sayılarına göre gruplandırılmıştır. Yeni kelimeler eklemek veya mevcut olanları değiştirmek isterseniz, bu dosyayı doğrudan düzenleyebilirsiniz:

```json
{
  "3": ["fur", "ear", "eye"],
  "4": ["eggs", "wing", "body"]
}
```

## Özellikler

- Kelimeleri harf uzunluğuna göre seçme (`3`, `4`, `5`, `6`, `7`, `8`)
- Kelimeyi tek tek gösterme
- Mikrofon ile telaffuz denemesi
- Tarayıcı Web Speech API ile konuşma tanıma (sunucu gerekmez)
- Esnek doğrulama:
  - Harf duyarsız eşleşme
  - Küçük yazım farkları için Levenshtein toleransı
  - Fonetik yakınlık için Soundex
- Doğru/yanlış geri bildirimi
- Doğruysa otomatik sonraki kelimeye geçiş
- Yanlışsa aynı kelimede tekrar deneme
- İlerleme göstergesi
- Doğruluk skoru ve localStorage ile kalıcı metrikler
- TTS ile kelimenin doğru telaffuzunu dinleme

## Teknolojiler

- React + Vite + TypeScript
- TailwindCSS
- Zustand
- Web Speech API (tarayıcı native)

## Tarayıcı Desteği

| Tarayıcı | Durum |
|---|---|
| Chrome / Edge | ✅ Çalışır |
| Safari | ✅ Çalışır |
| Brave | ⚠️ Shields ayarından mikrofona izin ver |
| Firefox | ❌ Web Speech API desteklenmiyor |

## Yerel Çalıştırma

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Vercel Deploy

```bash
vercel --prod
```
