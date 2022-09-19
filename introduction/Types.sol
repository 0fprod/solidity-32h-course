// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.8;

contract Types {
    // boolean, uint, int, address, bytes
    bool hasFavoriteNumber = false;
    uint256 favNumber = 1;
    int256 favNumber2 = 1;
    string favNumberText = "some random text"; // strings are byte objects
    address myAddrs = 0x9D3052DB3062d60643682B1272d00a6bF4A6f5E6;
    bytes32 favBytes = "cat"; // objects looks like 0x. and then hexadecimal
    // bytes 2,4,22.. there are several, even we can use only bytes but its recommended always to be
    // explicit defining the size
}
