// types/nft.ts

// Form data structure for user input
export interface NFTFormData {
  title: string;
  description: string;
  image: File | null;
}

// Minting status for UI state
export interface MintingState {
  isUploading: boolean;
  isMinting: boolean;
  status: 'idle' | 'uploading' | 'minting' | 'success' | 'error';
  error?: string;
  txHash?: string;
}

// OpenSea-compliant NFT metadata structure
export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URL or CID
  attributes?: Array<{
    trait_type: string;
    value: string | number;
    display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date';
    max_value?: number;
  }>;
  external_url?: string;
  background_color?: string; // Hex without #
  animation_url?: string;
  youtube_url?: string;
}
