/* Copyright (c) 2026 Yao Zeran
 *
 * The main page for the ntf market */


import React from "react";

import styles from "./MainPage.module.css"

import { Link } from "react-router-dom";


const MainPage: React.FC = () => {
  return (
    <main className={styles.container}>
      {/* Pixel decoration corners */}
      <div className={styles.pixelCornerTL} />
      <div className={styles.pixelCornerBR} />

      <div className={styles.hero}>
        <div className={styles.glitchWrapper}>
          <h1 className={styles.title}>NFT<br/>MARKET</h1>
        </div>
        <p className={styles.subtitle}>Mint, Trade & Collect Digital Assets on the Blockchain</p>

        <div className={styles.btnGroup}>
          <Link to="/mint" className={styles.ctrlBtn}>
            <span className={styles.btnIcon}>+</span> Create NFT
          </Link>
          <Link to="/market" className={styles.ctrlBtnAlt}>
            <span className={styles.btnIcon}>&lt;&gt;</span> Trade NFTs
          </Link>
          <Link to="/my-nfts" className={styles.ctrlBtnAlt}>
            <span className={styles.btnIcon}>@</span> My NFTs
          </Link>
        </div>
      </div>

      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>---</span>
          <span className={styles.statLabel}>Total NFTs</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>---</span>
          <span className={styles.statLabel}>Listed</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>ETH</span>
          <span className={styles.statLabel}>Network</span>
        </div>
      </div>
    </main>
  );
}


export default MainPage
