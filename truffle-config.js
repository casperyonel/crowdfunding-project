 

module.exports = {
  networks: {
    ganache: {
      host: "localhost",
      port: 7545,
      gas: 5000000, // Maximum number of gas unit the EVM can use to process the contract deployment transaction.
      network_id: "*" // Match any network id.
    }
  },
  mocha: {
  },
   compilers: {
    solc: {
      version: "0.8.10",    
    }
  }, 
};
