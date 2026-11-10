import { useChainId } from "wagmi";
import { useBalance } from "wagmi";
import { useAccount } from "wagmi";
import { formatEther } from "viem";

export function UseGetnativeBalance(){
const chainId=useChainId();
const {address}=useAccount();

const result=useBalance({
    chainId:chainId,
    address:address,
    query:{
        refetchInterval:6500
    }
})

return{
    balance: result.data?.value !== undefined ? formatEther(result.data.value):  "",
}


}