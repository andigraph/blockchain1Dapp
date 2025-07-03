// --- Bagian yang perlu Anda UBAH ---

// 1. Ganti dengan ALAMAT KONTRAK Lock.sol Anda yang berhasil di-deploy ke Hardhat Localhost.
//    Anda mendapatkan alamat ini dari output terminal saat menjalankan `npx hardhat ignition deploy ...`
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // <<< GANTI DENGAN ALAMAT ANDA

// 2. ABI (Application Binary Interface) dari kontrak Lock.sol Anda.
//    Anda bisa menemukannya di proyek Hardhat Anda: D:\blockchain-project\artifacts\contracts\Lock.sol\Lock.json
//    Buka file Lock.json, cari bagian `abi`, lalu salin seluruh array JSON-nya.
const CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_unlockTime",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "when",
          "type": "uint256"
        }
      ],
      "name": "Withdrawal",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address payable",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unlockTime",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]; // <<< GANTI DENGAN ABI ASLI DARI Lock.json ANDA

// --- Akhir Bagian yang perlu Anda UBAH ---


// Elemen DOM
const connectButton = document.getElementById("connectButton");
const accountAddressSpan = document.getElementById("accountAddress");
const getUnlockTimeButton = document.getElementById("getUnlockTimeButton");
const unlockTimeDisplay = document.getElementById("unlockTimeDisplay");
const statusDiv = document.getElementById("status");

let provider;
let signer;
let lockContract;

// Fungsi untuk menampilkan pesan status
function setStatus(message, color = "blue") {
    statusDiv.textContent = message;
    statusDiv.style.color = color;
}

// Fungsi untuk terhubung ke MetaMask
async function connectMetaMask() {
    if (typeof window.ethereum !== "undefined") {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            const account = accounts[0];
            accountAddressSpan.textContent = account;
            setStatus("MetaMask connected successfully!", "green");

            // Initialize Ethers.js provider and signer
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            // Initialize contract instance
            lockContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            // Dapatkan dan tampilkan unlock time setelah terhubung
            getUnlockTime();

        } catch (error) {
            console.error("User denied account access or other error:", error);
            setStatus("Failed to connect MetaMask. Please allow access.", "red");
        }
    } else {
        setStatus("MetaMask is not installed. Please install it!", "red");
        console.error("MetaMask is not installed!");
    }
}

// Fungsi untuk mendapatkan unlockTime dari kontrak
async function getUnlockTime() {
    if (!lockContract) {
        setStatus("Contract not initialized. Connect MetaMask first.", "orange");
        return;
    }
    try {
        setStatus("Fetching unlock time...");
        const time = await lockContract.unlockTime();
        // Waktu di blockchain adalah Unix timestamp (detik sejak 1 Januari 1970 UTC)
        // Kita ubah ke milidetik untuk membuat objek Date JavaScript
        const unlockDate = new Date(time.toNumber() * 1000); // .toNumber() karena Ethers mengembalikan BigNumber
        unlockTimeDisplay.textContent = unlockDate.toLocaleString(); // Tampilkan dalam format tanggal & waktu lokal yang mudah dibaca
        setStatus("Unlock time retrieved successfully!", "green");
    } catch (error) {
        console.error("Error getting unlock time:", error);
        setStatus("Failed to retrieve unlock time. Check console for details.", "red");
    }
}

// Event Listeners
connectButton.addEventListener("click", connectMetaMask);
getUnlockTimeButton.addEventListener("click", getUnlockTime);

// Coba hubungkan secara otomatis jika sudah ada koneksi sebelumnya
window.addEventListener('load', async () => {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            accountAddressSpan.textContent = accounts[0];
            setStatus("MetaMask already connected. Initializing contract...", "green");
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            lockContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            getUnlockTime();
        } else {
            setStatus("Connect MetaMask to interact with the DApp.", "blue");
        }
    } else {
        setStatus("MetaMask is not installed. Please install it!", "red");
    }
});

// Deteksi perubahan akun MetaMask
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            setStatus("MetaMask disconnected.", "orange");
            accountAddressSpan.textContent = "Not connected";
            unlockTimeDisplay.textContent = "Loading...";
            provider = null;
            signer = null;
            lockContract = null;
        } else {
            connectMetaMask(); // Rekoneksi dengan akun baru
        }
    });
}