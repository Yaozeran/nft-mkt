/* Copyright (c) 2026 Yao Zeran
 * 
 * The mint page for users to register their digital assets as nft */


import React from "react";

import NonFungibleTokenForm from "./components/NonFungibleTokenForm";


const MintPage: React.FC = () => {
  return (
    <main>
      <NonFungibleTokenForm />
    </main>
  );
}


export default MintPage
