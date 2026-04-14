interface WordCardProps {
  word: string;
}

export const WordCard = (props: WordCardProps): JSX.Element => {
  const { word } = props;

  return (
    <div className="animate-fadeSlide rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Hedef Kelime</p>
      <h1 className="mt-3 text-5xl font-bold text-slate-900 sm:text-6xl">{word}</h1>
    </div>
  );
};
