import { useCallback } from "react";
import { useAccount, useChainId } from "wagmi";

export function UseGetTransactionDetails() {
  const { address } = useAccount();
  const chainId = useChainId();

  const fetchDetails = useCallback(async (transactions = []) => {
    if (!address) {
      throw new Error("Connect your wallet first");
    }

    // Extract unique transaction hashes
    const hashes = [
      ...new Set(transactions.map(tx => tx.hash))
    ];

    if (hashes.length === 0) return [];

    const response = await fetch("/api/tx-history-details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chainId,
        address,
        hashes,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error fetching transaction details");
    }

    return data.details || [];

  }, [address, chainId]);

  return { fetchDetails };
}