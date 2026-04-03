# NFT Marketplace - Action Plan

## Phase 1: Fix Code Bugs

### Step 1 - Fix nft.sol Compilation Error & Add totalSupply `[x]`

- **Bug:** Event `AssetMinted` declaration (line 33) missing semicolon `)` → `);` — contract won't compile
- **Missing feature:** `_nextTokenId` is private, frontend can't read it
- Add `totalSupply()` public function:
  ```solidity
  function totalSupply() external view returns (uint256) {
      return _nextTokenId;
  }
  ```
- Update ABI in `src/web/src/services/contracts/nft.ts` to include `totalSupply` entry

File: `src/contracts/nft.sol`, `src/web/src/services/contracts/nft.ts`

### Step 2 - Fix Frontend Contract Method Names `[x]`

The marketplace component calls wrong method names that don't match the smart contract:

- `marketplace.methods.listNFT()` → `marketplace.methods.list()`
- `marketplace.methods.buyNFT()` → `marketplace.methods.buy()`
- `marketplace.methods.cancelListing()` → `marketplace.methods.cancel()`
- `nftContract.methods._tokenIds()` → `nftContract.methods.totalSupply()`

File: `src/web/src/features/market/components/NonFungibleTokenMarket.tsx`

### Step 3 - Fix Token ID Loop (Off-by-One) `[x]`

Token IDs start at 0 (from `_nextTokenId++`), but the loop starts at 1:

- `for (let i = 1; i <= totalSupply; i++)` → `for (let i = 0; i < Number(totalSupply); i++)`

File: `src/web/src/features/market/components/NonFungibleTokenMarket.tsx`

### Step 4 - Extract Web3 Context `[x]`

Mint and Market pages each independently connect to MetaMask (duplicated code).

- Create shared `Web3Context` at `src/web/src/contexts/Web3Context.tsx`
- Provide `web3`, `account`, `nftContract`, `marketplaceContract` to all pages
- Remove duplicated init logic from `NonFungibleTokenForm.tsx` and `NonFungibleTokenMarket.tsx`
- Also fixes: MintPage was missing `eth_requestAccounts` call

### Step 5 - Fix Header / Footer `[x]`

- `MarketHeader.tsx`: Currently empty — add project name + wallet address display
- `MarketFooter.tsx`: Fix component name typo `MartFooter` → `MarketFooter`
- `MarketLayout.tsx`: Wrap with `<Web3Provider>`

### Step 6 - Add Error Handling & Loading State `[x]`

- Add try-catch to list/buy/cancel functions in marketplace (currently silent failure)
- Add loading indicator while marketplace NFTs are being fetched

---

## Phase 2: Deploy Contracts to Sepolia

### Step 7 - Deploy via Remix `[X]`

1. Open https://remix.ethereum.org
2. Paste **fixed** `nft.sol` and `market.sol`
3. Solidity Compiler → select 0.8.20 → Compile both
4. Deploy & Run → Environment: "Injected Provider - MetaMask"
5. MetaMask must be on Sepolia network
6. Deploy `NonFungibleToken` first → record contract address A
7. Deploy `NonFungibleTokenMarketplace(admin)` → pass your wallet address → record contract address B
8. Each deploy costs a small amount of SepoliaETH (< 0.01)

### Step 8 - Update Contract Addresses in Frontend `[X]`

Update the addresses obtained from Step 7:

- `src/web/src/services/contracts/nft.ts` → `contractAddress = "address A"`
- `src/web/src/services/contracts/market.ts` → `contractAddress = "address B"`

---

## Phase 3: Configure Pinata (IPFS)

### Step 9 - Get Pinata API Keys `[X]`

1. Register at https://pinata.cloud (free tier: 1GB storage)
2. Go to API Keys page, create a new key
3. Create `src/web/.env`:
   ```
   VITE_PINATA_API_KEY=your_key
   VITE_PINATA_SECRET_KEY=your_secret
   ```

---

## Phase 4: Local Testing

### Step 10 - Start Frontend `[X]`

```bash
cd src/web
npm install
npm run dev
# Open http://localhost:5173
```

### Step 11 - Test Mint `[X]`

1. Connect MetaMask (Sepolia network)
2. Go to Mint page
3. Fill in name, description, royalty %, select an image
4. Click Mint → MetaMask confirms transaction → wait for on-chain confirmation
5. NFT is now minted (image on IPFS, record on-chain)

### Step 12 - Test List `[X]`

1. Go to Market page
2. Enter Token ID (e.g. **0**, first minted token) and price in ETH
3. Click List → MetaMask pops up twice: first for approve, second for list
4. NFT card appears on marketplace with image and price

### Step 13 - Test Buy `[ ]`

1. Switch to a different MetaMask account (or have a teammate use their wallet)
2. Refresh Market page, see the listed NFT
3. Click Buy → MetaMask confirms payment
4. NFT transfers to buyer, seller receives ETH (minus fee and royalty)

### Step 14 - Test Cancel `[]`

1. List an NFT, then click Cancel Listing
2. Listing should disappear from marketplace

---

## Phase 5: Deploy Frontend to Render

### Step 15 - Deploy `[ ]`

1. Push code to GitHub
2. Register at https://render.com, connect GitHub
3. New → Static Site
4. Select repo, configure:
   - Root Directory: `src/web`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
5. Add environment variables: `VITE_PINATA_API_KEY`, `VITE_PINATA_SECRET_KEY`
6. Deploy → get a public URL in a few minutes

---

## Phase 6: Assignment Deliverables

### Step 16 - PowerPoint (20 slides) `[ ]`

Follow the suggested structure in the assignment brief.

### Step 17 - Written Summary (500-800 words) `[ ]`

Cover: problem background, blockchain rationale, design decisions, security analysis, limitations, future improvements.

### Step 18 - Video Recording (10 minutes) `[ ]`

- Team introduction (1 min)
- Problem & use case (1 min)
- Architecture (2 min)
- Smart contract walkthrough (2 min)
- Demo (2 min)
- Conclusion (1 min)
