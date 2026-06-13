import { Tip } from "../hooks/useTips";
import { TipCard } from "./TipCard";

interface TipListProps {
  tips: Tip[];
  loading: boolean;
  error: string | null;
  newTxHash: string | null;
}

export function TipList({ tips, loading, error, newTxHash }: TipListProps) {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-brand-text font-semibold text-lg">Recent Tips</h2>
          <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse-dot" />
        </div>
        <span className="text-brand-muted text-xs tracking-wide">live · 10s refresh</span>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-brand-surface border border-brand-border rounded-xl p-4 h-16 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-brand-surface border border-brand-error/20 rounded-xl px-5 py-8 text-center">
          <p className="text-brand-error text-sm">Could not load tips</p>
          <p className="text-brand-muted text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && tips.length === 0 && (
        <div className="bg-brand-surface border border-brand-border rounded-xl px-5 py-14 text-center">
          <p className="text-brand-muted text-sm">No tips yet. Be the first.</p>
        </div>
      )}

      {/* List */}
      {tips.length > 0 && (
        <div className="space-y-3">
          {tips.map((tip) => (
            <TipCard
              key={tip.txHash}
              tip={tip}
              isNew={tip.txHash === newTxHash}
            />
          ))}
        </div>
      )}
    </section>
  );
}
