import { Link, useLocation } from "react-router";
import ConnectWallet from "../components/ConnectWallet";
import "./divscss/NavbarCss.css";

export default function NavBar() {
  const location = useLocation();

  const portfolioPaths = [
    "/portfolio",
    "/portfolio/tokens",
    "/portfolio/nfts",
    "/portfolio/activity",
  ];

  const isPortfolioActive = portfolioPaths.includes(location.pathname);

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <div className="navbar-logo">Dappify</div>

        <Link
          to="/"
          className={`navbar-link ${
            location.pathname === "/" ? "active" : ""
          }`}
        >
          Swap
        </Link>

        <Link
          to="/transfer"
          className={`navbar-link ${
            location.pathname === "/transfer" ? "active" : ""
          }`}
        >
          Transfer
        </Link>

        <div
          className={`navbar-dropdown ${
            isPortfolioActive ? "active" : ""
          }`}
        >
          <Link
            to="/portfolio"
            className={`navbar-link navbar-dropdown-trigger ${
              isPortfolioActive ? "active" : ""
            }`}
          >
            Portfolio <span className="dropdown-arrow">▾</span>
          </Link>

          <div className="navbar-dropdown-menu">
            <Link
              to="/portfolio"
              className={`navbar-dropdown-item ${
                location.pathname === "/portfolio" ? "active" : ""
              }`}
            >
              Overview
            </Link>

            <Link
              to="/portfolio/tokens"
              className={`navbar-dropdown-item ${
                location.pathname === "/portfolio/tokens" ? "active" : ""
              }`}
            >
              Tokens
            </Link>

            <Link
              to="/portfolio/nfts"
              className={`navbar-dropdown-item ${
                location.pathname === "/portfolio/nfts" ? "active" : ""
              }`}
            >
              NFTs
            </Link>

            <Link
              to="/portfolio/activity"
              className={`navbar-dropdown-item ${
                location.pathname === "/portfolio/activity" ? "active" : ""
              }`}
            >
              Activity
            </Link>
          </div>
        </div>
      </div>

      <div className="navbar-wallet">
        <ConnectWallet />
      </div>
    </nav>
  );
}