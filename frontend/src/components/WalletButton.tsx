import { ConnectButton } from "@rainbow-me/rainbowkit";

interface WalletButtonProps {
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-4 text-base",
};

export function WalletButton({ size = "md" }: WalletButtonProps) {
  const sz = sizes[size];

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) {
          return (
            <div
              aria-hidden
              className={`opacity-0 pointer-events-none rounded-full ${sz}`}
            />
          );
        }

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className={`
                rounded-full font-medium
                bg-gradient-to-r from-brand-primary to-brand-primary-hover text-white
                ${sz}
                transition-all duration-150 ease-out
                hover:shadow-[0_0_24px_rgba(124,106,247,0.4)] hover:scale-[1.02]
                active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-bg
              `}
            >
              Connect Wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className={`
                rounded-full font-medium
                bg-brand-error/10 border border-brand-error/30 text-brand-error
                ${sz}
                transition-all duration-150 ease-out
                hover:bg-brand-error/20
                focus:outline-none focus:ring-2 focus:ring-brand-error focus:ring-offset-2 focus:ring-offset-brand-bg
              `}
            >
              Wrong Network
            </button>
          );
        }

        return (
          <button
            onClick={openAccountModal}
            className={`
              inline-flex items-center gap-2 rounded-full font-medium
              bg-brand-surface border border-brand-border text-brand-text
              ${sz}
              transition-all duration-150 ease-out
              hover:border-brand-primary/40
              focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-bg
            `}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-success flex-shrink-0" />
            <span className="font-mono">{account.displayName}</span>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
