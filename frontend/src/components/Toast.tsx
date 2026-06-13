import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}

export function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isSuccess = type === "success";

  return (
    <div
      role="alert"
      className={`
        fixed bottom-6 right-6 z-50 max-w-sm w-full sm:w-auto
        flex items-start gap-3 p-4 rounded-xl border shadow-2xl
        animate-slide-up
        ${isSuccess
          ? "bg-brand-surface border-brand-success/25"
          : "bg-brand-surface border-brand-error/25"
        }
      `}
    >
      {isSuccess ? (
        <svg className="w-5 h-5 text-brand-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-brand-error flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
        </svg>
      )}
      <p className="text-brand-text text-sm leading-relaxed">{message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="ml-auto flex-shrink-0 text-brand-muted hover:text-brand-text transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
