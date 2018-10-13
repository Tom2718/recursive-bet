import React, { Component } from "react";
import { Jumbotron, Button, Image } from 'react-bootstrap';
import RecursiveDepositContract from "./contracts/RecursiveDeposit.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";

import "./App.css";

class App extends Component {
  // signed state stores if the current user has signed the contract
  // isLoading disables the button when querying the contract
  state = { web3: null, accounts: null, contract: null, isLoading: false, totalPot: 0 };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const Contract = truffleContract(RecursiveDepositContract);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();
      const currentPot = await instance._totalPot();

      console.log(currentPot);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, totalPot: currentPot });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  runExample = async () => {
    // TODO

    const { accounts, contract } = this.state;

    this.setState({ isLoading: true });

    // Sign the register
    await contract.signRegister( { from: accounts[0] });

    // Check you signed the register to prove it worked.
    let response = await contract.checkRegister(accounts[0]);
    console.log(response);

    // Update state with the result.
    this.setState({
      isLoading: false
    })
  };

  // The front end
  render() {
    const { isLoading } = this.state;

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract. Make sure Metamask is unlocked and connected to the Ganache network.</div>;
    }
    return (
      <div className="App">

        <Jumbotron>
          <h1>Win Now!</h1>
          <p>
            Only NN minutes to go.
          </p>
          <p>
            <Button
              bsStyle="primary"
              disabled={isLoading}
              onClick={!isLoading ? this.runExample : null}
            >
              {isLoading ? 'Loading...' : 'Bet now!'}
            </Button>
          </p>
        </Jumbotron>
      </div>
    );
  }
}

export default App;
