import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { INITIAL_SUPPLY, isDevelopmentChain } from "../helper-hardhat.config";
import { verify } from "../utils/verify";

const deploy = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;
  let waitConfirmations = 1;
  console.log("ChaindId", chainId);

  const contract = await deploy("OurToken", {
    from: deployer,
    args: [INITIAL_SUPPLY],
    log: true,
    waitConfirmations,
  });

  console.log("OurToken contract is deployed to ", contract.address);

  if (!isDevelopmentChain(chainId)) {
    await verify(contract.address, [INITIAL_SUPPLY]);
  }
};

export default deploy;
deploy.tags = ["all", "lottery"];
