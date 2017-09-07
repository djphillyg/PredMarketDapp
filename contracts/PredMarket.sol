pragma solidity ^0.4.11;

import "./Admin.sol";
import "./PredMarketToken.sol";


contract PredMarket is Admin {

  /**
  TODO:
  SettleBet
  set up Oracle.

  */
  event LogNewBet(uint256 _betId, uint _betPrice, uint _quantity, uint256 _deadline);
  event LogDeleteBet(uint256 _betId);
  event LogMakeBet(address _maker, uint256 _betId, uint _quantity, bool _outcome );
  event LogWithdrawn(address withdraw, uint amount);


  function hasEnoughStock (uint256 _betId, uint _quantity) returns(bool){
    return bets[_betId].availableStock>= _quantity;
  }
  address public owner;

  function PredMarket()  {
      owner = msg.sender;
  }




  struct BetStruct {
    bytes32 descrip;
    uint betPrice;
    uint index;
    uint payOut;
    //will check if deadline has been raised
    //next person to try to bet on this one will
    //activate the
    uint256 deadline;
    mapping(address=>uint) wagers;
    mapping(address=>bool) outcomes;
    uint availableStock;
    uint boughtStock;
    address[] people;

  }

    mapping (address => uint) public balances;
    mapping (uint256 => BetStruct) public bets;
    uint256[] private betIndex;

  function numBetters(uint256 _betId)
  public
  constant
  returns (uint count) {
    require(isBet(_betId));
    return bets[_betId].people.length;

  }

  function addrBetter(uint256 _betId,uint index)
  public
  constant
  returns (address bet) {
    require(isBet(_betId));
    return bets[_betId].people[index];
  }



  function isBet (uint256 _betId)
  public
  constant
  returns (bool)
  {
    if( betIndex.length == 0) return false;
    return ( betIndex[bets[_betId].index]==_betId);

  }
  function getBetFromIndex (uint _index)
  public
  constant
  returns (uint256 bet)

  {
     require(isBet(betIndex[_index]));

     return betIndex[_index];


  }





  function addBet (uint256 _betId, bytes32 _description, uint _betPrice, uint _quantity, uint256 _deadline)
  isAdmin
  public
   returns (uint index)
  {

    require(!isBet(_betId));
    require(bets[_betId].deadline>= block.timestamp);


    bets[_betId].descrip = _description;
    bets[_betId].betPrice = _betPrice;
    bets[_betId].availableStock = _quantity;
    bets[_betId].boughtStock = 0;
    bets[_betId].payOut = 0;
    bets[_betId].deadline = _deadline;
    bets[_betId].index = betIndex.push(_betId)-1;
    //LogNewBet
    LogNewBet(_betId, _betPrice, _quantity, _deadline);

    return betIndex.length -1;
  }


 event LogWithdrawDelete(uint256 _betId, address toWhom, uint amount);
  function deleteBet (uint256 _betId)
    isAdmin
    public
    returns (uint index)
     {

       /*
        mKey -- last item to switch
        mBetIndex -- index where the bet will be switched outcome
        */
        require(isBet(_betId));
        uint mBetIndex = bets[_betId].index;
        //must withdraw pending balances from the bet
        //cycle through betters in order to delete
        uint pLength = bets[_betId].people.length;
        for(uint i = 0; i<pLength; i++) {
          address sendBack2Better = bets[_betId].people[i];
          uint amount2Withdraw = bets[_betId].wagers[sendBack2Better];
          sendBack2Better.transfer(amount2Withdraw);
          bets[_betId].wagers[sendBack2Better] = 0;
          LogWithdrawDelete(_betId, sendBack2Better, amount2Withdraw);
        }

        uint256 mKey = betIndex[betIndex.length-1];

        betIndex[mBetIndex] = mKey;
        bets[mKey].index = mBetIndex;
        betIndex.length --;
        LogDeleteBet(_betId);
        //LogDeleteBet
        return  mBetIndex;
     }

function makeBet(uint256 _betId, uint _quantity, bool _outcome)
      public
      payable
      returns (bool)
      {
            require(isBet(_betId));
            hasEnoughStock(_betId,_quantity);

            if(bets[_betId].deadline > block.timestamp) {
              return false;
            }
            uint totalBPrice = (bets[_betId].betPrice *_quantity);
            require(totalBPrice<=msg.value);
            //account for ledger through owner
            uint remaining = totalBPrice - msg.value;
            balances[owner] += totalBPrice;
            //account for ledger for the bet itself
            bets[_betId].payOut += totalBPrice;
            bets[_betId].wagers[msg.sender] = totalBPrice;
            bets[_betId].availableStock -= _quantity;
            bets[_betId].boughtStock += _quantity;
            bets[_betId].outcomes[msg.sender] = _outcome;
            bets[_betId].people.push(msg.sender);
            LogMakeBet(msg.sender, _betId, _quantity, _outcome);
            if(remaining>0) {
              balances[msg.sender] += remaining;
            }


          return true;

        }

function getBetCount()
  public
  constant
  returns (uint count)
  {
    return betIndex.length;
  }

function getBetPrice( uint256 _betId, uint _quantity)
public
constant

returns (uint betPrice){
  require(isBet(_betId));
  return (bets[_betId].betPrice * _quantity);
}




function withdrawBalance()
    public
    payable
    returns (bool)
    {
      require(balances[msg.sender]>0);
      uint amount = balances[msg.sender];
      balances[msg.sender] = 0;
      msg.sender.transfer(amount);
      LogWithdrawn(msg.sender,amount);

      return true;
    }
}
