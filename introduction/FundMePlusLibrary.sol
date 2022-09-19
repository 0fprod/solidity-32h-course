// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.8;

import "./PriceConverter.sol";

/**
  FundMe contract:
   - Get funds from users   
   - Withdraw funds to contract owner
   - Set a minimum funding value in USD
 */
contract FundMe {
    using PriceConverter for uint256; // This adds syntatic sugar to the uin256 type
    /*
      for example:
      function foo(uint256 bar) {
        PriceConverter.getConversionRate(bar);
        is the same as
        bar.getConversionRate();
      }
      Basically binds the function declarations to the variables of used type. Also the first
      parameter can me omitted 
    */

    uint256 public minimumUsd = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public amountFundedbyAddress;

    function fund() public payable {
        // PriceConverter.getConversionRate(msg.value);
        // or
        // msg.value.getConversionRate()
        require(
            msg.value.getConversionRate() >= minimumUsd,
            "You must send at least 50$ of ether"
        );
        funders.push(msg.sender);
        amountFundedbyAddress[msg.sender] = msg.value;
    }

    // function widthdraw() {}
}
