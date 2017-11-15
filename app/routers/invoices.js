const express = require('express');
const router = express.Router();

// invoice model
let Invoice = require('../models/invoice');
// company model
let Company = require('../models/company');

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

module.exports = router;
