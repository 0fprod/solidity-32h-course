// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.8;

import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

library PriceConverter {
  function getPriceInTermsOfUsd(AggregatorV3Interface _priceFeed)
    internal
    view
    returns (uint256)
  {
    (, int256 price, , , ) = _priceFeed.latestRoundData();
    return uint256(price * 1e10);
  }

  function getConversionRate(
    uint256 ethAmount,
    AggregatorV3Interface _priceFeed
  ) internal view returns (uint256) {
    uint256 ethPriceInUsd = getPriceInTermsOfUsd(_priceFeed);
    uint256 ethAmoutInUsd = (ethPriceInUsd * ethAmount) / 1e18;
    return ethAmoutInUsd;
  }
}
