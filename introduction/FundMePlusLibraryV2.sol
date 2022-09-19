// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.8;

import "./PriceConverter.sol";

/**
  FundMe contract:
   - Get funds from users   
   - Withdraw funds to contract owner
   - Set a minimum funding value in USD
 */
contract FundMePlusLibraryV2 {
    using PriceConverter for uint256;

    uint256 public minimumUsd = 50 * 1e18;
    address[] public funderAddresses;
    mapping(address => uint256) public amountFundedbyAddress;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only callable by owner");
        _; // This indicates where the logic of the function that calls this modifier is going to be executed
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate() >= minimumUsd,
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

        // reset the array
        funderAddresses = new address[](0);

        // transfer / send / call
        // withdraw to whoever is calling this function
        // In solidity in order to send the native token we can only use payable address
        // So we must cast the caller address)
        // *payable(msg.sender).transfer(address(this).balance);
        // A regular transfer costs 2100 gas units. The Transfer method is capped to 2300 gas. If the transfer fails it throws an error

        // Send is also capped at 2300 gas but it returs a bool
        // *bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // *require(sendSuccess, "Send failed");
        // We have more control over this one, because the error throwns rever the tx. Here we can add custom logic

        // Call is very powerful, we're allowed to call virtually any function in all the blockchain
        // without even having to have the ABI.
        // (bool callSucess, bytes memory dataReturned) = payable(msg.sender).call{value: address(this).balance}("");
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Send failed");
    }
}
