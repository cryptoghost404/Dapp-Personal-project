export const getAllNFTs = async (req, res) => {
  try {
    const { address, chainId } = req.body;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ message: "Invalid wallet address" });
    }

    if (!Number.isSafeInteger(Number(chainId)) || Number(chainId) <= 0) {
      return res.status(400).json({ message: "Invalid chain ID" });
    }

    if (!process.env.BLOCKSCOUT_API_KEY) {
      return res.status(500).json({ message: "API key is missing" });
    }

    const url =
      `https://api.blockscout.com/${Number(chainId)}` +
      `/api/v2/addresses/${address}/nft`;

    const response = await fetch(
      `${url}?apikey=${process.env.BLOCKSCOUT_API_KEY}`
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Blockscout API request failed",
        detail: data,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve NFTs",
    });
  }
};