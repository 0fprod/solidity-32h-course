// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.8;

import './PriceConverter.sol';

/**
  FundMe contract:
   - Get funds from users   
   - Withdraw funds to contract owner
   - Set a minimum funding value in USD
 */
contract FundMe {
  using PriceConverter for uint256;

  uint256 public minimumUsd = 50 * 1e18;
  address[] public funders;
  mapping(address => uint256) public funderAddressToAmount;
  address public owner;

  AggregatorV3Interface priceFeed;

  constructor(address _priceFeed) {
    owner = msg.sender;
    priceFeed = AggregatorV3Interface(_priceFeed);
  }

  modifier onlyOwner() {
    require(msg.sender == owner, 'Only callable by owner');
    _;
  }

  function fund() public payable {
    require(
      msg.value.getConversionRate(priceFeed) >= minimumUsd,
      'You must send at least 50$ of ether'
    );
    funders.push(msg.sender);
    funderAddressToAmount[msg.sender] += msg.value;
  }

  function widthdraw() public onlyOwner {
    for (uint256 index = 0; index < funders.length; index++) {
      address funderAddress = funders[index];
      funderAddressToAmount[funderAddress] = 0;
    }
    funders = new address[](0);
    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }('');
    require(callSuccess, 'Send failed');
  }
}
