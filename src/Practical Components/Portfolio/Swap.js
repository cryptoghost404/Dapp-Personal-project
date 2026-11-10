import { useState, useEffect } from "react";
import { GetSwapQuote } from "../../hooks/GetSwapQuote";
import { useAccount } from "wagmi";
import { formatUnits, formatEther } from "viem";
import { GetSwapData } from "../../hooks/GetSwapData";
import { useSendTransaction } from "wagmi";
import { useChainId } from "wagmi";
import { hexToBigInt } from "viem";
import {sepoliaTokens} from "../../tokens/tokens";
import { CheckApproval } from "../../hooks/UseSwapApproval";
import{TransactionStatus} from "../../watchingTransactions/TransactionStatus";
import { UseTokenBalance } from "../../hooks/UseTokenBalance";
import "../css/SwapCss.css";
import { useBalance } from "wagmi";



export default function Swap(){

const chainId=useChainId();
const transaction=useSendTransaction();
const[currentQuote,setQuote]=useState();
const {address}=useAccount()
const [T2,SetT2]=useState('');
const[T1,SetT1]=useState('');
const [T2Amount,SetT2Amount]=useState('');
const[T1Amount,SetT1Amount]=useState('');
const[swapHash,setHash]=useState('');
const [gasFee,setFee]=useState();

//fetching balances for T1 selected:

const { balance, isLoading, error } = UseTokenBalance({
  tokenAddress: T1?.address,
  chainId: chainId,
  decimals: T1?.decimals
});


const ethTest = useBalance({
  address,
  chainId: 11155111,
});

console.log("Wallet address:", address);
console.log("ETH balance result:", ethTest.data);
console.log("ETH loading:", ethTest.isLoading);
console.log("ETH error:", ethTest.error);


const HandleT1Change = (e) => {

  SetT1(sepoliaTokens.find(tk => tk.address === e.target.value));

};
const HandleT1amountChange=(e)=>{
  SetT1Amount(e.target.value);
}
const HandleT2Change = (e) => {
  SetT2(sepoliaTokens.find(tk => tk.address === e.target.value));
};

//getting swap quote part
useEffect(() => {
  console.log("T1:", T1);
  console.log("T2:", T2);
  console.log("Amount:", T1Amount);
  console.log("Address:", address);

  async function fetchQuote() {
    if (!T1 || !T2 || !T1Amount || Number(T1Amount) <= 0 || !address) {
      console.log("Missing required values");
      return;
    }

    try {
      console.log("Calling GetSwapQuote");

      const result = await GetSwapQuote(
        T1.address,
        T2.address,
        T1Amount,
        T1.decimals,
        address
      );


      console.log("Quote result:", result);
      if(result.swapGasFee){
      setFee(result.swapGasFee);}
      if(result.quote.gasFee){
        setFee(result.quote.gasFee);
      }

      SetT2Amount(formatUnits(result.quote.output.amount, T2.decimals));
      setQuote(result.quote);
    } catch (err) {
      console.error("Quote error:", err);
    }
  }

  fetchQuote();
}, [T1, T2, T1Amount, address]);






//swapping part
  const handleSwap = async () => {
  try {
    if (!T1 || !T2 || !T1Amount || !address || !currentQuote) {
      throw new Error("Missing swap information");
    }

    // 1. Check whether token approval is needed
    const approvalResult = await CheckApproval(
      T1.address,
      T1Amount,
      T1.decimals,
      address
    );

    // 2. Submit approval if necessary
    if (approvalResult.approval) {
      console.log("Requesting token approval...");

      const approvalHash = await transaction.sendTransactionAsync({
        to: approvalResult.approval.to,
        data: approvalResult.approval.data,
        value: hexToBigInt(approvalResult.approval.value),
        chainId: approvalResult.approval.chainId,
      });

      console.log("Approval submitted:", approvalHash);

      // Stop here for now. Wait for approval confirmation
      // before requesting and submitting the swap.
      return;
    }

    // 3. Approval is already sufficient; submit the swap
    const result = await GetSwapData(currentQuote);
    const tx = result.swap;

    const hash= await transaction.sendTransactionAsync({
      to: tx.to,
      data: tx.data,
      value: hexToBigInt(tx.value),
      chainId: tx.chainId,
    });
    setHash(hash);

    SetT1Amount("");
    SetT2Amount("");
    setQuote(undefined);
    setFee(undefined);

  } catch (error) {
    console.error("Swap failed:", error);
  }
};

 


//return part


return (
  <div className="swap-page">


    <div className="swap-container">
      <h2 className="swap-title">Swap</h2>

      <div className="swap-section">
        <label className="swap-label">You pay</label>

        <div className="swap-row">
          <input
            className="swap-amount"
            type="number"
            min="0"
            placeholder="0.00"
            onChange={HandleT1amountChange}
            value={T1Amount}
          />

          <select
            className="swap-token-select"
            value={T1?.address || ""}
            onChange={HandleT1Change}
          >
            <option value="" disabled>Token</option>
            {sepoliaTokens.map(tk => (
              <option key={tk.address} value={tk.address} disabled={tk.address === T2?.address}>
                {tk.name}
              </option>
            ))}
          </select>

        <p>
  Balance: {isLoading ? "Loading..." : error ? "Error loading balance" : Number(balance).toFixed(5) || "0"}
</p>
        </div>
      </div>

      <div className="swap-divider">
        <div className="swap-arrow">↓</div>
      </div>

      <div className="swap-section">
        <label className="swap-label">You receive</label>

        <div className="swap-row">
          <input
            className="swap-amount"
            value={T2Amount}
            placeholder="0.00"
            readOnly
          />

          <select
            className="swap-token-select"
            value={T2?.address || ""}
            onChange={HandleT2Change}
          >
            <option value="" disabled>Token</option>
            {sepoliaTokens.map(tk => (
              <option key={tk.address} value={tk.address} disabled={tk.address === T1?.address}>
                {tk.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="swap-details">
        <p>
          Estimated network fee:{" "}
          {gasFee ? `${formatEther(gasFee)} ETH` : "—"}
        </p>

        {swapHash && (
          <TransactionStatus txHash={swapHash} />
        )}
      </div>

      <button
        className="swap-button"
        onClick={handleSwap}
        disabled={!currentQuote}
      >
        Swap
      </button>
    </div>


  </div>
);

  }
