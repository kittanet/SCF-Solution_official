const express = require('express');
const router = express.Router();

// company model
let Company = require('../models/company');
// invoice model
let Invoice = require('../models/invoice');
// user model
let User = require('../models/user');

// company
router.get('/', function(req, res) {
 Company.find({}, function(err, company) {
  if (err) {
   console.log(err);
  } else {
   User.find({}, function(err, user) {
    if (err) {
     console.log(err);
    } else {
     res.render('company', {
      company: company,
      user: user
     });
    }
   });
  }
 });
});

//more details
router.get('/details/:id', function(req, res) {
 let temp = req.params.id;
 Company.find({
  "_id": temp
 }, function(err, company) {
  if (err) {
   console.log(err);
  } else {
   let temp2 = company[0].Account;
   User.find({
    "_id": temp2
   }, function(err, user) {
    if (err) {
     console.log(err);
    } else {
     res.render('details', {
      company: company,
      user: user
     });
    }
   });
  }
 });
});

// approve company
router.get('/approve/:id', function(req, res) {
 let temp = req.params.id;
 Company.find({
  "_id": temp
 }, function(err, company) {
  if (err) {
   console.log(err);
  } else {
   let temp2 = company[0].Account;
   User.findByIdAndUpdate(temp2, {
    $set: {
     stage: 2
    }
   }, function(err, user) {
    if (err) {
     console.log(err);
     return;
    }
    res.send('Success');
   });
  }
 });
});

module.exports = router;