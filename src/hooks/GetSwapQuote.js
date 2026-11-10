
import { parseUnits } from "viem";


export async function GetSwapQuote(tokenIn,tokenOut,amountIn,decimals,address,chainId) {
  const response = await fetch("/api/quote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      tokenInChainId: chainId,
      tokenOutChainId: chainId,
      amount: parseUnits(amountIn,decimals).toString(),
      type: "EXACT_INPUT",
      swapper: address,
      slippageTolerance: 0.5,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || data.error || "Quote failed"
    );
  }

  return data;
}