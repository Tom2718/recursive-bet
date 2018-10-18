import React, { Component } from "react";

// Material Ui Core
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';

// Material Ui Styles
import { withStyles } from '@material-ui/core/styles';

// Material Ui Icons
import Code from '@material-ui/icons/Code';

// Ethereum
import RecursiveDepositContract from "./contracts/RecursiveDeposit.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";

// Other components
import SnackbarMessage from "./components/SnackbarMessage"

import "./App.css";
import styles from "./assets/js/appStyle";

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
      console.log(error);
    }
  };

  watchPot = async () => {
    const { accounts, contract } = this.state;

    var depositEvent = contract.NewBet({fromBlock: 0, toBlock: 'latest'});
    depositEvent.watch(function(err, result) {
      if (err) {
        console.log(err)
        return;
      }
      console.log("New bet by " + result.args._addr + " of " + result.args._value);
    })

    // depositEvent.stopWatching()
  };

  watchMyBets = async () => {
    const { accounts, contract } = this.state;

    var depositEvent = contract.NewBet({_addr: accounts[0]}, {fromBlock: 0, toBlock: 'latest'});
    depositEvent.watch(function(err, result) {
      if (err) {
        console.log(err)
        return;
      }
      console.log("New bet by " + result.args._addr + " of " + result.args._value);
    })

    // depositEvent.stopWatching()
  };

  getTotalPot = async () => {
    const { accounts, contract, totalPot } = this.state;

    // Check the pot
    let tp = await contract._totalPot( { from: accounts[0] });
    console.log(tp);

    // Update state with the result.
    this.setState({
      totalPot: tp
    })
  };

  makeBet = async () => {
    const { accounts, contract } = this.state;

    // Check the pot
    let tp = await contract.bet(accounts[0], { from: accounts[0], value: "1000000000000000000" });
    console.log(tp);
  };

  // The front end
  render() {
    const { isLoading } = this.state;
    const { classes } = this.props;

    // if (!this.state.web3) {
    //   return <div>Loading Web3, accounts, and contract. Make sure Metamask is unlocked and connected to the Ropsten network.</div>;
    // }
    return (
      <div className={classes.layout}>
      <Toolbar className={classes.toolbarMain}>
        <Typography
          component="h2"
          variant="h4"
          color="inherit"
          align="center"
          noWrap
          className={classes.toolbarTitle}
        >
          Recursive Bet
        </Typography>
        <IconButton className={classes.button} aria-label="GitHub" href="https://github.com/Tom2718">
          <Code />
        </IconButton>
      </Toolbar>


      <main>
        <Grid container spacing={40} className={classes.mainGrid}>
          <Grid item md={6} align="center">
          <h2>Win Now!</h2>
          <p>
            Only NN minutes to go.
          </p>
          </Grid>
          <Grid item md={6} align="center">
            <Button
              classes={{
                root: classes.playButton,
              }}
              disabled={isLoading}
              onClick={!isLoading ? this.makeBet : null}
            >
              {isLoading ? 'Loading...' : 'Bet now!'}
            </Button>
          </Grid>
        </Grid>
        <Divider className={classes.divider} />
        <Grid container spacing={40} className={classes.mainGrid}>
          <Grid item md={6} className={classes.mainFeaturedPostContent}>
          The aim of the game is to be the last person to put ETH into the pot - if you remain there for 30 minutes then you win the entire pot instantly.
          Ok - the real aim is to practice coding and thinking about smart contracts and developing (secure) DApps. Unless if you make millions - then share!
          </Grid>
        </Grid>
        {!this.state.web3 ?
          <SnackbarMessage
          variant="error"
          className={classes.margin}
          message="Error: Make sure Metamask is unlocked and connected to the correct Ethereum network."
        />
        : null
         }
      </main>
      </div>
    );
  }
}

// inject style classes
export default withStyles(styles)(App);
