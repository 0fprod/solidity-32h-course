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

    // Constants and inmutable vars are cheaper
    // as constant 21371 gas units
    // without constant 23471 gas units
    // ETH Price today ~1450$
    // 21,371 * 12000000000 = 256,452,000,000,000 wei
    // 23,473 * 12000000000 = 281,676,000,000,000 wei
    // A 0.000256452 ether * 1450$ = 0,37 $
    // B 0.000281676 ether * 1450$ = 0,40 $
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] public funderAddresses;
    mapping(address => uint256) public amountFundedbyAddress;
    address public immutable i_owner; // naming convention

    constructor() {
        i_owner = msg.sender;
    }

    modifier onlyOwner() {
        // Each character of the error messages needs to be stored
        // individually so it cost gas. When deploying a contract the more logs
        // the more gas it cost.
        // We can save gas by defining custom errors
        // require(msg.sender == i_owner, "Only callable by owner");
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

    function withdraw() public onlyOwner {
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
}
