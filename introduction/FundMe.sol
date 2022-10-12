// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
  FundMe contract:
   - Get funds from users   
   - Withdraw funds to contract owner
   - Set a minimum funding value in USD
 */
contract FundMe {
    uint256 public minimumUsd = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public amountFundedbyAddress;

    // payable fn give access to the msg.value variable
    // also marking a function as payable allows to send
    // and widthraw funds
    function fund() public payable {
        // set a minimum fund amout in USD
        // msg.value comes in wei units
        require(
            getConversionRate(msg.value) >= minimumUsd,
            "You must send at least 50$ of ether"
        );
        // require(msg.value >= 1e18, "You must send at least 1 ether"); // If this error is thrown all the tx is reverted (they user that paid a fee for this tx wont retrieve it back)
        funders.push(msg.sender);
        amountFundedbyAddress[msg.sender] = msg.value;
    }

    // Each request to an Oracle we must pay in the oracle token
    // In order to pay, the contract address (or the API consumer) must have the oracle tokens
    function getPriceInTermsOfUsd() public view returns (uint256) {
        // ABI
        // Contract address data feed
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        );
        // destructuring should match type
        (, int256 price, , , ) = priceFeed.latestRoundData();
        // typecast
        return uint256(price * 1e10); // Math in solidity are sensitive
        // So all numbers should operate with the same amount of decimals
        // since msg.value has 18 (because of eth), we must adapt price to it
        // the oracle returns the price in usd with 8 decimals, so we add 10 more
    }

    function getVersion() public view returns (uint256) {
        // Goerli address
        return
            AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e)
                .version();
    }

    function getConversionRate(uint256 ethAmount)
        public
        view
        returns (uint256)
    {
        uint256 ethPriceInUsd = getPriceInTermsOfUsd();
        uint256 ethAmoutInUsd = (ethPriceInUsd * ethAmount) / 1e18;
        return ethAmoutInUsd;
    }
    // function withdraw() {}
}
