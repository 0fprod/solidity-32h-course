// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.8; // Versions of the both contract should match

import "./SimpleStorage.sol";

contract StorageFactory {
    // SimpleStorage public simpleStorage;
    SimpleStorage[] public simpleStorage;

    function createSimpleStorage() public {
        // simpleStorage = new SimpleStorage(); // This actually deploys a new SimpleStorage contract
        SimpleStorage sp = new SimpleStorage();
        simpleStorage.push(sp);
    }

    function sfStore(uint256 _simpleStorageIndex, uint256 _simpleStorageNumber)
        public
    {
        SimpleStorage sp = simpleStorage[_simpleStorageIndex];
        sp.store(_simpleStorageNumber);
    }

    function sfRead(uint256 _simpleStorageIndex) public view returns (uint256) {
        SimpleStorage sp = simpleStorage[_simpleStorageIndex];
        return sp.getFavNumber();
    }
}
