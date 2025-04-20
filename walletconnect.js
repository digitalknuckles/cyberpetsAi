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
