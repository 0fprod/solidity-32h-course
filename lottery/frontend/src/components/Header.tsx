import {ConnectButton} from 'web3uikit'
export const Header: React.FC<{}> = () => {
  return <div> <ConnectButton moralisAuth={false}/> </div>
}