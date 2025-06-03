Description:
A complete NFT minting dApp using Next.js, TypeScript, Wagmi, and IPFS (Pinata). It allows users to upload an image, create OpenSea-standard metadata, and mint the NFT on the Ethereum Sepolia network.

Prerequisites:
- Node.js v18 or later
- Git
- MetaMask browser extension
- VS Code
- Pinata account (for IPFS)
- Alchemy account (for Ethereum RPC)

Project Setup:

1. Create Next.js App
npx create-next-app@latest nft-minting-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd nft-minting-app

2. Install Dependencies
npm install wagmi viem @tanstack/react-query
npm install pinata-web3 axios
npm install lucide-react clsx tailwind-merge

3. Install Dev Dependencies
npm install -D @types/node

nft-minting-app/
│
├── public/                      # Static assets
│   └── favicon.ico             # Favicon
│
├── src/                        # Source code
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx         # Root layout (Wagmi/Query providers)
│   │   └── page.tsx           # Home page (renders NFTMintingApp)
│
│   ├── components/             # React components
│   │   ├── NFTMintingApp.tsx  # Main NFT minting UI logic
│   │   └── TestNFTUploader.tsx# Dev tool for testing IPFS uploads
│
│   ├── config/                 # App configurations
│   │   └── wagmi.ts            # Wagmi chain and connector config
│
│   ├── constants/              # Constants like contract address & ABI
│   │   └── contract.ts         # Contract ABI and address
│
│   ├── hooks/                  # Custom Wagmi + contract hooks
│   │   └── useNFTContract.ts   # Hook for minting via NFT contract
│
│   ├── services/               # IPFS / Pinata API functions
│   │   └── ipfs.ts             # Upload image & metadata to IPFS
│
│   ├── types/                  # TypeScript type definitions
│   │   └── nft.ts              # NFTFormData, MintingState, NFTMetadata
│
│   ├── styles/                 # Global CSS or Tailwind (optional)
│   │   └── globals.css         # TailwindCSS base styles
│
│   └── utils/                  # Utility functions (optional)
│       └── helpers.ts          # Any shared utilities
│
├── .env.local                  # Environment variables (not committed)
├── .gitignore                  # Git ignored files
├── next.config.js              # Next.js config
├── package.json                # Dependencies & scripts
├── tailwind.config.ts          # TailwindCSS config
├── tsconfig.json               # TypeScript paths and compiler options
└── README.md                   # Project documentation
