// SPDX-License-Identifier: UNLICENSED
// Pragma
pragma solidity ^0.8.8;
// Imports
import './PriceConverter.sol';
import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';
// Errores
error FundMe__NotOwner();

/** @title A contract for crowd funding
 * @author Fran
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feeds as library
 */
contract FundMe {
  // Type declarations
  using PriceConverter for uint256;
  // State variables
  uint256 public constant MINIMUM_USD = 50 * 1e18;
  address[] private s_funders;
  mapping(address => uint256) private s_funderAddressToAmount;
  address private immutable i_owner;
  AggregatorV3Interface private s_priceFeed;
  // Modifiers
  modifier onlyOwner() {
    if (msg.sender != i_owner) {
      revert FundMe__NotOwner();
    }
    _;
  }

  constructor(address _priceFeed) {
    i_owner = msg.sender;
    s_priceFeed = AggregatorV3Interface(_priceFeed);
  }

  /**
   * @notice THis functions funds this contract
   */
  function fund() public payable {
    require(
      msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
      'You must send at least 50$ of ether'
    );
    s_funders.push(msg.sender);
    s_funderAddressToAmount[msg.sender] += msg.value;
  }

  function cheapWidthdraw() public payable onlyOwner {
    address[] memory funders = s_funders;
    for (uint256 index = 0; index < funders.length; index++) {
      s_funderAddressToAmount[funders[index]] = 0;
    }
    s_funders = new address[](0);
    (bool success, ) = i_owner.call{value: address(this).balance}('');
    require(success, 'Send failed');
  }

  function widthdraw() public payable onlyOwner {
    for (uint256 index = 0; index < s_funders.length; index++) {
      address funderAddress = s_funders[index];
      s_funderAddressToAmount[funderAddress] = 0;
    }
    s_funders = new address[](0);
    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }('');
    require(callSuccess, 'Send failed');
  }

  function getOwner() public view returns (address) {
    return i_owner;
  }

  function getFunders(uint256 index) public view returns (address) {
    return s_funders[index];
  }

  function getFunderAddressToAmount(address funderAddress)
    public
    view
    returns (uint256)
  {
    return s_funderAddressToAmount[funderAddress];
  }

  function getPriceFeed() public view returns (AggregatorV3Interface) {
    return s_priceFeed;
  }
}
