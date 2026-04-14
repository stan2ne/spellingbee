# Pronunciation Practice App

Modern, temiz ve üretime hazır İngilizce telaffuz alıştırma uygulaması.

## Özellikler

- Kelimeleri harf uzunluğuna göre seçme (`3`, `4`, `5`, `6`, `7`, `8`)
- Kelimeyi tek tek gösterme
- Mikrofon ile telaffuz denemesi
- Tarayıcıda ses kaydı alıp backend STT servisine gönderme
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
- Vercel Serverless Function
- OpenAI Audio Transcriptions (`whisper-1`)

## Ortam Değişkenleri

Vercel proje ayarlarında şu değişken zorunludur:

- `OPENAI_API_KEY`

## Yerel Çalıştırma

```bash
npm install
npm run dev
```

Not: Sadece `vite` ile yerelde çalışırken `/api/transcribe` endpoint'i yoktur. Gerçek transkripsiyon testi için Vercel deploy URL'sini kullan.

## Production Build

```bash
npm run build
npm run preview
```

## Vercel Deploy

```bash
vercel --prod
```

Deploy sonrası Vercel proje ayarlarından `OPENAI_API_KEY` ekleyip tekrar deploy et.
