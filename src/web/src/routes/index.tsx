/* Copyright (c) 2026 Yao Zeran
 * 
 *  */


import { createBrowserRouter } from "react-router-dom";

import MarketLayout from "../layouts/MarketLayout";
import MainPage from "../features/MainPage";
import MintPage from "src/features/mint/MintPage";
import MarketPage from "src/features/market/MarketPage";


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
    ]
  },
]);


export default router;
