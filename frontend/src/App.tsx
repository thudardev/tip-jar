import { useState, useCallback } from "react";
import { WalletButton } from "./components/WalletButton";
import { Hero } from "./components/Hero";
import { TipForm } from "./components/TipForm";
import { TipList } from "./components/TipList";
import { Toast } from "./components/Toast";
import { useTips } from "./hooks/useTips";

export default function App() {
  const { tips, loading, error, refetch } = useTips();
  const [newTxHash, setNewTxHash]         = useState<string | null>(null);
  const [toast, setToast]                 = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleTipSuccess = useCallback(
    (txHash: string) => {
      refetch();
      setNewTxHash(txHash);
      setToast({
        message: "Tip sent! It'll appear below once confirmed on-chain.",
        type: "success",
      });
      // Keep newTxHash alive long enough to catch the animation after N confirmations
      setTimeout(() => setNewTxHash(null), 120_000);
    },
    [refetch]
  );

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      {/* Sticky header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-brand-bg/80 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold tracking-tight text-brand-text">TipJar</span>
          <WalletButton size="sm" />
        </div>
      </header>

      {/* Hero — full viewport height */}
      <Hero />

      {/* Main content */}
      <main className="max-w-xl mx-auto px-4 pt-6 pb-24 space-y-8">
        <TipForm onSuccess={handleTipSuccess} />
        <TipList tips={tips} loading={loading} error={error} newTxHash={newTxHash} />
      </main>

      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />
      )}
    </div>
  );
}
