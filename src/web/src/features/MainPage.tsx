/* Copyright (c) 2026 Yao Zeran
 * 
 * The main page for the ntf market */


import React from "react";

import styles from "./MainPage.module.css"

import { Link } from "react-router-dom";


const MainPage: React.FC = () => {
  return (
    <main className={styles.container}>
      <h1>NFT Market</h1>
      <p>Choose an action to get started.</p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
        <Link to="/mint" className={styles.ctrl_btn}> Mint NFT </Link>
        <Link to="/market" className={styles.ctrl_btn}> Trade NFTs </Link>
      </div>
    </main>
  );
}


export default MainPage
