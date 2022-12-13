import { Contract } from "ethers"
import { ethers, network } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { isDevelopmentChain, networkConfigHelper } from "../helper-hardhat.config"
import { verify } from "../utils/verify"

const createSubscription = async (contractMock: Contract) => {
  const txResponse = await contractMock.createSubscription()
  const txReceipt = await txResponse.wait(1)
  return txReceipt.events[0].args.subId // @chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol#179
}

const deploy = async ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const { chainId } = network.config
  let VRFCoordinatorV2Address
  let subId
  let waitConfirmations = 1
  console.log("ChaindId", chainId)

  if (isDevelopmentChain(chainId)) {
    console.log("------------------------------")
    console.log("Getting mocks for local deployment...")
    const mockDeployment = await deployments.get("VRFCoordinatorV2Mock")
    const mock = await ethers.getContractAt(mockDeployment.abi, mockDeployment.address)
    console.log("🚀 ~ get VRFCoordinatorV2Mock ContractAt", mockDeployment.address)
    VRFCoordinatorV2Address = mock.address
    subId = await createSubscription(mock)
    await mock.fundSubscription(subId, ethers.utils.parseEther("30"))
    console.log("------------------------------")
  } else {
    VRFCoordinatorV2Address = networkConfigHelper[chainId!].vrfCoordinatorV2
    waitConfirmations = 6
    subId = networkConfigHelper[chainId!].subscriptionId
  }

  const args = [
    VRFCoordinatorV2Address,
    subId,
    networkConfigHelper[chainId!].gasLane,
    networkConfigHelper[chainId!].interval,
    networkConfigHelper[chainId!].entranceFee,
    networkConfigHelper[chainId!].callbackGasLimit,
  ]

  const contract = await deploy("Lottery", {
    from: deployer,
    args,
    log: true,
    waitConfirmations,
  })

  // Ensure the Raffle contract is a valid consumer of the VRFCoordinatorV2Mock contract.
  if (isDevelopmentChain(chainId)) {
    const mockDeployment = await deployments.get("VRFCoordinatorV2Mock")
    const vrfCoordinatorV2Mock = await ethers.getContractAt(mockDeployment.abi, mockDeployment.address)
    await vrfCoordinatorV2Mock.addConsumer(subId, contract.address)
  }

  console.log("Lottery contract is deployed to ", contract.address)

  if (!isDevelopmentChain(chainId)) {
    await verify(contract.address, args)
  }
}

export default deploy
deploy.tags = ["all", "lottery"]
