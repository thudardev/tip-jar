import { Tip } from "../hooks/useTips";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function truncate(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

interface TipCardProps {
  tip: Tip;
  isNew?: boolean;
}

export function TipCard({ tip, isNew = false }: TipCardProps) {
  return (
    <div
      className={`
        bg-brand-surface border border-brand-border rounded-xl p-4
        hover:border-brand-primary/25 hover:-translate-y-0.5
        transition-all duration-150 ease-out
        ${isNew ? "animate-tip-drop" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: avatar + address + time */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
            <span className="font-mono text-xs font-medium text-brand-primary">
              {tip.from.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <span className="font-mono text-sm text-brand-text">{truncate(tip.from)}</span>
            <span className="text-brand-muted text-xs ml-2">{timeAgo(tip.timestamp)}</span>
          </div>
        </div>

        {/* Right: amount */}
        <span className="flex-shrink-0 font-mono text-sm font-medium text-brand-primary">
          {parseFloat(tip.amount).toFixed(4)} ETH
        </span>
      </div>

      {/* Message */}
      {tip.message && (
        <p className="mt-3 pl-12 text-brand-muted text-sm italic leading-relaxed">
          "{tip.message}"
        </p>
      )}
    </div>
  );
}
