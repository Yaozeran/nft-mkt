/* Copyright (c) 2026 Yao Zeran
 *
 * The marketplace component - displays listed NFTs for buying */

import React, { useEffect, useState } from "react";

import styles from "./NonFungibleTokenMarket.module.css";

import { useWeb3 } from "src/contexts/Web3Context";
import { contractAddress as nftAddress } from "src/services/contracts/nft";


interface NFTItem {
  tokenId: number;
  owner: string;
  price: string;
  seller: string;
  metadata?: any;
}


const NonFungibleTokenMarket: React.FC = () => {

  const { web3, account, nftContract, marketplaceContract: marketplace } = useWeb3();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMetadata = async (tokenURI: string) => {
    try {
      const res = await fetch(tokenURI);
      return await res.json();
    } catch {
      return null;
    }
  };

  const loadListedNFTs = async () => {
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

          const price = listing.price.toString();
          const isListed = BigInt(price) > 0n;

          if (!isListed) continue;

          const owner = await nftContract.methods.ownerOf(i).call();
          const tokenURI = await nftContract.methods.tokenURI(i).call();
          const metadata = await fetchMetadata(tokenURI);

          items.push({
            tokenId: i,
            owner,
            price,
            seller: listing.seller,
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
      loadListedNFTs();
    }
  }, [marketplace, nftContract]);

  const buyNFT = async (tokenId: number, price: string) => {
    if (!account) {
      alert("Please connect your wallet to buy NFTs");
      return;
    }
    try {
      await marketplace.methods
        .buy(nftAddress, tokenId)
        .send({ from: account, value: price });

      alert("NFT purchased!");
      loadListedNFTs();
    } catch (err) {
      console.error(err);
      alert("Purchase failed: " + (err as Error).message);
    }
  };

  const isMySelling = (nft: NFTItem) =>
    account && nft.seller.toLowerCase() === account.toLowerCase();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Marketplace</h1>

      {loading && <p className={styles.loading}>Loading listings...</p>}

      {!loading && nfts.length > 0 && (
        <h2 className={styles.sectionTitle}>
          For Sale ({nfts.length})
        </h2>
      )}

      <div className={styles.grid}>
        {nfts.map((nft) => (
          <div key={nft.tokenId} className={styles.card}>
            {nft.metadata?.image && (
              <img
                src={nft.metadata.image}
                className={styles.cardImage}
                alt={nft.metadata?.name || `Token #${nft.tokenId}`}
              />
            )}

            <div className={styles.cardBody}>
              <h3 className={styles.cardName}>
                {nft.metadata?.name || `Token #${nft.tokenId}`}
              </h3>
              {nft.metadata?.description && (
                <p className={styles.cardDesc}>{nft.metadata.description}</p>
              )}
              <p className={styles.cardMeta}>ID: #{nft.tokenId}</p>
              <p className={styles.cardMeta}>
                Seller: {isMySelling(nft) ? "You" : `${nft.seller.slice(0, 6)}...${nft.seller.slice(-4)}`}
              </p>

              <div className={styles.cardPrice}>
                <span className={styles.cardPriceIcon} />
                {web3?.utils.fromWei(nft.price, "ether")} ETH
              </div>

              {isMySelling(nft) ? (
                <p className={styles.yourListing}>Your listing</p>
              ) : (
                <button
                  className={styles.buyBtn}
                  onClick={() => buyNFT(nft.tokenId, nft.price)}
                >
                  Buy NFT
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && nfts.length === 0 && (
        <p className={styles.empty}>No NFTs listed for sale.</p>
      )}
    </div>
  );
};


export default NonFungibleTokenMarket;
