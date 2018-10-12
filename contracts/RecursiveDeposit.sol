pragma solidity ^0.4.24;

// A gambling contract where you win if you are the last person 
// to add into the pot for longer than (XY) minutes
contract RecursiveDeposit {
    uint8 timeDelay;
    address mostRecentBetter;
    bool isOpen;
    uint lastBetTime;
    uint minBet;
    uint totalPot;

    function RecursiveDeposit(uint8 bettingCycle, uint minimumBet) public {
        timeDelay = 30 minutes; // bettingCycle
        startTime = now;
        totalPot = 0;
        isOpen = true;
        minBet = 0.005 ether; // minimumBet
    }


    function bet(address better) public payable {
        require(better!=0x0);
        require(msg.value >= minBet, "Bets must be more than or equal to " + minBet);

        checkCloseBetting();

        require(isOpen, "Someone has already won!");

        mostRecentBetter = better;
        totalPot += msg.value;
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
        require(!isOpen);
        require(msg.sender==mostRecentBetter);

        msg.sender.transfer(0.9*totalPot);
    }

    function casinoWithdraw() onlyOwner {
        // TODO
    }
}
