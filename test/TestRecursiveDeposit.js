// Javascript tests

const rd = artifacts.require("RecursiveDeposit");

contract('Javascript RecursiveDeposit Test', async (accounts) => {

  it("should throw on an attempted withdraw", async () => {
    let instance = await rd.deployed();
    try{
      await instance.withdraw.call(accounts[0]);
      throw null;
    } catch (error){
      assert(error, "Expected an error but did not get one");    }
  });

})
