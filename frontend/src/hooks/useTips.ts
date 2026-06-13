import { useEffect, useState } from "react";
import { API_URL } from "../lib/constants";

export interface Tip {
  from: string;
  amount: string;
  message: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
}

export function useTips() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchTips() {
    try {
      const res = await fetch(`${API_URL}/tips`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Tip[] = await res.json();
      setTips(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tips");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTips();
    const interval = setInterval(fetchTips, 10_000);
    return () => clearInterval(interval);
  }, []);

  return { tips, loading, error, refetch: fetchTips };
}
