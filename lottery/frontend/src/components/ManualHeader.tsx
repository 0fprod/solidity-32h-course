import { useEffect } from "react"
import { useMoralis } from "react-moralis"

export const ManualHeader: React.FC<{}> = () => {
  const {account, enableWeb3, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } = useMoralis()
  
  const formatAccount = (acc:string | null) => {
    if (!acc) return ''
    return `${acc.substring(0, 6)}...${acc.substring(acc.length - 4)}`
  }

  const connect = async () => {
    await enableWeb3()
    window.localStorage.setItem('connected','injected')
  }

  useEffect(() => {
    if (isWeb3Enabled) return;
    if (window.localStorage.getItem('connected')) {
      enableWeb3()
    }
  } , [isWeb3Enabled, enableWeb3]) 

  useEffect(() => {
    Moralis.onAccountChanged(async (newAccount) => {
      console.log('Account changed to ', newAccount)
      if (newAccount === null) {
        window.localStorage.removeItem('connected')
        await deactivateWeb3()
      }
    })
  }, [Moralis, deactivateWeb3])

  return <> { isWeb3Enabled ? <h3> Connected to wallet: {formatAccount(account)}</h3> : <button onClick={connect} disabled={isWeb3EnableLoading}> Connect wallet! </button>} </>
}