// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.8;

// If someone sends funds to this contract without calling the fund function
// we can handle the errors by defining 2 functions

contract FallbackAndReceiveExample {
    uint256 public result;

    // triggered when someone sends tokens to this contract, even if its 0 tokens
    receive() external payable {
        result = 1;
    }

    // this will run whenever someone a function that is NOT defined in this contract
    fallback() external payable {
        result = 2;
    }
}

// Ether is sent to contract
//      is msg.data empty?
//           /   \
//          yes   no
//         /      \
//     receive()? fallback()
//       /   \
//     yes   no
//     /      \
// receive() fallback()
