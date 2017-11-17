const express = require('express');
const router = express.Router();

// invoice model
let Invoice = require('../models/invoice');
// company model
let Company = require('../models/company');
// user model
let User = require('../models/user');

// status invoice
router.get('/', function(req, res){
  Invoice.find({}, function(err, invoice){
    if(err){
      console.log(err);
    } else {
      res.render('status', {
        invoice: invoice
      });
    }
  });
});

// approve invoice
router.get('/approve/:id', function(req, res){
  let temp = req.params.id;
  Invoice.find({ "_id": temp }, function(err, invoice){
    if(err){
      console.log(err);
    } else {
      User.find({}, function(err, user){
        if(err){
          console.log(err);
        } else {
          Company.find({}, function(err, company){
            if(err){
              console.log(err);
            } else {
              res.render('approve', {
                invoice: invoice,
                user:user,
                company:company
              });
            }
          });
        }
      });
    }
  });
});

router.post('/approve/:id', function(req, res){
  var today = new Date();
  //today.setDate(today.getDate() + 7);
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  if(dd<10){
      dd='0'+dd;
  } 
  if(mm<10){
      mm='0'+mm;
  }
  var today = dd+'/'+mm+'/'+yyyy;

  let invoiceID = req.params.id;
  Invoice.findById(invoiceID,function(err,invoice){
    if(invoice.LoanTerm){
    var Dueday = new Date();
    Dueday.setDate(Dueday.getDate()+invoice.LoanTerm);
    var dd = Dueday.getDate();
    var mm = Dueday.getMonth()+1; //January is 0!
    var yyyy = Dueday.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    }
    var Dueday = dd+'/'+mm+'/'+yyyy;
    Invoice.findByIdAndUpdate(invoiceID, { $set:{ MaturityDate:Dueday,Stage:2 } }, function(err,invoice){
      if(err){
        console.log(err);
        return;
      }
    });
    }
  });

  Invoice.findByIdAndUpdate(invoiceID, { $set:{ EffectiveDate:today } }, function(err,invoice){
    let payerID = invoice.AccountPayer;
    let payeeID = invoice.AccountPayee;
    Company.findOneAndUpdate({ "Account": payerID }, { $set:{ ETHAccount:req.body.PayerETHAccount } }, function(err, invoice){
          if(err){
            console.log(err);
            return;
          }
          Company.findOneAndUpdate({ "Account": payeeID }, { $set:{ ETHAccount:req.body.PayeeETHAccount } }, function(err, invoice){
            if(err){
              console.log(err);
              return;
            }
            req.flash('success', 'Verified invoice');
            res.redirect('/invoices');
          });
        });
  });
});

module.exports = router;
