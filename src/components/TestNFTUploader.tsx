'use client';

import React, { useState } from 'react';
import { uploadImageToIPFS, uploadMetadataToIPFS } from '@/services/ipfs';
import type { NFTMetadata } from '@/types/nft';

const TestNFTUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [log, setLog] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
    } else {
      alert('Please select an image file');
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Please choose a file first');

    try {
      setLog('📤 Uploading image to IPFS...');
      const imageUrl = await uploadImageToIPFS(file);
      setLog(`✅ Image uploaded: ${imageUrl}`);

      const metadata: NFTMetadata = {
        name: 'Test NFT',
        description: 'This is a test NFT uploaded from React',
        image: imageUrl,
        attributes: [
          { trait_type: 'Speed', value: 42 },
          { trait_type: 'Type', value: 'Demo' },
        ],
      };

      setLog('🧾 Uploading metadata to IPFS...');
      const metadataUrl = await uploadMetadataToIPFS(metadata);
      setLog(`✅ Metadata uploaded: ${metadataUrl}`);
    } catch (err: any) {
      setLog(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-900 text-white rounded-xl">
      <h2 className="text-xl font-bold mb-4">Test IPFS Upload</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
      <button
        onClick={handleUpload}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
      >
        Upload to IPFS
      </button>
      <pre className="mt-4 text-sm whitespace-pre-wrap">{log}</pre>
    </div>
  );
};

export default TestNFTUploader;
