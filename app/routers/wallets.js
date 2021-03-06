const express = require('express');
const router = express.Router();
const moment = require('moment');
const Web3 = require('web3');
const contract = require('truffle-contract');
const tokenContract = require('../../build/contracts/Token.json');

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

// company model
let Company = require('../models/company');
// invoice model
let Invoice = require('../models/invoice');
// invoice model
let Transaction = require('../models/transaction');

var token;
// setup contract
var Token = contract(tokenContract);
Token.setProvider(web3.currentProvider);
// initialize contract
Token.deployed().then(function(instance) {
 token = instance;
});
var accounts = web3.eth.accounts;

router.get('/', function(req, res) {
 var addr = accounts[0];
 var balance = {};
 var eth_balance = web3.eth.getBalance(addr);
 balance.eth = web3.fromWei(eth_balance, 'ether').toString(10);
 // get token balance
 token.balanceOf.call(addr).then(function(b) {
  balance.token = b.toNumber();
  res.render('wallet', {
   accounts: addr,
   balance: balance
  });
 });
});

router.get('/withdraw', function(req, res) {
 Company.find({}, function(err, company) {
  res.render('withdraw', {
   flag: 0,
   company: company
  });
 });
});

router.get('/withdraw/:id', function(req, res) {
 var id = req.params.id;
 Company.find({
  "ETHAccount": id
 }, function(err, company) {
  res.render('withdraw', {
   flag: 1,
   company: company
  });
 });
});

router.post('/withdraw', function(req, res) {
 if (req.body.NameEnglish == 'Bangkok Bank') {
  var balance = {};
  var eth_balance = web3.eth.getBalance(accounts[0]);
  balance.eth = web3.fromWei(eth_balance, 'ether').toString(10);
  // get token balance
  token.balanceOf.call(accounts[0]).then(function(b) {
   balance.token = b.toNumber();
   if (req.body.amount <= balance.token) {
    var from = accounts[0];
    var txref = req.body.txref;
    var amount = req.body.amount;
    token.withdraw(txref, amount, {
     from: from
    }).then(function(v) {
     req.flash('success', 'Withdraw Complete');
     res.redirect('/wallets');
    }).catch(function(err) {
     res.send(err);
    });
   } else {
    req.flash('danger', 'Your token too low.');
    res.redirect('/wallets/withdraw');
   }
  });
 } else {
  Company.find({
   "NameEnglish": req.body.NameEnglish
  }, function(err, company) {
   var balance = {};
   var eth_balance = web3.eth.getBalance(company[0].ETHAccount);
   balance.eth = web3.fromWei(eth_balance, 'ether').toString(10);
   // get token balance
   token.balanceOf.call(company[0].ETHAccount).then(function(b) {
    balance.token = b.toNumber();
    if (req.body.amount <= balance.token) {
     var from = company[0].ETHAccount;
     var txref = req.body.txref;
     var amount = req.body.amount;
     token.withdraw(txref, amount, {
      from: from
     }).then(function(v) {
      req.flash('success', 'Withdraw Complete');
      res.redirect('/wallets');
     }).catch(function(err) {
      res.send(err);
     });
    } else {
     req.flash('danger', 'Your token too low.');
     res.redirect('/wallets/withdraw');
    }
   });
  });
 }
});

router.get('/deposit', function(req, res) {
 Company.find({}, function(err, company) {
  res.render('deposit', {
   flag: 0,
   company: company
  });
 });
});

router.get('/deposit/:id', function(req, res) {
 var id = req.params.id;
 Company.find({
  "ETHAccount": id
 }, function(err, company) {
  res.render('deposit', {
   flag: 1,
   company: company
  });
 });
});


router.post('/deposit', function(req, res) {
 if (req.body.NameEnglish == 'Bangkok Bank') {
  var from = accounts[0];
  var txref = req.body.txref;
  var amount = req.body.amount;
  token.deposit(txref, amount, {
   from: from
  }).then(function(v) {
   req.flash('success', 'Deposit Complete');
   res.redirect('/wallets');
  }).catch(function(err) {
   res.send(err);
  });
 } else {
  Company.find({
   "NameEnglish": req.body.NameEnglish
  }, function(err, company) {
   var from = company[0].ETHAccount;
   var txref = req.body.txref;
   var amount = req.body.amount;
   token.deposit(txref, amount, {
    from: from
   }).then(function(v) {
    req.flash('success', 'Deposit Complete');
    res.redirect('/wallets');
   }).catch(function(err) {
    res.send(err);
   });
  });
 }
});

router.get('/transfer', function(req, res) {
 var addr = accounts[0];
 var balance = {};
 var eth_balance = web3.eth.getBalance(addr);
 balance.eth = web3.fromWei(eth_balance, 'ether').toString(10);
 // get token balance
 token.balanceOf.call(addr).then(function(b) {
  balance.token = b.toNumber();
  Company.find({}, function(err, company) {
   if (err) {
    console.log(err);
   } else {
    Invoice.find({}, function(err, invoice) {
     if (err) {
      console.log(err);
     } else {
      res.render('transfer', {
       company: company,
       balance: balance,
       invoice: invoice
      });
     }
    });
   }
  });
 });
});

router.post('/transfer', function(req, res) {
 var temp = req.body.VoucherNo;
 Invoice.find({
  "VoucherNo": temp
 }, function(err, invoice) {
     
  if (err) {
   console.log(err);
  } else {
   var temp2 = invoice[0].AccountPayee;
   Company.find({
    "Account": temp2
   }, function(err, company) {
    if (err) {
     console.log(err);
    } else {
     var balance = {};
     var eth_balance = web3.eth.getBalance(accounts[0]);
     balance.eth = web3.fromWei(eth_balance, 'ether').toString(10);
     // get token balance
     token.balanceOf.call(accounts[0]).then(function(b) {
      balance.token = b.toNumber();
      if (invoice[0].TotalAmount <= balance.token) {
       var to = company[0].ETHAccount;
       var from = accounts[0];
       var amount = invoice[0].TotalAmount;
       //Token.web3.personal.unlockAccount(from, 'Password123');
       token.transfer(to, amount, {
        from: from
       }).then(function(v) {
        var temp3 = invoice[0]._id;
        Invoice.findByIdAndUpdate(temp3, {
         $set: {
          Stage: 3
         }
        }, function(err, invoice2) {
         if (err) {
          console.log(err);
         } else {
            var date = (web3.eth.getBlock((web3.eth.getTransaction(v.logs[0].transactionHash)).blockNumber).timestamp)
            var date2 = new Date(date*1000);
            var dd = date2.getDate();
            var mm = date2.getMonth() + 1; //January is 0!
            var yyyy = date2.getFullYear();
            var h = date2.getHours();
            var m = date2.getMinutes();
            var s = date2.getSeconds();
            if (dd < 10) {
            dd = '0' + dd;
            }
            if (mm < 10) {
            mm = '0' + mm;
            }
            if (h < 10) {
              h = '0' + h;
            }
            if (m < 10) {
              m = '0' + m;
            }
            if (s < 10) {
              s = '0' + s;
            }
            var Timestamp = dd + '/' + mm + '/' + yyyy + ' '+ h + ':' + m + ':' + s;
            let transaction = new Transaction();
            transaction.TxHash = v.logs[0].transactionHash;
            transaction.TxReceiptStatus = v.receipt.status;
            transaction.Timestamp = Timestamp;
            transaction.From = v.logs[0].args.from;
            transaction.To = v.logs[0].args.to;
            transaction.Quantity = v.logs[0].args.value.toNumber();
            transaction.Event = v.logs[0].event;
            transaction.save(function(err) {
              if (err) {
               console.log(err);
               return;
              } else {
                req.flash('success', 'Voucher No: ' + invoice2.VoucherNo + ' Transfer is Complete');
                res.redirect('/wallets/transfer');
              }
             });
         }
        });
       }).catch(function(err) {
        res.send(err);
       });
      } else {
       req.flash('danger', 'Your token too low.');
       res.redirect('/wallets/transfer');
      }
     });
    }
   });
  }
 });
});

// list all account
router.get('/account', function(req, res) {
 var accounts = web3.eth.accounts;
 Company.find({}, function(err, company) {
  if (err) {
   console.log(err);
  } else {
   res.render('list_account', {
    company: company,
    accounts: accounts
   });
  }
 });
});

router.get('/account/:id', function(req, res) {
 var addr = req.params.id;
 Company.findOne({
  "ETHAccount": addr
 }, function(err, company) {
  if (err) {
   console.log(err);
  } else {
   var balance = {};
   var eth_balance = web3.eth.getBalance(addr);
   balance.eth = web3.fromWei(eth_balance, 'ether').toString(10);
   // get token balance
   token.balanceOf.call(addr).then(function(b) {
    balance.token = b.toNumber();
    res.render('account', {
     accounts: addr,
     balance: balance,
     company: company
    });
   });
  }
 });
});

// list transaction
router.get('/transaction', function(req, res) {
    var accounts = web3.eth.accounts;
    Transaction.find({}, function(err, tansaction) {
     if (err) {
      console.log(err);
     } else {
      res.render('transaction', {
       tansaction: tansaction,
       accounts: accounts
      });
     }
    });
   });

router.get('/block/:num', function(req, res) {
 var num = req.params.num;
 var block = web3.eth.getBlock(num);
 return res.send(block);
});

router.get('/test', function(req, res) {
 var transaction = web3.eth.getTransaction('0xf38fa84e69994f86604c4b08f1e62b5e6f9cfc75ab27cf1bdc9e32edfa960930');
 console.log(transaction);
});

module.exports = router;