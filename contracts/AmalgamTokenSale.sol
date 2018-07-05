pragma solidity^0.4.2;
import "./Amalgam.sol";

contract AmalgamTokenSale {

    address admin; // state variable will be written to disk and not stored in memory
    Amalgam public tokenContract; // gives a function that gives us an address of the token we are using
    uint256 public tokenPrice;
    uint256 public tokenSold;

    event Sell(address _buyer, uint256 _amount);

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }


    function AmalgamTokenSale(Amalgam _tokenContract, uint256 _tokenPrice) public{

        // Assign an Admin
        admin = msg.sender;
        // Token Contract - to purchase tokens
        tokenContract = _tokenContract;
        // Token Price
        tokenPrice = _tokenPrice;

        
    }
    // buying Tokens
    function buyTokens(uint256 _numberOfTokens) public payable{
        
       
        // require the value is equal to tokens
        require(msg.value == multiply(_numberOfTokens , tokenPrice));

        // there are enough tokens in contract
        require(tokenContract.balanceOf(this) >= _numberOfTokens);
        // transfer is successful
        require(tokenContract.transfer(msg.sender,_numberOfTokens)); // actual buy functionality

        // keep track of tokens sole
        tokenSold += _numberOfTokens;
        // trigger sell event
        Sell(msg.sender, _numberOfTokens);
    }

    // Ending Token Sale
    function endSale() public {
        // require admin
        require(msg.sender == admin);
        // Transfer Remaining tokens in contract
        require(tokenContract.transfer(admin, tokenContract.balanceOf(this)));
        // Just transfer the balance to the admin NOTE: do not destroy the contract here
        admin.transfer(address(this).balance);
    }

}