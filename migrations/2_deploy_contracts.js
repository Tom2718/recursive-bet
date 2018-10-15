var RecursiveDepositContract = artifacts.require("./RecursiveDeposit.sol");

module.exports = function(deployer) {
  deployer.deploy(RecursiveDepositContract, 30, 500000000);
};
