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
  // const trace = await network.provider.send('debug_traceTransaction', [
  //   funWithStorage.transactionHash,
  // ]);
  // for (let structLog in trace.structLogs) {
  //   if (trace.structLogs[structLog].op == 'SSTORE') {
  //     console.log(trace.structLogs[structLog]);
  //   }
  // }

  // Can you write a function that finds the storage slot of the arrays and mappings?
  // And then find the data in those slots?
  console.log('############');
  console.log('### Printing all values in the dynamic array');
  console.log('############');
  await printArrayValues(funWithStorage.address);
  console.log('############');
  console.log('### Printing all values in the mapping');
  console.log('############');
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
  const mappingKeys = [0, 20, 25];
  const mappingSlot = ethers.utils.hexZeroPad('0x3', 32);

  for (let i = 0; i < mappingKeys.length; i++) {
    const keyAsHex = ethers.BigNumber.from(mappingKeys[i]).toHexString();
    const keyPad = ethers.utils.hexZeroPad(keyAsHex, 32);
    const concatenationOf = ethers.utils.concat([keyPad, mappingSlot]);
    const concatenationHash = ethers.utils.keccak256(concatenationOf);
    console.log('🚀 ~ concatenationHash', concatenationHash);
    const value = await ethers.provider.getStorageAt(
      contractAddres,
      concatenationHash
    );
    console.log('🚀 ~ value', value);
  }
  ethers.BigNumber.from(25).toHexString;
};

export default func;
func.tags = ['storage'];
