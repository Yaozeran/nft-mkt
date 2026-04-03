/* Copyright (c) 2026 Yao Zeran
 *
 * The market pages' header component. */


import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useWeb3 } from "src/contexts/Web3Context";


const MarketHeader: React.FC = () => {
  const { account } = useWeb3();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/mint", label: "Create" },
    { path: "/market", label: "Market" },
    { path: "/my-nfts", label: "My NFTs" },
  ];

  return (
    <header style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem 2rem",
      borderBottom: "1px solid #1a1a2e",
      background: "rgba(10, 10, 18, 0.95)",
      backdropFilter: "blur(10px)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{
        fontFamily: "var(--pixel)",
        fontSize: "14px",
        color: "var(--accent-pink)",
        textDecoration: "none",
        textShadow: "0 0 20px rgba(255, 45, 120, 0.6)",
        letterSpacing: "2px",
      }}>
        NFT MKT
      </Link>

      <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              fontFamily: "var(--pixel)",
              fontSize: "9px",
              color: location.pathname === item.path ? "var(--accent-cyan)" : "var(--text)",
              textDecoration: "none",
              textTransform: "uppercase",
              letterSpacing: "2px",
              transition: "all 0.2s",
              textShadow: location.pathname === item.path ? "0 0 10px rgba(0, 229, 255, 0.5)" : "none",
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div style={{
        fontFamily: "var(--mono)",
        fontSize: "11px",
        padding: "6px 14px",
        border: account ? "1px solid var(--accent-cyan)" : "1px solid #2a2a40",
        color: account ? "var(--accent-cyan)" : "#4a4a60",
        background: "rgba(0, 229, 255, 0.05)",
        clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
      }}>
        {account
          ? `${account.slice(0, 6)}...${account.slice(-4)}`
          : "NOT CONNECTED"
        }
      </div>
    </header>
  );
};


export default MarketHeader;
