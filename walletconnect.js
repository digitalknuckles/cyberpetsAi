// Import ethers (only once at the top)
import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js';

// Import WalletConnect provider
import { Web3Provider } from 'https://cdn.jsdelivr.net/npm/@walletconnect/web3-provider@1.6.6/dist/umd/index.min.js';

// Your contract address and ABI
const CONTRACT_ADDRESS = '0x36b8192ef6bc601dcf380af0fa439ba8b78417cb';
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
 * Connects to the user's wallet using MetaMask or WalletConnect.
 * Checks if the wallet is already connected, and requests account access if not.
 */
export async function connectWallet() {
  if (window.ethereum) {
    // MetaMask is installed, use it
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });

      if (accounts.length === 0) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }

      // Initialize ethers provider and signer
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      console.log('✅ MetaMask wallet connected successfully!');
      return signer;
    } catch (error) {
      console.error('❌ Failed to connect MetaMask wallet:', error);
      throw new Error('MetaMask connection failed');
    }
  } else {
    // MetaMask is not installed, fallback to WalletConnect
    try {
      const walletConnectProvider = new WalletConnectProvider({
        infuraId: "YOUR_INFURA_PROJECT_ID", // Replace with your Infura project ID
      });

      await walletConnectProvider.enable();  // Request connection to the wallet

      provider = new ethers.providers.Web3Provider(walletConnectProvider);
      signer = provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      console.log('✅ WalletConnect wallet connected successfully!');
      return signer;
    } catch (error) {
      console.error('❌ Failed to connect WalletConnect wallet:', error);
      throw new Error('WalletConnect connection failed');
    }
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

// Event listener for minting on victory
window.addEventListener("message", (event) => {
  const { action, message } = event.data;

  if (action === "victory-achieved") {
    alert(message);
    connectWallet()
      .then(() => {
        return mintPrize();
      })
      .then(() => {
        alert("🏆 NFT Minted Successfully!");
      })
      .catch((err) => {
        console.error("Minting error:", err);
        alert("Error minting NFT.");
      });
  }
});
