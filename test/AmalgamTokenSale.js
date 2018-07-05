var Amalgam = artifacts.require("./Amalgam.sol");
var AmalgamTokenSale = artifacts.require("./AmalgamTokenSale.sol");

contract('AmalgamTokenSale',function(accounts){
    var tokenInstance;
    var tokenSaleInstance;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokensAvailable= 750000;
    var numberOfTokens;
    var tokenPrice = 1000000000000000000; // in wei smallest division of ether
    
    it('initializes the contract with the correct values',function(){
        return AmalgamTokenSale.deployed().then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.address
        }).then(function(address){
            assert.notEqual(address, 0x0,'has contract address'); // heartbeat test to check whether it's working or not
            return tokenSaleInstance.tokenContract();
        }).then(function(address){
            assert.notEqual(address, 0x0,'has token contract address');
            return tokenSaleInstance.tokenPrice();
        }).then(function(price){
            assert.equal(price, tokenPrice, 'token price is correct');
        });
    });

    it ('facilitates token buying', function(){
        return Amalgam.deployed().then(function(instance){
            // Grab token instance first
            tokenInstance = instance;
            return AmalgamTokenSale.deployed();
        }).then(function(instance){
            // then grab token sale instance
            tokenSaleInstance = instance;
            // Provision 75% of all tokens to the token sale
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin} )
        }).then(function(receipt){
            numberOfTokens =10;
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens* tokenPrice})
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
            return tokenSaleInstance.tokenSold();
        }).then(function(amount){
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of sold tokens');
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance){
            assert.equal(balance.toNumber(),numberOfTokens);    
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance){
            assert.equal(balance.toNumber(),tokensAvailable-numberOfTokens);
            // try to buy tokens diff from ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
            return tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice })
        }).then(assert.fail).catch(function(error) {
          assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
        });

    });

    // it('ends token sale', function() {
    //     return Amalgam.deployed().then(function(instance) {
    //       // Grab token instance first
    //       tokenInstance = instance;
    //       return AmalgamTokenSale.deployed();
    //     }).then(function(instance) {
    //       // Then grab token sale instance
    //       tokenSaleInstance = instance;
    //       // Try to end sale from account other than the admin
    //       return tokenSaleInstance.endSale({ from: buyer });
    //     }).then(assert.fail).catch(function(error) {
    //       assert(error.message.indexOf('revert' >= 0, 'must be admin to end sale'));
    //       // End sale as admin
    //       return tokenSaleInstance.endSale({ from: admin });
    //     }).then(function(receipt) {
    //       return tokenInstance.balanceOf(admin);
    //     }).then(function(balance) {
    //       assert.equal(balance.toNumber(), 999990, 'returns all unsold Amalgam tokens to admin');
    //       // Check that token price was reset when selfDestruct was called
    //       return tokenSaleInstance.tokenPrice();
    //     }).then(function(price) {
    //       assert.equal(price.toNumber(), 0, 'token price was reset');
    //     });
    // });

    it('ends token sale', function() {
        return Amalgam.deployed().then(function(instance) {
          // Grab token instance first
          tokenInstance = instance;
          return AmalgamTokenSale.deployed();
        }).then(function(instance) {
          // Then grab token sale instance
          tokenSaleInstance = instance;
          // Try to end sale from account other than the admin
          return tokenSaleInstance.endSale({ from: buyer });
        }).then(assert.fail).catch(function(error) {
          assert(error.message.indexOf('revert' >= 0, 'must be admin to end sale'));
          // End sale as admin
          return tokenSaleInstance.endSale({ from: admin });
        }).then(function(receipt) {
          return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), 999990, 'returns all unsold tokens to admin');
          // Check that the contract has no balance
          balance = web3.eth.getBalance(tokenSaleInstance.address)
          assert.equal(balance.toNumber(), 0);
        });
    });
    



});