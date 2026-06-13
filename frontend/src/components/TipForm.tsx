import { useState, useEffect, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { TIPJAR_ABI } from "../lib/abi";
import { CONTRACT_ADDRESS } from "../lib/constants";
import { useEthPrice } from "../hooks/useEthPrice";

type TxState = "idle" | "pending" | "confirmed" | "error";

interface ErrorDetail {
  type: "rejected" | "underpriced" | "revert" | "network";
  message: string;
}

function classifyError(err: unknown): ErrorDetail {
  const msg = err instanceof Error ? err.message : String(err);
  if (/user rejected|denied|rejected the request/i.test(msg))
    return { type: "rejected", message: "Signature rejected in wallet." };
  if (/underpriced|replacement fee too low/i.test(msg))
    return { type: "underpriced", message: "Gas too low — try again with higher gas." };
  if (/reverted|ZeroValue/i.test(msg))
    return { type: "revert", message: "Transaction reverted. Amount must be > 0." };
  return { type: "network", message: "Network error — please try again." };
}

interface TipFormProps {
  onSuccess: (txHash: string) => void;
}

export function TipForm({ onSuccess }: TipFormProps) {
  const { isConnected } = useAccount();
  const ethPrice = useEthPrice();

  const [amount, setAmount]       = useState("");
  const [message, setMessage]     = useState("");
  const [txState, setTxState]     = useState<TxState>("idle");
  const [txHash, setTxHash]       = useState<`0x${string}` | undefined>();
  const [txError, setTxError]     = useState<ErrorDetail | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const { isSuccess: isConfirmed, isError: isReceiptError } =
    useWaitForTransactionReceipt({ hash: txHash });

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, []);

  useEffect(() => {
    if (isConfirmed && txState === "pending" && txHash) {
      setTxState("confirmed");
      onSuccess(txHash);
    }
  }, [isConfirmed]);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isReceiptError && txState === "pending") {
      setTxState("error");
      setTxError({ type: "revert", message: "Transaction reverted on-chain." });
      triggerShake();
    }
  }, [isReceiptError]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setTxState("pending");
    setTxError(null);
    setTxHash(undefined);

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: TIPJAR_ABI,
        functionName: "tip",
        args: [message],
        value: parseEther(amount),
      });
      setTxHash(hash);
    } catch (err) {
      setTxState("error");
      setTxError(classifyError(err));
      triggerShake();
    }
  }

  function reset() {
    setTxState("idle");
    setTxError(null);
    setAmount("");
    setMessage("");
    setTxHash(undefined);
  }

  const usdValue =
    ethPrice && amount && !isNaN(parseFloat(amount))
      ? (parseFloat(amount) * ethPrice).toFixed(2)
      : null;

  const charCount = message.length;
  const isDisabled = txState === "pending" || txState === "confirmed";

  if (!isConnected) {
    return (
      <div
        id="tip-section"
        className="bg-brand-surface border border-brand-border rounded-2xl p-8 text-center"
      >
        <p className="text-brand-muted text-sm">
          Connect your wallet above to send a tip.
        </p>
      </div>
    );
  }

  return (
    <div
      id="tip-section"
      className={`
        bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-8
        transition-transform duration-100
        ${isShaking ? "animate-shake" : ""}
      `}
    >
      {/* Success banner */}
      {txState === "confirmed" && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-brand-success/8 border border-brand-success/20 animate-slide-up">
          <svg className="w-5 h-5 text-brand-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div className="flex-1">
            <p className="text-brand-success font-medium text-sm">Tip sent!</p>
            <p className="text-brand-muted text-xs mt-0.5">
              It will appear in the feed once confirmed on-chain.
            </p>
          </div>
          <button
            onClick={reset}
            className="text-brand-muted hover:text-brand-text text-xs underline transition-colors flex-shrink-0"
          >
            Send another
          </button>
        </div>
      )}

      {/* Error banner */}
      {txState === "error" && txError && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-brand-error/8 border border-brand-error/20 animate-slide-up">
          <svg className="w-5 h-5 text-brand-error flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
          </svg>
          <p className="flex-1 text-brand-error text-sm">{txError.message}</p>
          <button
            onClick={reset}
            className="text-brand-muted hover:text-brand-text text-xs underline transition-colors flex-shrink-0"
          >
            Try again
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount */}
        <div>
          <label className="block text-brand-muted text-xs font-medium tracking-widest uppercase mb-2">
            Amount
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.001"
              min="0.001"
              placeholder="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isDisabled}
              required
              className="
                w-full bg-brand-bg border border-brand-border rounded-xl
                px-4 pr-16 py-4
                text-2xl font-mono text-brand-text placeholder-brand-muted/50
                focus:outline-none focus:border-brand-primary
                transition-colors disabled:opacity-50
              "
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-brand-muted font-medium pointer-events-none">
              ETH
            </span>
          </div>
          <div className="mt-1.5 h-4">
            {usdValue && (
              <p className="font-mono text-xs text-brand-muted animate-slide-up">
                ≈ ${usdValue} USD
              </p>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-brand-muted text-xs font-medium tracking-widest uppercase mb-2">
            Message
          </label>
          <div className="relative">
            <textarea
              placeholder="Leave a message…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isDisabled}
              maxLength={280}
              rows={3}
              className="
                w-full bg-brand-bg border border-brand-border rounded-xl
                px-4 py-3 pb-8
                text-sm text-brand-text placeholder-brand-muted/50
                focus:outline-none focus:border-brand-primary
                transition-colors resize-none disabled:opacity-50
              "
            />
            <span
              className={`
                absolute bottom-3 right-3 text-xs font-mono pointer-events-none
                ${charCount > 250 ? "text-brand-warning" : "text-brand-muted"}
              `}
            >
              {charCount}/280
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isDisabled || !amount}
          className="
            w-full rounded-xl py-4 font-medium text-sm
            bg-gradient-to-r from-brand-primary to-brand-primary-hover text-white
            transition-all duration-150 ease-out
            hover:shadow-[0_0_24px_rgba(124,106,247,0.35)] active:scale-[0.99]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
            focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-surface
          "
        >
          {txState === "pending" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="text-white/70">Confirming</span>
              <span className="flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="animate-bounce-dot w-1.5 h-1.5 rounded-full bg-white"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
            </span>
          ) : txState === "confirmed" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Tip sent
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Send Tip
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          )}
        </button>

        {/* Tx link */}
        {txState === "pending" && txHash && (
          <p className="text-center text-xs text-brand-muted">
            Tx:{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-brand-primary hover:text-brand-primary-hover underline"
            >
              {txHash.slice(0, 10)}…{txHash.slice(-8)}
            </a>
          </p>
        )}
      </form>
    </div>
  );
}
