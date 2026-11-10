async function checkApproval(req, res) {
  try {
    const response = await fetch(
      "https://trade-api.gateway.uniswap.org/v1/check_approval",
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
    console.error("Check approval error:", error);
    return res.status(500).json({
      error: "Failed to check token approval",
    });
  }
}

module.exports = { checkApproval };