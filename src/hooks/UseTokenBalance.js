import { useAccount, useReadContract, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { ERC20_ABI } from '../ABIs/ERC20_ABI';

const NATIVE_ETH = "0x0000000000000000000000000000000000000000";

export function UseTokenBalance({ tokenAddress, chainId, decimals }) {
  const { address } = useAccount();

  const isNativeETH =
    tokenAddress?.toLowerCase() === NATIVE_ETH.toLowerCase();

  const ethResult = useBalance({
    address:address,
    chainId:chainId,
    query: {
      enabled: Boolean(address && isNativeETH),
      refetchInterval: 8500,
    },
  });

  const tokenResult = useReadContract({
    abi: ERC20_ABI,
    address: tokenAddress,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId:chainId,
    query: {
      enabled: Boolean(address && tokenAddress && decimals !== undefined && !isNativeETH),
      refetchInterval: 8500,
    },
  });

  if (isNativeETH) {
    return {
      balance: ethResult.data?.value !== undefined ? formatUnits(ethResult.data.value, 18):  "",
      rawBalance: ethResult.data?.value,
      isLoading: ethResult.isLoading,
      error: ethResult.error,
      refetch: ethResult.refetch,
    };
  }

  return {
    balance:
      tokenResult.data !== undefined && decimals !== undefined
        ? formatUnits(tokenResult.data, decimals)
        : '',
    rawBalance: tokenResult.data,
    isLoading: tokenResult.isLoading,
    error: tokenResult.error,
    refetch: tokenResult.refetch,
  };
}