const express = require('express');
const router = express.Router();

// user model
let User = require('../models/user');

router.get('/', function(req, res){
    User.find({}, function(err, user){
    if(err){
      console.log(err);
    } else {
        res.render('messenger', {
            user:user
      });
    }
  });
});

router.get('/add/:id', function(req, res){
    let temp = req.params.id;
    User.find({ "_id": temp }, function(err, user){
      if(err){
        console.log(err);
      } else {
        res.render('add_messenger', {
            user: user
        });
      }
    });
  });

router.post('/add/:id', function(req, res){
  let user = {};
  user.message = req.body.message;

  let query = {_id:req.params.id}

  User.update(query, user, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success', 'Send Message Successfully');
      res.redirect('/messengers');
    }
  });
});

module.exports = router;