import { useEffect, useState } from "react";
import "./css/NFTsCss.css";
import PortfolioHeader from "./PortfolioHeader";
import { UseGetAllNFTs } from "../../hooks/UseGetAllNFTs";

export default function NFTs() {
  const { fetchNFTs, address } = UseGetAllNFTs();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address) {
      setNfts([]);
      return;
    }

    async function loadNFTs() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchNFTs();
        setNfts(data.items || []);
      } catch (err) {
        setError(err.message || "Failed to load NFTs.");
      } finally {
        setLoading(false);
      }
    }

    loadNFTs();
  }, [address, fetchNFTs]);

  return (
    <div>
      <PortfolioHeader />

      <div className="portfolio">
        <h2 className="portfolio-title">NFTs</h2>

        {!address ? (
          <p>Connect your wallet to see your NFTs.</p>
        ) : loading ? (
          <p>Loading NFTs...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="portfolio-table-wrapper">
            <table className="portfolio-table nft-table">
              <thead>
                <tr>
                  <th>NFT</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Contract Address</th>
                </tr>
              </thead>

              <tbody>
                {nfts.map((nft, index) => {
                  const token = nft.token || {};
                  const name =
                    nft.metadata?.name || `NFT #${nft.id}`;
                  const image =
                    nft.image_url || nft.metadata?.image;

                  return (
                    <tr
                      key={`${token.address_hash || "nft"}-${nft.id}-${index}`}
                    >
                      <td>
                        <div className="portfolio-token">
                          {image ? (
                            <img
                              className="portfolio-token-icon nft-icon"
                              src={image}
                              alt={name}
                            />
                          ) : (
                            <div className="portfolio-token-placeholder">
                              ◈
                            </div>
                          )}

                          <div className="portfolio-token-info">
                            <span className="portfolio-token-name">
                              {name}
                            </span>
                            <span className="portfolio-token-symbol">
                              #{nft.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="nft-description">
                        {nft.metadata?.description || "—"}
                      </td>

                      <td>{nft.token_type || token.type || "NFT"}</td>

                      <td>
                        {token.address_hash ? (
                          <a
                            className="nft-address"
                            href={`https://eth-sepolia.blockscout.com/token/${token.address_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {token.address_hash.slice(0, 6)}...
                            {token.address_hash.slice(-4)} ↗
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}

                {nfts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="portfolio-empty">
                      No NFTs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}