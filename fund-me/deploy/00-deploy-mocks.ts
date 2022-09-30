import { network } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  developmentNetworkNames,
  DECIMALS,
  INITIAL_ANSWER,
} from '../helper-hardhat-config';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (developmentNetworkNames.includes(network.name)) {
    log('Local network detected, deploying mocks...');
    await deploy('MockV3Aggregator', {
      contract: 'MockV3Aggregator',
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER], // constructor params
    });
    log('Mocks deployed!');
    log('#########################');
  }
};

export default func;
func.tags = ['all', 'mocks'];
// this allow us to run npx hardhat deploy --TAGNAME
// That command will only run the scripts that contain that tags
