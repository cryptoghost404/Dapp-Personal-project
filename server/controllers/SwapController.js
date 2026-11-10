async function getSwapData(req, res) {
  try {
    const response = await fetch(
      "https://trade-api.gateway.uniswap.org/v1/swap",
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.UNISWAP_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-permit2-disabled": "true",
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Swap error:", error);
    return res.status(500).json({
      error: "Failed to fetch Uniswap swap data",
    });
  }
};



async function getQuote(req, res) {
  try {
    const response = await fetch(
      "https://trade-api.gateway.uniswap.org/v1/quote",
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.UNISWAP_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-permit2-disabled": "true",
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Quote error:", error);
    return res.status(500).json({
      error: "Failed to fetch Uniswap quote",
    });
  }
}

module.exports = { getSwapData,getQuote };