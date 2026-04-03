/* Copyright (c) 2026 Yao Zeran
 * 
 *  */


import { createBrowserRouter } from "react-router-dom";

import MarketLayout from "../layouts/MarketLayout";
import MainPage from "../features/MainPage";
import MintPage from "src/features/mint/MintPage";
import MarketPage from "src/features/market/MarketPage";
import MyNFTsPage from "src/features/my-nfts/MyNFTsPage";


export const router = createBrowserRouter([
  {
    element: <MarketLayout />,
    children: [
      {
        path: "/",
        element: <MainPage />,
      },
      {
        path: "/mint",
        element: <MintPage />,
      },
      {
        path: "/market",
        element: <MarketPage />,
      },
      {
        path: "/my-nfts",
        element: <MyNFTsPage />,
      },
    ]
  },
]);


export default router;
