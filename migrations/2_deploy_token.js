var SafeMath = artifacts.require("./SafeMath.sol")
var Token = artifacts.require("./Token.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, Token);
  deployer.deploy(Token, "Thailand Baht", "THB", 2 ,{from: web3.eth.accounts[0]});
};
