/* Copyright (c) 2026 Yao Zeran
 *
 * The marketplace component */

import React, { useEffect, useState } from "react";

import { useWeb3 } from "src/contexts/Web3Context";
import { contractAddress as nftAddress } from "src/services/contracts/nft";


interface NFTItem {
  tokenId: number;
  price: string;
  seller: string;
  metadata?: any;
}


const NonFungibleTokenMarket: React.FC = () => {

  const { web3, account, nftContract, marketplaceContract: marketplace } = useWeb3();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [tokenIdToList, setTokenIdToList] = useState("");
  const [priceToList, setPriceToList] = useState("");
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    const items: NFTItem[] = [];

    try {
      const totalSupply = await nftContract.methods.totalSupply().call();

      for (let i = 0; i < Number(totalSupply); i++) {
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
    } catch (err) {
      console.error("Failed to load NFTs:", err);
    } finally {
      setLoading(false);
    }

    setNfts(items);
  };

  useEffect(() => {
    if (marketplace && nftContract) {
      loadMarketplaceNFTs();
    }
  }, [marketplace, nftContract]);

  const approveNFT = async (tokenId: string) => {
    await nftContract.methods
      .approve(marketplace.options.address, tokenId)
      .send({ from: account });
  };

  const listNFT = async () => {
    if (!priceToList || !tokenIdToList) return;

    try {
      const priceWei = web3!.utils.toWei(priceToList, "ether");

      await approveNFT(tokenIdToList);

      await marketplace.methods
        .list(nftAddress, tokenIdToList, priceWei)
        .send({ from: account });

      alert("NFT listed!");
      loadMarketplaceNFTs();
    } catch (err) {
      console.error(err);
      alert("List failed: " + (err as Error).message);
    }
  };

  const buyNFT = async (tokenId: number, price: string) => {
    try {
      await marketplace.methods
        .buy(nftAddress, tokenId)
        .send({ from: account, value: price });

      alert("NFT purchased!");
      loadMarketplaceNFTs();
    } catch (err) {
      console.error(err);
      alert("Purchase failed: " + (err as Error).message);
    }
  };

  const cancelListing = async (tokenId: number) => {
    try {
      await marketplace.methods
        .cancel(nftAddress, tokenId)
        .send({ from: account });

      alert("Listing cancelled!");
      loadMarketplaceNFTs();
    } catch (err) {
      console.error(err);
      alert("Cancel failed: " + (err as Error).message);
    }
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

      {loading && nfts.length === 0 && <p>Loading...</p>}

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
