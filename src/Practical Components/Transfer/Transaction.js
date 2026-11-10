import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { parseUnits } from 'viem';
import './css/TransactionCss.css'
import {TransactionStatus}  from '../../watchingTransactions/TransactionStatus'
import { Tokens } from '../../config/tokens';
import { UseTransferToken } from '../../hooks/UseTransferToken';
import { UseTokenBalance } from '../../hooks/UseTokenBalance';

export default function Transaction() {
  const chainId = useChainId();
  const { address } = useAccount();
  const [txHash, setTxHash] = useState("");
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [T1, setT1] = useState();

    const networkTokens = {
      11155111: Tokens.sepoliaTokens,
      1301: Tokens.unichainSepoliaTokens,
      84532: Tokens.baseSepoliaTokens,
    };
  
    const chainTokens = networkTokens[chainId] || [];

  const { sendToken, isPending } = UseTransferToken();

  const {
    balance,
    isLoading,
    error,
  } = UseTokenBalance({
    tokenAddress: T1?.address,
    chainId,
    decimals: T1?.decimals,
  });

  const handleTokenChange = (e) => {
    setT1(chainTokens.find((tk) => tk.address === e.target.value));
  };

  const Send = async () => {
    if (!address) {
      window.alert('Connect your wallet first');
      return;
    }

    if (!T1 || !receiver || !amount) {
      window.alert('Fill in all fields');
      return;
    }

    if (isLoading) {
      window.alert('Balance is still fetching');
      return;
    }

    if (error || !balance) {
      window.alert('Balance unavailable');
      return;
    }

    try {
      const amountInUnits = parseUnits(amount, T1.decimals);

      if (amountInUnits > balance.value) {
        window.alert('Insufficient balance');
        return;
      }

      const hash = await sendToken({
        tokenAddress: T1.address,
        receiver,
        amount,
        decimals: T1.decimals,
      });

      console.log('Transaction hash:', hash);

      window.alert(`Transaction submitted: ${hash}`);
      
      setTxHash(hash);
      setAmount('');
    } catch (err) {
      console.error(err);
      window.alert(err.shortMessage || err.message || 'Transaction failed');
    }
  };


  
//return part 


  return (
  <div className="transfer-page">
    <div className="transfer-container">
      <div className="transfer-header">
        <div>
          <h2 className="transfer-title">Send Tokens</h2>
          <p className="transfer-subtitle">
            Transfer tokens securely to another wallet.
          </p>
        </div>

        <div className="transfer-icon">↗</div>
      </div>

      <div className="transfer-field">
        <label className="transfer-label">Asset</label>

        <div className="transfer-asset-row">
          <select
            className="transfer-token-select"
            value={T1?.address || ""}
            onChange={handleTokenChange}
          >
            <option value="" disabled>
              Select token
            </option>

            {chainTokens.map((tk) => (
              <option key={tk.address} value={tk.address}>
                {tk.name}
              </option>
            ))}
          </select>

          <div className="transfer-balance">
            <span>Balance</span>
            <strong>
              {isLoading
                ? "Loading..."
                : error
                  ? "Unavailable"
                  : `${Number(balance || 0).toFixed(5)} ${T1?.symbol || ""}`}
            </strong>
          </div>
        </div>
      </div>

      <div className="transfer-field">
        <label className="transfer-label" htmlFor="receiver">
          Recipient address
        </label>

        <div className="transfer-input-wrapper">
          <input
            id="receiver"
            className="transfer-input"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder="0x..."
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <p className="transfer-hint">
          Enter the wallet address you want to send tokens to.
        </p>
      </div>

      <div className="transfer-field">
        <label className="transfer-label" htmlFor="transfer-amount">
          Amount
        </label>

        <div className="transfer-amount-box">
          <input
            id="transfer-amount"
            className="transfer-amount-input"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />

          <span className="transfer-amount-symbol">
            {T1?.symbol || "TOKEN"}
            
            
          
          </span>
        </div>
      </div>

      <div className="transfer-network-note">
        <span className="transfer-status-dot" />
        <span>Connected to your selected network</span>
      </div>

      <button
        className="transfer-button"
        onClick={Send}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <span className="transfer-spinner" />
            Sending transaction...
          </>
        ) : (
          "Send tokens"
        )}
      </button>
      {txHash&&
       <div className="transfer-status-container">
  <TransactionStatus txHash={txHash} />
</div>
}
      <p className="transfer-footer">
        Double-check the recipient address before confirming.
      </p>
    </div>
  </div>
);
}