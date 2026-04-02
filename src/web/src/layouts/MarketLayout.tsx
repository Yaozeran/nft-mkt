/* Copyright (c) 2026 Yao Zeran
 * 
 * The market layout file defines the layout for market related pages, where 
 *   user trade the tokens */


import React from "react";

import { Outlet } from "react-router-dom";

import { Web3Provider } from "src/contexts/Web3Context";
import MarketHeader from "../components/MarketHeader";
import MarketFooter from "../components/MarketFooter";


const MarketLayout: React.FC = () => {
  return (
    <Web3Provider>
      <div>
        <MarketHeader />
        <Outlet />
        <MarketFooter />
      </div>
    </Web3Provider>
  );
}


export default MarketLayout
