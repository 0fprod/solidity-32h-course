// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error NotOwner();

/**
  FundMe contract:
   - Get funds from users   
   - Withdraw funds to contract owner
   - Set a minimum funding value in USD
 */
contract FundMePlusLibraryV2 {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] public funderAddresses;
    mapping(address => uint256) public amountFundedbyAddress;
    address public immutable i_owner;

    constructor() {
        i_owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert NotOwner();
        }
        _;
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate() >= MINIMUM_USD,
            "You must send at least 50$ of ether"
        );
        funderAddresses.push(msg.sender);
        amountFundedbyAddress[msg.sender] += msg.value;
    }

    function widthdraw() public onlyOwner {
        for (uint256 index = 0; index < funderAddresses.length; index++) {
            address funderAddress = funderAddresses[index];
            amountFundedbyAddress[funderAddress] = 0;
        }

        funderAddresses = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Send failed");
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
