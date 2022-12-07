import { Lottery } from "../typechain-types"
import { ethers, getNamedAccounts, network, deployments } from "hardhat"
import { expect } from "chai"
import { isDevelopmentChain } from "../helper-hardhat.config"
import { VRFCoordinatorV2Mock } from "../typechain-types/@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock"
import { BigNumber } from "ethers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

if (isDevelopmentChain(network.config.chainId)) {
  describe("Lottery ", () => {
    let lottery: Lottery
    let VRFCoordinatorV2Mock: VRFCoordinatorV2Mock
    let minimumFee: BigNumber
    let interval: BigNumber
    let player: SignerWithAddress
    let accounts: Array<SignerWithAddress> = []

    beforeEach(async () => {
      // const { deployer } = await getNamedAccounts()
      // player = deployer
      accounts = await ethers.getSigners()
      player = accounts[0]
      await deployments.fixture("all")

      const mockDeployment = await deployments.get("VRFCoordinatorV2Mock")
      VRFCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", mockDeployment.address)

      const lotteryDeployment = await deployments.get("Lottery")
      lottery = await ethers.getContractAt("Lottery", lotteryDeployment.address)

      minimumFee = await lottery.getMinimumFee()
      interval = await lottery.getInterval()
    })

    it("initializes correctly", async () => {
      const lotteryState = await lottery.getLotteryState()
      const lotteryInterval = await lottery.getInterval()
      expect(lotteryState).to.eq(0)
      expect(lotteryInterval).to.eq(30) //networkid.chainid.interval
    })

    it("gets the minimum fee", async () => {
      const minFee = await lottery.getMinimumFee()
      expect(minFee.toString()).to.eq(minimumFee.toString())
    })

    it("reject players that pay less than 0.1ETH", async () => {
      await expect(
        lottery.enterLottery({
          value: ethers.utils.parseEther("0.05"),
        })
      ).to.be.revertedWithCustomError(lottery, "Lottery__NotEnoughEth")
    })

    it("allow players with enough ETH to enter the lottery", async () => {
      await lottery.enterLottery({
        value: ethers.utils.parseEther("0.1"),
      })
      const numberOfParticipants = (await lottery.getNumberOfParticipants()).toString()
      const playerAddress = await lottery.getParticipantsAt(0)
      expect(numberOfParticipants).to.eq("1")
      expect(playerAddress).to.eq(player.address)
    })

    it("emits an event when a player enter the lottery", async () => {
      await expect(
        lottery.enterLottery({
          value: ethers.utils.parseEther("0.1"),
        })
      ).to.emit(lottery, "LotteryEnter")
    })

    it("rejects players when lottery is calculating", async () => {
      await lottery.enterLottery({
        value: ethers.utils.parseEther("0.1"),
      })

      await increaseTimeAndMine()
      await lottery.performUpkeep([])
      await expect(
        lottery.enterLottery({
          value: ethers.utils.parseEther("0.1"),
        })
      ).to.be.revertedWithCustomError(lottery, "Lottery__IsNotOpen")
    })

    it("doesnt checkUpkeep if there are no funds", async () => {
      await increaseTimeAndMine()
      // simulate a tx with callStatic
      const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]) // [] is equivalent to 0x which means its a blank byte object
      expect(upkeepNeeded).to.eq(false)
    })

    it("doesnt checkUpkeep if lottery is not open", async () => {
      await lottery.enterLottery({
        value: ethers.utils.parseEther("0.1"),
      })
      await increaseTimeAndMine()
      await lottery.performUpkeep([])
      const lotteryState = await lottery.getLotteryState()
      const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([])
      expect(lotteryState.toString()).to.eq("1")
      expect(upkeepNeeded).to.eq(false)
    })

    it("reverts if checkupkeep is false", async () => {
      await expect(lottery.performUpkeep([])).to.be.revertedWithCustomError(lottery, "Lottery__UpkeepNotNeeded")
    })

    it("performs upkeep", async () => {
      await lottery.enterLottery({
        value: ethers.utils.parseEther("0.1"),
      })
      await increaseTimeAndMine()
      const txResponse = await lottery.performUpkeep([])
      const txReceipt = await txResponse.wait(1)
      const reqId = txReceipt.events![1].args![0]
      const eventName = txReceipt.events![1].event

      expect(reqId).to.eq(1)
      expect(eventName).to.eq("RequestRandomWinner")
    })

    it.only("picks a random winner, resets the lottert and sends money", async () => {
      const additionalEntrances = 3 // to test
      const startingIndex = 2
      for (let i = startingIndex; i < startingIndex + additionalEntrances; i++) {
        // i = 2; i < 5; i=i+1
        lottery = lottery.connect(accounts[i]) // Returns a new instance of the Raffle contract connected to player
        await lottery.enterLottery({ value: minimumFee })
      }
      const startingTimeStamp = await lottery.getLastTimestamp() // stores starting timestamp (before we fire our event)

      // This will be more important for our staging tests...
      await new Promise<void>(async (resolve, reject) => {
        lottery.once("WinnerPicked", async () => {
          // event listener for WinnerPicked
          console.log("WinnerPicked event fired!")
          // assert throws an error if it fails, so we need to wrap
          // it in a try/catch so that the promise returns event
          // if it fails.
          try {
            // Now lets get the ending values...
            const recentWinner = await lottery.getRecentWinner()
            const raffleState = await lottery.getLotteryState()
            const winnerBalance = await accounts[2].getBalance()
            const endingTimeStamp = await lottery.getLastTimestamp()
            await expect(lottery.getParticipantsAt(0)).to.be.reverted
            // Comparisons to check if our ending values are correct:
            expect(recentWinner.toString()).to.eq(accounts[2].address)
            expect(raffleState).to.eq(0)
            expect(winnerBalance.toString()).to.eq(
              startingBalance // startingBalance + ( (raffleEntranceFee * additionalEntrances) + raffleEntranceFee )
                .add(minimumFee.mul(additionalEntrances).add(minimumFee))
                .toString()
            )
            expect(endingTimeStamp).to.be.greaterThan(startingTimeStamp)
            resolve() // if try passes, resolves the promise
          } catch (e) {
            reject(e) // if try fails, rejects the promise
          }
        })

        // kicking off the event by mocking the chainlink keepers and vrf coordinator
        const tx = await lottery.performUpkeep("0x")
        const txReceipt = await tx.wait(1)
        const startingBalance = await accounts[2].getBalance()
        await VRFCoordinatorV2Mock.fulfillRandomWords(txReceipt.events![1].args!.requestId, lottery.address)
      })
    })

    async function increaseTimeAndMine() {
      // We have to manipulate time in blockchain in order to run performUpkeep and checkUpkeep
      // https://hardhat.org/hardhat-network/docs/reference#special-testing/debugging-methods
      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
      await network.provider.send("evm_mine", [])
    }
  })
}
