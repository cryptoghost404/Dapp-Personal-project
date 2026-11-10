const { alchemyEndpoints } = require("../Endpoints/alchemyEndPoints");
const { toEventSelector } = require("viem");
const {alchemyRequest,getTokenMetadata}=require("../config/Alchemy/AlchemyHelper");

// Event signatures emitted by token contracts
const TRANSFER = toEventSelector("Transfer(address,address,uint256)");
const APPROVAL = toEventSelector("Approval(address,address,uint256)");
const APPROVAL_FOR_ALL = toEventSelector("ApprovalForAll(address,address,bool)");





// 2. Extract an Ethereum address from an event topic
function getAddress(topic) {
  return "0x" + topic.slice(-40);
}


// 3. Main controller



async function getTransactionsDetails(req, res) {
  try {
    // Get information sent by the frontend
    const { chainId, address, hashes } = req.body;

    // Select the Alchemy URL for the connected network
    const rpcUrl = alchemyEndpoints[chainId];

    if (!rpcUrl) {
      return res.status(400).json({ error: "Unsupported network" });
    }

    // Validate wallet address
    if (!/^0x[a-fA-F0-9]{40}$/.test(address || "")) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    // Validate transaction hashes
    if (
      !Array.isArray(hashes) ||
      hashes.length === 0 ||
      hashes.length > 50 ||
      hashes.some(hash => !/^0x[a-fA-F0-9]{64}$/.test(hash))
    ) {
      return res.status(400).json({ error: "Invalid transaction hashes" });
    }

    // Convert wallet address to lowercase for comparisons
    const wallet = address.toLowerCase();





    // Remove duplicate hashes and fetch their details

    const details = await Promise.all(
      [...new Set(hashes)].map(async (hash) => {
        try {

          // Get transaction information and receipt from Alchemy
          const [tx, receipt] = await Promise.all([
            alchemyRequest(rpcUrl, "eth_getTransactionByHash", [hash]),
            alchemyRequest(rpcUrl, "eth_getTransactionReceipt", [hash]),
          ]);




          if (!tx) {
            return { hash, found: false };
          }

          // Store all activities found in this transaction
          const activities = [];

          // Get the function selector from the transaction input
          const selector = tx.input.slice(0, 10).toLowerCase();


          // 4. Check for native ETH transfers
          if (BigInt(tx.value) > 0n) {

            let direction = "other";

            if (tx.from.toLowerCase() === wallet) {
              direction = tx.to?.toLowerCase() === wallet ? "self" : "sent";
            } else if (tx.to?.toLowerCase() === wallet) {
              direction = "received";
            }

            if (direction !== "other") {
              activities.push({
                activity: "native_transfer",
                direction,
                amount: tx.value,
              });
            }
          }


          // 5. Check events emitted by the transaction
          // Failed transactions must not be classified using their logs
          if (receipt?.status === "0x1") {

            for (const log of receipt.logs) {

              // Get the event signature and contract address
              const event = log.topics[0]?.toLowerCase();
              const tokenAddress = log.address;


              // 6. Detect token transfers
              if (event === TRANSFER.toLowerCase() && log.topics.length >= 3) {

                const from = getAddress(log.topics[1]);
                const to = getAddress(log.topics[2]);

                // Check whether the wallet sent or received the tokens
                const direction =
                  from.toLowerCase() === wallet ? "sent" :
                  to.toLowerCase() === wallet ? "received" :
                  "other";

                if (direction !== "other") {
                  const metadata = await getTokenMetadata(rpcUrl, tokenAddress);
                  
                  activities.push({
                    activity: "token_transfer",
                    direction,
                    tokenAddress,
                        tokenName: metadata.name,
                        tokenSymbol: metadata.symbol,
                        tokenLogo: metadata.logo,
                        tokenDecimals: metadata.decimals,
                    from,
                    to,
                    amount: log.data,
                  });
                }
              }


              // 7. Detect individual token/NFT approvals
              if (event === APPROVAL.toLowerCase() && log.topics.length >= 3) {

                const owner = getAddress(log.topics[1]);

                if (owner.toLowerCase() === wallet) {
                  activities.push({
                    activity: "approval",
                    tokenAddress,
                    owner,
                    spender: getAddress(log.topics[2]),
                    amount: log.data,
                  });
                }
              }




              // 8. Detect approval for all NFTs
              if (event === APPROVAL_FOR_ALL.toLowerCase() && log.topics.length >= 3) {

                const owner = getAddress(log.topics[1]);

                if (owner.toLowerCase() === wallet) {
                  activities.push({
                    activity: "approval",
                    approvalType: "all_nfts",
                    tokenAddress,
                    owner,
                    operator: getAddress(log.topics[2]),
                    approved: BigInt(log.data) === 1n,
                  });
                }
              }
            }
          }




          // 9. If no known activity was found, classify the transaction
          if (activities.length === 0) {

            if (
              selector === "0x095ea7b3" ||
              selector === "0xa22cb465"
            ) {
              activities.push({
                activity: "approval_attempt",
              });
            } else {
              activities.push({
                activity: "contract_interaction",
              });
            }
          }


          // 10. Return the classified transaction
          return {
            hash,
            found: true,

            status:
              receipt?.status === "0x1" ? "success" :
              receipt?.status === "0x0" ? "failed" :
              "pending",

            from: tx.from,
            to: tx.to,
            activities,
          };

        } catch (error) {

          // Handle errors for individual transactions
          return {
            hash,
            found: false,
            error: error.message,
          };
        }
      })
    );

    // Send all classified transactions to the frontend
    return res.json({ details });

  } catch (error) {

    console.error("Transaction details error:", error.message);

    return res.status(500).json({
      error: "Failed to retrieve transaction details",
    });
  }
}

module.exports = { getTransactionsDetails };