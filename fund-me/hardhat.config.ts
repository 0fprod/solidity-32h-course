import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-etherscan';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import '@typechain/hardhat';
import 'hardhat-deploy';
import dotenv from 'dotenv';

dotenv.config();
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || '';
// const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || '';

const config: HardhatUserConfig = {
  solidity: '0.8.8',
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      // accounts: [PRIVATE_KEY], see namedAccounts
      chainId: 5,
    },
    localhost: {
      url: 'http://127.0.0.1:8545/',
      chainId: 31337,
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'EUR',
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      // <chainId> : <account index>
    },
    user: {
      default: 1,
    },
  },
};

export default config;
