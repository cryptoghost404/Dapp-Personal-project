import { sepolia } from "viem/chains";
import { useWaitForTransactionReceipt } from "wagmi";
import { useChainId } from "wagmi";
import {explorers} from '../config/explorers'

export function TransactionStatus({ txHash }) {
    const chainId=useChainId();
    const explorer=explorers[chainId];
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: chainId,
    query: {
      enabled: Boolean(txHash),
    },
  });

  if (!txHash) return null;

  return (
    <div className="transaction-status">
      {isConfirming && (
        <p className="transaction-message confirming">
          <span className="status-dot" />
          Transaction getting confirmed...
        </p>
      )}

      {isError && (
        <p className="transaction-message failed">
          Transaction confirmation failed.
        </p>
      )}

      <div className="transaction-hash">
        <span>Transaction hash</span>
        <span className="hash-value">
          {`${txHash.slice(0, 8)}...${txHash.slice(-6)}`}
        </span>
                  <a
            href={`${explorer}${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Etherscan ↗
          </a>
      </div>

      {isConfirmed && (
        <div className="transaction-confirmed">
          <span className="status-dot" />
          <span>Transaction confirmed</span>

        </div>
      )}
    </div>
  );
}