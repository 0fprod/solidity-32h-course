import { ethers } from "ethers";
import { contractAbi, contractAddress } from "./constants";

const connectBtn = document.getElementById("connect");
const fundBtn = document.getElementById("fund");
const withdrawBtn = document.getElementById("withdraw");
const getBalanceBtn = document.getElementById("getbalance");
const accoutput = document.getElementById("accoutput");
const contractoutput = document.getElementById("contractoutput");
const getAmountInput = document.getElementById("fundamount");

connectBtn.onclick = connect;
fundBtn.onclick = fund;
withdrawBtn.onclick = withdraw;
getBalanceBtn.onclick = getBalance;

let isConnected = false;
let provider;
let signer = "";
let contract;

async function connect() {
  if (typeof window["ethereum"] !== "undefined") {
    document.getElementById("connect").innerHTML = "Connected!";
    isConnected = true;
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractAbi, signer);
  }
}

async function fund() {
  if (isConnected) {
    let amount = getAmountInput.value == "" ? "0" : getAmountInput.value;
    console.log("🚀 ~ amount", amount);
    const txResponse = await contract.fund({
      value: ethers.utils.parseEther(amount),
    });
    await listenToTxMine(txResponse);
    console.log("Done");
  }
}

async function withdraw() {
  if (isConnected) {
    const txResponse = await contract.withdraw();
    await listenToTxMine(txResponse);
  }
}

async function getBalance() {
  if (isConnected) {
    let balance = await provider.getBalance(contractAddress);
    let acc = await provider.getBalance(
      "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
    );
    contractoutput.innerHTML = ethers.utils.formatEther(balance);
    accoutput.innerHTML = ethers.utils.formatEther(acc);
  }
}

function listenToTxMine(txResponse) {
  console.log("Mining ", txResponse.hash, "...");
  return new Promise((resolve, reject) => {
    provider.once(txResponse.hash, (txReceipt) => {
      console.log("Completed with ", txReceipt.confirmations, " confirmations");
      resolve();
    });
  });
}
