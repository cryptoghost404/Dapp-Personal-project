import { useCallback } from "react";
import { useAccount, useChainId } from "wagmi";

export function UseGetTransactionHistory() {
  const { address } = useAccount();
  const chainId = useChainId();

  const fetchHistory = useCallback(async () => {
    if (!address) {
      throw new Error("Connect your wallet first");
    }

    const response = await fetch("/api/tx-history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chainId,
        address,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || data.message || data.error || "Error fetching history"
      );
    }

    return data;
  }, [address, chainId]);

  return { fetchHistory, address, chainId };
}