module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ci: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    }
  // Add additional networks here if you want to deploy to testnets or mainnet
  },
  compilers: {
    solc: {
      version: "0.4.25",   // Change this to whatever you need
    }
  }
};
