import { ethers, network } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { isDevelopmentChain } from "../helper-hardhat.config"

const BASE_FEE = ethers.utils.parseEther("0.25") // 0.25 is premium https://docs.chain.link/docs/vrf/v2/subscription/supported-networks/#goerli-testnet
const GAS_PRICE_LINKS = 1e9 // based on the gas price of the chain. Its like LINKs per GAS unit

const deploy = async ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const { chainId } = network.config

  if (isDevelopmentChain(chainId)) {
    console.log("------------------------------")
    console.log("Deploying mocks to local network...")
    const mockDeployment = await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: [BASE_FEE, GAS_PRICE_LINKS],
      log: true,
    })
    console.log("VRFCoordinatorV2Mock deployed at ", mockDeployment.address)
    console.log("Please run `npm run local` to interact with the deployed smart contracts!")
    console.log("------------------------------")
  }
}

export default deploy
deploy.tags = ["all", "mocks"]
