// walletconnect.js
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

let provider;
let signer;

async function connectWallet() {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const address = await signer.getAddress();
    console.log("Connected to MetaMask:", address);
    alert("Wallet Connected: " + address);
  } else {
    alert("MetaMask or WalletConnect not found.");
  }
}

document.getElementById("btnConnect").addEventListener("click", connectWallet);
