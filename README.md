# TipJar dApp

A minimal end-to-end decentralised tipping application built on Ethereum (Sepolia testnet).

## Live Demo
- Contract: `[DEPLOYED_ADDRESS]` — [View on Etherscan](https://sepolia.etherscan.io/address/0x1558264A38e9089790382E6cc467c6c566136D0e)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                         │
│  React + wagmi + RainbowKit                              │
│  ┌──────────────┐    ┌──────────────────────────────┐   │
│  │  TipForm     │    │  TipList                     │   │
│  │  Send ETH +  │    │  Poll GET /tips every 10s    │   │
│  │  message     │    │  Show from, amount, message  │   │
│  └──────┬───────┘    └──────────────┬───────────────┘   │
│         │ wagmi writeContract        │ fetch             │
└─────────┼────────────────────────────┼───────────────────┘
          │                            │
          ▼                            ▼
┌─────────────────┐         ┌──────────────────────┐
│  Ethereum Node  │         │  Backend API          │
│  Sepolia RPC    │         │  Node.js + Fastify    │
│                 │◄────────│  GET /tips            │
│  TipJar.sol     │         │  GET /tips/:address   │
│  - tip()        │         │  GET /status          │
│  - withdraw()   │         └──────────┬───────────┘
│  - NewTip event │                    │
└────────┬────────┘         ┌──────────▼───────────┐
         │                  │  Indexer              │
         │ NewTip events    │  - Poll for events    │
         └─────────────────►│  - N confirmations    │
                            │  - Reorg handling     │
                            │  - Persist state      │
                            └──────────┬───────────┘
                                       │
                            ┌──────────▼───────────┐
                            │  PostgreSQL           │
                            │  - tips table         │
                            │  - indexer_state      │
                            └──────────────────────┘
```

---

## Smart Contract

### TipJar.sol
- Anyone can call `tip(string memory message)` payable to send ETH with a message
- Owner (set in constructor) can call `withdraw()` to pull the full balance
- Emits `NewTip(address indexed from, uint256 amount, string message)` on every tip
- Uses checks-effects-interactions pattern to prevent reentrancy
- Uses OpenZeppelin ReentrancyGuard as an additional safety layer
- Custom errors for gas efficiency

### Security Decisions
- **Checks-Effects-Interactions**: Balance is updated before the ETH transfer in `withdraw()` to prevent reentrancy attacks
- **ReentrancyGuard**: Additional protection layer on `withdraw()`
- **Custom errors**: `NotOwner()`, `ZeroValue()`, `InsufficientBalance()` instead of require strings to save gas
- **No tx.origin**: All auth uses msg.sender

---

## Backend

### Event Indexer
- Connects to Sepolia via RPC_URL
- Polls for `NewTip` events in configurable batch sizes
- Persists `last_processed_block` in PostgreSQL — survives restarts without double-counting
- Waits for `CONFIRMATIONS` (default: 3) before inserting a tip — protects against reorgs
- On reorg detection, removes tips from reorged blocks

### API Endpoints
```
GET /tips                    Returns all tips, newest first
GET /tips/:address           Returns tips from a specific address
GET /status                  Returns { lastBlock, tipCount }
```

---

## Frontend

### Transaction Lifecycle
Every tip submission goes through four states:
- **idle**: Default, form ready to submit
- **pending**: Transaction submitted to mempool, waiting for confirmation
- **confirmed**: Transaction mined, success message shown
- **error**: Four sub-states handled separately:
  - User rejected the signature in their wallet
  - Gas underpriced (transaction dropped)
  - Contract revert (e.g. zero value)
  - Network error

---

## Setup

### Prerequisites
- Node.js 18+
- Docker (for PostgreSQL)
- A Sepolia RPC URL (Alchemy or Infura)
- A WalletConnect Project ID (cloud.walletconnect.com)

### 1. Clone and install
```bash
git clone https://github.com/thudardev/tip-jar
cd tipjar

# Install all dependencies
cd contracts && npm install && cd ..
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Start PostgreSQL
```bash
docker-compose up -d
```

### 3. Configure environment variables

**contracts/.env**
```
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
ETHERSCAN_API_KEY=your_etherscan_key
```

**backend/.env**
```
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
CONTRACT_ADDRESS=deployed_contract_address
CONTRACT_BLOCK=block_number_of_deployment
CONFIRMATIONS=3
DATABASE_URL=postgresql://tipjar:tipjar@localhost:5432/tipjar
PORT=3001
```

**frontend/.env**
```
VITE_API_URL=http://localhost:3001
VITE_CONTRACT_ADDRESS=deployed_contract_address
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

### 4. Deploy contract
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

### 5. Run tests
```bash
cd contracts
npx hardhat test
```

### 6. Start backend
```bash
cd backend
npm run dev
```

### 7. Start frontend
```bash
cd frontend
npm run dev
```

---


## Tech Stack
- **Smart Contract**: Solidity ^0.8.20, Hardhat, OpenZeppelin
- **Backend**: Node.js, TypeScript, Fastify, Ethers.js v6, PostgreSQL
- **Frontend**: React, TypeScript, Tailwind CSS, wagmi v2, RainbowKit, viem
- **Infrastructure**: Docker Compose, Sepolia testnet, Alchemy RPC

---

Built for ShaikTech Technical Assessment — June 2025