import {
  useSendTransaction,
  useWriteContract,
  useChainId,
  useAccount,
} from 'wagmi';

import { parseEther, parseUnits, isAddress } from 'viem';
import { ERC20_ABI } from '../ABIs/ERC20_ABI';

const NATIVE_ETH = '0x0000000000000000000000000000000000000000';

export function UseTransferToken() {
  const chainId = useChainId();
  const { address } = useAccount();

  const {
    sendTransactionAsync,
    isPending: isEthPending,
  } = useSendTransaction();

  const {
    writeContractAsync,
    isPending: isTokenPending,
  } = useWriteContract();

  const sendToken = async ({ tokenAddress, receiver, amount, decimals }) => {
    if (!address) throw new Error('Connect your wallet first');

    if (!isAddress(receiver)) {
      throw new Error('Invalid receiver address');
    }

    if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      throw new Error('Enter a valid amount');
    }

    const isNativeETH =
      tokenAddress?.toLowerCase() === NATIVE_ETH.toLowerCase();

    if (isNativeETH) {
      return await sendTransactionAsync({
        to: receiver,
        value: parseEther(amount),
        chainId:chainId,
      });
    }

    if (!tokenAddress || decimals === undefined) {
      throw new Error('Select a valid token');
    }

    return await writeContractAsync({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [receiver, parseUnits(amount, decimals)],
      chainId,
    });
  };

  return {
    sendToken,
    isPending: isEthPending || isTokenPending,
  };
}