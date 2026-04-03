/* Copyright (c) 2026 Yao Zeran
 *
 * The marketplace component */

import React, { useEffect, useState } from "react";

import { useWeb3 } from "src/contexts/Web3Context";
import { contractAddress as nftAddress } from "src/services/contracts/nft";


interface NFTItem {
  tokenId: number;
  owner: string;
  price: string;
  seller: string;
  isListed: boolean;
  metadata?: any;
}


const NonFungibleTokenMarket: React.FC = () => {

  const { web3, account, nftContract, marketplaceContract: marketplace } = useWeb3();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [priceInputs, setPriceInputs] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const fetchMetadata = async (tokenURI: string) => {
    try {
      const res = await fetch(tokenURI);
      return await res.json();
    } catch {
      return null;
    }
  };

  const loadAllNFTs = async () => {

    if (!marketplace || !nftContract) return;

    setLoading(true);
    const items: NFTItem[] = [];

    try {
      const totalSupply = await nftContract.methods.totalSupply().call();

      for (let i = 0; i < Number(totalSupply); i++) {
        try {
          const owner = await nftContract.methods.ownerOf(i).call();
          const tokenURI = await nftContract.methods.tokenURI(i).call();
          const metadata = await fetchMetadata(tokenURI);

          const listing = await marketplace.methods
            .listings(nftAddress, i)
            .call();

          const price = listing.price.toString();
          const isListed = BigInt(price) > 0n;

          items.push({
            tokenId: i,
            owner,
            price,
            seller: listing.seller,
            isListed,
            metadata,
          });
        } catch (err) {
          console.error(`Failed to load token ${i}:`, err);
        }
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
      loadAllNFTs();
    }
  }, [marketplace, nftContract]);

  const listNFT = async (tokenId: number) => {
    const price = priceInputs[tokenId];
    if (!price) {
      alert("Please enter a price");
      return;
    }

    try {
      const priceWei = web3!.utils.toWei(price, "ether");

      await nftContract.methods
        .approve(marketplace.options.address, tokenId)
        .send({ from: account });

      await marketplace.methods
        .list(nftAddress, tokenId, priceWei)
        .send({ from: account });

      alert("NFT listed!");
      loadAllNFTs();
    } catch (err) {
      console.error("List failed:", err);
      alert("List failed: " + (err as Error).message);
    }
  };

  const buyNFT = async (tokenId: number, price: string) => {
    try {
      await marketplace.methods
        .buy(nftAddress, tokenId)
        .send({ from: account, value: price });

      alert("NFT purchased!");
      loadAllNFTs();
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
      loadAllNFTs();
    } catch (err) {
      console.error(err);
      alert("Cancel failed: " + (err as Error).message);
    }
  };

  const isMyNFT = (nft: NFTItem) =>
    account && nft.owner.toLowerCase() === account.toLowerCase();

  const isMySelling = (nft: NFTItem) =>
    account && nft.seller.toLowerCase() === account.toLowerCase();

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <h1>NFT Marketplace</h1>

      {loading && <p>Loading NFTs...</p>}

      <h2>All NFTs</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {nfts.map((nft) => (
          <div key={nft.tokenId} style={{ border: "1px solid #ccc", padding: 10, borderRadius: 8 }}>
            {nft.metadata?.image && (
              <img src={nft.metadata.image} width="100%" style={{ borderRadius: 4 }} />
            )}

            <h3>{nft.metadata?.name || `Token #${nft.tokenId}`}</h3>
            <p>{nft.metadata?.description}</p>
            <p>Token ID: {nft.tokenId}</p>
            <p>Owner: {isMyNFT(nft) ? "You" : `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`}</p>

            {nft.isListed ? (
              <>
                <p><strong>Price: {web3?.utils.fromWei(nft.price, "ether")} ETH</strong></p>
                <p>Seller: {isMySelling(nft) ? "You" : `${nft.seller.slice(0, 6)}...${nft.seller.slice(-4)}`}</p>

                {isMySelling(nft) ? (
                  <button onClick={() => cancelListing(nft.tokenId)}>
                    Cancel Listing
                  </button>
                ) : (
                  <button onClick={() => buyNFT(nft.tokenId, nft.price)}>
                    Buy NFT
                  </button>
                )}
              </>
            ) : (
              <>
                <p style={{ color: "#888" }}>Not Listed</p>
                {isMyNFT(nft) && (
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <input
                      placeholder="Price (ETH)"
                      value={priceInputs[nft.tokenId] || ""}
                      onChange={(e) =>
                        setPriceInputs({ ...priceInputs, [nft.tokenId]: e.target.value })
                      }
                      style={{ flex: 1 }}
                    />
                    <button onClick={() => listNFT(nft.tokenId)}>List</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {!loading && nfts.length === 0 && <p>No NFTs minted yet.</p>}
    </div>
  );
};


export default NonFungibleTokenMarket;
