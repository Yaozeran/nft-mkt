/* Copyright (c) 2026 Yao Zeran
 * 
 * The market layout file defines the layout for market related pages, where 
 *   user trade the tokens */


import React from "react";

import { Outlet } from "react-router-dom";

import MarketHeader from "../components/MarketHeader";
import MarketFooter from "../components/MarketFooter";


const MarketLayout: React.FC = () => {
  return (
    <div>
      <MarketHeader />
      <Outlet />
      <MarketFooter />
    </div>
  );
}


export default MarketLayout
