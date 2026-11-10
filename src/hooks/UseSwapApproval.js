import { parseUnits } from "viem";
import { useSendTransaction } from "wagmi";
import { hexToBigInt } from "viem";

export async function CheckApproval(
  tokenIn,
  amountIn,
  decimals,
  address,
  chainId
) {
  const response = await fetch("/api/check-approval", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      walletAddress: address,
      token: tokenIn,
      amount: parseUnits(amountIn, decimals).toString(),
      chainId: chainId ,
      includeGasInfo: true,
    }),
  });

  
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || data.error ||
      "Failed to check approval"
    );
  }

  console.log("Approval check response:", data);

  return data;
}
