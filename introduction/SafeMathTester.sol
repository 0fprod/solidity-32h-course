// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract SafeMathTester {
    uint8 public biggestPossibleNumber = 255;

    function addOne() public {
        biggestPossibleNumber = biggestPossibleNumber + 1;
        // This is not 256, its not possible to fit in the memsize
        // What happens here is that it goes to 0. It goes back to the lowest
        // number it could be
    }
}

// The SafeMath library its native to contracts since solidity 0.8.0
// So contract above that will not cause that 'go-to-zero' effect.
// Instead it will thrown an error

// However this can be hardcoded if we add the unchecked keyword
// unchecked {biggestPossibleNumber = biggestPossibleNumber + 1;}
// This will go to 0 in the ^0.8.0
// PRO TIP:
// Unchecked keyword its also gas efficient, so if we're
// 200% sure that nothing is going to break, we can use it
