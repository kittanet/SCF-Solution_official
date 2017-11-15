const express = require('express');
const router = express.Router();

// company model
let Company = require('../models/company');
// invoice model
let Invoice = require('../models/invoice');

// company
router.get('/', function(req, res){
  Company.find({}, function(err, company){
    if(err){
      console.log(err);
    } else {
      res.render('company', {
        company: company
      });
    }
  });
});

module.exports = router;