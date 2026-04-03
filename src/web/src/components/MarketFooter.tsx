/* Copyright (c) 2026 Yao Zeran
 *
 * The market pages' footer component. */


import React from "react";


const MarketFooter: React.FC = () => {
  return (
    <footer style={{
      textAlign: "center",
      padding: "2rem",
      borderTop: "1px solid #1a1a2e",
      background: "rgba(10, 10, 18, 0.9)",
    }}>
      <p style={{
        fontFamily: "var(--pixel)",
        fontSize: "8px",
        color: "#4a4a60",
        letterSpacing: "3px",
        textTransform: "uppercase",
      }}>
        NFT Marketplace &copy; 2026
      </p>
    </footer>
  );
};


export default MarketFooter;
