import { useMemo, useRef, useState } from 'react';
import { normalizeText } from '../utils/text';
import type {
  SpeechRecognitionConstructor,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
  SpeechRecognitionInstance
} from '../types/speech';

export interface SpeechState {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  supportMessage: string | null;
}

export interface UseSpeechRecognitionResult extends SpeechState {
  startListening: () => Promise<void>;
  stopListening: () => void;
  clearTranscript: () => void;
}

const getRecognitionConstructor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (typeof window.SpeechRecognition !== 'undefined') {
    return window.SpeechRecognition;
  }

  if (typeof window.webkitSpeechRecognition !== 'undefined') {
    return window.webkitSpeechRecognition;
  }

  return null;
};

const getSupportMessage = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (getRecognitionConstructor() === null) {
    const userAgent: string = navigator.userAgent;

    if (userAgent.includes('Firefox')) {
      return 'Firefox konuşma tanımayı desteklemiyor. Lütfen Chrome, Edge veya Safari kullanın.';
    }

    return 'Tarayıcınız konuşma tanıma özelliğini desteklemiyor.';
  }

  return null;
};

export const useSpeechRecognition = (language: string): UseSpeechRecognitionResult => {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [supportMessage] = useState<string | null>(getSupportMessage());

  const isSupported: boolean = useMemo((): boolean => {
    return supportMessage === null;
  }, [supportMessage]);

  const stopListening = (): void => {
    const recognition: SpeechRecognitionInstance | null = recognitionRef.current;

    if (recognition !== null) {
      recognition.abort();
      recognitionRef.current = null;
    }

    setIsListening(false);
  };

  const startListening = async (): Promise<void> => {
    if (!isSupported) {
      setError(supportMessage ?? 'Tarayıcı desteklenmiyor.');
      return;
    }

    if (isListening) {
      return;
    }

    const RecognitionClass: SpeechRecognitionConstructor | null = getRecognitionConstructor();

    if (RecognitionClass === null) {
      setError('Konuşma tanıma başlatılamadı.');
      return;
    }

    const recognition: SpeechRecognitionInstance = new RecognitionClass();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent): void => {
      const result = event.results[event.resultIndex];

      if (result === undefined) {
        return;
      }

      const alternative = result[0];

      if (alternative === undefined) {
        return;
      }

      const normalizedText: string = normalizeText(alternative.transcript);
      setTranscript(normalizedText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent): void => {
      setIsListening(false);
      recognitionRef.current = null;

      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          setError(
            'Mikrofon izni reddedildi. Tarayıcı ayarlarından mikrofona izin verin. ' +
              'Brave kullanıyorsanız adres çubuğundaki Shields simgesini kontrol edin.'
          );
          break;
        case 'network':
          setError('Konuşma tanıma için internet bağlantısı gerekiyor.');
          break;
        case 'no-speech':
          setError('Ses algılanamadı. Mikrofona yaklaşıp tekrar deneyin.');
          break;
        case 'audio-capture':
          setError('Mikrofona erişilemiyor. Cihaza bağlı olduğundan emin olun.');
          break;
        case 'aborted':
          // Kullanıcı iptal etti, hata gösterme
          break;
        default:
          setError(`Konuşma tanıma hatası: ${event.error}`);
      }
    };

    recognition.onend = (): void => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      setTranscript('');
      setError(null);
      setIsListening(true);
    } catch {
      setIsListening(false);
      recognitionRef.current = null;
      setError('Konuşma tanıma başlatılamadı.');
    }
  };

  const clearTranscript = (): void => {
    setTranscript('');
  };

  return {
    isSupported,
    isListening,
    transcript,
    error,
    supportMessage,
    startListening,
    stopListening,
    clearTranscript
  };
};
