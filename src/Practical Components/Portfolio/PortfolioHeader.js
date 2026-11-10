import { Link, useLocation } from "react-router";
import { useAccount } from "wagmi";
import "./css/PortfolioHeaderCss.css";

export default function PortfolioHeader() {
  const { address } = useAccount();
  const location = useLocation();

  const tabs = [
    { name: "Overview", path: "/portfolio" },
    { name: "Tokens", path: "/portfolio/tokens" },
    { name: "NFTs", path: "/portfolio/nfts" },
    { name: "Activity", path: "/portfolio/activity" },
  ];

  return (
    <div className="portfolio-header">
      <div className="portfolio-wallet">
        <div className="portfolio-wallet-icon">✦</div>

        <div>
          <h3>
            {address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : "Wallet not connected"}
          </h3>
          <p>Wallet portfolio</p>
        </div>
      </div>

      <div className="portfolio-tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`portfolio-tab ${
              location.pathname === tab.path ? "active" : ""
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </div>
    </div>
  );
}