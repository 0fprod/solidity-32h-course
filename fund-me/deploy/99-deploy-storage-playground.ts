import { ethers, network } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

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
  for (let i = 0; i < 10; i++) {
    log(
      `Location ${i}: ${await ethers.provider.getStorageAt(
        funWithStorage.address,
        i
      )}`
    );
  }

  //  You can use this to trace!
  const trace = await network.provider.send('debug_traceTransaction', [
    funWithStorage.transactionHash,
  ]);
  for (let structLog in trace.structLogs) {
    if (trace.structLogs[structLog].op == 'SSTORE') {
      console.log(trace.structLogs[structLog]);
    }
  }

  // Can you write a function that finds the storage slot of the arrays and mappings?
  // And then find the data in those slots?
  // await printArrayValues(funWithStorage.address);
  await printMappingValues(funWithStorage.address);
};

const printArrayValues = async (contractAddress: string): Promise<void> => {
  const arrayLengthLocation = ethers.utils.hexZeroPad('0x2', 32);
  const arrayLengthValueInHex = await ethers.provider.getStorageAt(
    contractAddress,
    arrayLengthLocation
  );
  const arrayLengthValueInNumber = ethers.BigNumber.from(
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
    const itemLocationHash = ethers.BigNumber.from(
      firstArrayElementLocationHash
    ).add(i);
    const arrayElement = await ethers.provider.getStorageAt(
      contractAddress,
      itemLocationHash
    );
    console.log(
      'Reading memory location:',
      ethers.utils.hexlify(itemLocationHash)
    );
    console.log(`Item location hash ${itemLocationHash}`);
    console.log(`Item[${i}] value in hex = ${arrayElement}`);
    console.log(
      `Item[${i}] value in decimal = ${ethers.BigNumber.from(
        arrayElement
      ).toNumber()}`
    );
    console.log('-------------');
  }
};

const printMappingValues = async (contractAddres: string): Promise<void> => {
  // elements are stored at hask(keyinHex, mappingLocation)
  // keys = 0, 20 & 25
  console.log('hexlify', ethers.utils.hexlify(0));
  console.log('hexlify', ethers.utils.hexlify(20));
  console.log('hexlify', ethers.utils.hexlify(25));
  // const hex25 = ethers.utils.hexlify(25); // 0x19
  const mappingLocation = ethers.utils.hexZeroPad('0x193', 32);
  console.log('🚀 ~ mappingLocation', mappingLocation);
  // const firstHexKey = ethers.utils.hexZeroPad('0x143', 32);
  const hashedLocation = ethers.utils.keccak256(mappingLocation);
  console.log('🚀 ~ hashedLocation', hashedLocation);
  const hexValueAt = await ethers.provider.getStorageAt(
    contractAddres,
    hashedLocation
  );
  console.log('🚀 ~ hexValueAt', hexValueAt);
  console.log(
    `value in decimal = ${ethers.BigNumber.from(hexValueAt).toNumber()}`
  );
};

export default func;
func.tags = ['storage'];
