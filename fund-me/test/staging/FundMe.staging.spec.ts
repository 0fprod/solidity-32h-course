import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { FundMe } from '../../typechain-types';
import { assert, expect } from 'chai';
import { networkConfig } from '../../helper-hardhat-config';

describe('FundMe specs', async () => {
  let fundMe: FundMe;
  let deployer: string;

  if (network.config.chainId == )

  beforeEach(async () => {
    // const accounts = await ethers.getSigners() // returns things defined in accounts in the hardhatconfig

    const { deployer: namedAccDeployer } = await getNamedAccounts();
    deployer = namedAccDeployer;
    await deployments.fixture(['all']);

    fundMe = await ethers.getContract('FundMe', deployer); // Most recently deployed contract
  });

  it('sets the aggregator addresses correctly', async () => {
    const response = await fundMe.getPriceFeed();
    // assert.equal(response, mockV3Aggerator.address);
  });

  it('reverts the tx when the sender sends less thant 50$ in ETH', async () => {
    await expect(fundMe.fund()).to.be.revertedWith(
      'You must send at least 50$ of ether'
    );
  });

  it('updates the amount funded', async () => {
    await fundMe.fund({
      value: ethers.utils.parseEther('0.5'),
    });
    const response = await fundMe.getFunderAddressToAmount(deployer);
    assert.equal(
      response.toString(),
      ethers.utils.parseEther('0.5').toString()
    );
  });

  it('register the funder address', async () => {
    await fundMe.fund({
      value: ethers.utils.parseEther('0.5'),
    });
    await fundMe.getFunderAddressToAmount(deployer);
    const funder = await fundMe.getFunders(0);
    assert.equal(funder, deployer);
  });

  it('allows the owner to withdraw funds', async () => {
    // Arrange
    const contractBalance = await fundMe.provider.getBalance(fundMe.address);
    const deployerBalance = await fundMe.provider.getBalance(deployer);
    // Act
    const txResponse = await fundMe.widthdraw();
    const txReceipt = await txResponse.wait(1);
    const gasFee = txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice);
    const finalContractBalance = await fundMe.provider.getBalance(
      fundMe.address
    );
    const finalDeployerBalance = await fundMe.provider.getBalance(deployer);
    // Assert
    assert.equal(finalContractBalance.toString(), '0');
    assert.equal(
      deployerBalance.add(contractBalance).toString(),
      finalDeployerBalance.add(gasFee).toString()
    );
  });

  it('allows the owner to cheapwithdraw funds', async () => {
    // Arrange
    const contractBalance = await fundMe.provider.getBalance(fundMe.address);
    const deployerBalance = await fundMe.provider.getBalance(deployer);
    // Act
    const txResponse = await fundMe.cheapWidthdraw();
    const txReceipt = await txResponse.wait(1);
    const gasFee = txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice);
    const finalContractBalance = await fundMe.provider.getBalance(
      fundMe.address
    );
    const finalDeployerBalance = await fundMe.provider.getBalance(deployer);
    // Assert
    assert.equal(finalContractBalance.toString(), '0');
    assert.equal(
      deployerBalance.add(contractBalance).toString(),
      finalDeployerBalance.add(gasFee).toString()
    );
  });

  it('allow owner to withdraw from several funder', async () => {
    const accounts = await ethers.getSigners();

    for (let i = 1; i < 6; i++) {
      const connectedContract = fundMe.connect(accounts[i]);
      await connectedContract.fund({ value: ethers.utils.parseEther('1') });
    }

    const contractBalance = await fundMe.provider.getBalance(fundMe.address);
    const deployerBalance = await fundMe.provider.getBalance(deployer);
    const txResponse = await fundMe.widthdraw();
    const txReceipt = await txResponse.wait(1);
    const gasFee = txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice);
    const finalContractBalance = await fundMe.provider.getBalance(
      fundMe.address
    );
    const finalDeployerBalance = await fundMe.provider.getBalance(deployer);

    assert.equal(finalContractBalance.toString(), '0');
    assert.equal(
      deployerBalance.add(contractBalance).toString(),
      finalDeployerBalance.add(gasFee).toString()
    );

    // ¿?
    await expect(fundMe.getFunders(0)).to.be.reverted;

    for (let i = 1; i < 6; i++) {
      assert.equal(
        (await fundMe.getFunderAddressToAmount(accounts[i].address)).toString(),
        '0'
      );
    }
  });

  it('allow owner to cheapWithdraw from several funder', async () => {
    const accounts = await ethers.getSigners();

    for (let i = 1; i < 6; i++) {
      const connectedContract = fundMe.connect(accounts[i]);
      await connectedContract.fund({ value: ethers.utils.parseEther('1') });
    }

    const contractBalance = await fundMe.provider.getBalance(fundMe.address);
    const deployerBalance = await fundMe.provider.getBalance(deployer);
    const txResponse = await fundMe.cheapWidthdraw();
    const txReceipt = await txResponse.wait(1);
    const gasFee = txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice);
    const finalContractBalance = await fundMe.provider.getBalance(
      fundMe.address
    );
    const finalDeployerBalance = await fundMe.provider.getBalance(deployer);

    assert.equal(finalContractBalance.toString(), '0');
    assert.equal(
      deployerBalance.add(contractBalance).toString(),
      finalDeployerBalance.add(gasFee).toString()
    );

    // ¿?
    await expect(fundMe.getFunders(0)).to.be.reverted;

    for (let i = 1; i < 6; i++) {
      assert.equal(
        (await fundMe.getFunderAddressToAmount(accounts[i].address)).toString(),
        '0'
      );
    }
  });
});

// https://www.youtube.com/watch?v=gyMwXuJrbJQ 12:14
