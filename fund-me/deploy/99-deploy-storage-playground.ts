import { hexlify } from '@ethersproject/bytes';
import { ethers, network } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { BigNumber } from '../node_modules/@ethersproject/bignumber';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log('----------------------------------------------------');
  log('Deploying FunWithStorage and waiting for confirmations...');
  const funWithStorage = await deploy('FunWithStorage', {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 0,
  });

  log('Logging storage...');
  for (let i = 0; i < 5; i++) {
    log(
      `Location ${i}: ${await ethers.provider.getStorageAt(
        funWithStorage.address,
        i
      )}`
    );
  }

  //  You can use this to trace!
  // const trace = await network.provider.send('debug_traceTransaction', [
  //   funWithStorage.transactionHash,
  // ]);
  // for (let structLog in trace.structLogs) {
  //   if (trace.structLogs[structLog].op == 'SSTORE') {
  //     console.log(trace.structLogs[structLog]);
  //   }
  // }
  // const firstelementLocation = ethers.utils.keccak256(
  //   '0x0000000000000000000000000000000000000000000000000000000000000002'
  // );
  // const arrayElement = await ethers.provider.getStorageAt(
  //   funWithStorage.address,
  //   firstelementLocation
  // );
  // log(`Location ${firstelementLocation}: ${arrayElement}`);

  // Can you write a function that finds the storage slot of the arrays and mappings?
  // And then find the data in those slots?
  await printArrayValues(funWithStorage.address);
};

const printArrayValues = async (contractAddress: string): Promise<void> => {
  const arrayLengthLocation =
    '0x0000000000000000000000000000000000000000000000000000000000000002';
  const arrayLengthValueInHex = await ethers.provider.getStorageAt(
    contractAddress,
    arrayLengthLocation
  );
  const arrayLengthValueInNumber = BigNumber.from(
    arrayLengthValueInHex
  ).toNumber();

  console.log('Location of the array length: ', arrayLengthLocation);
  console.log('Number of elements in the array (hex): ', arrayLengthValueInHex);
  console.log(
    'Number of elements in the array (decimal): ',
    arrayLengthValueInNumber
  );
  const firstArrayElementLocationHash =
    ethers.utils.keccak256(arrayLengthLocation);
  console.log(
    'Hashed location (0x00...02) of the first element in the array: ',
    firstArrayElementLocationHash
  );

  for (let i = 0; i < arrayLengthValueInNumber; i++) {
    console.log('-------------');
    const itemLocationHash = BigNumber.from(firstArrayElementLocationHash).add(
      i
    );
    const arrayElement = await ethers.provider.getStorageAt(
      contractAddress,
      itemLocationHash
    );
    console.log('Reading memory location:', hexlify(itemLocationHash));
    console.log(`Item location hash ${itemLocationHash}`);
    console.log(`Item[${i}] value in hex = ${arrayElement}`);
    console.log(
      `Item[${i}] value in decimal = ${BigNumber.from(arrayElement).toNumber()}`
    );
    console.log('-------------');
  }
};

export default func;
func.tags = ['storage'];
