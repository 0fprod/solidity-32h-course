export const networkConfigHelper: any = {
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
  31337: {
    name: "hardhat",
  },
};

export const INITIAL_SUPPLY = "1000000000000000000000000";

export const isDevelopmentChain = (chainId?: number) => {
  const HARDHAT_CHAIN_ID = 31337;
  if (!chainId) chainId = HARDHAT_CHAIN_ID;
  const developmentNetworkNames = ["hardhat", "localhost"];

  return developmentNetworkNames.includes(networkConfigHelper[chainId].name);
};
