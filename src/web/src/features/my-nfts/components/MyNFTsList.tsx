/* Copyright (c) 2026 Yao Zeran
 *
 * Component to display and manage the user's own NFTs */

import React, { useEffect, useState } from "react";

import styles from "./MyNFTsList.module.css";

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


const MyNFTsList: React.FC = () => {

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

  const loadMyNFTs = async () => {
    if (!marketplace || !nftContract || !account) return;

    setLoading(true);
    const items: NFTItem[] = [];

    try {
      const totalSupply = await nftContract.methods.totalSupply().call();

      for (let i = 0; i < Number(totalSupply); i++) {
        try {
          const owner = await nftContract.methods.ownerOf(i).call();

          const listing = await marketplace.methods
            .listings(nftAddress, i)
            .call();

          const price = listing.price.toString();
          const isListed = BigInt(price) > 0n;
          const seller = listing.seller;

          // Show NFTs the user owns OR is currently selling
          const isOwner = owner.toLowerCase() === account.toLowerCase();
          const isSeller = isListed && seller.toLowerCase() === account.toLowerCase();

          if (!isOwner && !isSeller) continue;

          const tokenURI = await nftContract.methods.tokenURI(i).call();
          const metadata = await fetchMetadata(tokenURI);

          items.push({
            tokenId: i,
            owner,
            price,
            seller,
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
    if (marketplace && nftContract && account) {
      loadMyNFTs();
    }
  }, [marketplace, nftContract, account]);

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
      loadMyNFTs();
    } catch (err) {
      console.error("List failed:", err);
      alert("List failed: " + (err as Error).message);
    }
  };

  const cancelListing = async (tokenId: number) => {
    try {
      await marketplace.methods
        .cancel(nftAddress, tokenId)
        .send({ from: account });

      alert("Listing cancelled!");
      loadMyNFTs();
    } catch (err) {
      console.error(err);
      alert("Cancel failed: " + (err as Error).message);
    }
  };

  if (!account) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>My NFTs</h1>
        <p className={styles.empty}>Connect your wallet to view your NFTs</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My NFTs</h1>

      {loading && <p className={styles.loading}>Loading your NFTs...</p>}

      {!loading && nfts.length > 0 && (
        <h2 className={styles.sectionTitle}>
          Your Collection ({nfts.length})
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

              {nft.isListed ? (
                <div className={styles.listedSection}>
                  <div className={styles.statusBadge}>
                    <span className={styles.statusDot} />
                    Listed
                  </div>
                  <div className={styles.cardPrice}>
                    <span className={styles.cardPriceIcon} />
                    {web3?.utils.fromWei(nft.price, "ether")} ETH
                  </div>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => cancelListing(nft.tokenId)}
                  >
                    Cancel Listing
                  </button>
                </div>
              ) : (
                <div className={styles.unlistedSection}>
                  <div className={styles.statusBadgeInactive}>
                    Not Listed
                  </div>
                  <div className={styles.listRow}>
                    <input
                      className={styles.listInput}
                      placeholder="Price (ETH)"
                      value={priceInputs[nft.tokenId] || ""}
                      onChange={(e) =>
                        setPriceInputs({ ...priceInputs, [nft.tokenId]: e.target.value })
                      }
                    />
                    <button
                      className={styles.listBtn}
                      onClick={() => listNFT(nft.tokenId)}
                    >
                      List
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && nfts.length === 0 && (
        <p className={styles.empty}>You don't own any NFTs yet.</p>
      )}
    </div>
  );
};


export default MyNFTsList;
