import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { FeedbackBadge } from './components/FeedbackBadge';
import { ProgressBar } from './components/ProgressBar';
import { ScoreCard } from './components/ScoreCard';
import { WordCard } from './components/WordCard';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSessionStore } from './store/sessionStore';
import { comparePronunciation } from './utils/text';
import { speakWord } from './utils/speechSynthesis';

const AUTO_NEXT_DELAY_MS: number = 900;

const App = (): JSX.Element => {
  const {
    wordsByLength,
    selectedLength,
    currentIndex,
    status,
    feedbackStatus,
    feedbackMessage,
    recognizedWord,
    totalAttempts,
    correctAttempts,
    selectLength,
    startSession,
    pauseSession,
    markResult,
    nextWord,
    skipWord,
    resetFeedback
  } = useSessionStore();

  const { isSupported, isListening, transcript, error, supportMessage, startListening, stopListening, clearTranscript } =
    useSpeechRecognition('en-US');

  const [comparisonHint, setComparisonHint] = useState<string>('');
  const lastProcessedTranscriptRef = useRef<string>('');

  const activeWords: string[] = useMemo(() => {
    return wordsByLength[selectedLength] ?? [];
  }, [selectedLength, wordsByLength]);

  const totalWords: number = activeWords.length;
  const safeIndex: number = Math.min(currentIndex, Math.max(totalWords - 1, 0));
  const currentWord: string = activeWords[safeIndex] ?? '';

  useEffect(() => {
    if (transcript.length === 0 || currentWord.length === 0 || status !== 'running') {
      return;
    }

    if (lastProcessedTranscriptRef.current === transcript) {
      return;
    }

    lastProcessedTranscriptRef.current = transcript;

    // Konuşmadan gelen metni hedef kelimeyle karşılaştırır.
    const comparison = comparePronunciation(currentWord, transcript);
    const hintMap: Record<string, string> = {
      exact: 'Birebir eşleşme',
      distance: 'Küçük farkla kabul edildi',
      phonetic: 'Fonetik olarak kabul edildi',
      none: 'Eşleşme bulunamadı'
    };

    setComparisonHint(hintMap[comparison.strategy]);
    markResult(comparison.isMatch, transcript);
    clearTranscript();

    if (comparison.isMatch) {
      window.setTimeout(() => {
        nextWord();
      }, AUTO_NEXT_DELAY_MS);
    }
  }, [clearTranscript, currentWord, markResult, nextWord, status, transcript]);

  useEffect(() => {
    if (transcript.length === 0) {
      lastProcessedTranscriptRef.current = '';
    }
  }, [transcript]);

  useEffect(() => {
    if (feedbackStatus === 'neutral') {
      setComparisonHint('');
    }
  }, [feedbackStatus]);

  const handleMicClick = (): void => {
    if (status !== 'running' || currentWord.length === 0) {
      return;
    }

    resetFeedback();

    if (isListening) {
      stopListening();
      return;
    }

    startListening();
  };

  const handleLengthChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    selectLength(event.target.value);
  };

  const handlePlayWord = (): void => {
    if (currentWord.length === 0) {
      return;
    }

    speakWord(currentWord);
  };

  const isRunning: boolean = status === 'running';
  const hasWords: boolean = totalWords > 0;
  const currentProgress: number = hasWords ? safeIndex + 1 : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white px-4 py-8 text-slate-900 sm:px-6">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Pronunciation Practice</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">İngilizce Telaffuz Alıştırması</h1>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <ProgressBar current={currentProgress} total={totalWords} />
          <ScoreCard totalAttempts={totalAttempts} correctAttempts={correctAttempts} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-sm font-medium text-slate-700" htmlFor="word-length">
              Kelime Uzunluğu
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none ring-brand-500 transition focus:ring-2 sm:w-44"
              id="word-length"
              onChange={handleLengthChange}
              value={selectedLength}
            >
              {Object.keys(wordsByLength).map((length: string) => (
                <option key={length} value={length}>
                  {length} harf
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              onClick={isRunning ? pauseSession : startSession}
              type="button"
            >
              {isRunning ? 'Duraklat' : 'Başlat'}
            </button>
            <button
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!isRunning || !hasWords}
              onClick={skipWord}
              type="button"
            >
              Kelimeyi Geç
            </button>
            <button
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!hasWords}
              onClick={handlePlayWord}
              type="button"
            >
              Telaffuzu Dinle
            </button>
          </div>
        </div>

        {hasWords ? <WordCard word={currentWord} /> : <WordCard word="Kelime yok" />}

        <button
          className={`rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
            isListening ? 'bg-rose-500 hover:bg-rose-400' : 'bg-slate-900 hover:bg-slate-800'
          } disabled:cursor-not-allowed disabled:bg-slate-300`}
          disabled={!isRunning || !hasWords || !isSupported}
          onClick={handleMicClick}
          type="button"
        >
          {isListening ? 'Dinleme Durduruluyor...' : 'Mikrofona Bas ve Oku'}
        </button>

        {!isSupported ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-700">
            {supportMessage ?? 'Tarayıcı ses kaydı veya mikrofon erişimini desteklemiyor.'}
          </div>
        ) : null}

        {error !== null ? (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        ) : null}

        <FeedbackBadge message={feedbackMessage} recognizedWord={recognizedWord} status={feedbackStatus} />

        {comparisonHint.length > 0 ? (
          <p className="text-center text-xs font-medium text-slate-500">Karşılaştırma: {comparisonHint}</p>
        ) : null}

        {status === 'completed' ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            Oturum tamamlandı. Yeni tur için "Başlat" butonuna bas.
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default App;
