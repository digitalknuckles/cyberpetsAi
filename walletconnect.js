// Import ethers (only once at the top)
import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js';

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
 * Checks if the wallet is already connected, and requests account access if not.
 */
export async function connectWallet() {
  if (window.ethereum) {
    try {
      // Check if the wallet is already connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });

      if (accounts.length === 0) {
        // Request wallet connection if not already connected
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }

      // Initialize ethers provider and signer
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      console.log('✅ Wallet connected successfully!');
      return signer;
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      throw new Error('Connection to wallet failed');
    }
  } else {
    alert('Please install MetaMask or a compatible wallet.');
    throw new Error('No wallet found');
  }
}

/**
 * Mints the prize by calling the `mintPrize` function on the contract.
 * Ensures the wallet is connected before proceeding.
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
    throw new Error('Minting failed');
  }
}
