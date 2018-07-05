var Amalgam = artifacts.require("./Amalgam.sol");
var AmalgamTokenSale = artifacts.require("./AmalgamTokenSale.sol"); // just to import the contract, just reading the file

module.exports = function(deployer) {
  deployer.deploy(Amalgam, 1000000).then(function(){
    // Token price is 0.001 ether
    var tokenPrice = 1000000000000000000;
    return deployer.deploy(AmalgamTokenSale, Amalgam.address, tokenPrice);
  });
  
};
