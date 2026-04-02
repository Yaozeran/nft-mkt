/* Copyright (c) 2026 Yao Zeran
 *
 * The market pages' header component. */


import React from "react";

import { useWeb3 } from "src/contexts/Web3Context";


const MarketHeader: React.FC = () => {
  const { account } = useWeb3();
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", borderBottom: "1px solid #ccc" }}>
      <h2 style={{ margin: 0 }}>NFT Marketplace</h2>
      <span>{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}</span>
    </header>
  );
};


export default MarketHeader;
