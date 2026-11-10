import { useAccount, useWatchContractEvent } from "wagmi";
import { usdcAbi } from "../ABIs/USDCAbi";

export default function WatchTransfer(receiver){  

useWatchContractEvent({
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    abi: usdcAbi,
    eventName: 'Transfer',
    args: receiver
      ? { to: receiver }
      : undefined,

    onLogs(logs) {
      console.log('New logs!', logs)
    },
    onError(error) {
      console.log('Error', error)
    }
  })

}