
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useAccount, useChainId } from "wagmi";
import { UseGetTransactionHistory } from "../../hooks/UseGetTransactionHistory";
import { explorers } from "../../config/explorers";
import "./css/TransactionHistoryCss.css";
import PortfolioHeader from "./PortfolioHeader";
import { UseMergeTransactionDetails } from "../../hooks/UseMergeTransactionDetails";
import { UseGetTransactionDetails } from "../../hooks/UseGetTransactionsDetails";
import { formatUnits } from "viem";

export function TransactionHistory({ limit }) {
  const chainId = useChainId();
  const explorer = explorers[chainId];
  const location = useLocation();

  const { address } = useAccount();
  const { fetchHistory } = UseGetTransactionHistory();
  const { fetchDetails } = UseGetTransactionDetails();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address) {
      setTransactions([]);
      setError("");
      return;
    }

    async function loadHistory() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchHistory();

        const history = Array.isArray(data)
          ? data
          : Array.isArray(data?.result)
          ? data.result
          : [];

        // Keep only one transaction per hash
        const uniqueHistory = [
          ...new Map(
            history.map(tx => [tx.hash.toLowerCase(), tx])
          ).values()
        ];

        setTransactions(uniqueHistory);

        // Fetch Alchemy details for unique transactions only
        const details = await fetchDetails(uniqueHistory);

        // Merge Alchemy details with Tatum history
        const mergedTransactions = UseMergeTransactionDetails(
          uniqueHistory,
          details
        );

        setTransactions(mergedTransactions);

      } catch (err) {
        setError(err.message || "Error loading transaction history.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [address, fetchHistory, fetchDetails]);

  const displayedTransactions =
    limit !== undefined
      ? transactions.slice(0, limit)
      : transactions;


  // Format blockchain amounts
  const formatAmount = (amount, decimals) => {
    if (!amount) return "0";

    try {
      return Number(
        formatUnits(BigInt(amount), decimals)
      ).toLocaleString(undefined, {
        maximumFractionDigits: 6,
      });
    } catch {
      return amount;
    }
  };






  // Get activities from Alchemy or fall back to Tatum
  const getActivities = (tx) => {
    const activities = tx.alchemyDetails?.activities || [];

    // Remove duplicate native transfer pseudo-token
    const filteredActivities = activities.filter(
      activity =>
        activity.tokenAddress?.toLowerCase() !==
        "0xfffffffffffffffffffffffffffffffffffffffe"
    );

    // Use Tatum if Alchemy has no activities
    const sourceActivities = filteredActivities.length > 0
      ? filteredActivities
      : [{
          activity: tx.transactionType === "native"
            ? "native_transfer"
            : "token_transfer",
          direction: tx.transactionSubtype === "incoming"
            ? "received"
            : tx.transactionSubtype === "outgoing"
            ? "sent"
            : "other",
          amount: tx.amount,
          tokenAddress: tx.tokenAddress,
          isTatum: true,
        }];

    // Prepare the information needed by the UI
    return sourceActivities.map(activity => {
      const isNative = activity.activity === "native_transfer";
      const isApproval = activity.activity === "approval";
      const isContract = activity.activity === "contract_interaction";

      // Correct addresses
const from = isApproval
  ? activity.owner
  : activity.from ||
    (isNative ? tx.alchemyDetails?.from : null) ||
    (activity.isTatum
      ? activity.direction === "received"
        ? tx.counterAddress
        : tx.address
      : null) ||
    "Unknown";

const to = isApproval
  ? activity.spender
  : activity.to ||
    (isNative ? tx.alchemyDetails?.to : null) ||
    (activity.isTatum
      ? activity.direction === "received"
        ? tx.address
        : tx.counterAddress
      : null) ||
    "Unknown";



    
      // Prepare display name and symbol
      const displayName = isNative
        ? "Native currency"
        : isApproval
        ? "Token approval"
        : activity.tokenName || activity.tokenSymbol || "Unknown token";

      const displaySymbol = isNative
        ? "ETH"
        : activity.tokenSymbol ||
          (activity.tokenAddress
            ? `${activity.tokenAddress.slice(0, 6)}...${activity.tokenAddress.slice(-4)}`
            : "Unknown asset");

      // Prepare amount
      let displayAmount = "Amount unavailable";

      if (isApproval) {
        // Maximum uint256 allowance means unlimited approval
        displayAmount =
          activity.amount?.toLowerCase() ===
          "0x" + "f".repeat(64)
            ? "Unlimited"
            : activity.amount || "Amount unavailable";
      } else if (activity.isTatum) {
        // Tatum already provides human-readable amounts
        displayAmount = activity.amount;
      } else if (isNative) {
        displayAmount = formatAmount(activity.amount, 18);
      } else if (activity.tokenDecimals !== undefined) {
        displayAmount = formatAmount(
          activity.amount,
          activity.tokenDecimals
        );
      }

      return {
        ...activity,
        from,
        to,
        displayName,
        displaySymbol,
        displayAmount,
        isNative,
        isApproval,
        isContract,
      };
    });
  };




  
  // Get transaction date
  const getDate = (timestamp) => {
    return timestamp
      ? new Date(Number(timestamp)).toLocaleString()
      : "Date unavailable";
  };


























//jsx rendering part

  return (
    <div>
      {location.pathname === "/portfolio" ? "" : <PortfolioHeader />}

      <div className="transaction-history">

        <h2>Transaction History</h2>

        {!address ? (
          <p className="transaction-status">
            Connect your wallet to view transaction history.
          </p>

        ) : loading ? (
          <p className="transaction-status">
            Loading transactions...
          </p>

        ) : error ? (
          <p className="transaction-error">
            Error loading transaction history: {error}
          </p>

        ) : transactions.length === 0 ? (
          <p className="transaction-status">
            No transaction history found.
          </p>

        ) : (

          displayedTransactions.map(tx => {
            const activities = getActivities(tx);
            const status = tx.alchemyDetails?.status;

            return (
              <div className="transaction" key={tx.hash}>

                <div className="transaction-left">

                  {activities.map((activity, activityIndex) => {

                    const isSent = activity.direction === "sent";
                    const isReceived = activity.direction === "received";

                    return (
                      <div className="activity-item" key={activityIndex}>

                        {/* Activity heading */}
                        <div className="activity-heading">

                          <span className={
                            isSent
                              ? "direction sent"
                              : isReceived
                              ? "direction received"
                              : "direction other"
                          }>
                            {activity.isApproval
                              ? "Approval"
                              : activity.isContract
                              ? "Contract Interaction"
                              : isSent
                              ? "↑ Sent"
                              : isReceived
                              ? "↓ Received"
                              : "Transaction"}
                          </span>

                          {status && activityIndex === 0 && (
                            <span className={`status ${status}`}>
                              {status}
                            </span>
                          )}

                        </div>

                        {/* Transfer information */}
                        {!activity.isApproval && !activity.isContract && (
                          <>
                            <div className="token-information">

                              {activity.tokenLogo && (
                                <img
                                  src={activity.tokenLogo}
                                  alt={activity.displaySymbol}
                                  className="token-logo"
                                />
                              )}

                              <div>
                                <p className="token-name">
                                  {activity.displayName}
                                </p>

                                <span className="token-symbol">
                                  {activity.displaySymbol}
                                </span>
                              </div>

                            </div>

                            <div className="activity-addresses">
                              <p>
                                <span>From:</span> {activity.from}
                              </p>

                              <p>
                                <span>To:</span> {activity.to}
                              </p>
                            </div>

                            <div className="activity-amount">
                              <span className="amount">
                                {activity.displayAmount}
                              </span>

                              <span className="amount-symbol">
                                {activity.displaySymbol === "Unknown asset"
                                  ? ""
                                  : activity.displaySymbol}
                              </span>
                            </div>
                          </>
                        )}

                        {/* Approval information */}
                        {activity.isApproval && (
                          <div className="activity-addresses">
                            <p>
                              <span>Token:</span> {activity.tokenAddress}
                            </p>

                            <p>
                              <span>Owner:</span> {activity.from}
                            </p>

                            <p>
                              <span>Spender:</span> {activity.to}
                            </p>

                            <p>
                              <span>Allowance:</span> {activity.displayAmount}
                            </p>
                          </div>
                        )}

                        {/* Contract interaction information */}
                        {activity.isContract && (
                          <div className="activity-addresses">
                            <p>
                              <span>From:</span> {tx.alchemyDetails?.from || "Unknown"}
                            </p>

                            <p>
                              <span>Contract:</span> {tx.alchemyDetails?.to || "Unknown"}
                            </p>
                          </div>
                        )}

                      </div>
                    );
                  })}

                  {/* Transaction date and explorer link */}
                  <div className="transaction-footer">

                    <div className="transaction-date">
                      <span>◷</span>
                      {getDate(tx.timestamp)}
                    </div>

                    {tx.hash && explorer && (
                      <a
                        href={`${explorer}${tx.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="view-transaction"
                      >
                        View transaction ↗
                      </a>
                    )}

                  </div>

                </div>
              </div>
            );
          })

        )}

      </div>
    </div>
  );
}
