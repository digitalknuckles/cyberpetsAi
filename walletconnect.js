import { ethers } from './ethers-5.7.esm.min.js';

// Your deployed smart contract address and ABI
const CONTRACT_ADDRESS = '0x7eFC729a41FC7073dE028712b0FB3950F735f9ca';
const ABI = [
  // Only include the functions you need; for minting:
  {
    inputs: [],
    name: 'mintPrize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

// WalletConnect provider setup (if using WalletConnect v2 or MetaMask Mobile)
let provider;
let signer;
let contract;

/**
 * Connects the wallet and initializes provider, signer, and contract.
 */
export async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      console.log('✅ Wallet connected');
      return signer;
    } catch (err) {
      console.error('❌ Wallet connection failed:', err);
      throw err;
    }
  } else {
    alert('Please install MetaMask or a WalletConnect-compatible wallet.');
    throw new Error('No wallet found');
  }
}

/**
 * Calls the mintPrize function on the smart contract.
 */
export async function mintPrize() {
  if (!contract) {
    await connectWallet(); // Auto-connect if not yet connected
  }

  try {
    const tx = await contract.mintPrize();
    console.log('🎉 Minting transaction sent:', tx.hash);
    await tx.wait();
    console.log('✅ Prize minted!');
  } catch (err) {
    console.error('❌ Minting failed:', err);
    throw err;
  }
}
import { ethers } from './ethers-5.7.esm.min.js';  // Importing ethers for interaction with the contract

// Your contract address and ABI
const CONTRACT_ADDRESS = '0x7eFC729a41FC7073dE028712b0FB3950F735f9ca';
const ABI = [
  {
    inputs: [],
    name: 'mintPrize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

// Declare variables for provider, signer, and contract
let provider;
let signer;
let contract;

/**
 * Connects to the user's wallet using MetaMask or other supported providers.
 */
export async function connectWallet() {
  if (window.ethereum) {
    try {
      // Request wallet connection
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Initialize ethers provider and signer
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      console.log('✅ Wallet connected successfully!');
      return signer;
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      throw error;
    }
  } else {
    alert('Please install MetaMask or a compatible wallet.');
    throw new Error('No wallet found');
  }
}

/**
 * Mints the prize by calling the `mintPrize` function on the contract.
 */
export async function mintPrize() {
  if (!contract) {
    await connectWallet(); // Connect if not already connected
  }

  try {
    const tx = await contract.mintPrize();
    console.log('🎉 Minting transaction sent:', tx.hash);
    await tx.wait();  // Wait for the transaction to be mined
    console.log('✅ Prize minted successfully!');
  } catch (error) {
    console.error('❌ Failed to mint prize:', error);
    throw error;
  }
}
