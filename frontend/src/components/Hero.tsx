import { useAccount } from "wagmi";
import { WalletButton } from "./WalletButton";

export function Hero() {
  const { isConnected } = useAccount();

  function scrollToForm() {
    document.getElementById("tip-section")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand-primary opacity-[0.05] blur-[140px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(124,106,247,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124,106,247,1) 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Network badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border text-brand-muted text-xs font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse-dot" />
          Live on Sepolia
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-5">
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-text to-brand-primary">
            Send a tip.
          </span>
          <br />
          <span className="text-brand-text">Leave a mark.</span>
        </h1>

        {/* Subheading */}
        <p className="text-brand-muted text-lg max-w-sm mx-auto mb-10 leading-relaxed">
          Tip anyone on Ethereum.{" "}
          <span className="text-brand-text/60">Instant, permissionless, permanent.</span>
        </p>

        {/* CTA */}
        {isConnected ? (
          <button
            onClick={scrollToForm}
            className="
              inline-flex items-center gap-2.5 rounded-full font-medium
              bg-gradient-to-r from-brand-primary to-brand-primary-hover text-white
              px-8 py-4 text-base
              transition-all duration-150 ease-out
              hover:shadow-[0_0_28px_rgba(124,106,247,0.4)] hover:scale-[1.02]
              active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-bg
            "
          >
            Send a Tip
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ) : (
          <WalletButton size="lg" />
        )}
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-brand-muted text-xs">
        <span className="tracking-wider uppercase">scroll</span>
        <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
