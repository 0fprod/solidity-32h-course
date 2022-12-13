import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import {contractAbi, contractAddresses} from '../constants'
import {ethers} from 'ethers'
export const EnterLottery: React.FC<{}> = () => {
  const [minFee, setMinFee] = useState<string>('0')
  const { chainId: chainIdHex, isWeb3Enabled, Moralis } = useMoralis()
  
  const chainId = parseInt(chainIdHex ?? '0')
  const lotteryContractAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

  // First read minimunFee and then pass it as an argument to join the lottery
  const { runContractFunction: getMinimumFee } = useWeb3Contract({
    abi: contractAbi,
    contractAddress: lotteryContractAddress,
    functionName:'getMinimumFee',
  })
  const { runContractFunction: enterLottery } = useWeb3Contract({
    abi: contractAbi,
    contractAddress: lotteryContractAddress,
    functionName:'enterLottery',
    params: {},
    msgValue: minFee
  })

  useEffect(() => {
    if (isWeb3Enabled) {
      const updateUI = async () =>{
        const minFee = await getMinimumFee()
        setMinFee(minFee + '')
      }
      updateUI()
    }
  },[isWeb3Enabled, getMinimumFee])

  

  const enterLotteryHandler = async () => {
    await enterLottery({
      onSuccess(result) {
        console.log('Result r', result)
      },
      onError(error) {
        console.log('Error', error)
      },
    })
  }

  return <div> 
    { minFee && <span>Min fee: {ethers.utils.formatUnits(`${minFee}`,'ether')} ETH</span>}
     <br/> 
     <button onClick={enterLotteryHandler}> Join Lottery! </button>
     </div>
}