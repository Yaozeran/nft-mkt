/* Copyright (c) 2026 Yao Zeran
 *
 * The Web3 context centralizes MetaMask/Web3 initialization and provides
 *   blockchain state to the component tree. */


import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import Web3 from "web3";

import {
  contractABI as nftABI,
  contractAddress as nftAddress,
} from "src/services/contracts/nft";
import {
  contractABI as marketABI,
  contractAddress as marketAddress,
} from "src/services/contracts/market";


interface Web3ContextType {
  web3: Web3 | null;
  account: string;
  nftContract: any;
  marketplaceContract: any;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
}

const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

const Web3Context = createContext<Web3ContextType>({
  web3: null,
  account: "",
  nftContract: null,
  marketplaceContract: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnecting: false,
});


export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>("");
  const [nftContract, setNftContract] = useState<any>(null);
  const [marketplaceContract, setMarketplaceContract] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize read-only mode
  useEffect(() => {
    const readonlyWeb3 = new Web3(SEPOLIA_RPC);
    const readonlyNft = new readonlyWeb3.eth.Contract(nftABI, nftAddress);
    const readonlyMarketplace = new readonlyWeb3.eth.Contract(marketABI, marketAddress);

    setWeb3(readonlyWeb3);
    setNftContract(readonlyNft);
    setMarketplaceContract(readonlyMarketplace);
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to connect your wallet");
      return;
    }

    setIsConnecting(true);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const walletWeb3 = new Web3(window.ethereum);
      const accounts = await walletWeb3.eth.getAccounts();

      const nft = new walletWeb3.eth.Contract(nftABI, nftAddress);
      const marketplace = new walletWeb3.eth.Contract(marketABI, marketAddress);

      setWeb3(walletWeb3);
      setAccount(accounts[0]);
      setNftContract(nft);
      setMarketplaceContract(marketplace);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    const readonlyWeb3 = new Web3(SEPOLIA_RPC);
    const readonlyNft = new readonlyWeb3.eth.Contract(nftABI, nftAddress);
    const readonlyMarketplace = new readonlyWeb3.eth.Contract(marketABI, marketAddress);

    setWeb3(readonlyWeb3);
    setAccount("");
    setNftContract(readonlyNft);
    setMarketplaceContract(readonlyMarketplace);
  }, []);

  // Listen for MetaMask account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (account) {
        // Only update if already connected
        const walletWeb3 = new Web3(window.ethereum);
        const nft = new walletWeb3.eth.Contract(nftABI, nftAddress);
        const marketplace = new walletWeb3.eth.Contract(marketABI, marketAddress);

        setWeb3(walletWeb3);
        setAccount(accounts[0]);
        setNftContract(nft);
        setMarketplaceContract(marketplace);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [account, disconnectWallet]);

  return (
    <Web3Context.Provider value={{
      web3, account, nftContract, marketplaceContract,
      connectWallet, disconnectWallet, isConnecting,
    }}>
      {children}
    </Web3Context.Provider>
  );
};


export const useWeb3 = (): Web3ContextType => {
  return useContext(Web3Context);
};


export default Web3Context;
