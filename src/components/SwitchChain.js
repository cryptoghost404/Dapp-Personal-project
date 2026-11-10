import { useState, useEffect, useRef } from "react";
import { useChains, useSwitchChain, useChainId } from "wagmi";
import "../css/SwitchChainCss.css";

export default function SwitchChain() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const chains = useChains();
  const chainId = useChainId();
  const { mutate: switchChain } = useSwitchChain();

  const currentChain = chains.find((chain) => chain.id === chainId);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="chain-dropdown" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>
        {currentChain?.name ?? "Unknown Network"} ▼
      </button>

      {isOpen && (
        <div className="chain-menu">
          {chains.map((chain) => (
            <button
              key={chain.id}
              onClick={() => {
                switchChain({ chainId: chain.id });
                setIsOpen(false);
              }}
            >
              {chain.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}