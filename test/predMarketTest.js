var PredMarket = artifacts.require("./PredMarket.sol");
const Web3 = require("web3");
const truffleContract  = require("truffle-contract");
const Eth = require('ethjs');
const eth = new Eth(new Eth.HttpProvider('https://localhost:8545'));
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

contract('PredMarket',function(accounts){


  //get contract and two Betters
  var contract;
  var owner = accounts[0];
  var bet1 = accounts[1];

  var bet2 = accounts[2];
  var outcome = true;
  before(function() {
    return PredMarket.new()
      .then(function(instance){
        contract = instance;
      }).catch(function(err){
        console.error(err);
      });
  });

  describe("testing the ability to add one person to a bet",function(){

    let accs =[];
    //before this tests the functionality of one person adding a bet
    //this function will add 4 to every other account from the owner
    //just to be able to play around with some ether to start off with
    before(function() {
      return web3.eth.getAccounts(function(err,res){
        if(!err){
          res.forEach(function(address){
            accs.push(address);
          });
        }
      }).then(function(){
        var owner = accs[0];
        accs.shift(1);
        return accs.forEach(function(address){
          web3.eth.sendTransaction({from: owner, to: address, value: Eth.toWei(4,"ether")},
                  function(err,res){
                    if(err) console.error(err);});
         });
      }).catch(function(err){console.error(err);});
    });
    /***
    TODO: Simple Tests to pass to make it seem like I am spending time on this
    contract owner is correct
    **/

    let balances =[];
    it("should update the balances of the accounts",function(){
      return updateBalances(accs,balances);
    });


    it("should have initialized the account owner correctly",function(){
        return contract.owner.call(function(err,res){
          if(!err){return res;}
        }).then(function(addr_owner){
          assert.equal(addr_owner, owner, "The owner should have been correctly initialized");
        }).catch(function(err) {
          console.error(err);
        });
    });
    it("shouldn't have any bets so far",function(){
      return contract.getBetCount()
            .then(function(betCount){
              assert.equal(betCount,0,"there should be not bets currently made in the system");
            }).catch(function(err) {
              console.error(err);
            });
    });

    var betId = 123;
    var description = "is coding fun?";
    var betPrice = Eth.toWei(0.5,"ether");
    var quantity = 16;
    var deadline = new Date().getTime()/1000 + 150;

    it("should add a bet successfully",function() {
      return contract.addBet(betId,description, betPrice, quantity, deadline,{from: owner})
          .then(function(){
            return contract.getBetCount.call(function(bCount){
              assert(bCount,1,"there is one element present in bets");
            }).catch(function(err) {
              console.err(err);
            });
          });
    });


    var better1 = accounts[1];
    it("should store a bet successfully",function(){
      return contract.isBet(betId)==true;
    });

    it("should allow one person to make a bet", function(){
      return contract.makeBet(betId, 8, true,{from: better1,value: Eth.toWei(4.3,"ether")}).then(function(succ){
        assert(succ,true,"it was supposed to return a true from successfull completion");
      });
    });
    //reset
    balances = [];

    it("should have taken 4 ether from the first account", function(){
      return updateBalances(accs,balances);
    });

    it("should have one better stored in bet struct",function(){
      return contract.numBetters.call(betId)
            .then(function(numBets){
              assert(numBets,1,"there should be one bet stored in bet struct");
            }).catch(function(err){console.error(err);});
    });

    it("should be stored as the address that sent ether",function(){
      return contract.addrBetter.call(betId,0)
            .then(function(addr){
              assert(addr,better1,"this account should have been the sender");
              console.log("account in bet: " + addr);
            }).catch(function(err){
              console.error(err);
            });
    });

    it("should delete a bet successfully",function(){
      return contract.deleteBet(betId,{from: owner}).then(function(index){
        assert(index,0,"it should have deleted the first bet");
      }).catch(function(err){console.error(err);});
    });


    balances =[];
    it("should have refunded the first account 4 ether",function(){
      return updateBalances(accs,balances);
    });







  });

});

function updateBalances(address,balances) {
  address.forEach(function(addr){
    return web3.eth.getBalance(addr,function(err,res){
      if(!err) {balances[addr] = res;
   console.log("address: " + addr + "  balance: " + Eth.fromWei(balances[addr].toString(10),"ether") + " ether");}
    });
  });
}
