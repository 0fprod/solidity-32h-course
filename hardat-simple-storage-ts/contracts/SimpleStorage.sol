// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.8;

contract SimpleStorage {
    uint256 favNumber;

    function store(uint256 _favNumber) public virtual {
        favNumber = _favNumber;
    }

    function retrieve() public view returns (uint256) {
        return favNumber;
    }
}
