import TokenBalances from "./TokenBalances";
import PortfolioHeader from "./PortfolioHeader";
import { TransactionHistory } from "./TransactionHistory";
import "./css/PortfolioCss.css";

export default function Overview() {
  return (
    <div>
      <PortfolioHeader />

      <div className="overview-container">
        <section className="overview-section">
          <div className="overview-section-header">
            <h2>Token Balances</h2>
            <a href="/portfolio/tokens">View all tokens →</a>
          </div>

          <TokenBalances limit={3} />
        </section>

        <div className="overview-divider"></div>

        <section className="overview-section">
          <div className="overview-section-header">
            <h2>Recent Activity</h2>
            <a href="/portfolio/activity">View all activity →</a>
          </div>

          <TransactionHistory limit={3} />
        </section>
      </div>
    </div>
  );
}