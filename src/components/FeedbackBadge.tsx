import type { FeedbackStatus } from '../store/sessionStore';

interface FeedbackBadgeProps {
  status: FeedbackStatus;
  message: string;
  recognizedWord: string;
}

const feedbackClassMap: Record<FeedbackStatus, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  correct: 'animate-pulseSuccess border-emerald-200 bg-emerald-50 text-emerald-700',
  incorrect: 'border-rose-200 bg-rose-50 text-rose-700'
};

export const FeedbackBadge = (props: FeedbackBadgeProps): JSX.Element => {
  const { status, message, recognizedWord } = props;

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${feedbackClassMap[status]}`}>
      <p>{message}</p>
      {recognizedWord.length > 0 ? (
        <p className="mt-1 text-xs font-medium opacity-80">Algılanan: {recognizedWord}</p>
      ) : null}
    </div>
  );
};
