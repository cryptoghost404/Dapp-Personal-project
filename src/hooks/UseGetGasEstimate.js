import { useEstimateGas } from 'wagmi'
import { useChainId } from 'wagmi'
import { encodeFunctionData, parseUnits } from "viem";
import { ERC20_ABI } from '../ABIs/ERC20_ABI'; 
import { parseEther } from 'viem';
const native_eth='0x0000000000000000000000000000000000000000';


function UsetGetGasEstimate(token,amount,recipient) {



    const chainId=useChainId()
  const isNativeETH=  native_eth===token.address ;







  const data =  !isNativeETH && amount && recipient
    ? encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [
          recipient,
          parseUnits(amount, token.decimals),
        ],
      })
    : undefined;

//estimate for a token

  const tokenResult = useEstimateGas({
    chainId: chainId, 
    to: token.address,
    data:data,
   query:{
    enabled:Boolean(!isNativeETH)
   }
  });


//estimate for native eth
  const ETHResult = useEstimateGas({
    chainId: chainId, 
    to: recipient,
     value: parseEther(amount),
     query:{
      enabled: Boolean(isNativeETH)}
  });


//return part
  return {
    gasEstimate: isNativeETH ? ETHResult.data : tokenResult.data,
    isLoading: isNativeETH ? ETHResult.isLoading : tokenResult.isLoading,
    error: isNativeETH ? ETHResult.error : tokenResult.error,
  };


}