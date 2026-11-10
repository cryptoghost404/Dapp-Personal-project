async function alchemyRequest(rpcUrl, method, params) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  const data = await response.json();

  // Check if Alchemy returned an error
  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.result;
}

async function getTokenMetadata(rpcUrl, tokenAddress) {
  const metadata = await alchemyRequest(
    rpcUrl,
    "alchemy_getTokenMetadata",
    [tokenAddress]
  );

  return metadata;
}


module.exports={alchemyRequest,getTokenMetadata};



