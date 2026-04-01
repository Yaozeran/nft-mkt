/* Copyright (c) 2026 Yao Zeran
 * 
 * The marketplace component */

import React, { useEffect, useState } from "react";

import Web3 from "web3";

import { 
  contractABI as marketplaceABI, contractAddress as marketplaceAddress 
} from "src/services/contracts/market";
import { 
  contractABI as nftABI, contractAddress as nftAddress 
} from "src/services/contracts/nft";


interface NFTItem {
  tokenId: number;
  price: string;
  seller: string;
  metadata?: any;
}


const NonFungibleTokenMarket: React.FC = () => {

  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [marketplace, setMarketplace] = useState<any>(null);
  const [nftContract, setNftContract] = useState<any>(null);
  const [account, setAccount] = useState<string>("");
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [tokenIdToList, setTokenIdToList] = useState("");
  const [priceToList, setPriceToList] = useState("");

  useEffect(() => {

    const init = async () => {
      if (!window.ethereum) {
        return alert("Install MetaMask");
      }

      const web3Instance = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const accounts = await web3Instance.eth.getAccounts();

      const marketplaceInstance = new web3Instance.eth.Contract(
        marketplaceABI as any,
        marketplaceAddress
      );

      const nftInstance = new web3Instance.eth.Contract(
        nftABI as any,
        nftAddress
      );

      setWeb3(web3Instance);
      setMarketplace(marketplaceInstance);
      setNftContract(nftInstance);
      setAccount(accounts[0]);
    };

    init();
  }, []);

  const fetchMetadata = async (tokenURI: string) => {
    try {
      const res = await fetch(tokenURI);
      return await res.json();
    } catch {
      return null;
    }
  };

  const loadMarketplaceNFTs = async () => {

    if (!marketplace || !nftContract) return;

    const items: NFTItem[] = [];

    const totalSupply = await nftContract.methods._tokenIds().call().catch(() => 50);

    for (let i = 1; i <= totalSupply; i++) {
      try {
        const listing = await marketplace.methods
          .listings(nftAddress, i)
          .call();

        if (listing.price > 0) {
          const tokenURI = await nftContract.methods.tokenURI(i).call();
          const metadata = await fetchMetadata(tokenURI);

          items.push({
            tokenId: i,
            price: listing.price,
            seller: listing.seller,
            metadata,
          });
        }
      } catch {}
    }

    setNfts(items);
  };

  useEffect(() => {
    loadMarketplaceNFTs();
  }, [marketplace]);

  const approveNFT = async (tokenId: string) => {
    await nftContract.methods
      .approve(marketplaceAddress, tokenId)
      .send({ from: account });
  };

  const listNFT = async () => {
    if (!priceToList || !tokenIdToList) return;

    const priceWei = web3!.utils.toWei(priceToList, "ether");

    await approveNFT(tokenIdToList);

    await marketplace.methods
      .listNFT(nftAddress, tokenIdToList, priceWei)
      .send({ from: account });

    alert("NFT listed!");
    loadMarketplaceNFTs();
  };

  const buyNFT = async (tokenId: number, price: string) => {
    await marketplace.methods
      .buyNFT(nftAddress, tokenId)
      .send({ from: account, value: price });

    alert("NFT purchased 🎉");
    loadMarketplaceNFTs();
  };

  const cancelListing = async (tokenId: number) => {
    await marketplace.methods
      .cancelListing(nftAddress, tokenId)
      .send({ from: account });

    loadMarketplaceNFTs();
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <h1>NFT Marketplace</h1>

      <h2>List Your NFT</h2>
      <input
        placeholder="Token ID"
        value={tokenIdToList}
        onChange={(e) => setTokenIdToList(e.target.value)}
      />
      <input
        placeholder="Price in ETH"
        value={priceToList}
        onChange={(e) => setPriceToList(e.target.value)}
      />
      <button onClick={listNFT}>List NFT</button>

      <hr />

      <h2>Available NFTs</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {nfts.map((nft) => (
          <div key={nft.tokenId} style={{ border: "1px solid #ccc", padding: 10 }}>
            {nft.metadata?.image && (
              <img src={nft.metadata.image} width="100%" />
            )}

            <h3>{nft.metadata?.name}</h3>
            <p>{nft.metadata?.description}</p>

            <p>Token ID: {nft.tokenId}</p>
            <p>Price: {web3?.utils.fromWei(nft.price, "ether")} ETH</p>
            <p>Seller: {nft.seller.slice(0, 6)}...</p>

            {account.toLowerCase() === nft.seller.toLowerCase() ? (
              <button onClick={() => cancelListing(nft.tokenId)}>
                Cancel Listing
              </button>
            ) : (
              <button onClick={() => buyNFT(nft.tokenId, nft.price)}>
                Buy NFT
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


export default NonFungibleTokenMarket;
