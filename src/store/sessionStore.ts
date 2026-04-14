import { create } from 'zustand';
import wordsByLengthData from '../data/words.json';

export type SessionStatus = 'idle' | 'running' | 'paused' | 'completed';
export type FeedbackStatus = 'neutral' | 'correct' | 'incorrect';

interface PersistedMetrics {
  totalAttempts: number;
  correctAttempts: number;
}

interface SessionState {
  wordsByLength: Record<string, string[]>;
  selectedLength: string;
  currentIndex: number;
  status: SessionStatus;
  feedbackStatus: FeedbackStatus;
  feedbackMessage: string;
  recognizedWord: string;
  totalAttempts: number;
  correctAttempts: number;
  selectLength: (length: string) => void;
  startSession: () => void;
  pauseSession: () => void;
  markResult: (isCorrect: boolean, recognizedWord: string) => void;
  nextWord: () => void;
  skipWord: () => void;
  resetFeedback: () => void;
}

const STORAGE_KEY: string = 'pronunciation-practice-metrics';

const readPersistedMetrics = (): PersistedMetrics => {
  const rawValue: string | null = localStorage.getItem(STORAGE_KEY);

  if (rawValue === null) {
    return { totalAttempts: 0, correctAttempts: 0 };
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'totalAttempts' in parsed &&
      'correctAttempts' in parsed &&
      typeof parsed.totalAttempts === 'number' &&
      typeof parsed.correctAttempts === 'number'
    ) {
      return {
        totalAttempts: parsed.totalAttempts,
        correctAttempts: parsed.correctAttempts
      };
    }

    return { totalAttempts: 0, correctAttempts: 0 };
  } catch {
    return { totalAttempts: 0, correctAttempts: 0 };
  }
};

const persistMetrics = (metrics: PersistedMetrics): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
};

const wordsByLength: Record<string, string[]> = wordsByLengthData;
const initialLength: string = '3';
const persistedMetrics: PersistedMetrics = readPersistedMetrics();

export const useSessionStore = create<SessionState>((set, get) => ({
  wordsByLength,
  selectedLength: initialLength,
  currentIndex: 0,
  status: 'idle',
  feedbackStatus: 'neutral',
  feedbackMessage: 'Başlamak için mikrofon butonuna bas.',
  recognizedWord: '',
  totalAttempts: persistedMetrics.totalAttempts,
  correctAttempts: persistedMetrics.correctAttempts,
  selectLength: (length: string): void => {
    set({
      selectedLength: length,
      currentIndex: 0,
      status: 'idle',
      feedbackStatus: 'neutral',
      feedbackMessage: 'Kelime uzunluğu güncellendi. Başlatabilirsin.',
      recognizedWord: ''
    });
  },
  startSession: (): void => {
    const { status } = get();

    if (status === 'completed') {
      set({
        currentIndex: 0,
        status: 'running',
        feedbackStatus: 'neutral',
        feedbackMessage: 'Yeni tur başladı.',
        recognizedWord: ''
      });
      return;
    }

    set({
      status: 'running',
      feedbackStatus: 'neutral',
      feedbackMessage: 'Dinlemeye hazırım.',
      recognizedWord: ''
    });
  },
  pauseSession: (): void => {
    set({
      status: 'paused',
      feedbackMessage: 'Oturum duraklatıldı.'
    });
  },
  markResult: (isCorrect: boolean, recognizedWord: string): void => {
    const state: SessionState = get();
    const nextTotalAttempts: number = state.totalAttempts + 1;
    const nextCorrectAttempts: number = isCorrect ? state.correctAttempts + 1 : state.correctAttempts;

    // Skor bilgisi oturumlar arasında korunur.
    persistMetrics({
      totalAttempts: nextTotalAttempts,
      correctAttempts: nextCorrectAttempts
    });

    set({
      totalAttempts: nextTotalAttempts,
      correctAttempts: nextCorrectAttempts,
      feedbackStatus: isCorrect ? 'correct' : 'incorrect',
      feedbackMessage: isCorrect ? 'Doğru telaffuz!' : 'Tekrar dene.',
      recognizedWord
    });
  },
  nextWord: (): void => {
    const state: SessionState = get();
    const activeWords: string[] = state.wordsByLength[state.selectedLength] ?? [];
    const isLastWord: boolean = state.currentIndex >= activeWords.length - 1;

    if (isLastWord) {
      set({
        status: 'completed',
        feedbackStatus: 'neutral',
        feedbackMessage: 'Harika! Tüm kelimeleri tamamladın.',
        recognizedWord: ''
      });
      return;
    }

    set({
      currentIndex: state.currentIndex + 1,
      feedbackStatus: 'neutral',
      feedbackMessage: 'Sıradaki kelimeye geçildi.',
      recognizedWord: ''
    });
  },
  skipWord: (): void => {
    get().nextWord();
  },
  resetFeedback: (): void => {
    set({
      feedbackStatus: 'neutral',
      feedbackMessage: 'Dinlemeye hazırım.',
      recognizedWord: ''
    });
  }
}));
