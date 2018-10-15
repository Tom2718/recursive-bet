pragma solidity ^0.4.24;

import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol";

// A gambling contract where you win if you are the last person 
// to add into the pot for longer than (XY) minutes
contract RecursiveDeposit is Ownable{
    uint timeDelay;
    address mostRecentBetter;
    bool isOpen;
    uint lastBetTime;
    uint minBet;
    uint totalPot;
    
    event NewBet(address indexed _addr, uint _value);

    constructor (uint bettingCycle, uint minimumBet) public {
        timeDelay = 30 minutes; // bettingCycle
        lastBetTime = now;
        totalPot = 0;
        isOpen = true;
        minBet = 0.005 ether; // minimumBet
    }

    function bet(address better) public payable {
        require(better!=0x0, "Invalid address");
        require(msg.value >= minBet, "Bets must be more than or equal to 0.005 ether"); // hardcoded minbet warning

        checkCloseBetting();

        require(isOpen, "Someone has already won!");

        mostRecentBetter = better;
        totalPot += msg.value;
        
        emit NewBet(msg.sender, msg.value);
    }
    
    function _totalPot() public view returns (uint){
        return totalPot;
    }

    function () public payable {
        bet(msg.sender);
    }

    function checkCloseBetting() internal {
        if (now - lastBetTime > timeDelay){
            isOpen = false;
        }
    }

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
