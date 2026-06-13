import { useState, useEffect } from "react";

export function useEthPrice(): number | null {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = (await res.json()) as { ethereum: { usd: number } };
        setPrice(data.ethereum.usd);
      } catch {
        // USD equivalent is cosmetic — fail silently
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000);
    return () => clearInterval(interval);
  }, []);

  return price;
}
