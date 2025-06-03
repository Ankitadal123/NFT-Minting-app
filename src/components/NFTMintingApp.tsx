'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Upload, Wallet, CheckCircle, AlertCircle, Camera, Loader2 } from 'lucide-react';
import { useNFTContract } from '@/hooks/useNFTContract';
import { uploadImageToIPFS, uploadMetadataToIPFS } from '@/services/ipfs';
import type { NFTMetadata, NFTFormData } from '@/types/nft';

type Step = 'minting' | 'confirmation' | 'wallet';
type MintStatus = 'idle' | 'uploading' | 'minting' | 'success' | 'error';

const NFTMintingApp = () => {
  const [currentStep, setCurrentStep] = useState<Step>('minting');
  const [formData, setFormData] = useState<NFTFormData>({
    title: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [mintStatus, setMintStatus] = useState<MintStatus>('idle');
  const [error, setError] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const { disconnect } = useDisconnect();
  const { mint, isPending, isConfirming, isSuccess, error: contractError } = useNFTContract();

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setFormData(prev => ({ ...prev, image: file }));
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleInputChange = useCallback((field: keyof NFTFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleMint = useCallback(async () => {
    if (!isConnected || !address) {
      setCurrentStep('wallet');
      return;
    }
    
    if (!formData.image || !formData.title || !formData.description) {
      setError('Please fill all required fields');
      return;
    }

    setCurrentStep('confirmation');
    setMintStatus('uploading');
    setError('');

    try {
      const imageUri = await uploadImageToIPFS(formData.image);
      const metadata: NFTMetadata = {
        name: formData.title,
        description: formData.description,
        image: imageUri,
        attributes: []
      };
      const metadataUri = await uploadMetadataToIPFS(metadata);
      
      setMintStatus('minting');
      await mint(address, metadataUri);
      
    } catch (err) {
      setMintStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
    }
  }, [address, formData, isConnected, mint]);

  const resetForm = useCallback(() => {
    setFormData({ title: '', description: '', image: null });
    setImagePreview('');
    setCurrentStep('minting');
    setMintStatus('idle');
    setError('');
  }, []);

  useEffect(() => {
    if (isSuccess) {
      setMintStatus('success');
      resetForm();
    } else if (contractError) {
      setMintStatus('error');
      setError(contractError.message);
    }
  }, [isSuccess, contractError, resetForm]);

  const isFormValid = Boolean(formData.title && formData.description && formData.image);
  const isLoading = mintStatus === 'uploading' || mintStatus === 'minting' || isPending || isConfirming;

  if (currentStep === 'wallet') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
            <p className="text-gray-300">Connect your wallet to start minting NFTs</p>
          </div>
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
          >
            Connect Wallet
          </button>
          <button
            onClick={() => setCurrentStep('minting')}
            className="w-full text-gray-300 hover:text-white transition-colors duration-200 mt-6 text-center"
          >
            Back to Minting
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20">
          {mintStatus === 'success' ? (
            <>
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">NFT Minted Successfully!</h2>
              <button
                onClick={resetForm}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
              >
                Mint Another NFT
              </button>
            </>
          ) : mintStatus === 'error' ? (
            <>
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Minting Failed</h2>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={() => setCurrentStep('minting')}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {mintStatus === 'uploading' ? 'Uploading to IPFS...' : 'Minting NFT...'}
              </h2>
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-4">
                  {imagePreview && (
                    <img src={imagePreview} alt="NFT Preview" className="w-16 h-16 rounded-lg object-cover" />
                  )}
                  <div className="text-left">
                    <h3 className="text-white font-semibold">{formData.title}</h3>
                    <p className="text-gray-300 text-sm">{formData.description}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex justify-between items-center p-6">
        <div className="text-white">
          <h1 className="text-2xl font-bold">NFT Minter</h1>
          <p className="text-gray-300">Create and mint your unique NFT</p>
        </div>
        <button
          onClick={isConnected ? () => disconnect() : () => setCurrentStep('wallet')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2"
        >
          <Wallet className="w-4 h-4" />
          <span>{isConnected ? 'Disconnect' : 'Connect Wallet'}</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Create Your NFT</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}
          
          <div className="mb-8">
            <label className="block text-white font-semibold mb-3">Upload Image *</label>
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                imagePreview 
                  ? 'border-purple-400/50 bg-purple-500/5' 
                  : 'border-white/30 hover:border-white/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative group">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-w-full h-48 object-cover rounded-lg mx-auto transition-all duration-200 group-hover:brightness-75" 
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-8 h-8 text-white mx-auto mb-2" />
                      <p className="text-white text-sm">Change Image</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
                  <p className="text-white/80 mb-2">Click to upload image</p>
                  <p className="text-white/60 text-sm">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">
              Title *
              <span className="text-gray-400 font-normal text-sm ml-2">
                ({formData.title.length}/50)
              </span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value.slice(0, 50))}
              placeholder="Enter NFT title"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
            />
          </div>

          <div className="mb-8">
            <label className="block text-white font-semibold mb-3">
              Description *
              <span className="text-gray-400 font-normal text-sm ml-2">
                ({formData.description.length}/200)
              </span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value.slice(0, 200))}
              placeholder="Describe your NFT"
              rows={4}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 resize-none"
            />
          </div>

          <button
            onClick={handleMint}
            disabled={!isFormValid || isLoading}
            className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
              !isFormValid || isLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Mint NFT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTMintingApp;