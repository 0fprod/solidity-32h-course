import fs from "fs"
import { deployments, network } from "hardhat"
const CONTRACT_PATH = "../frontend/src/constants/contractAddress.json"
const ABI_PATH = "../frontend/src/constants/abi.json"

const deploy = async () => {
  console.log("Updating frontend files...")
  await updateContractAddress()
  await updateAbi()
}

const updateContractAddress = async () => {
  console.log("Updating contract address...")
  const lottery = await deployments.get("Lottery")
  const chainId = network.config.chainId?.toString() ?? ""
  const currentAddresses = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"))
  if (!chainId) return

  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(lottery.address)) {
      currentAddresses[chainId].push(lottery.address)
      console.log(`Pushed { [${chainId}]: [${lottery.address}]}`)
    }
  } else {
    currentAddresses[chainId] = [lottery.address]
    console.log(`Created { [${chainId}]: [${lottery.address}]}`)
  }

  fs.writeFileSync(CONTRACT_PATH, JSON.stringify(currentAddresses))
}

const updateAbi = async () => {
  console.log("Updating ABI")
  const lottery = await deployments.get("Lottery")
  fs.writeFileSync(ABI_PATH, JSON.stringify(lottery.abi))
}

export default deploy
deploy.tags = ["all", "frontend"]
