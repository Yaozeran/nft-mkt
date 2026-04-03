/* Copyright (c) 2026 Yao Zeran
 *
 * The page for users to view and manage their own NFTs */


import React from "react";

import styles from "./MyNFTsPage.module.css"

import MyNFTsList from "./components/MyNFTsList";


const MyNFTsPage: React.FC = () => {
  return (
    <main className={styles.container}>
      <MyNFTsList />
    </main>
  );
}


export default MyNFTsPage
