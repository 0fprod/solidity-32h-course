const { ethers } = require("hardhat");

async function main() {
  // const [deployer] = await ethers.getSigners();
  // console.log("Deploying contracts with the account:", deployer.address);
  // console.log("Account balance:", (await deployer.getBalance()).toString());
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying contract...");
  const simpleStorage = await SimpleStorage.deploy();
  console.log("Deployed at ", simpleStorage.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
  https://youtu.be/gyMwXuJrbJQ?t=31883