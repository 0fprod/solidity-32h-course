import {ethers} from 'ethers'
import fs from 'fs-extra'
import dotenv from 'dotenv'
dotenv.config(); 

async function main() {
  const privateKey = process.env.PRIVATE_KEY ?? '';
  const providerRpcUrl = process.env.RPC_URL ?? '';
  const provider = new ethers.providers.JsonRpcProvider(providerRpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const abi = fs.readFileSync("./abi/SimpleStorage_sol_SimpleStorage.abi", "utf-8");
  const bin = fs.readFileSync("./bin/SimpleStorage_sol_SimpleStorage.bin", "utf-8");
  const contractFactory = new ethers.ContractFactory(abi, bin, wallet); 
  console.log("Deploying contract...");
  const contract= await contractFactory.deploy();
  contract.deployTransaction.wait(1);
  console.log('Contract deployed to ', contract.address)
  const txResponse = await contract.store("97");
  const txReceipt = await txResponse.wait(1);
  const updatedFavNum = await contract.retrieve();
  console.log("🚀 ~ updatedFavNum", updatedFavNum.toString());
}

main();
