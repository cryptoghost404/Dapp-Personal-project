import { useState } from "react";
import "../css/ConnectWalletCss.css";
import SwitchChain from "./SwitchChain";

import {
  useAccount,
  useConnect,
  useConnectors,
  useDisconnect,
} from "wagmi";


export default function ConnectWallet() {
  const [showWallets, setShowWallets] = useState(false);

  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const connectors = useConnectors();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);
const copyAddress = async () => {
  await navigator.clipboard.writeText(address);
  setCopied(true);

  setTimeout(() => {
    setCopied(false);
  }, 2000);
};








//return 

  if (isConnected) {
    return (

      <div className="nav-right">
           <div>
        <SwitchChain/>
      </div>

        <div>
       <button
        className="adress-btn"
        onClick={copyAddress}
        title="Copy wallet address"
      >
        {address?.slice(0, 4)+'....'+address.slice(38)}
        <span className="copy-icon"> 📋</span>
      </button>

      {copied && <span className="copy-message">Address copied!</span>}

      </div>
      <div>
         <button
          className="disconnect-btn"
          onClick={() => disconnect()}
        >
          Disconnect Wallet
        </button>
      </div>
    

       
      </div>
    );
  }

  return (

    <div className="wallet-container">
      <button
        className="connect-btn"
        onClick={() => setShowWallets(true)}
      >
        Connect Wallet
      </button>

      {showWallets && (
        <div
          className="wallet-overlay"
          onClick={() => setShowWallets(false)}
        >
          <div
            className="wallet-options"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowWallets(false)}
              aria-label="Close wallet options"
            >
              &times;
            </button>

            <h3>Connect a Wallet</h3>
            <p className="wallet-subtitle">
              Choose your preferred wallet to continue.
            </p>

            {connectors.map((connector) => (
              <button
                className="wallet-option"
                key={connector.uid}
                onClick={() => connect({ connector })}
              >
                {connector.name}
                <span className="wallet-arrow">→</span>
              </button>
            ))}

            <button
              className="close-btn"
              onClick={() => setShowWallets(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}