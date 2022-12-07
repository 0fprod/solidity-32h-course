import { ethers } from "hardhat"

export const networkConfigHelper: any = {
  5: {
    name: "goerli",
    vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    entranceFee: ethers.utils.parseEther("0.1"),
    gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: "0", // overwritten witht he mock address onDeployment
    callbackGasLimit: "500000",
    interval: "30",
  },
  31337: {
    name: "hardhat",
    vrfCoordinatorV2: "", // overwritten witht he mock address onDeployment
    entranceFee: ethers.utils.parseEther("0.1"),
    gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    subscriptionId: "0", // overwritten witht he mock address onDeployment
    callbackGasLimit: "500000",
    interval: "30",
  },
}

export const DECIMALS = 8
export const INITIAL_ANSWER = 200000000000

export const isDevelopmentChain = (chainId?: number) => {
  const HARDHAT_CHAIN_ID = 31337
  if (!chainId) chainId = HARDHAT_CHAIN_ID
  const developmentNetworkNames = ["hardhat", "localhost"]

  return developmentNetworkNames.includes(networkConfigHelper[chainId].name)
}
