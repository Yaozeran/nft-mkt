/* Copyright (c) 2026 Yao Zeran
 * 
 * The mint page for users to register their digital assets as nft */


import React from "react";

import styles from "./MarketPage.module.css"

import NonFungibleTokenMarket from "./components/NonFungibleTokenMarket";


const MarketPage: React.FC = () => {
  return (
    <main className={styles.container}>
      <NonFungibleTokenMarket />
    </main>
  );
}


export default MarketPage
