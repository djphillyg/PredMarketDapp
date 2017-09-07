const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract  = require("truffle-contract");
const Eth = require('ethjs');
const eth = new Eth(new Eth.HttpProvider('https://localhost:8545'));

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));




web3.eth.getCoinbase(function(err,res){
  if(!err) {
    console.log(res);
  }
  else {
    console.error(err);
  }
});


/*
let accounts =[];
web3.eth.getAccounts(function(err,res){
  if(!err) {
    res.forEach(function(item){
      accounts.push(item);
    })
  }
  getBalances(accounts);
  //get the owner
  var owner = accounts[0];
  accounts.shift(1);

  for(var i = 0; i<accounts.length; i++){
    web3.eth.sendTransaction({from: owner, to: accounts[i], value: eth.toWei(4,"ether")},function(err,res){
      if(!err) {
        console.log(res + " tx hash logged");
      }
    });

  }
*/

function addEtherToAccounts() {
    let accounts =[]
    return web3.eth.getAccounts(function(err,res){
      if(!err) {
        res.forEach(function(item){
          accounts.push(item);
        });
      }
    }).then(function(){
      getBalances(accounts);
    }).then(function(){
      var owner = accounts[0];
      accounts.shift(1);
      return accounts.forEach(function(address){
        web3.eth.sendTransaction({from: owner, to: address, value: eth.toWei(4,"ether")},function(err,res){
          if(!err) {
            console.log(res + " tx hash logged");
          }
        });
      })
    }).then(function(){
      getBalances(accounts);
    })

}
addEtherToAccounts();





function getBalances(accounts){
accounts.forEach(function(address){
    web3.eth.getBalance(address,function(err,res){
      if(!err){
        console.log("Account: " + address + " Balance: "+ Eth.fromWei(Eth.BN(res),"ether") + "\n");
      }
    });
  });
};
