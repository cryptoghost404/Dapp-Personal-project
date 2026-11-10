import { createConfig, http } from 'wagmi';
import { sepolia,baseSepolia,unichainSepolia,arbitrumSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [sepolia,baseSepolia,unichainSepolia,arbitrumSepolia],

  connectors: [
    injected(),
  ],

  transports: {
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
    [baseSepolia.id]:http(),
    [unichainSepolia.id]:http(),
    [arbitrumSepolia.id]:http(),
  },
});