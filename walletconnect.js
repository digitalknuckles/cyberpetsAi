// walletconnect.js

const projectId = "15da3c431a74b29edb63198a503d45b5";

const metadata = {
  name: "CyberPetsAi Trainer",
  description: "Mint a prize NFT when your CyberPet reaches full health + training!",
  url: "https://digitalknuckles.github.io/MoveToMint/",
  icons: ["https://digitalknuckles.github.io/MoveToMint/icon.png"]
};

const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider.default,
    options: {
      infuraId: projectId
    }
  }
};

const web3Modal = new window.Web3Modal.default({
  cacheProvider: true,
  providerOptions,
  theme: "light",
  metadata
});

window.connectWallet = async function () {
  try {
    const provider = await web3Modal.connect();
    const web3Provider = new window.ethers.providers.Web3Provider(provider);
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    console.log("🔌 Wallet connected:", address);
    return { provider: web3Provider, signer, address };
  } catch (err) {
    console.error("❌ Wallet connection failed:", err);
    alert("❌ Failed to connect wallet: " + (err.message || err));
    return null;
  }
};

window.mintPrizeNFT = async function () {
  const wallet = await window.connectWallet();
  if (!wallet) return;

  try {
    const contract = new window.ethers.Contract(
      "0x36b8192ef6bc601dcf380af0fa439ba8b78417cb",
      [
        {
          inputs: [],
          name: "mintPrize",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        }
      ],
      wallet.signer
    );

    const tx = await contract.mintPrize();
    await tx.wait();
    alert("🎉 NFT Minted Successfully!");
  } catch (err) {
    console.error("❌ Minting failed:", err);
    alert("❌ Minting failed: " + (err.reason || err.message || err));
  }
};

// Optional: Enable connect button after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("btnConnect");
  if (connectBtn) {
    connectBtn.disabled = false;
    connectBtn.addEventListener("click", async () => {
      const wallet = await window.connectWallet();
      if (wallet) {
        alert("✅ Wallet connected: " + wallet.address);
      }
    });
  }
});
