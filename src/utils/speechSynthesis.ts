export const speakWord = (word: string): void => {
  if (!('speechSynthesis' in window)) {
    return;
  }

  const utterance: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};
