interface ScoreCardProps {
  totalAttempts: number;
  correctAttempts: number;
}

export const ScoreCard = (props: ScoreCardProps): JSX.Element => {
  const { totalAttempts, correctAttempts } = props;
  const accuracyRate: number = totalAttempts === 0 ? 0 : Math.round((correctAttempts / totalAttempts) * 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Doğruluk Skoru</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">%{accuracyRate}</p>
      <p className="mt-1 text-xs text-slate-500">
        {correctAttempts} doğru / {totalAttempts} deneme
      </p>
    </div>
  );
};
