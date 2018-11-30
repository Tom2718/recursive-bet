import React, { Component } from "react";

// Material Ui Core
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

// Material Ui Styles
import { withStyles } from '@material-ui/core/styles';

// Material Ui Icons
import Code from '@material-ui/icons/Code';

// Ethereum
// import RecursiveDepositContract from "./contracts/RecursiveDeposit.json";
import RecursiveDepositABI from "./RecursiveDeposit.js";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import {BigNumber} from 'bignumber.js';

// Other components
import SnackbarMessage from "./components/SnackbarMessage"

import "./App.css";
import styles from "./assets/js/appStyle";

class App extends Component {
  // isLoading disables the button when querying the contract
  state = { web3: null, accounts: null, contract: null, isLoading: false, totalPot: 0, newBets: [], betTimeDiff: 30 };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      // const Contract = truffleContract(RecursiveDepositContract);
      // Contract.setProvider(web3.currentProvider);
      // const instance = await Contract.deployed();

      // contract address on ropsten: "0x6be39b681ce4dbb1866602b0d90011d3a01a6b67"
      // web3 v1: https://web3js.readthedocs.io/en/1.0/index.html
      var instance = await new web3.eth.Contract(RecursiveDepositABI, "0x933dccab2d7fe84b6522e1ab210f8621bb3ac3ab");

      // console.log(instance);
      let currentPot = BigNumber((await instance.methods.getTotalPot().call({from: accounts[0]})).toString()).dividedBy(BigNumber('1e18'));
      let lastTime = await instance.methods.getLastBetTime().call();

      const timeDelay = 300 * 60; // 300 minutes
      let timeNow = new Date();
      let timeDiff = timeDelay - (Math.floor(timeNow.getTime()/1000) - lastTime);
      // console.log(currentPot);
      // .then((tp) => {
      //  currentPot = BigNumber(tp.toString()).dividedBy(BigNumber('1e18'));
      // });

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, totalPot: currentPot, betTimeDiff: timeDiff });
      setTimeout(this.watchPot, 1000);
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.log(error);
    }
  };

  watchPot = async () => {
    const { accounts, contract, newBets } = this.state;
    const prevState = this.state;

    let updatedBets = [];
    contract.events.NewBet({fromBlock: 0, toBlock: 'latest'},
      (error, event) => {
        if (error){
          console.log(error);
        }
        console.log(event.returnValues);
        updatedBets.push(event.returnValues);

        this.setState({
          newBets: this.state.newBets.concat([event.returnValues])
        });
      });
      // console.log(...updatedBets);


    console.log(this.state.newBets);
    // console.log(event);
    // event.watch((err, result) => {
    //   if (err) {
    //     console.log(err)
    //     return;
    //   }
    //   console.log("New bet by " + result.args._addr + " of " + result.args._value);
    // });

    // depositEvent.stopWatching()
  };

  watchMyBets = async () => {
    const { accounts, contract } = this.state;

    contract.NewBet({_addr: accounts[0]}, {fromBlock: 0, toBlock: 'latest'})
    .watch(function(err, result) {
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
    try {
      let tp = await contract.methods.bet(accounts[0]).send({ from: accounts[0], value: "5000000000000000" });
      console.log(tp);
    } catch (error){
      // return (
      //   <SnackbarMessage
      //     variant="error"
      //     className={classes.margin}
      //     message="Error: Transaction cancelled."
      //   />
      // );
    }
  };

  // The front end
  render() {
    const { isLoading, totalPot, newBets, betTimeDiff } = this.state;
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
        <Grid container spacing={40} className={classes.mainGrid} alignItems="center">
          <Grid item md={4} align="center" >
            <h4>{totalPot.toString()}</h4>
            <p>ETH in the Pot</p>
          </Grid>
          <Grid item md={4} align="center">
          <h2>Win Now!</h2>
          <p>
            Only {Math.floor(betTimeDiff/60)} minutes to go.
          </p>
          </Grid>
          <Grid item md={4} align="center" >
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
        <Grid container spacing={40} justify="center" className={classes.mainGrid}>
          <Grid item md={6} className={classes.mainFeaturedPostContent}>
          The aim of the game is to be the last person to put ETH into the pot - if you remain there for 30 minutes then you win the entire pot instantly.
          Ok - the real aim is to practice coding and thinking about smart contracts and developing (secure) DApps. Unless if you make millions - then share!
          <Divider className={classes.divider} />

            <Typography variant="h6" className={classes.title}>
              Previous Bets
            </Typography>
            <div className={classes.demo}>
              <List>
                {newBets.map( (bet) =>
                  <ListItem key={bet._addr}>
                    <ListItemIcon>
                      <Code />
                    </ListItemIcon>
                    <ListItemText
                      primary={bet._addr.toString()}
                      secondary={BigNumber(bet._value.toString()).dividedBy(BigNumber('1e18')).toString() + " ETH"}
                    />
                  </ListItem>,
                )}
              </List>
            </div>
          </Grid>
        </Grid>
        {!this.state.web3 ?
        <SnackbarMessage
          variant="error"
          className={classes.margin}
          message="Error: Make sure Metamask is unlocked and connected to the correct Ethereum network."
        />
        :
        <SnackbarMessage
          variant="success"
          className={classes.margin}
          message="Success: Connected to the Ethereum network."
        />
         }
      </main>
      </div>
    );
  }
}

// inject style classes
export default withStyles(styles)(App);
