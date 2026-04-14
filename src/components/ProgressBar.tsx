interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = (props: ProgressBarProps): JSX.Element => {
  const { current, total } = props;
  const safeTotal: number = total === 0 ? 1 : total;
  const percentage: number = Math.round((current / safeTotal) * 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span>İlerleme</span>
        <span>
          {current} / {total}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-500 transition-all duration-300" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};
