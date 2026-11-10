import { alchemyEndpoints } from "../Endpoints/alchemyEndPoints.js";
import { formatUnits } from "viem";
import{alchemyRequest} from "../config/Alchemy/AlchemyHelper.js";

export const getTokenBalances = async (req, res) => {
  try {
    const { address, chainId } = req.body;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ message: "Invalid wallet address" });
    }

    const endpoint = alchemyEndpoints[Number(chainId)];

    if (!endpoint) {
      return res.status(400).json({ message: "Unsupported chain ID" });
    }

    // Reusable requests thing:
    

    // Retrieve wallet token balances
    const balanceResult = await alchemyRequest(endpoint,
      "alchemy_getTokenBalances",
      [address, "erc20"]
    );

    // Remove zero-balance tokens
    const nonZeroTokens = balanceResult.tokenBalances.filter(
      (token) => BigInt(token.tokenBalance) > 0n
    );

    // Retrieve metadata and format balances
    const tokens = await Promise.all(
      nonZeroTokens.map(async (token) => {
        const metadata = await alchemyRequest(endpoint,
          "alchemy_getTokenMetadata",
          [token.contractAddress]
        );

        const decimals = Number(metadata.decimals ?? 18);
        const rawBalance = BigInt(token.tokenBalance);

        return {
          address: token.contractAddress,
          name: metadata.name || "Unknown Token",
          symbol: metadata.symbol || "—",
          decimals,
          balance: formatUnits(rawBalance, decimals),
          icon: metadata.logo || null,
        };
      })
    );

    return res.status(200).json({
      address,
      tokens,
    });

  } catch (error) {
    console.error("Token balance error:", error);

    return res.status(500).json({
      message: "Failed to retrieve token balances",
    });
  }
};