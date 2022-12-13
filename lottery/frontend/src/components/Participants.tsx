import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import {contractAbi, contractAddresses} from '../constants'

export const Participants: React.FC<{}> = () => {
  const [numberOfPlayers, setNumberOfPlayers] = useState(0)
  const [lotteryState, setLotteryState] = useState(0)
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
  
  const chainId = parseInt(chainIdHex ?? '0')
  const lotteryContractAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

  // First read minimunFee and then pass it as an argument to join the lottery
  const { runContractFunction: getNumberOfParticipants } = useWeb3Contract({
    abi: contractAbi,
    contractAddress: lotteryContractAddress,
    functionName:'getNumberOfParticipants',
  })

  const { runContractFunction: getLotteryState } = useWeb3Contract({
    abi: contractAbi,
    contractAddress: lotteryContractAddress,
    functionName:'getLotteryState',
  })

  useEffect(() => {
    if (isWeb3Enabled) {
      const updateUI = async () =>{
        setNumberOfPlayers(parseInt(await getNumberOfParticipants() + ''))
        setLotteryState(parseInt(await getLotteryState() + ''))
      }
      updateUI()
    }
  },[isWeb3Enabled, getNumberOfParticipants, getLotteryState])

// 18.17
  return <div> { numberOfPlayers && <span>Total players: {numberOfPlayers} players</span> }
    <br/>
    { lotteryState && <span>State: {lotteryState}</span> }
    <br/>
    </div>
}