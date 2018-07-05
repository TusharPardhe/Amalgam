pragma solidity ^0.4.2;

contract Amalgam {
    string  public name = "Amalgam";
    string  public symbol = "a";
    string  public standard = "Amalgam v1.0";
    uint256 public totalSupply;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
   //allowance
    mapping(address => mapping(address => uint256 )) public allowance;

    //approve event
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    function Amalgam (uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) { // To transfer the money from one account to the other
        require(balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        Transfer(msg.sender, _to, _value);

        return true;
    }

    // Delegated Transfer one func to allow or approve the transaction
    // other function handles the transfer - approve, tranfeFrom, Allowance - count of tokens

    function approve(address _spender, uint256 _value) public returns (bool success){
        
        // approve triggers the approve event
        Approval(msg.sender, _spender, _value);


        // allowance
        allowance[msg.sender][_spender]= _value;
        
        return true;
    }  

    // to handle the delegated transfer
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){

        // Functions we need to perform

        // 3.Require _from has enough tokens
        require(_value <= balanceOf[_from]);
        // 4.Require allowance is big enough
        require(_value <= allowance[_from][msg.sender]);
            
        // 2.Change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        // 1.Update the allowance
        allowance[_from][msg.sender] -= _value;

        // 6.call a transfer event
        Transfer(_from , _to, _value);
        // 5.return the boolean
        return true;
    }


}
