import { ethers, run, network } from "hardhat";

async function main() {
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying contract...");
  const simpleStorage = await SimpleStorage.deploy();
  console.log("Deployed at ", simpleStorage.address);

  if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
    await simpleStorage.deployTransaction.wait(6); // wait 6 blocks to make sure its deployed before verification
    await verify(simpleStorage.address, []);
  }

}

// args for the contract constructor
async function verify(contractAddress: any, args: any) {
  // only works for etherscan (might not work for other blockexplorers)
  // https://docs.etherscan.io/tutorials/verifying-contracts-programmatically
  // we can follow that guide or use a hardhat plugin
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.error(error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
