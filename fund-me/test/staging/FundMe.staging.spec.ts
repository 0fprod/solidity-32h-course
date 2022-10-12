import { ethers, getNamedAccounts, network } from 'hardhat';
import { FundMe, FundMe__factory } from '../../typechain-types';
import { assert, expect } from 'chai';
import { developmentNetworkNames } from '../../helper-hardhat-config';

developmentNetworkNames.includes(network.name)
  ? describe.skip
  : describe('FundMe specs', async () => {
      let fundMe: FundMe;
      let deployer: string;

      beforeEach(async () => {
        const { deployer: namedAccDeployer } = await getNamedAccounts();
        deployer = namedAccDeployer;
        fundMe = await ethers.getContract('FundMe', deployer);
      });
      it('allows people to fund and withdraw', async () => {
        await fundMe.fund({ value: ethers.utils.parseEther('0.04') });
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        console.log('🚀 ~ endingBalance', endingBalance);

        assert.equal(endingBalance.toString(), '0');
      });
    });

// https://www.youtube.com/watch?v=gyMwXuJrbJQ 12:12
