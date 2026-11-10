    import { useCallback } from "react";
    import { useAccount, useChainId } from "wagmi";

export function UseGetAllNFTs(){
      const { address } = useAccount();
      const chainId = useChainId();
    
      const fetchNFTs = useCallback(async () => {
        if (!address) {
          throw new Error("Connect your wallet first");
        }
    
        const response = await fetch("/api/NFTs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chainId,
            address,
          }),
        });
    
        const data = await response.json();
    
        if (!response.ok) {
          throw new Error(
            data.detail || data.message || data.error || "Error fetching NFTs"
          );
        }
    
        return data;
      }, [address, chainId]);
    
      return { fetchNFTs, address, chainId };
    }