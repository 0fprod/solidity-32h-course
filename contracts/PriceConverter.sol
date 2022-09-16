// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// Libraries are similar to contracts, but you can't declare any state variable and you can't send ether.
// A library is embedded into the contract if all library functions are internal.
// Otherwise the library must be deployed and then linked before the contract is deployed.
library PriceConverter {
    function getPriceInTermsOfUsd() internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    function getVersion() internal view returns (uint256) {
        // Goerli address
        return
            AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e)
                .version();
    }

    function getConversionRate(uint256 ethAmount)
        internal
        view
        returns (uint256)
    {
        uint256 ethPriceInUsd = getPriceInTermsOfUsd();
        uint256 ethAmoutInUsd = (ethPriceInUsd * ethAmount) / 1e18;
        return ethAmoutInUsd;
    }
}
