# NFT Marketplace DApp

SC6106 Blockchain Development Fundamentals - Group Project

A decentralized NFT marketplace where users can mint, list, buy, and transfer NFTs on the Ethereum Sepolia testnet.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.20, OpenZeppelin v5 |
| Frontend | React 19, TypeScript, Vite 8 |
| Web3 | web3.js 4, MetaMask |
| File Storage | Pinata (IPFS) |
| Deployment | Remix (contracts), Render (frontend) |

## Project Structure

```
nft-mkt/
├── src/
│   ├── contracts/
│   │   ├── nft.sol                  # ERC721 NFT contract with ERC2981 royalties
│   │   └── market.sol               # Marketplace contract (list/buy/cancel)
│   └── web/                         # React frontend
│       └── src/
│           ├── routes/              # Page routing
│           ├── layouts/             # Shared layout (header/footer)
│           ├── components/          # Reusable components
│           ├── features/            # Pages: MainPage, Mint, Market
│           ├── services/contracts/  # Contract ABIs and addresses
│           └── types/               # TypeScript type definitions
├── what_to_do.md                    # Action plan & task checklist
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MetaMask](https://metamask.io/) browser extension
- A [Pinata](https://pinata.cloud/) account (free tier)
- SepoliaETH for gas fees (free from [Sepolia Faucet](https://sepoliafaucet.com/))

## Setup & Run

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd nft-mkt
```

### 2. Configure environment variables

Create `src/web/.env`:

```env
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
```

### 3. Install dependencies and start dev server

```bash
cd src/web
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Connect MetaMask

1. Open MetaMask browser extension
2. Switch network to **Sepolia** testnet
3. The DApp will prompt you to connect your wallet

## Smart Contract Deployment (Remix)

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create new files and paste `nft.sol` and `market.sol`
3. Compile with Solidity 0.8.20
4. In "Deploy & Run", set Environment to **Injected Provider - MetaMask**
5. Make sure MetaMask is on **Sepolia** network
6. Deploy `NonFungibleToken` -> copy the contract address
7. Deploy `NonFungibleTokenMarketplace` -> pass your wallet address as the `admin` parameter -> copy the contract address
8. Update the contract addresses in:
   - `src/web/src/services/contracts/nft.ts`
   - `src/web/src/services/contracts/market.ts`

## Deploy Frontend to Render

1. Push code to GitHub
2. Go to [Render](https://render.com) -> New -> Static Site
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `src/web`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Add environment variables (`VITE_PINATA_API_KEY`, `VITE_PINATA_SECRET_KEY`)
6. Click Deploy

## Usage

| Feature | Description |
|---------|-------------|
| **Mint** | Upload an image, set name/description/royalty, mint as ERC721 NFT |
| **List** | Put your NFT on the marketplace with a price |
| **Buy** | Purchase a listed NFT (payment in SepoliaETH) |
| **Cancel** | Remove your NFT listing from the marketplace |

## Network

This DApp runs on **Ethereum Sepolia Testnet**. All transactions use free test ETH with no real monetary value. Get free SepoliaETH from faucets like https://sepoliafaucet.com.
