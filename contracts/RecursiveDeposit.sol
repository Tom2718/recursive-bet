pragma solidity ^0.4.25;

// Use github link in Remix IDE
// import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Ownable.sol";

/**
 * @title RecursiveDeposit
 * @dev A gambling contract where you win if you are the last person
 * to add into the pot for longer than (XY) minutes
 */
contract RecursiveDeposit is Ownable{

    // These variables could be made public instead
    uint timeDelay;
    address mostRecentBetter;
    bool isOpen;
    uint lastBetTime;
    uint minBet;
    uint totalPot;

    event NewBet(address indexed _addr, uint _value);

    /**
     * @dev initialises the contract with the houses parameters.
     * @param bettingCycle sets the maximum delay betweeen bets.
     * @param minimumBet sets the minimum allowable bet.
     */
    constructor (uint bettingCycle, uint minimumBet) public {
        timeDelay = 300 minutes; // bettingCycle
        lastBetTime = now;
        totalPot = 0;
        isOpen = true;
        minBet = 0.005 ether; // minimumBet
    }

    /**
     * @dev allows someone to make a bet.
     * @param better is the address owning a bet.
     */
    function bet(address better) public payable {
        require(better!=0x0, "Invalid address");
        require(msg.value >= minBet, "Bets must be more than or equal to 0.005 ether"); // hardcoded minbet warning

        checkCloseBetting();

        require(isOpen, "Someone has already won!");

        mostRecentBetter = better;
        totalPot += msg.value;

        emit NewBet(msg.sender, msg.value);
    }

    function getTotalPot() public view returns (uint){
        return totalPot;
    }

    function getLastBetTime() public view returns (uint){
        return lastBetTime;
    }

    function () public payable {
        bet(msg.sender);
    }

    /**
     * @dev checks if time has expired for bets.
     * @notice this must be called to officially end the round.
     */
    function checkCloseBetting() internal {
        if (now - lastBetTime > timeDelay){
            isOpen = false;
        }
    }

    /**
     * @dev allows the winning address to withdraw their winnings.
     */
    function withdraw() public {
        checkCloseBetting();

        require(!isOpen, "Nobody has won yet!");
        require(msg.sender==mostRecentBetter, "You're not the winner");

        msg.sender.transfer(totalPot);
    }

    // function casinoWithdraw() onlyOwner public {
    //     // owner.transfer(0.1*totalPot);
    // }
}
