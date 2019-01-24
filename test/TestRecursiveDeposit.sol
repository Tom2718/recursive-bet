pragma solidity ^0.4.25;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/RecursiveDeposit.sol";

contract TestRecursiveDeposit {
    RecursiveDeposit rd = RecursiveDeposit(DeployedAddresses.RecursiveDeposit());

    address owner = this;

    function testGetTotalPot() public {
        uint pot = rd.getTotalPot();

        Assert.equal(pot, 0, "Initial pot is 0.");
    }
}
