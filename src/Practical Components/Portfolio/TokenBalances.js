import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { UsegetAllTokenBalances } from "../../hooks/UseGetAllTokenBalances";
import { UseGetnativeBalance } from "../../hooks/UseGetNativeBalance";
import "./css/TokenBalancesCss.css";
import PortfolioHeader from "./PortfolioHeader";

export default function TokenBalances({ limit }) {
  const location = useLocation();

  // Automatically show only 3 tokens on /portfolio
  const tokenLimit =
    limit ?? (location.pathname === "/portfolio" ? 3 : Infinity);

  const { fetchBalances, address } = UsegetAllTokenBalances();
  const { balance: nativeBalance } = UseGetnativeBalance({});

  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address) {
      setTokens([]);
      setError("");
      return;
    }

    async function loadBalances() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchBalances();

        // Your Alchemy backend returns an array of token objects.
        setTokens(Array.isArray(data) ? data : data?.tokens || []);
      } catch (err) {
        setError(err.message || "Error loading token balances.");
      } finally {
        setLoading(false);
      }
    }

    loadBalances();
  }, [address, fetchBalances]);

  const formatBalance = (amount) =>
    Number(amount).toLocaleString(undefined, {
      maximumFractionDigits: 6,
    });

  const rows = [
    {
      name: "Ethereum",
      symbol: "ETH",
      amount: Number(nativeBalance ?? 0),
      icon: null,
      id: "native-eth",
    },
    ...tokens.map((token) => ({
      name: token.name || "Unknown Token",
      symbol: token.symbol || "—",
      amount: Number(token.balance || 0),
      icon: token.icon || null,
      id: token.address,
    })),
  ];

  const displayedRows = rows.slice(0, tokenLimit);

  return (
    <div>
      {location.pathname==="/portfolio"? '': <PortfolioHeader/>}
      
      <div className="portfolio">
        <h2 className="portfolio-title">Token Balances</h2>

        {!address ? (
          <p>Connect your wallet to see token balances.</p>
        ) : loading ? (
          <p className="portfolio-status">Loading balances...</p>
        ) : error ? (
          <p className="portfolio-error">Error loading balances: {error}</p>
        ) : (
          <>
            <div className="portfolio-table-wrapper">
              <table className="portfolio-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Price</th>
                    <th>Balance</th>
                    <th className="value-heading">↓ Value</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedRows.map((token) => (
                    <tr key={token.id}>
                      <td>
                        <div className="portfolio-token">
                          {token.icon ? (
                            <img
                              className="portfolio-token-icon"
                              src={token.icon}
                              alt=""
                            />
                          ) : (
                            <div className="portfolio-token-placeholder">
                              {token.symbol === "ETH" ? "◆" : token.symbol}
                            </div>
                          )}

                          <div className="portfolio-token-info">
                            <span className="portfolio-token-name">
                              {token.name}
                            </span>
                            <span className="portfolio-token-symbol">
                              {token.symbol}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>—</td>

                      <td className="portfolio-balance">
                        {formatBalance(token.amount)} {token.symbol}
                      </td>

                      <td>—</td>
                    </tr>
                  ))}

                  {tokens.length === 0 && (
                    <tr>
                      <td colSpan={4} className="portfolio-empty">
                        No token balances found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}