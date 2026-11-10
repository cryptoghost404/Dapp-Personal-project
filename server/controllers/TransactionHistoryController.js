const { chainNames } = require("../config/TatumChainNames");

async function getTransactions(req, res) {
  try {
    const { chainId, address } = req.body;

    if (!chainId) {
      return res.status(400).json({ error: "Missing chain ID" });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address || "")) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }
    const chainNameTatum=chainNames[chainId]
    if (!chainNameTatum) {
  return res.status(400).json({ error: "Unsupported network" });
}
if (!process.env.TATUM_TESTNET_API_KEY) {
  return res.status(500).json({ error: "Tatum API key is missing" });
}
    const url = new URL("https://api.tatum.io/v4/data/transaction/history");

    url.searchParams.set("chain", String(chainNameTatum));
    url.searchParams.set("addresses", String(address));

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "x-api-key":process.env.TATUM_TESTNET_API_KEY
      },
    });

    const data = await response.json();

    if (!response.ok || !Array.isArray(data.result)) {
  return res.status(response.status || 502).json({
    error: data.message || "Tatum request failed",
  });
}

    return res.json(data);
  } catch (error) {
    console.error("Transaction history error:", error.message);

    return res.status(500).json({
      error: "Failed to retrieve transaction history",
    });
  }
}

module.exports = { getTransactions };