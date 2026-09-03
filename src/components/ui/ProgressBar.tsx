export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full">
      <div className="h-1.5 w-full rounded-full bg-rose-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-400 to-plum-600 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
