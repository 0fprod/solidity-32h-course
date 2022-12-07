// Uncomment this line to use console.log
// import "hardhat/console.sol";
// Lottery
// Enter the lotery (paying some amount)
// Pick a random winner (verifiably random)
// Winner to be selected every X minutes (automatized)
// ChainlinkOragle -> Randomness, Automated execution (chainlink keeper)
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

error Lottery__NotEnoughEth();
error Lottery__TransferToWinnerFailed();
error Lottery__IsNotOpen();
error Lottery__UpkeepNotNeeded(uint256 balance, uint256 numParticipants, uint256 lotteryState);

/** @title Sample lottery contract
 * @author Franjpr
 * @dev This implements Chainlink VRF v2 & Chainlink Keepers
 */
contract Lottery is VRFConsumerBaseV2, KeeperCompatibleInterface {
  enum LotteryState {
    OPEN,
    CALCULATING
  }
  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;

  address payable[] private s_participants;
  address private s_recentWinner;
  bytes32 private immutable i_gasLane;

  LotteryState private s_lotteryState;
  uint256 private immutable i_lottery_fee;
  uint256 private s_lastTimestamp;
  uint256 private immutable i_interval;
  uint64 private immutable i_subscriptionId;
  uint32 private immutable i_callbackGasLimit;
  uint8 private constant REQUEST_CONFIRMATIONS = 3;
  uint8 private constant NUMBER_OF_RANDOM_WORDS = 1;

  // convention is to invert the name of the fn that invokes this event
  event LotteryEnter(address indexed player);
  event RequestRandomWinner(uint256 indexed requestId);
  event WinnerPicked(address indexed winner);

  constructor(
    address vrfCoordinatorV2,
    uint64 subscriptionId,
    bytes32 gasLane, // keyHash
    uint256 interval,
    uint256 entranceFee,
    uint32 callbackGasLimit
  ) VRFConsumerBaseV2(vrfCoordinatorV2) {
    i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_gasLane = gasLane;
    i_interval = interval;
    i_subscriptionId = subscriptionId;
    i_lottery_fee = entranceFee;
    s_lotteryState = LotteryState.OPEN;
    s_lastTimestamp = block.timestamp;
    i_callbackGasLimit = callbackGasLimit;
  }

  function enterLottery() public payable {
    if (msg.value < i_lottery_fee) {
      revert Lottery__NotEnoughEth();
    }

    if (s_lotteryState != LotteryState.OPEN) {
      revert Lottery__IsNotOpen();
    }

    s_participants.push(payable(msg.sender));
    emit LotteryEnter(msg.sender);
  }

  /**
   * @dev this fn is called by a chainlink keeper node subscribed to this contract
   * This function returns true if:
   * 1 - Time interval has passed
   * 2 - Lottery has at least one participant and have some ETH
   * 3 - Subscription is funded with LINK
   * 4 - Lottery is in "open" state
   */
  function checkUpkeep(
    bytes memory /*checkData*/
  ) public override returns (bool upkeepNeeded, bytes memory /*performData*/) {
    bool isOpen = LotteryState.OPEN == s_lotteryState;
    bool timePassed = (block.timestamp - s_lastTimestamp) > i_interval;
    bool hasParticipants = s_participants.length > 0;
    bool hasBalance = address(this).balance > 0;
    upkeepNeeded = (isOpen && timePassed && hasParticipants && hasBalance);
  }

  function performUpkeep(bytes calldata /*performData*/) external override {
    (bool upkeepNeeded, ) = checkUpkeep("");

    if (!upkeepNeeded) {
      revert Lottery__UpkeepNotNeeded(address(this).balance, s_participants.length, uint256(s_lotteryState));
    }
    s_lotteryState = LotteryState.CALCULATING;
    uint256 requestId = i_vrfCoordinator.requestRandomWords(
      i_gasLane,
      i_subscriptionId,
      REQUEST_CONFIRMATIONS,
      i_callbackGasLimit,
      NUMBER_OF_RANDOM_WORDS
    );

    emit RequestRandomWinner(requestId);
  }

  // randomWords is the size of NUMBER_OF_RANDOM_WORDS
  function fulfillRandomWords(uint256 /*requestId*/, uint256[] memory randomWords) internal virtual override {
    uint256 indexOfWinner = randomWords[0] % s_participants.length;
    address payable recentWinner = s_participants[indexOfWinner];
    s_recentWinner = recentWinner;
    s_lotteryState = LotteryState.OPEN;
    s_participants = new address payable[](0);
    s_lastTimestamp = block.timestamp;

    (bool success, ) = recentWinner.call{value: address(this).balance}("");
    if (!success) {
      revert Lottery__TransferToWinnerFailed();
    }

    emit WinnerPicked(recentWinner);
  }

  function getParticipantsAt(uint256 index) public view returns (address) {
    return s_participants[index];
  }

  function getMinimumFee() public view returns (uint256) {
    return i_lottery_fee;
  }

  function getInterval() public view returns (uint256) {
    return i_interval;
  }

  function getRecentWinner() public view returns (address) {
    return s_recentWinner;
  }

  function getLotteryState() public view returns (LotteryState) {
    return s_lotteryState;
  }

  function getNumWords() public pure returns (uint8) {
    return NUMBER_OF_RANDOM_WORDS;
  }

  function getNumberOfParticipants() public view returns (uint256) {
    return s_participants.length;
  }

  function getLastTimestamp() public view returns (uint256) {
    return s_lastTimestamp;
  }

  function getConfirmations() public pure returns (uint8) {
    return REQUEST_CONFIRMATIONS;
  }
}
