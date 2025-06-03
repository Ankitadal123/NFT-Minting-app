// services/ipfs.ts

import { PinataSDK } from 'pinata-web3';
import type { NFTMetadata } from '@/types/nft';

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY!,
});

/**
 * Upload an image to IPFS using Pinata
 */
export const uploadImageToIPFS = async (file: File): Promise<string> => {
  try {
    const upload = await pinata.upload.file(file);
    return `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${upload.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    throw new Error('Failed to upload image to IPFS');
  }
};

/**
 * Upload OpenSea-standard metadata JSON to IPFS
 */
export const uploadMetadataToIPFS = async (metadata: NFTMetadata): Promise<string> => {
  try {
    const upload = await pinata.upload.json(metadata);
    return `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${upload.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
};
